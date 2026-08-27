import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import type { AdapterAccountType } from "next-auth/adapters";

// ---------------------------------------------------------------------------
// Auth.js tables (shape required by @auth/drizzle-adapter), extended with a
// `password` column for the Credentials (email/password) provider.
// ---------------------------------------------------------------------------
export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"), // bcrypt hash; null for OAuth-only users
});

export const accounts = pgTable(
  "account",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })]
);

// ---------------------------------------------------------------------------
// App tables
// ---------------------------------------------------------------------------
export const brandProfiles = pgTable("brand_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  industry: text("industry"),
  tone: text("tone"),
  audience: text("audience"),
  samplePosts: text("sample_posts"),
  createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
});

export const generatedContent = pgTable(
  "generated_content",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    brandProfileId: uuid("brand_profile_id").references(() => brandProfiles.id, {
      onDelete: "set null",
    }),
    platform: text("platform").notNull(),
    contentType: text("content_type").notNull(),
    topic: text("topic"),
    caption: text("caption"),
    hashtags: text("hashtags").array(),
    hooks: text("hooks").array(),
    bestTime: text("best_time"),
    imageUrl: text("image_url"),
    isFavorite: boolean("is_favorite").notNull().default(false),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("generated_content_user_id_idx").on(table.userId),
    index("generated_content_created_at_idx").on(table.createdAt),
  ]
);

export const generationUsage = pgTable(
  "generation_usage",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
    ipHash: text("ip_hash"),
    createdAt: timestamp("created_at", { mode: "date" }).notNull().defaultNow(),
  },
  (table) => [
    index("generation_usage_user_id_idx").on(table.userId),
    index("generation_usage_ip_hash_idx").on(table.ipHash),
  ]
);

export const usersRelations = relations(users, ({ many }) => ({
  brandProfiles: many(brandProfiles),
  generatedContent: many(generatedContent),
}));

export const brandProfilesRelations = relations(brandProfiles, ({ one, many }) => ({
  user: one(users, { fields: [brandProfiles.userId], references: [users.id] }),
  generatedContent: many(generatedContent),
}));

export const generatedContentRelations = relations(generatedContent, ({ one }) => ({
  user: one(users, { fields: [generatedContent.userId], references: [users.id] }),
  brandProfile: one(brandProfiles, {
    fields: [generatedContent.brandProfileId],
    references: [brandProfiles.id],
  }),
}));
