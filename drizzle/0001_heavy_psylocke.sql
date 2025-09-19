CREATE TABLE "api_keys" (
	"id" serial PRIMARY KEY NOT NULL,
	"key_id" varchar(64) NOT NULL,
	"key_hash" varchar(256) NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"daily_limit" integer DEFAULT 1000,
	"monthly_limit" integer DEFAULT 30000,
	"daily_usage" integer DEFAULT 0,
	"monthly_usage" integer DEFAULT 0,
	"total_usage" integer DEFAULT 0,
	"allowed_domains" text,
	"allowed_ips" text,
	"is_active" boolean DEFAULT true,
	"expires_at" timestamp,
	"last_used_at" timestamp,
	"last_used_ip" varchar(45),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"created_by" varchar(255),
	"daily_reset_at" timestamp DEFAULT now(),
	"monthly_reset_at" timestamp DEFAULT now(),
	CONSTRAINT "api_keys_key_id_unique" UNIQUE("key_id")
);
--> statement-breakpoint
CREATE TABLE "api_request_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"key_id" varchar(64),
	"endpoint" varchar(500) NOT NULL,
	"method" varchar(10) NOT NULL,
	"status_code" integer NOT NULL,
	"response_time" integer,
	"user_agent" text,
	"ip_address" varchar(45),
	"referer" text,
	"request_size" integer,
	"response_size" integer,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "api_request_logs" ADD CONSTRAINT "api_request_logs_key_id_api_keys_key_id_fk" FOREIGN KEY ("key_id") REFERENCES "public"."api_keys"("key_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "api_keys_key_id_idx" ON "api_keys" USING btree ("key_id");--> statement-breakpoint
CREATE INDEX "api_keys_is_active_idx" ON "api_keys" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "api_keys_expires_at_idx" ON "api_keys" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "api_request_logs_key_id_idx" ON "api_request_logs" USING btree ("key_id");--> statement-breakpoint
CREATE INDEX "api_request_logs_created_at_idx" ON "api_request_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "api_request_logs_endpoint_idx" ON "api_request_logs" USING btree ("endpoint");