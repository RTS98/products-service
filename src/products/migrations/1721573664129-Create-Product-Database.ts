import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProductDatabase1721573664129 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "product" (
        "id" SERIAL NOT NULL,
        "title" character varying NOT NULL,
        "price" integer NOT NULL,
        "description" character varying NOT NULL,
        "quantity" integer NOT NULL,
        "idempotency_key_id" integer,
        CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "idempotency_key" (
        "id" SERIAL NOT NULL,
        "key" character varying NOT NULL,
        CONSTRAINT "PK_6b5e4b716f1f1b7e5b2f4d2f4f2" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "product"
      ADD CONSTRAINT "FK_3d4c8d4c2b0a3e5c7b7f4b6f5f2"
      FOREIGN KEY ("idempotency_key_id")
      REFERENCES "idempotency_key"("id")
      ON DELETE CASCADE
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "product"
      DROP CONSTRAINT "FK_3d4c8d4c2b0a3e5c7b7f4b6f5f2"
    `);
    await queryRunner.query(`
      DROP TABLE "idempotency_key"
    `);
    await queryRunner.query(`
      DROP TABLE "product
  `);
  }
}
