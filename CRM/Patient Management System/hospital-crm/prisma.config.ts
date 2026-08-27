import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL || "postgresql://postgres:123456@localhost:5432/hospital_crm?sslmode=disable",
  },
});
