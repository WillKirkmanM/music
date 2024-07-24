-- DropIndexes
DROP INDEX IF EXISTS "_playlist_to_song_b_index";
DROP INDEX IF EXISTS "_playlist_to_song_a_b_unique";
DROP INDEX IF EXISTS "_playlist_to_user_b_index";
DROP INDEX IF EXISTS "_playlist_to_user_a_b_unique";
DROP INDEX IF EXISTS "follow_follower_id_following_id_key";
DROP INDEX IF EXISTS "idx_listen_history_user";

-- Undo RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "old_user" (
	"id" TEXT NOT NULL PRIMARY KEY,
	"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	"image" TEXT,
	"name" TEXT,
	"updatedAt" DATETIME NOT NULL
);
INSERT INTO "old_user" ("createdAt", "id", "image", "name", "updatedAt") SELECT "created_at", "id", "image", "name", "updated_at" FROM "user";
DROP TABLE "user";
ALTER TABLE "old_user" RENAME TO "user";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- DropTables
DROP TABLE IF EXISTS "_playlist_to_song";
DROP TABLE IF EXISTS "_playlist_to_user";
DROP TABLE IF EXISTS "song";
DROP TABLE IF EXISTS "playlist";
DROP TABLE IF EXISTS "follow";
DROP TABLE IF EXISTS "listen_history_item";
DROP TABLE IF EXISTS "search_item";
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS "account";
DROP TABLE IF EXISTS "session";