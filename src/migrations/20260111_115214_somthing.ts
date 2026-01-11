import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('superadmin', 'admin', 'operator', 'owner', 'business_rep');
  CREATE TYPE "public"."enum_vessels_registration_type" AS ENUM('permanent', 'temporary', 'hourly');
  CREATE TYPE "public"."enum_vessels_status" AS ENUM('pending', 'payment_pending', 'active', 'departed', 'rejected', 'blacklisted');
  CREATE TYPE "public"."enum_vessels_finance_payment_status" AS ENUM('unpaid', 'paid');
  CREATE TYPE "public"."enum_vessels_vessel_type" AS ENUM('DHOANI', 'LAUNCH', 'BOAT', 'BOKKURA', 'BAHTHELI', 'DINGHY', 'BARGE', 'YACHT', 'TUG', 'SUBMARINE', 'PASSENGER FERRY', 'OTHER');
  CREATE TYPE "public"."enum_vessels_use_type" AS ENUM('Passenger', 'Fishing', 'Cargo', 'Diving', 'Excursion', 'Other');
  CREATE TYPE "public"."enum_vessels_specs_fuel_type" AS ENUM('Diesel', 'Petrol');
  CREATE TYPE "public"."enum_vessels_specs_engine_type" AS ENUM('Inboard', 'Outboard');
  CREATE TYPE "public"."enum_services_calculation_mode" AS ENUM('quantity', 'budget');
  CREATE TYPE "public"."enum_services_status" AS ENUM('requested', 'payment_pending', 'in_progress', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_services_payment_status" AS ENUM('unpaid', 'paid', 'waived');
  CREATE TYPE "public"."enum_payments_status" AS ENUM('paid', 'void');
  CREATE TYPE "public"."enum_payments_method" AS ENUM('cash', 'transfer');
  CREATE TYPE "public"."enum_berths_plan_type" AS ENUM('hourly', 'daily', 'monthly', 'yearly');
  CREATE TYPE "public"."enum_berths_status" AS ENUM('active', 'completed', 'cancelled');
  CREATE TYPE "public"."enum_berthing_slots_zone" AS ENUM('block_a_zone_a', 'block_a_zone_b', 'block_a_zone_c', 'block_a_zone_d', 'block_a_zone_e', 'zone_t');
  CREATE TYPE "public"."enum_berthing_slots_type" AS ENUM('permanent', 'temporary');
  CREATE TYPE "public"."enum_berthing_slots_status" AS ENUM('available', 'occupied', 'maintenance');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'operator' NOT NULL,
  	"full_name" varchar NOT NULL,
  	"id_number" varchar NOT NULL,
  	"phone" varchar NOT NULL,
  	"address_house_name" varchar,
  	"address_street" varchar,
  	"address_island" varchar,
  	"address_zip" varchar,
  	"photo_id" integer,
  	"id_card_copy_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "businesses" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"registration_number" varchar NOT NULL,
  	"email" varchar,
  	"phone" varchar,
  	"registration_doc_id" integer,
  	"owner_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "vessels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"registration_number" varchar NOT NULL,
  	"registration_type" "enum_vessels_registration_type" NOT NULL,
  	"current_berth_id" integer,
  	"status" "enum_vessels_status" DEFAULT 'pending' NOT NULL,
  	"finance_fee" numeric DEFAULT 0,
  	"finance_last_paid_amount" numeric,
  	"finance_payment_status" "enum_vessels_finance_payment_status" DEFAULT 'unpaid',
  	"finance_payment_date" timestamp(3) with time zone,
  	"finance_next_payment_due" timestamp(3) with time zone,
  	"finance_transaction_id" varchar,
  	"vessel_type" "enum_vessels_vessel_type" NOT NULL,
  	"use_type" "enum_vessels_use_type" NOT NULL,
  	"owner_id" integer NOT NULL,
  	"operator_id" integer,
  	"registration_doc_id" integer,
  	"specs_length" numeric,
  	"specs_width" numeric,
  	"specs_fuel_type" "enum_vessels_specs_fuel_type",
  	"specs_engine_type" "enum_vessels_specs_engine_type",
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"service_type_id" integer NOT NULL,
  	"vessel_id" integer NOT NULL,
  	"calculation_mode" "enum_services_calculation_mode" DEFAULT 'quantity',
  	"service_location" varchar,
  	"preferred_time" timestamp(3) with time zone NOT NULL,
  	"contact_number" varchar NOT NULL,
  	"quantity" numeric DEFAULT 1,
  	"total_cost" numeric,
  	"status" "enum_services_status" DEFAULT 'requested',
  	"payment_status" "enum_services_payment_status" DEFAULT 'unpaid',
  	"request_date" timestamp(3) with time zone,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payments" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"invoice_number" varchar,
  	"vessel_id" integer NOT NULL,
  	"description" varchar NOT NULL,
  	"related_berth_id" integer,
  	"related_service_id" integer,
  	"amount" numeric NOT NULL,
  	"status" "enum_payments_status" DEFAULT 'paid' NOT NULL,
  	"method" "enum_payments_method" NOT NULL,
  	"paid_at" timestamp(3) with time zone NOT NULL,
  	"proof_of_payment_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "berths" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"vessel_id" integer NOT NULL,
  	"plan_type" "enum_berths_plan_type" NOT NULL,
  	"status" "enum_berths_status" DEFAULT 'active',
  	"start_time" timestamp(3) with time zone NOT NULL,
  	"end_time" timestamp(3) with time zone,
  	"assigned_slot_id" integer NOT NULL,
  	"billing_rate_applied" numeric,
  	"billing_total_calculated" numeric,
  	"billing_is_paid" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "berthing_slots" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"zone" "enum_berthing_slots_zone" NOT NULL,
  	"type" "enum_berthing_slots_type" NOT NULL,
  	"status" "enum_berthing_slots_status" DEFAULT 'available',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "service_types" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"rate" numeric NOT NULL,
  	"unit" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"businesses_id" integer,
  	"vessels_id" integer,
  	"services_id" integer,
  	"payments_id" integer,
  	"berths_id" integer,
  	"berthing_slots_id" integer,
  	"service_types_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "site_settings" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform_name" varchar DEFAULT 'Nautica Harbor',
  	"support_phone" varchar,
  	"support_email" varchar,
  	"hourly_rate" numeric DEFAULT 50 NOT NULL,
  	"daily_rate" numeric DEFAULT 500 NOT NULL,
  	"monthly_rate" numeric DEFAULT 10000 NOT NULL,
  	"yearly_rate" numeric DEFAULT 100000 NOT NULL,
  	"tax_percentage" numeric DEFAULT 6 NOT NULL,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "users" ADD CONSTRAINT "users_id_card_copy_id_media_id_fk" FOREIGN KEY ("id_card_copy_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "businesses" ADD CONSTRAINT "businesses_registration_doc_id_media_id_fk" FOREIGN KEY ("registration_doc_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vessels" ADD CONSTRAINT "vessels_current_berth_id_berthing_slots_id_fk" FOREIGN KEY ("current_berth_id") REFERENCES "public"."berthing_slots"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vessels" ADD CONSTRAINT "vessels_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vessels" ADD CONSTRAINT "vessels_operator_id_users_id_fk" FOREIGN KEY ("operator_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "vessels" ADD CONSTRAINT "vessels_registration_doc_id_media_id_fk" FOREIGN KEY ("registration_doc_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_service_type_id_service_types_id_fk" FOREIGN KEY ("service_type_id") REFERENCES "public"."service_types"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_vessel_id_vessels_id_fk" FOREIGN KEY ("vessel_id") REFERENCES "public"."vessels"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_vessel_id_vessels_id_fk" FOREIGN KEY ("vessel_id") REFERENCES "public"."vessels"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_related_berth_id_berths_id_fk" FOREIGN KEY ("related_berth_id") REFERENCES "public"."berths"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_related_service_id_services_id_fk" FOREIGN KEY ("related_service_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payments" ADD CONSTRAINT "payments_proof_of_payment_id_media_id_fk" FOREIGN KEY ("proof_of_payment_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "berths" ADD CONSTRAINT "berths_vessel_id_vessels_id_fk" FOREIGN KEY ("vessel_id") REFERENCES "public"."vessels"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "berths" ADD CONSTRAINT "berths_assigned_slot_id_berthing_slots_id_fk" FOREIGN KEY ("assigned_slot_id") REFERENCES "public"."berthing_slots"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_businesses_fk" FOREIGN KEY ("businesses_id") REFERENCES "public"."businesses"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_vessels_fk" FOREIGN KEY ("vessels_id") REFERENCES "public"."vessels"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_payments_fk" FOREIGN KEY ("payments_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_berths_fk" FOREIGN KEY ("berths_id") REFERENCES "public"."berths"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_berthing_slots_fk" FOREIGN KEY ("berthing_slots_id") REFERENCES "public"."berthing_slots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_service_types_fk" FOREIGN KEY ("service_types_id") REFERENCES "public"."service_types"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_photo_idx" ON "users" USING btree ("photo_id");
  CREATE INDEX "users_id_card_copy_idx" ON "users" USING btree ("id_card_copy_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "businesses_registration_number_idx" ON "businesses" USING btree ("registration_number");
  CREATE INDEX "businesses_registration_doc_idx" ON "businesses" USING btree ("registration_doc_id");
  CREATE INDEX "businesses_owner_idx" ON "businesses" USING btree ("owner_id");
  CREATE INDEX "businesses_updated_at_idx" ON "businesses" USING btree ("updated_at");
  CREATE INDEX "businesses_created_at_idx" ON "businesses" USING btree ("created_at");
  CREATE UNIQUE INDEX "vessels_registration_number_idx" ON "vessels" USING btree ("registration_number");
  CREATE INDEX "vessels_current_berth_idx" ON "vessels" USING btree ("current_berth_id");
  CREATE INDEX "vessels_owner_idx" ON "vessels" USING btree ("owner_id");
  CREATE INDEX "vessels_operator_idx" ON "vessels" USING btree ("operator_id");
  CREATE INDEX "vessels_registration_doc_idx" ON "vessels" USING btree ("registration_doc_id");
  CREATE INDEX "vessels_updated_at_idx" ON "vessels" USING btree ("updated_at");
  CREATE INDEX "vessels_created_at_idx" ON "vessels" USING btree ("created_at");
  CREATE INDEX "services_service_type_idx" ON "services" USING btree ("service_type_id");
  CREATE INDEX "services_vessel_idx" ON "services" USING btree ("vessel_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "payments_vessel_idx" ON "payments" USING btree ("vessel_id");
  CREATE INDEX "payments_related_berth_idx" ON "payments" USING btree ("related_berth_id");
  CREATE INDEX "payments_related_service_idx" ON "payments" USING btree ("related_service_id");
  CREATE INDEX "payments_proof_of_payment_idx" ON "payments" USING btree ("proof_of_payment_id");
  CREATE INDEX "payments_updated_at_idx" ON "payments" USING btree ("updated_at");
  CREATE INDEX "payments_created_at_idx" ON "payments" USING btree ("created_at");
  CREATE INDEX "berths_vessel_idx" ON "berths" USING btree ("vessel_id");
  CREATE INDEX "berths_assigned_slot_idx" ON "berths" USING btree ("assigned_slot_id");
  CREATE INDEX "berths_updated_at_idx" ON "berths" USING btree ("updated_at");
  CREATE INDEX "berths_created_at_idx" ON "berths" USING btree ("created_at");
  CREATE UNIQUE INDEX "berthing_slots_name_idx" ON "berthing_slots" USING btree ("name");
  CREATE INDEX "berthing_slots_updated_at_idx" ON "berthing_slots" USING btree ("updated_at");
  CREATE INDEX "berthing_slots_created_at_idx" ON "berthing_slots" USING btree ("created_at");
  CREATE INDEX "service_types_updated_at_idx" ON "service_types" USING btree ("updated_at");
  CREATE INDEX "service_types_created_at_idx" ON "service_types" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_businesses_id_idx" ON "payload_locked_documents_rels" USING btree ("businesses_id");
  CREATE INDEX "payload_locked_documents_rels_vessels_id_idx" ON "payload_locked_documents_rels" USING btree ("vessels_id");
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_payments_id_idx" ON "payload_locked_documents_rels" USING btree ("payments_id");
  CREATE INDEX "payload_locked_documents_rels_berths_id_idx" ON "payload_locked_documents_rels" USING btree ("berths_id");
  CREATE INDEX "payload_locked_documents_rels_berthing_slots_id_idx" ON "payload_locked_documents_rels" USING btree ("berthing_slots_id");
  CREATE INDEX "payload_locked_documents_rels_service_types_id_idx" ON "payload_locked_documents_rels" USING btree ("service_types_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "businesses" CASCADE;
  DROP TABLE "vessels" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "payments" CASCADE;
  DROP TABLE "berths" CASCADE;
  DROP TABLE "berthing_slots" CASCADE;
  DROP TABLE "service_types" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TABLE "site_settings" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_vessels_registration_type";
  DROP TYPE "public"."enum_vessels_status";
  DROP TYPE "public"."enum_vessels_finance_payment_status";
  DROP TYPE "public"."enum_vessels_vessel_type";
  DROP TYPE "public"."enum_vessels_use_type";
  DROP TYPE "public"."enum_vessels_specs_fuel_type";
  DROP TYPE "public"."enum_vessels_specs_engine_type";
  DROP TYPE "public"."enum_services_calculation_mode";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum_services_payment_status";
  DROP TYPE "public"."enum_payments_status";
  DROP TYPE "public"."enum_payments_method";
  DROP TYPE "public"."enum_berths_plan_type";
  DROP TYPE "public"."enum_berths_status";
  DROP TYPE "public"."enum_berthing_slots_zone";
  DROP TYPE "public"."enum_berthing_slots_type";
  DROP TYPE "public"."enum_berthing_slots_status";`)
}
