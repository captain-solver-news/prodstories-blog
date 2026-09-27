import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres';

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "categories" ADD COLUMN "cover_image_id" uuid;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_cover_image_id_media_id_fk" FOREIGN KEY ("cover_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "categories_cover_image_idx" ON "categories" USING btree ("cover_image_id");`);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "categories" DROP CONSTRAINT "categories_cover_image_id_media_id_fk";
  
  DROP INDEX "categories_cover_image_idx";
  ALTER TABLE "categories" DROP COLUMN "cover_image_id";`);
}
