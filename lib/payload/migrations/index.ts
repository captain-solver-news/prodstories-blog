import * as migration_20260907_184239_payload_migrations from './20260907_184239_payload_migrations';
import * as migration_20260907_184240_initial from './20260907_184240_initial';
import * as migration_20260910_183306_add_vercel_blob_media from './20260910_183306_add_vercel_blob_media';
import * as migration_20260910_184951_add_media_prefix from './20260910_184951_add_media_prefix';
import * as migration_20260912_204243_drop_media_url_mirrors from './20260912_204243_drop_media_url_mirrors';
import * as migration_20260914_120000_richtext_bodies from './20260914_120000_richtext_bodies';
import * as migration_20260919_212056_add_published_at_and_noindex from './20260919_212056_add_published_at_and_noindex';
import * as migration_20260919_212748_drop_is_sitemap from './20260919_212748_drop_is_sitemap';
import * as migration_20260925_181346_add_seo_title from './20260925_181346_add_seo_title';
import * as migration_20260926_180132_add_content_updated_at from './20260926_180132_add_content_updated_at';
import * as migration_20260927_191246_add_category_cover_image from './20260927_191246_add_category_cover_image';

export const migrations = [
  {
    up: migration_20260907_184239_payload_migrations.up,
    down: migration_20260907_184239_payload_migrations.down,
    name: '20260907_184239_payload_migrations',
  },
  {
    up: migration_20260907_184240_initial.up,
    down: migration_20260907_184240_initial.down,
    name: '20260907_184240_initial',
  },
  {
    up: migration_20260910_183306_add_vercel_blob_media.up,
    down: migration_20260910_183306_add_vercel_blob_media.down,
    name: '20260910_183306_add_vercel_blob_media',
  },
  {
    up: migration_20260910_184951_add_media_prefix.up,
    down: migration_20260910_184951_add_media_prefix.down,
    name: '20260910_184951_add_media_prefix',
  },
  {
    up: migration_20260912_204243_drop_media_url_mirrors.up,
    down: migration_20260912_204243_drop_media_url_mirrors.down,
    name: '20260912_204243_drop_media_url_mirrors',
  },
  {
    up: migration_20260914_120000_richtext_bodies.up,
    down: migration_20260914_120000_richtext_bodies.down,
    name: '20260914_120000_richtext_bodies',
  },
  {
    up: migration_20260919_212056_add_published_at_and_noindex.up,
    down: migration_20260919_212056_add_published_at_and_noindex.down,
    name: '20260919_212056_add_published_at_and_noindex',
  },
  {
    up: migration_20260919_212748_drop_is_sitemap.up,
    down: migration_20260919_212748_drop_is_sitemap.down,
    name: '20260919_212748_drop_is_sitemap',
  },
  {
    up: migration_20260925_181346_add_seo_title.up,
    down: migration_20260925_181346_add_seo_title.down,
    name: '20260925_181346_add_seo_title',
  },
  {
    up: migration_20260926_180132_add_content_updated_at.up,
    down: migration_20260926_180132_add_content_updated_at.down,
    name: '20260926_180132_add_content_updated_at',
  },
  {
    up: migration_20260927_191246_add_category_cover_image.up,
    down: migration_20260927_191246_add_category_cover_image.down,
    name: '20260927_191246_add_category_cover_image',
  },
];
