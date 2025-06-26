PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_anime` (
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
INSERT INTO `__new_anime`("id", "name", "update_weekday", "update_time_hhmm", "current_episode", "total_episode", "is_over", "cover", "created_at") SELECT "id", "name", "update_weekday", "update_time_hhmm", "current_episode", "total_episode", "is_over", "cover", "created_at" FROM `anime`;--> statement-breakpoint
DROP TABLE `anime`;--> statement-breakpoint
ALTER TABLE `__new_anime` RENAME TO `anime`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_schdule` (
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
INSERT INTO `__new_schdule`("id", "name", "update_weekday", "update_time_hhmm", "current_episode", "total_episode", "is_over", "cover", "created_at") SELECT "id", "name", "update_weekday", "update_time_hhmm", "current_episode", "total_episode", "is_over", "cover", "created_at" FROM `schdule`;--> statement-breakpoint
DROP TABLE `schdule`;--> statement-breakpoint
ALTER TABLE `__new_schdule` RENAME TO `schdule`;