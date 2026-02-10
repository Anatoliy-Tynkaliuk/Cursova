-- CreateTable
CREATE TABLE "child_level_progress" (
    "id" BIGSERIAL NOT NULL,
    "childProfileId" BIGINT NOT NULL,
    "gameId" BIGINT NOT NULL,
    "difficulty" INTEGER NOT NULL,
    "maxUnlockedLevel" INTEGER NOT NULL DEFAULT 1,
    "starsJson" JSONB NOT NULL DEFAULT '{}',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "child_level_progress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "child_level_progress_childProfileId_gameId_idx" ON "child_level_progress"("childProfileId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "child_level_progress_childProfileId_gameId_difficulty_key" ON "child_level_progress"("childProfileId", "gameId", "difficulty");

-- AddForeignKey
ALTER TABLE "child_level_progress" ADD CONSTRAINT "child_level_progress_childProfileId_fkey" FOREIGN KEY ("childProfileId") REFERENCES "child_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_level_progress" ADD CONSTRAINT "child_level_progress_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
