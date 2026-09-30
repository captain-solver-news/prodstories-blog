import type { CollectionConfig } from 'payload';
import { richTextEditor } from '@/lib/payload/editor';
import {
  revalidateCrawlerFilesAfterChange,
  revalidateCrawlerFilesAfterDelete,
} from '@/lib/payload/hooks/revalidate-crawler-files';

export const Authors: CollectionConfig = {
  slug: 'authors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'jobTitle'],
    group: 'Content',
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
      name: 'name',
      type: 'text',
      required: true,
      maxLength: 255,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      maxLength: 255,
      admin: {
        description: 'URL segment for the author page: /author/<slug>',
      },
    },
    {
      name: 'jobTitle',
      type: 'text',
      required: true,
      maxLength: 255,
    },
    {
      name: 'bio',
      type: 'richText',
      required: true,
      editor: richTextEditor,
    },
    {
      type: 'collapsible',
      label: 'Avatars',
      fields: [
        { name: 'avatarDark', label: 'Dark theme', type: 'upload', relationTo: 'media' },
        { name: 'avatarDarkHovered', label: 'Dark theme (hover)', type: 'upload', relationTo: 'media' },
        { name: 'avatarLight', label: 'Light theme', type: 'upload', relationTo: 'media' },
        { name: 'avatarLightHovered', label: 'Light theme (hover)', type: 'upload', relationTo: 'media' },
        { name: 'miniAvatar', label: 'Small avatar', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Social links',
      fields: [
        { name: 'githubUrl', type: 'text', maxLength: 255 },
        { name: 'linkedinUrl', type: 'text', maxLength: 255 },
      ],
    },
  ],
};
