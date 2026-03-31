-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "WatchJob" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "rawPrompt" TEXT,
  "query" TEXT NOT NULL,
  "maxPrice" REAL,
  "preferredKeywords" TEXT NOT NULL DEFAULT '[]',
  "excludedKeywords" TEXT NOT NULL DEFAULT '[]',
  "conditionFilters" TEXT NOT NULL DEFAULT '[]',
  "sellerRatingThreshold" REAL,
  "shippingPreferences" TEXT,
  "notificationThreshold" REAL NOT NULL DEFAULT 70,
  "pollingIntervalMinutes" INTEGER NOT NULL DEFAULT 30,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastPolledAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "WatchJob_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "SeenListing" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "watchJobId" TEXT NOT NULL,
  "ebayItemId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "price" REAL,
  "url" TEXT NOT NULL,
  "sellerName" TEXT,
  "sellerFeedbackPercent" REAL,
  "condition" TEXT,
  "location" TEXT,
  "firstSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastScore" REAL,
  "lastScoreExplanation" TEXT,
  "metadataJson" TEXT,
  CONSTRAINT "SeenListing_watchJobId_fkey" FOREIGN KEY ("watchJobId") REFERENCES "WatchJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "MatchNotification" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "watchJobId" TEXT NOT NULL,
  "seenListingId" TEXT NOT NULL,
  "score" REAL NOT NULL,
  "explanation" TEXT NOT NULL,
  "reasonsJson" TEXT NOT NULL DEFAULT '[]',
  "wasDelivered" BOOLEAN NOT NULL DEFAULT false,
  "deliveredAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MatchNotification_watchJobId_fkey" FOREIGN KEY ("watchJobId") REFERENCES "WatchJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MatchNotification_seenListingId_fkey" FOREIGN KEY ("seenListingId") REFERENCES "SeenListing" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "PollRun" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "watchJobId" TEXT NOT NULL,
  "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" DATETIME,
  "success" BOOLEAN NOT NULL DEFAULT false,
  "resultCount" INTEGER NOT NULL DEFAULT 0,
  "newListingCount" INTEGER NOT NULL DEFAULT 0,
  "notifiedCount" INTEGER NOT NULL DEFAULT 0,
  "errorMessage" TEXT,
  CONSTRAINT "PollRun_watchJobId_fkey" FOREIGN KEY ("watchJobId") REFERENCES "WatchJob" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "WatchJob_userId_isActive_idx" ON "WatchJob"("userId", "isActive");
CREATE UNIQUE INDEX "SeenListing_watchJobId_ebayItemId_key" ON "SeenListing"("watchJobId", "ebayItemId");
CREATE INDEX "SeenListing_watchJobId_lastSeenAt_idx" ON "SeenListing"("watchJobId", "lastSeenAt");
CREATE INDEX "MatchNotification_watchJobId_createdAt_idx" ON "MatchNotification"("watchJobId", "createdAt");
CREATE INDEX "PollRun_watchJobId_startedAt_idx" ON "PollRun"("watchJobId", "startedAt");
