import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { generateShareToken, getUserBoardWithShareToken, revokeShareToken } from "@/lib/share";

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
      
      const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/board/${shareToken}`;
      console.log("Generated shareUrl:", shareUrl);
      
      return NextResponse.json({ 
        shareToken, 
        shareUrl,
        boardId: board.id 
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

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const board = await getUserBoardWithShareToken(user.id);
    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }
    
    const shareUrl = board.shareToken 
      ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/board/${board.shareToken}`
      : null;
    
    return NextResponse.json({ 
      shareToken: board.shareToken,
      shareUrl,
      isShared: !!board.shareToken 
    });
  } catch (error) {
    console.error("Error getting share status:", error);
    return NextResponse.json(
      { error: "Failed to get share status" },
      { status: 500 }
    );
  }
}
