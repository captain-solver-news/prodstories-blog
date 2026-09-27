import type { CollectionConfig, RelationshipFieldSingleValidation } from 'payload';
import type { Category } from '@/lib/payload/generated-types';
import { Type } from '@/lib/payload/taxonomy';
import {
  revalidateCrawlerFilesAfterChange,
  revalidateCrawlerFilesAfterDelete,
} from '@/lib/payload/hooks/revalidate-crawler-files';

export const Categories: CollectionConfig = {
  slug: 'categories',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'type', 'weight'],
    group: 'Blog',
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateCrawlerFilesAfterChange],
    afterDelete: [revalidateCrawlerFilesAfterDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      maxLength: 255,
    },
    {
      name: 'coverImage',
      label: 'Category image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      maxLength: 255,
      admin: {
        description: 'One path segment. The full URL is built from the parent chain.',
      },
    },
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'categories',
      index: true,
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
      validate: (async (value, { id, req }) => {
        if (!value || !id) return true;

        const parentId = typeof value === 'object' ? value.value : value;

        if (String(parentId) === String(id)) {
          return 'A category cannot be its own parent.';
        }

        const seen = new Set<string>([String(id)]);
        let currentId: string | null = String(parentId);

        while (currentId && !seen.has(currentId)) {
          seen.add(currentId);

          const ancestor: Category | null = await req.payload.findByID({
            collection: 'categories',
            id: currentId,
            depth: 0,
            req,
            disableErrors: true,
          });

          const nextParent: Category['parent'] = ancestor?.parent;
          if (!nextParent) return true;

          currentId = String(typeof nextParent === 'object' ? nextParent.id : nextParent);

          if (currentId === String(id)) {
            return 'A category cannot be a descendant of itself.';
          }
        }

        return true;
      }) as RelationshipFieldSingleValidation,
      admin: {
        description: 'Leave empty for a root category.',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: Type.Hidden,
      options: [
        { label: 'Hidden', value: Type.Hidden },
        { label: 'Displays posts and subcategories', value: Type.DisplayedAll },
        { label: 'Displays posts', value: Type.DisplayedPosts },
        { label: 'Displays subcategories', value: Type.DisplayedSubcategories },
      ],
    },
    {
      name: 'weight',
      type: 'number',
      required: true,
      defaultValue: 0,
      admin: {
        description: 'Sort order, ascending.',
      },
    },
    {
      type: 'collapsible',
      label: 'SEO',
      fields: [
        { name: 'seoTitle', type: 'text' },
        { name: 'seoDescription', type: 'textarea' },
        {
          name: 'ogImageMedia',
          label: 'Social image',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'noIndex',
          type: 'checkbox',
          defaultValue: false,
          label: 'Hide from search engines (noindex)',
          admin: {
            description: 'Adds a noindex robots tag and drops the URL from sitemap.xml.',
          },
        },
      ],
    },
  ],
};
