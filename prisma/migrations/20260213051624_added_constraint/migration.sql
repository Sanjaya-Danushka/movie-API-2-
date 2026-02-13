/*
  Warnings:

  - A unique constraint covering the columns `[userId,movieId]` on the table `watchlistItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "watchlistItem_userId_movieId_key" ON "watchlistItem"("userId", "movieId");
