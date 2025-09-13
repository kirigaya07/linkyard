import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { clearUserBookmarks } from "@/lib/bookmarks";

export async function DELETE() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await clearUserBookmarks(user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing bookmarks:", error);
    return NextResponse.json(
      { error: "Failed to clear bookmarks" },
      { status: 500 }
    );
  }
}
