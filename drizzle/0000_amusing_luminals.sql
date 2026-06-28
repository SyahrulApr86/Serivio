CREATE TYPE "public"."history_kind" AS ENUM('progress', 'status', 'created');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('Anime', 'TV Series', 'Movie', 'Manga', 'Manhwa', 'Manhua', 'Comic', 'Light Novel', 'Web Novel', 'Novel', 'Book');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('Watching', 'Reading', 'Completed', 'On Hold', 'Dropped', 'Plan to Watch', 'Plan to Read');--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "collection_item" (
	"collection_id" text NOT NULL,
	"series_id" text NOT NULL,
	"added_at" timestamp NOT NULL,
	CONSTRAINT "collection_item_collection_id_series_id_pk" PRIMARY KEY("collection_id","series_id")
);
--> statement-breakpoint
CREATE TABLE "progress_history" (
	"id" text PRIMARY KEY NOT NULL,
	"series_id" text NOT NULL,
	"kind" "history_kind" DEFAULT 'progress' NOT NULL,
	"from_value" integer,
	"to_value" integer,
	"note" text,
	"created_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "series" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"alt_title" text,
	"cover_image" text,
	"media_type" "media_type" NOT NULL,
	"status" "status" NOT NULL,
	"current_progress" integer DEFAULT 0 NOT NULL,
	"total_progress" integer,
	"season" integer,
	"current_volume" integer,
	"current_page" integer,
	"rating" real,
	"notes" text,
	"description" text,
	"author" text,
	"studio_publisher" text,
	"release_year" integer,
	"genres" text[] DEFAULT '{}' NOT NULL,
	"tags" text[] DEFAULT '{}' NOT NULL,
	"last_activity_at" timestamp NOT NULL,
	"last_opened_at" timestamp,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"username" text,
	"display_username" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection" ADD CONSTRAINT "collection_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_item" ADD CONSTRAINT "collection_item_collection_id_collection_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."collection"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "collection_item" ADD CONSTRAINT "collection_item_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "progress_history" ADD CONSTRAINT "progress_history_series_id_series_id_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "series" ADD CONSTRAINT "series_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "collection_user_name_idx" ON "collection" USING btree ("user_id","name");--> statement-breakpoint
CREATE INDEX "history_series_idx" ON "progress_history" USING btree ("series_id");--> statement-breakpoint
CREATE INDEX "series_user_idx" ON "series" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "series_status_idx" ON "series" USING btree ("status");--> statement-breakpoint
CREATE INDEX "series_media_idx" ON "series" USING btree ("media_type");--> statement-breakpoint
CREATE INDEX "series_activity_idx" ON "series" USING btree ("last_activity_at");