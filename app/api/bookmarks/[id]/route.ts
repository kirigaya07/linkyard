import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  updateBookmarkPosition,
  updateBookmarkMetadata,
  deleteBookmark,
} from "@/lib/bookmarks";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { x, y, title, description, imageUrl } = body;
    const { id } = await params;

    if (x !== undefined && y !== undefined) {
      // Update position
      await updateBookmarkPosition(id, user.id, x, y);
    }

    if (
      title !== undefined ||
      description !== undefined ||
      imageUrl !== undefined
    ) {
      // Update metadata
      await updateBookmarkMetadata(id, user.id, {
        title,
        description,
        imageUrl,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating bookmark:", error);
    return NextResponse.json(
      { error: "Failed to update bookmark" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await deleteBookmark(id, user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting bookmark:", error);
    return NextResponse.json(
      { error: "Failed to delete bookmark" },
      { status: 500 }
    );
  }
}
