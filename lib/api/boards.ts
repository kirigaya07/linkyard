import { db } from "@/db/client";
import {
  boards,
  bookmarks,
  collections,
  type boards as BoardsTable,
  type bookmarks as BookmarksTable,
  type collections as CollectionsTable,
} from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import type { Board, Bookmark, Collection, BoardWithRelations } from "@/lib/types";

export async function getOrCreateUserBoard(userId: string): Promise<Board> {
  const existing = await db
    .select()
    .from(boards)
    .where(eq(boards.userId, userId))
    .limit(1);

  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(boards)
    .values({
      id: nanoid(),
      userId,
      name: "My Board",
      isPublic: false,
    })
    .returning();

  return created;
}

export async function getUserBoardWithRelations(userId: string): Promise<BoardWithRelations> {
  const board = await getOrCreateUserBoard(userId);

  const [boardBookmarks, boardCollections] = await Promise.all([
    db.select().from(bookmarks).where(eq(bookmarks.boardId, board.id)),
    db.select().from(collections).where(eq(collections.boardId, board.id)),
  ]);

  return {
    board,
    bookmarks: boardBookmarks,
    collections: boardCollections,
  };
}

export async function getBoardByShareTokenWithRelations(
  shareToken: string
): Promise<BoardWithRelations | null> {
  const result = await db
    .select()
    .from(boards)
    .where(eq(boards.shareToken, shareToken))
    .limit(1);

  const board = result[0];
  if (!board) return null;

  const [boardBookmarks, boardCollections] = await Promise.all([
    db.select().from(bookmarks).where(eq(bookmarks.boardId, board.id)),
    db.select().from(collections).where(eq(collections.boardId, board.id)),
  ]);

  return {
    board,
    bookmarks: boardBookmarks,
    collections: boardCollections,
  };
}

export async function updateBookmarkPosition(
  userId: string,
  bookmarkId: string,
  x: number,
  y: number
): Promise<void> {
  const board = await getOrCreateUserBoard(userId);

  await db
    .update(bookmarks)
    .set({ x, y })
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.boardId, board.id)));
}

