CREATE TABLE `registrations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text NOT NULL,
	`team_name` text NOT NULL,
	`category` text NOT NULL,
	`additional_emails` text DEFAULT '[]' NOT NULL,
	`paid` integer DEFAULT false NOT NULL,
	`stripe_payment_intent_id` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `registrations_stripe_payment_intent_id_unique` ON `registrations` (`stripe_payment_intent_id`);