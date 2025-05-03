import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: Request) {
  try {
    // Get the current user
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const userId = user.id;
    
    // Parse the request body
    const body = await request.json();
    const { articleUrl, action } = body;
    
    if (!articleUrl) {
      return NextResponse.json(
        { error: "Article URL is required" },
        { status: 400 }
      );
    }
    
    // Find the article by URL
    const article = await db.article.findFirst({
      where: { url: articleUrl }
    });
    
    if (!article) {
      return NextResponse.json(
        { error: "Article not found" },
        { status: 404 }
      );
    }
    
    // Find if the user has already saved this article
    const savedArticle = await db.savedArticle.findFirst({
      where: {
        userId,
        articleId: article.id
      }
    });
    
    if (action === "save" && !savedArticle) {
      // Save the article
      await db.savedArticle.create({
        data: {
          userId,
          articleId: article.id
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "Article saved successfully" 
      });
    } else if (action === "unsave" && savedArticle) {
      // Remove the saved article
      await db.savedArticle.delete({
        where: {
          id: savedArticle.id
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: "Article removed from saved items" 
      });
    }
    
    // If we get here, there was no change
    return NextResponse.json({ 
      success: true, 
      message: "No change needed",
      isSaved: !!savedArticle
    });
    
  } catch (error) {
    console.error("Error saving article:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
} 