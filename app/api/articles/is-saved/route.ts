import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get("url");
    
    if (!url) {
      return NextResponse.json(
        { error: "Article URL is required" },
        { status: 400 }
      );
    }
    
    // Get the current user
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { isSaved: false }
      );
    }
    
    // Find the article by URL
    let article;
    try {
      article = await db.article.findFirst({
        where: { url }
      });
    } catch (dbError) {
      console.error("Database error while finding article:", dbError);
      return NextResponse.json(
        { isSaved: false, debug: "Error querying for article" }
      );
    }
    
    if (!article) {
      console.log(`Article not found in database: ${url}`);
      return NextResponse.json(
        { isSaved: false, debug: "Article not in database" }
      );
    }
    
    // Check if the user has saved this article
    try {
      const savedArticle = await db.savedArticle.findFirst({
        where: {
          userId: user.id,
          articleId: article.id
        }
      });
      
      return NextResponse.json({ 
        isSaved: !!savedArticle 
      });
    } catch (dbError) {
      console.error("Database error while finding saved article:", dbError);
      return NextResponse.json(
        { isSaved: false, debug: "Error querying for saved article" }
      );
    }
    
  } catch (error) {
    console.error("Error checking saved status:", error);
    return NextResponse.json(
      { error: "Failed to check saved status", debug: String(error) },
      { status: 500 }
    );
  }
} 