import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// GET - Get user's saved articles
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        savedArticles: {
          include: {
            article: {
              include: {
                source: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      savedArticles: user.savedArticles.map(sa => sa.article) 
    });
  } catch (error) {
    console.error('Error fetching saved articles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save an article
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId } = await request.json();
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if already saved
    const existing = await db.savedArticle.findUnique({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId: articleId
        }
      }
    });

    if (existing) {
      return NextResponse.json({ message: 'Article already saved' });
    }

    // Save the article
    await db.savedArticle.create({
      data: {
        userId: user.id,
        articleId: articleId
      }
    });

    return NextResponse.json({ message: 'Article saved successfully' });
  } catch (error) {
    console.error('Error saving article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE - Remove saved article
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { articleId } = await request.json();
    if (!articleId) {
      return NextResponse.json({ error: 'Article ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await db.savedArticle.deleteMany({
      where: {
        userId: user.id,
        articleId: articleId
      }
    });

    return NextResponse.json({ message: 'Article removed from saved' });
  } catch (error) {
    console.error('Error removing saved article:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
