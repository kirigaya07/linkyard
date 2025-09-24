import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import {
  generateShareToken,
  getUserBoardWithShareToken,
  revokeShareToken,
} from "@/lib/share";

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();

    if (action === "generate") {
      const board = await getUserBoardWithShareToken(user.id);
      console.log("Found board for user:", board);

      if (!board) {
        return NextResponse.json({ error: "Board not found" }, { status: 404 });
      }

      const shareToken = await generateShareToken(board.id, user.id);
      console.log("Generated shareToken:", shareToken);

      // Build share URL from the incoming request origin (works in prod/preview/dev)
      const origin = request.nextUrl.origin;
      const shareUrl = `${origin}/board/${shareToken}`;
      console.log("Generated shareUrl:", shareUrl);

      return NextResponse.json({
        shareToken,
        shareUrl,
        boardId: board.id,
      });
    }

    if (action === "revoke") {
      const board = await getUserBoardWithShareToken(user.id);
      if (!board) {
        return NextResponse.json({ error: "Board not found" }, { status: 404 });
      }

      await revokeShareToken(board.id, user.id);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error managing share:", error);
    return NextResponse.json(
      { error: "Failed to manage share" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const board = await getUserBoardWithShareToken(user.id);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    const origin = request.nextUrl.origin;
    const shareUrl = board.shareToken
      ? `${origin}/board/${board.shareToken}`
      : null;

    return NextResponse.json({
      shareToken: board.shareToken,
      shareUrl,
      isShared: !!board.shareToken,
    });
  } catch (error) {
    console.error("Error getting share status:", error);
    return NextResponse.json(
      { error: "Failed to get share status" },
      { status: 500 }
    );
  }
}
