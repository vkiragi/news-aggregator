import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const { articleId, articleUrl, action } = body;

    if (!articleId && !articleUrl) {
      return NextResponse.json({ error: 'Article ID or URL is required' }, { status: 400 });
    }

    if (!action || (action !== 'save' && action !== 'unsave')) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Find or create user in database
    let dbUser = await db.user.findUnique({
      where: {
        clerkId: userId
      }
    });

    // If user doesn't exist in our DB yet, create them
    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          clerkId: userId,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: `${user.firstName} ${user.lastName}`.trim() || user.username || ''
        }
      });
    }

    // Find article by ID or URL
    let article = null;
    if (articleId) {
      article = await db.article.findUnique({
        where: {
          id: articleId
        }
      });
    }

    // If article was not found by ID, look it up by URL
    if (!article && articleUrl) {
      article = await db.article.findFirst({
        where: {
          url: articleUrl
        }
      });
    }

    // If article doesn't exist in our DB, we can't save it
    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (action === 'save') {
      // Check if already saved
      const existingSave = await db.savedArticle.findFirst({
        where: {
          userId: dbUser.id,
          articleId: article.id
        }
      });

      if (existingSave) {
        return NextResponse.json({ message: 'Article already saved' }, { status: 200 });
      }

      // Save article
      await db.savedArticle.create({
        data: {
          userId: dbUser.id,
          articleId: article.id
        }
      });

      return NextResponse.json({ success: true, message: 'Article saved successfully' });
    } else {
      // Unsave article
      const savedArticle = await db.savedArticle.findFirst({
        where: {
          userId: dbUser.id,
          articleId: article.id
        }
      });

      if (savedArticle) {
        await db.savedArticle.delete({
          where: {
            id: savedArticle.id
          }
        });
      }

      return NextResponse.json({ success: true, message: 'Article removed from saved' });
    }
  } catch (error) {
    console.error('Error in save article API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 