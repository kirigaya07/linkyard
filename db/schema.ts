import {
  pgTable,
  text,
  boolean,
  timestamp,
  varchar,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(), // Clerk userId
  name: varchar("name", { length: 120 }), // Full name
  email: varchar("email", { length: 255 }), // Primary email
  imageUrl: text("image_url"), // Profile picture
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const boards = pgTable("boards", {
  id: varchar("id", { length: 30 }).primaryKey(), // nanoid
  userId: varchar("user_id", { length: 64 }).notNull(), // Clerk user id
  name: varchar("name", { length: 120 }).notNull().default("My Board"),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const bookmarks = pgTable("bookmarks", {
  id: varchar("id", { length: 30 }).primaryKey(), // nanoid
  boardId: varchar("board_id", { length: 30 })
    .notNull()
    .references(() => boards.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  domain: varchar("domain", { length: 120 }).notNull(),
  title: text("title"),
  description: text("description"),
  imageUrl: text("image_url"),
  x: integer("x").notNull().default(0),
  y: integer("y").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tags = pgTable("tags", {
  id: varchar("id", { length: 30 }).primaryKey(),
  userId: varchar("user_id", { length: 64 }).notNull(),
  name: varchar("name", { length: 50 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const bookmarkTags = pgTable(
  "bookmark_tags",
  {
    bookmarkId: varchar("bookmark_id", { length: 30 })
      .notNull()
      .references(() => bookmarks.id, { onDelete: "cascade" }),
    tagId: varchar("tag_id", { length: 30 })
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.bookmarkId, t.tagId] }),
  })
);

export const boardRelations = relations(boards, ({ many }) => ({
  bookmarks: many(bookmarks),
}));

export const bookmarkRelations = relations(bookmarks, ({ one }) => ({
  board: one(boards, { fields: [bookmarks.boardId], references: [boards.id] }),
}));
