CREATE TABLE `anime` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`update_weekday` integer NOT NULL,
	`update_time_hhmm` text NOT NULL,
	`current_episode` integer NOT NULL,
	`total_episode` integer NOT NULL,
	`is_finished` integer DEFAULT 0 NOT NULL,
	`cover` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`first_episode_date_time` integer NOT NULL,
	`last_episode_date_time` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schdule` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`anime_id` integer NOT NULL,
	`is_notification` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `upcoming` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`anime_id` integer NOT NULL,
	FOREIGN KEY (`anime_id`) REFERENCES `anime`(`id`) ON UPDATE no action ON DELETE cascade
);
