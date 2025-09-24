import { NextRequest, NextResponse } from "next/server";
import { getBoardByShareToken, getPublicBookmarks } from "@/lib/share";

// Ensure no caching so revoked links stop working immediately
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;
    console.log("Fetching board with shareToken:", shareToken);

    const board = await getBoardByShareToken(shareToken);
    console.log("Found board:", board);

    if (!board) {
      console.log("Board not found for shareToken:", shareToken);
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const bookmarks = await getPublicBookmarks(board.id);
    console.log("Found bookmarks:", bookmarks.length);

    return NextResponse.json(
      {
        board: {
          id: board.id,
          name: board.name,
          createdAt: board.createdAt,
        },
        bookmarks: bookmarks.map((bookmark) => ({
          id: bookmark.id,
          url: bookmark.url,
          title: bookmark.title || bookmark.domain,
          domain: bookmark.domain,
          image: bookmark.imageUrl,
          x: bookmark.x,
          y: bookmark.y,
        })),
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  } catch (error) {
    console.error("Error fetching public board:", error);
    return NextResponse.json(
      { error: "Failed to fetch board" },
      { status: 500 }
    );
  }
}
