CREATE TABLE "brand_loft47_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand_id" uuid NOT NULL,
	"loft47_email" varchar(255) NOT NULL,
	"loft47_password" varchar(255) NOT NULL,
	"is_staging" boolean DEFAULT false NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now(),
	CONSTRAINT "brand_loft47_credentials_brand_id_unique" UNIQUE("brand_id")
);
