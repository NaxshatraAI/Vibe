-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "supabaseAnonKey" TEXT,
ADD COLUMN     "supabaseApiUrl" TEXT,
ADD COLUMN     "supabaseDbUrl" TEXT,
ADD COLUMN     "supabaseProjectRef" TEXT,
ADD COLUMN     "supabaseServiceRole" TEXT;
