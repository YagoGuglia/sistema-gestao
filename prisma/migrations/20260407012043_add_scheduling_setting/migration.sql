-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_GlobalSettings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "defaultMinStock" REAL NOT NULL DEFAULT 10,
    "decimalSeparator" TEXT NOT NULL DEFAULT '.',
    "defaultDeliveryFee" REAL NOT NULL DEFAULT 0,
    "defaultSchedulingEnabled" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_GlobalSettings" ("decimalSeparator", "defaultDeliveryFee", "defaultMinStock", "id", "updatedAt") SELECT "decimalSeparator", "defaultDeliveryFee", "defaultMinStock", "id", "updatedAt" FROM "GlobalSettings";
DROP TABLE "GlobalSettings";
ALTER TABLE "new_GlobalSettings" RENAME TO "GlobalSettings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
