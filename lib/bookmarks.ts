import { db } from "@/db/client";
import { bookmarks, boards } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export type Bookmark = {
  id: string;
  boardId: string;
  url: string;
  domain: string;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  x: number;
  y: number;
  createdAt: Date;
};

/**
 * Get or create a default board for a user
 */
export async function getOrCreateUserBoard(userId: string) {
  // First try to find an existing board
  const existingBoard = await db
    .select()
    .from(boards)
    .where(eq(boards.userId, userId))
    .limit(1);

  if (existingBoard.length > 0) {
    return existingBoard[0];
  }

  // Create a new board if none exists
  const [newBoard] = await db
    .insert(boards)
    .values({
      id: nanoid(),
      userId,
      name: "My Board",
      isPublic: false,
    })
    .returning();

  return newBoard;
}

/**
 * Get all bookmarks for a user's board
 */
export async function getUserBookmarks(userId: string): Promise<Bookmark[]> {
  const board = await getOrCreateUserBoard(userId);

  const userBookmarks = await db
    .select()
    .from(bookmarks)
    .where(eq(bookmarks.boardId, board.id));

  return userBookmarks;
}

/**
 * Create a new bookmark
 */
export async function createBookmark(
  userId: string,
  bookmarkData: {
    url: string;
    domain: string;
    title?: string;
    description?: string;
    imageUrl?: string;
    x: number;
    y: number;
  }
): Promise<Bookmark> {
  const board = await getOrCreateUserBoard(userId);

  const [newBookmark] = await db
    .insert(bookmarks)
    .values({
      id: nanoid(),
      boardId: board.id,
      url: bookmarkData.url,
      domain: bookmarkData.domain,
      title: bookmarkData.title || null,
      description: bookmarkData.description || null,
      imageUrl: bookmarkData.imageUrl || null,
      x: bookmarkData.x,
      y: bookmarkData.y,
    })
    .returning();

  return newBookmark;
}

/**
 * Update bookmark position
 */
export async function updateBookmarkPosition(
  bookmarkId: string,
  userId: string,
  x: number,
  y: number
): Promise<void> {
  const board = await getOrCreateUserBoard(userId);

  await db
    .update(bookmarks)
    .set({ x, y })
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.boardId, board.id)));
}

/**
 * Update bookmark metadata (title, description, imageUrl)
 */
export async function updateBookmarkMetadata(
  bookmarkId: string,
  userId: string,
  updates: {
    title?: string;
    description?: string;
    imageUrl?: string;
  }
): Promise<void> {
  const board = await getOrCreateUserBoard(userId);

  await db
    .update(bookmarks)
    .set(updates)
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.boardId, board.id)));
}

/**
 * Delete a bookmark
 */
export async function deleteBookmark(
  bookmarkId: string,
  userId: string
): Promise<void> {
  const board = await getOrCreateUserBoard(userId);

  await db
    .delete(bookmarks)
    .where(and(eq(bookmarks.id, bookmarkId), eq(bookmarks.boardId, board.id)));
}

/**
 * Clear all bookmarks for a user
 */
export async function clearUserBookmarks(userId: string): Promise<void> {
  const board = await getOrCreateUserBoard(userId);

  await db.delete(bookmarks).where(eq(bookmarks.boardId, board.id));
}
