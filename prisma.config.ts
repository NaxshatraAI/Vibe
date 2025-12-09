import { defineConfig } from "@prisma/config";
import { config } from "dotenv";

// Load environment variables
config();

export default defineConfig({
  earlyAccess: true,
  schema: "./prisma/schema.prisma",
});
