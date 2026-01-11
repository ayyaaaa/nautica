import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ payload, req }: MigrateUpArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- 1. Create the new Enum safely (skips if it already exists)
    DO $$ BEGIN
        CREATE TYPE "public"."enum_vessels_finance_payment_status" AS ENUM('unpaid', 'paid');
    EXCEPTION
        WHEN duplicate_object THEN null;
    END $$;

    -- 2. Add only the new columns to the vessels table
    ALTER TABLE "vessels" ADD COLUMN IF NOT EXISTS "finance_fee" numeric DEFAULT 0;
    ALTER TABLE "vessels" ADD COLUMN IF NOT EXISTS "finance_last_paid_amount" numeric;
    ALTER TABLE "vessels" ADD COLUMN IF NOT EXISTS "finance_payment_status" "enum_vessels_finance_payment_status" DEFAULT 'unpaid';
    ALTER TABLE "vessels" ADD COLUMN IF NOT EXISTS "finance_payment_date" timestamp(3) with time zone;
    ALTER TABLE "vessels" ADD COLUMN IF NOT EXISTS "finance_next_payment_due" timestamp(3) with time zone;
    ALTER TABLE "vessels" ADD COLUMN IF NOT EXISTS "finance_transaction_id" varchar;
  `)
}

export async function down({ payload, req }: MigrateDownArgs): Promise<void> {
  await payload.db.drizzle.execute(sql`
    -- Remove the columns if we rollback
    ALTER TABLE "vessels" DROP COLUMN IF EXISTS "finance_fee";
    ALTER TABLE "vessels" DROP COLUMN IF EXISTS "finance_last_paid_amount";
    ALTER TABLE "vessels" DROP COLUMN IF EXISTS "finance_payment_status";
    ALTER TABLE "vessels" DROP COLUMN IF EXISTS "finance_payment_date";
    ALTER TABLE "vessels" DROP COLUMN IF EXISTS "finance_next_payment_due";
    ALTER TABLE "vessels" DROP COLUMN IF EXISTS "finance_transaction_id";
    
    -- Drop the enum
    DROP TYPE IF EXISTS "public"."enum_vessels_finance_payment_status";
  `)
}
