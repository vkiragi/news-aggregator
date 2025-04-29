import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const articleId = req.nextUrl.searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    // Find user in our database
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      return NextResponse.json(
        { isSaved: false },
        { status: 200 }
      );
    }

    // Check if article is saved
    const savedArticle = await db.savedArticle.findFirst({
      where: {
        userId: dbUser.id,
        articleId
      }
    });

    return NextResponse.json(
      { isSaved: !!savedArticle },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking saved status:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 