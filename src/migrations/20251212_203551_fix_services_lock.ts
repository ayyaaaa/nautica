import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_service_type" AS ENUM('cleaning', 'water', 'fuel', 'waste', 'electric', 'loading');
  CREATE TYPE "public"."enum_services_status" AS ENUM('requested', 'payment_pending', 'in_progress', 'completed', 'cancelled');
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"service_type" "enum_services_service_type" NOT NULL,
  	"vessel_id" integer NOT NULL,
  	"status" "enum_services_status" DEFAULT 'requested' NOT NULL,
  	"quantity" numeric DEFAULT 1 NOT NULL,
  	"total_cost" numeric,
  	"request_date" timestamp(3) with time zone NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "service_requests" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "service_requests" CASCADE;
  ALTER TABLE "payments" DROP CONSTRAINT "payments_related_service_id_service_requests_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_service_requests_fk";
  
  DROP INDEX "payload_locked_documents_rels_service_requests_id_idx";
  ALTER TABLE "site_settings" ALTER COLUMN "platform_name" SET DEFAULT 'Nautica Harbor';
  ALTER TABLE "site_settings" ALTER COLUMN "cleaning_rate" SET DEFAULT 150;
  ALTER TABLE "site_settings" ALTER COLUMN "water_rate" SET DEFAULT 50;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "site_settings" ADD COLUMN "fuel_rate" numeric DEFAULT 25;
  ALTER TABLE "site_settings" ADD COLUMN "waste_rate" numeric DEFAULT 200;
  ALTER TABLE "site_settings" ADD COLUMN "electric_rate" numeric DEFAULT 5;
  ALTER TABLE "site_settings" ADD COLUMN "loading_rate" numeric DEFAULT 100;
  ALTER TABLE "services" ADD CONSTRAINT "services_vessel_id_vessels_id_fk" FOREIGN KEY ("vessel_id") REFERENCES "public"."vessels"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_vessel_idx" ON "services" USING btree ("vessel_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  ALTER TABLE "payments" ADD CONSTRAINT "payments_related_service_id_services_id_fk" FOREIGN KEY ("related_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "service_requests_id";
  DROP TYPE "public"."enum_service_requests_service_type";
  DROP TYPE "public"."enum_service_requests_status";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_service_requests_service_type" AS ENUM('Cleaning', 'Passenger Pickup', 'Cargo Loading', 'Fresh Water', 'Fuel Supply', 'Waste Disposal', 'Vehicle Support');
  CREATE TYPE "public"."enum_service_requests_status" AS ENUM('requested', 'in_progress', 'completed', 'cancelled');
  CREATE TABLE "service_requests" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"vessel_id" integer NOT NULL,
  	"service_type" "enum_service_requests_service_type" NOT NULL,
  	"status" "enum_service_requests_status" DEFAULT 'requested',
  	"description" varchar,
  	"request_date" timestamp(3) with time zone,
  	"unit_price" numeric NOT NULL,
  	"quantity" numeric DEFAULT 1,
  	"total_price" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services" CASCADE;
  ALTER TABLE "payments" DROP CONSTRAINT "payments_related_service_id_services_id_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  ALTER TABLE "site_settings" ALTER COLUMN "platform_name" SET DEFAULT 'Harbor Management System';
  ALTER TABLE "site_settings" ALTER COLUMN "cleaning_rate" DROP DEFAULT;
  ALTER TABLE "site_settings" ALTER COLUMN "water_rate" DROP DEFAULT;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "service_requests_id" integer;
  ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_vessel_id_vessels_id_fk" FOREIGN KEY ("vessel_id") REFERENCES "public"."vessels"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "service_requests_vessel_idx" ON "service_requests" USING btree ("vessel_id");
  CREATE INDEX "service_requests_updated_at_idx" ON "service_requests" USING btree ("updated_at");
  CREATE INDEX "service_requests_created_at_idx" ON "service_requests" USING btree ("created_at");
  ALTER TABLE "payments" ADD CONSTRAINT "payments_related_service_id_service_requests_id_fk" FOREIGN KEY ("related_service_id") REFERENCES "public"."service_requests"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_service_requests_fk" FOREIGN KEY ("service_requests_id") REFERENCES "public"."service_requests"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_service_requests_id_idx" ON "payload_locked_documents_rels" USING btree ("service_requests_id");
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "site_settings" DROP COLUMN "fuel_rate";
  ALTER TABLE "site_settings" DROP COLUMN "waste_rate";
  ALTER TABLE "site_settings" DROP COLUMN "electric_rate";
  ALTER TABLE "site_settings" DROP COLUMN "loading_rate";
  DROP TYPE "public"."enum_services_service_type";
  DROP TYPE "public"."enum_services_status";`)
}
