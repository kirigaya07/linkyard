import { db } from "@/db/client";
import { boards, bookmarks } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

export type ShareableBoard = {
  id: string;
  userId: string;
  name: string;
  isPublic: boolean;
  shareToken: string | null;
  createdAt: Date;
};

export type PublicBookmark = {
  id: string;
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
 * Generate a share token for a board
 */
export async function generateShareToken(boardId: string, userId: string): Promise<string> {
  const shareToken = nanoid();
  
  await db
    .update(boards)
    .set({ shareToken })
    .where(
      and(
        eq(boards.id, boardId),
        eq(boards.userId, userId)
      )
    );
    
  return shareToken;
}

/**
 * Get board by share token (for public access)
 */
export async function getBoardByShareToken(shareToken: string): Promise<ShareableBoard | null> {
  const result = await db
    .select()
    .from(boards)
    .where(eq(boards.shareToken, shareToken))
    .limit(1);
    
  return result.length > 0 ? result[0] : null;
}

/**
 * Get public bookmarks for a board
 */
export async function getPublicBookmarks(boardId: string): Promise<PublicBookmark[]> {
  const result = await db
    .select({
      id: bookmarks.id,
      url: bookmarks.url,
      domain: bookmarks.domain,
      title: bookmarks.title,
      description: bookmarks.description,
      imageUrl: bookmarks.imageUrl,
      x: bookmarks.x,
      y: bookmarks.y,
      createdAt: bookmarks.createdAt,
    })
    .from(bookmarks)
    .where(eq(bookmarks.boardId, boardId));
    
  return result;
}

/**
 * Get user's board with share token
 */
export async function getUserBoardWithShareToken(userId: string): Promise<ShareableBoard | null> {
  const result = await db
    .select()
    .from(boards)
    .where(eq(boards.userId, userId))
    .limit(1);
    
  return result.length > 0 ? result[0] : null;
}

/**
 * Revoke share token (disable sharing)
 */
export async function revokeShareToken(boardId: string, userId: string): Promise<void> {
  await db
    .update(boards)
    .set({ shareToken: null })
    .where(
      and(
        eq(boards.id, boardId),
        eq(boards.userId, userId)
      )
    );
}
