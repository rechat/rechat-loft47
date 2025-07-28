CREATE TABLE "rechat_loft47_deals_mapping" (
	"id" serial PRIMARY KEY NOT NULL,
	"loft47_deal_id" varchar(255),
	"rechat_deal_id" varchar(255),
	"created_at" timestamp (6) with time zone DEFAULT now()
);
