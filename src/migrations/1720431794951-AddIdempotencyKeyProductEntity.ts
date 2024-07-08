import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIdempotencyKeyProductEntity1720431794951
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" ADD COLUMN "idempotencyKeyId" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "product" DROP COLUMN "idempotencyKeyId"`,
    );
  }
}
