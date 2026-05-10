DROP INDEX `redeemed_codes_code_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `redeemed_codes_code_discord_id_unique` ON `redeemed_codes` (`code`,`discord_id`);