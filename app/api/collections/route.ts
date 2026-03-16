import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  generateClusterSuggestions,
  createCollectionFromSuggestion,
  getBoardCollections,
  deleteCollection,
  clearBoardCollections,
} from "@/lib/clustering";
import { getUserBookmarks } from "@/lib/bookmarks";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");

    if (action === "suggestions") {
      // Get clustering suggestions
      const bookmarks = await getUserBookmarks(user.id);
      const bookmarkNodes = bookmarks.map((b) => ({
        id: b.id,
        url: b.url,
        title: b.title || b.domain,
        domain: b.domain,
        description: b.description || undefined,
        image: b.imageUrl || undefined,
        x: b.x,
        y: b.y,
        collectionId: b.collectionId || undefined,
        createdAt: b.createdAt,
      }));

      // We need to get the boardId - for now, let's assume single board per user
      const boardId = bookmarks[0]?.boardId;
      if (!boardId) {
        return NextResponse.json({ suggestions: [] });
      }

      const suggestions = await generateClusterSuggestions(
        boardId,
        bookmarkNodes
      );
      return NextResponse.json({ suggestions });
    }

    // Default: return all collections for user's board
    const bookmarks = await getUserBookmarks(user.id);
    const boardId = bookmarks[0]?.boardId;

    if (!boardId) {
      return NextResponse.json({ collections: [] });
    }

    const collections = await getBoardCollections(boardId);
    return NextResponse.json({ collections });
  } catch (error) {
    console.error("Error in collections API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, suggestion } = body;

    if (action === "create-from-suggestion") {
      // Get user's board ID and bookmarks
      const bookmarks = await getUserBookmarks(user.id);
      const boardId = bookmarks[0]?.boardId;

      if (!boardId) {
        return NextResponse.json({ error: "No board found" }, { status: 404 });
      }

      // Convert bookmarks to the format expected by clustering logic
      const bookmarkNodes = bookmarks.map((b) => ({
        id: b.id,
        url: b.url,
        title: b.title || b.domain,
        domain: b.domain,
        description: b.description || undefined,
        image: b.imageUrl || undefined,
        x: b.x,
        y: b.y,
        collectionId: b.collectionId || undefined,
        createdAt: b.createdAt,
      }));

      const collection = await createCollectionFromSuggestion(
        suggestion,
        boardId,
        bookmarkNodes
      );
      return NextResponse.json({ collection });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error creating collection:", error);
    return NextResponse.json(
      { error: "Failed to create collection" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const collectionId = searchParams.get("id");
    const action = searchParams.get("action");

    if (action === "clear-all") {
      // Clear all collections for user's board
      const bookmarks = await getUserBookmarks(user.id);
      const boardId = bookmarks[0]?.boardId;

      if (!boardId) {
        return NextResponse.json({ error: "No board found" }, { status: 404 });
      }

      await clearBoardCollections(boardId);
      return NextResponse.json({ success: true });
    }

    if (!collectionId) {
      return NextResponse.json(
        { error: "Collection ID is required" },
        { status: 400 }
      );
    }

    // Delete specific collection
    await deleteCollection(collectionId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting collection:", error);
    return NextResponse.json(
      { error: "Failed to delete collection" },
      { status: 500 }
    );
  }
}
