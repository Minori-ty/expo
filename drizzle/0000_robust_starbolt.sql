CREATE TABLE `anime` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`updateWeekday` integer NOT NULL,
	`updateTime` text NOT NULL,
	`currentEpisode` integer NOT NULL,
	`totalEpisode` integer NOT NULL,
	`isOver` integer DEFAULT false NOT NULL,
	`cover` text NOT NULL,
	`createAt` integer DEFAULT strftime('%s', 'now') NOT NULL
);
