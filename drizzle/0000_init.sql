CREATE TYPE "public"."lead_status" AS ENUM('pending', 'purchased', 'refused');--> statement-breakpoint
CREATE TABLE "leads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"company" varchar(255),
	"email" varchar(255),
	"phone" varchar(50),
	"source" varchar(100) DEFAULT 'Outro',
	"value" numeric(14, 2) DEFAULT '0' NOT NULL,
	"status" "lead_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
