-- AlterTable
ALTER TABLE "User" ADD COLUMN     "githubAccessToken" TEXT,
ADD COLUMN     "githubConnectedAt" TIMESTAMP(3),
ADD COLUMN     "githubId" TEXT,
ADD COLUMN     "githubRefreshToken" TEXT,
ADD COLUMN     "githubUsername" TEXT;
