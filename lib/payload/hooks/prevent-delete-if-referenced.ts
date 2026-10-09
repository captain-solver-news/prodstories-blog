import {
  APIError,
  type CollectionBeforeDeleteHook,
  type CollectionSlug,
  type FlattenedField,
  type PayloadRequest,
  type SanitizedCollectionConfig,
  type Where,
} from 'payload';

type DocumentID = number | string;

function buildReferenceConditions(
  fields: FlattenedField[],
  target: CollectionSlug,
  id: DocumentID,
  prefix = ''
): Where[] {
  return fields.flatMap((field): Where[] => {
    const path = `${prefix}${field.name}`;

    if (field.type === 'upload' || field.type === 'relationship') {
      if (field.relationTo === target) {
        return [{ [path]: { equals: id } }];
      }

      if (Array.isArray(field.relationTo) && field.relationTo.includes(target)) {
        return [{ and: [{ [`${path}.relationTo`]: { equals: target } }, { [`${path}.value`]: { equals: id } }] }];
      }

      return [];
    }

    if (field.type === 'group' || field.type === 'tab' || field.type === 'array') {
      return buildReferenceConditions(field.flattenedFields, target, id, `${path}.`);
    }

    return [];
  });
}

function containsRichText(field: FlattenedField): boolean {
  if (field.type === 'richText') return true;

  if (field.type === 'group' || field.type === 'tab' || field.type === 'array') {
    return field.flattenedFields.some(containsRichText);
  }

  return false;
}

function referencesDocument(value: unknown, target: CollectionSlug, id: DocumentID): boolean {
  if (Array.isArray(value)) return value.some((item) => referencesDocument(item, target, id));
  if (!value || typeof value !== 'object') return false;

  const node = value as Record<string, unknown>;

  if ((node.type === 'upload' || node.type === 'relationship') && node.relationTo === target) {
    const ref = node.value;
    const refId = ref && typeof ref === 'object' && 'id' in ref ? ref.id : ref;

    if (String(refId) === String(id)) return true;
  }

  return Object.values(node).some((child) => referencesDocument(child, target, id));
}

async function findRichTextReferences(
  req: PayloadRequest,
  config: SanitizedCollectionConfig,
  target: CollectionSlug,
  id: DocumentID
): Promise<DocumentID[]> {
  const fieldNames = config.flattenedFields.filter(containsRichText).map((field) => field.name);
  if (!fieldNames.length) return [];

  const { docs } = await req.payload.find({
    collection: config.slug,
    select: Object.fromEntries(fieldNames.map((name) => [name, true])),
    depth: 0,
    pagination: false,
    req,
  });

  return docs.filter((doc) => referencesDocument(doc, target, id)).map((doc) => doc.id);
}

async function countFieldReferences(
  req: PayloadRequest,
  config: SanitizedCollectionConfig,
  conditions: Where[],
  excludeIds: DocumentID[]
): Promise<number> {
  if (!conditions.length) return 0;

  const where: Where = excludeIds.length
    ? { and: [{ or: conditions }, { id: { not_in: excludeIds } }] }
    : { or: conditions };
  const { totalDocs } = await req.payload.count({ collection: config.slug, where, req });

  return totalDocs;
}

export const preventDeleteIfReferenced: CollectionBeforeDeleteHook = async ({ collection, id, req }) => {
  const usages: string[] = [];

  for (const { config } of Object.values(req.payload.collections)) {
    if (config.slug.startsWith('payload-')) continue;

    const conditions = buildReferenceConditions(config.flattenedFields, collection.slug, id);
    const richTextIds = await findRichTextReferences(req, config, collection.slug, id);
    const totalDocs = richTextIds.length + (await countFieldReferences(req, config, conditions, richTextIds));

    if (totalDocs > 0) usages.push(`${config.slug} (${totalDocs})`);
  }

  if (usages.length) {
    throw new APIError(
      `This document is used in: ${usages.join(', ')}. Remove it from there before deleting.`,
      409,
      null,
      true
    );
  }
};
