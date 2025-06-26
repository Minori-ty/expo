CREATE TABLE `schdule` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`update_weekday` integer NOT NULL,
	`update_time_hhmm` text NOT NULL,
	`current_episode` integer NOT NULL,
	`total_episode` integer NOT NULL,
	`is_over` integer DEFAULT false NOT NULL,
	`cover` text NOT NULL,
	`create_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_anime` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`update_weekday` integer NOT NULL,
	`update_time_hhmm` text NOT NULL,
	`current_episode` integer NOT NULL,
	`total_episode` integer NOT NULL,
	`is_over` integer DEFAULT false NOT NULL,
	`cover` text NOT NULL,
	`create_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_anime`("id", "name", "update_weekday", "update_time_hhmm", "current_episode", "total_episode", "is_over", "cover", "create_at") SELECT "id", "name", "update_weekday", "update_time_hhmm", "current_episode", "total_episode", "is_over", "cover", "create_at" FROM `anime`;--> statement-breakpoint
DROP TABLE `anime`;--> statement-breakpoint
ALTER TABLE `__new_anime` RENAME TO `anime`;--> statement-breakpoint
PRAGMA foreign_keys=ON;