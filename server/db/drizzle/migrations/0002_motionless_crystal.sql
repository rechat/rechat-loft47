ALTER TABLE "brand_loft47_credentials" ADD COLUMN "token" varchar(1000);--> statement-breakpoint
ALTER TABLE "brand_loft47_credentials" ADD COLUMN "token_expires_at" timestamp (6) with time zone;