import type { CollectionConfig } from 'payload';
import { Status } from '@/lib/payload/taxonomy';
import { richTextEditor } from '@/lib/payload/editor';
import { setContentUpdatedAt } from '@/lib/payload/hooks/content-updated-at';
import {
  revalidateCrawlerFilesAfterChange,
  revalidateCrawlerFilesAfterDelete,
} from '@/lib/payload/hooks/revalidate-crawler-files';

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'category', 'status', 'createdAt'],
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
      name: 'slug',
      type: 'text',
      required: true,
      index: true,
      maxLength: 255,
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      required: true,
      index: true,
    },
    {
      name: 'authors',
      type: 'relationship',
      relationTo: 'authors',
      hasMany: true,
    },
    {
      name: 'teaser',
      type: 'textarea',
      required: true,
    },
    {
      name: 'body',
      type: 'richText',
      required: true,
      editor: richTextEditor,
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: Status.Published,
      options: [
        { label: 'Published', value: Status.Published },
        { label: 'Draft', value: Status.Draft },
      ],
    },
    {
      name: 'publishedAt',
      type: 'date',
      label: 'Published at',
      index: true,
      admin: {
        date: { pickerAppearance: 'dayAndTime' },
        description: 'Public publish date. Set automatically the first time the post is published.',
      },
      hooks: {
        beforeChange: [
          ({ siblingData, value }) => {
            if (value) return value;
            if (siblingData?.status === Status.Published) return new Date().toISOString();

            return value;
          },
        ],
      },
    },
    {
      name: 'contentUpdatedAt',
      type: 'date',
      index: true,
      admin: {
        hidden: true,
      },
      access: {
        create: () => false,
        update: () => false,
      },
      hooks: {
        beforeChange: [setContentUpdatedAt],
      },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Featured on the home page',
    },
    {
      type: 'collapsible',
      label: 'SEO',
      fields: [
        { name: 'seoTitle', type: 'text' },
        { name: 'seoDescription', type: 'textarea' },
        {
          name: 'ogImageMedia',
          label: 'Featured / social image',
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
