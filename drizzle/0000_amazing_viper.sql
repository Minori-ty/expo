CREATE TABLE `anime` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`update_weekday` integer NOT NULL,
	`update_time_hhmm` text NOT NULL,
	`current_episode` integer NOT NULL,
	`total_episode` integer NOT NULL,
	`is_over` integer DEFAULT 0 NOT NULL,
	`cover` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schdule` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`update_weekday` integer NOT NULL,
	`update_time_hhmm` text NOT NULL,
	`current_episode` integer NOT NULL,
	`total_episode` integer NOT NULL,
	`is_over` integer DEFAULT 0 NOT NULL,
	`cover` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
