import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user || !user.id) {
      return NextResponse.json(
        { error: "You must be signed in to save articles" },
        { status: 401 }
      );
    }

    const clerkId = user.id;
    const { articleId, action } = await req.json();

    if (!articleId) {
      return NextResponse.json(
        { error: "Article ID is required" },
        { status: 400 }
      );
    }

    if (action !== "save" && action !== "unsave") {
      return NextResponse.json(
        { error: "Invalid action. Must be 'save' or 'unsave'" },
        { status: 400 }
      );
    }

    // Find or create user in our database
    let dbUser = await db.user.findUnique({
      where: { clerkId }
    });

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          clerkId,
          email: user.emailAddresses[0].emailAddress,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          image: user.imageUrl
        }
      });
    }

    // Check if the article exists
    const article = await db.article.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }

    if (action === "save") {
      // Check if already saved
      const existingSaved = await db.savedArticle.findFirst({
        where: {
          userId: dbUser.id,
          articleId
        }
      });

      if (existingSaved) {
        return NextResponse.json(
          { message: "Article already saved" },
          { status: 200 }
        );
      }

      // Save the article
      await db.savedArticle.create({
        data: {
          userId: dbUser.id,
          articleId
        }
      });

      return NextResponse.json(
        { message: "Article saved successfully" },
        { status: 200 }
      );
    } else {
      // Unsave the article
      await db.savedArticle.deleteMany({
        where: {
          userId: dbUser.id,
          articleId
        }
      });

      return NextResponse.json(
        { message: "Article removed from saved items" },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error saving article:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 