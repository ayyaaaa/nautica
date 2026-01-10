import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_calculation_mode" AS ENUM('quantity', 'budget');
  ALTER TYPE "public"."enum_users_role" ADD VALUE 'superadmin' BEFORE 'admin';
  CREATE TABLE "service_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"rate" numeric NOT NULL,
  	"unit" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'paid'::text;
  DROP TYPE "public"."enum_payments_status";
  CREATE TYPE "public"."enum_payments_status" AS ENUM('paid', 'void');
  ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'paid'::"public"."enum_payments_status";
  ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "public"."enum_payments_status" USING "status"::"public"."enum_payments_status";
  ALTER TABLE "payments" ALTER COLUMN "method" SET DATA TYPE text;
  DROP TYPE "public"."enum_payments_method";
  CREATE TYPE "public"."enum_payments_method" AS ENUM('cash', 'transfer');
  ALTER TABLE "payments" ALTER COLUMN "method" SET DATA TYPE "public"."enum_payments_method" USING "method"::"public"."enum_payments_method";
  DROP INDEX "payments_invoice_number_idx";
  ALTER TABLE "services" ALTER COLUMN "status" DROP NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "quantity" DROP NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "request_date" DROP NOT NULL;
  ALTER TABLE "payments" ALTER COLUMN "method" SET NOT NULL;
  ALTER TABLE "payments" ALTER COLUMN "paid_at" SET NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "tax_percentage" SET NOT NULL;
  ALTER TABLE "vessels" ADD COLUMN "finance_last_paid_amount" numeric;
  ALTER TABLE "services" ADD COLUMN "service_type_id" integer NOT NULL;
  ALTER TABLE "services" ADD COLUMN "calculation_mode" "enum_services_calculation_mode" DEFAULT 'quantity';
  ALTER TABLE "services" ADD COLUMN "service_location" varchar;
  ALTER TABLE "services" ADD COLUMN "preferred_time" timestamp(3) with time zone NOT NULL;
  ALTER TABLE "services" ADD COLUMN "contact_number" varchar NOT NULL;
  ALTER TABLE "payments" ADD COLUMN "description" varchar NOT NULL;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "service_types_id" integer;
  CREATE INDEX "service_types_updated_at_idx" ON "service_types" USING btree ("updated_at");
  CREATE INDEX "service_types_created_at_idx" ON "service_types" USING btree ("created_at");
  ALTER TABLE "services" ADD CONSTRAINT "services_service_type_id_service_types_id_fk" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_service_types_fk" FOREIGN KEY ("service_types_id") REFERENCES "public"."service_types"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "services_service_type_idx" ON "services" USING btree ("service_type_id");
  CREATE INDEX "payload_locked_documents_rels_service_types_id_idx" ON "payload_locked_documents_rels" USING btree ("service_types_id");
  ALTER TABLE "services" DROP COLUMN "service_type";
  ALTER TABLE "site_settings" DROP COLUMN "cleaning_rate";
  ALTER TABLE "site_settings" DROP COLUMN "water_rate";
  ALTER TABLE "site_settings" DROP COLUMN "fuel_rate";
  ALTER TABLE "site_settings" DROP COLUMN "waste_rate";
  ALTER TABLE "site_settings" DROP COLUMN "electric_rate";
  ALTER TABLE "site_settings" DROP COLUMN "loading_rate";
  DROP TYPE "public"."enum_services_service_type";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_service_type" AS ENUM('cleaning', 'water', 'fuel', 'waste', 'electric', 'loading');
  ALTER TABLE "service_types" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "service_types" CASCADE;
  ALTER TABLE "services" DROP CONSTRAINT "services_service_type_id_service_types_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_service_types_fk";
  
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE text;
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'operator'::text;
  DROP TYPE "public"."enum_users_role";
  CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'operator', 'owner', 'business_rep');
  ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'operator'::"public"."enum_users_role";
  ALTER TABLE "users" ALTER COLUMN "role" SET DATA TYPE "public"."enum_users_role" USING "role"::"public"."enum_users_role";
  ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE text;
  ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'unpaid'::text;
  DROP TYPE "public"."enum_payments_status";
  CREATE TYPE "public"."enum_payments_status" AS ENUM('unpaid', 'paid', 'overdue', 'cancelled');
  ALTER TABLE "payments" ALTER COLUMN "status" SET DEFAULT 'unpaid'::"public"."enum_payments_status";
  ALTER TABLE "payments" ALTER COLUMN "status" SET DATA TYPE "public"."enum_payments_status" USING "status"::"public"."enum_payments_status";
  ALTER TABLE "payments" ALTER COLUMN "method" SET DATA TYPE text;
  DROP TYPE "public"."enum_payments_method";
  CREATE TYPE "public"."enum_payments_method" AS ENUM('cash', 'bank_transfer', 'online', 'cheque');
  ALTER TABLE "payments" ALTER COLUMN "method" SET DATA TYPE "public"."enum_payments_method" USING "method"::"public"."enum_payments_method";
  DROP INDEX "services_service_type_idx";
  DROP INDEX "payload_locked_documents_rels_service_types_id_idx";
  ALTER TABLE "services" ALTER COLUMN "quantity" SET NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "status" SET NOT NULL;
  ALTER TABLE "services" ALTER COLUMN "request_date" SET NOT NULL;
  ALTER TABLE "payments" ALTER COLUMN "method" DROP NOT NULL;
  ALTER TABLE "payments" ALTER COLUMN "paid_at" DROP NOT NULL;
  ALTER TABLE "site_settings" ALTER COLUMN "tax_percentage" DROP NOT NULL;
  ALTER TABLE "services" ADD COLUMN "service_type" "enum_services_service_type" NOT NULL;
  ALTER TABLE "site_settings" ADD COLUMN "cleaning_rate" numeric DEFAULT 150;
  ALTER TABLE "site_settings" ADD COLUMN "water_rate" numeric DEFAULT 50;
  ALTER TABLE "site_settings" ADD COLUMN "fuel_rate" numeric DEFAULT 25;
  ALTER TABLE "site_settings" ADD COLUMN "waste_rate" numeric DEFAULT 200;
  ALTER TABLE "site_settings" ADD COLUMN "electric_rate" numeric DEFAULT 5;
  ALTER TABLE "site_settings" ADD COLUMN "loading_rate" numeric DEFAULT 100;
  CREATE UNIQUE INDEX "payments_invoice_number_idx" ON "payments" USING btree ("invoice_number");
  ALTER TABLE "vessels" DROP COLUMN "finance_last_paid_amount";
  ALTER TABLE "services" DROP COLUMN "service_type_id";
  ALTER TABLE "services" DROP COLUMN "calculation_mode";
  ALTER TABLE "services" DROP COLUMN "service_location";
  ALTER TABLE "services" DROP COLUMN "preferred_time";
  ALTER TABLE "services" DROP COLUMN "contact_number";
  ALTER TABLE "payments" DROP COLUMN "description";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "service_types_id";
  DROP TYPE "public"."enum_services_calculation_mode";`)
}
