import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

// GET - Retrieve user preferences
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Find or create user in database
    let dbUser = await db.user.findUnique({
      where: { clerkId: userId },
      include: {
        userPreferences: {
          include: {
            category: true
          }
        },
        userKeywords: true
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        preferredSports: dbUser.preferredSports,
        preferredPolitics: dbUser.preferredPolitics,
        preferredTech: dbUser.preferredTech,
        preferredBusiness: dbUser.preferredBusiness,
        preferredEntertainment: dbUser.preferredEntertainment,
        preferredScience: dbUser.preferredScience,
        preferredLifestyle: dbUser.preferredLifestyle,
        emailNotifications: dbUser.emailNotifications,
        dailyDigest: dbUser.dailyDigest,
        breakingNewsAlerts: dbUser.breakingNewsAlerts,
        preferredReadingTime: dbUser.preferredReadingTime,
        preferredArticleLength: dbUser.preferredArticleLength,
        userPreferences: dbUser.userPreferences,
        userKeywords: dbUser.userKeywords
      }
    });
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user preferences' },
      { status: 500 }
    );
  }
}

// POST - Update user preferences
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

    const body = await request.json();
    const {
      categoryPreferences,
      keywords,
      preferredSports,
      preferredPolitics,
      preferredTech,
      preferredBusiness,
      preferredEntertainment,
      preferredScience,
      preferredLifestyle,
      emailNotifications,
      dailyDigest,
      breakingNewsAlerts,
      preferredReadingTime,
      preferredArticleLength
    } = body;

    // Find or create user in database
    let dbUser = await db.user.findUnique({
      where: { clerkId: userId }
    });

    if (!dbUser) {
      dbUser = await db.user.create({
        data: {
          clerkId: userId,
          email: user.emailAddresses[0]?.emailAddress || '',
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          image: user.imageUrl,
        }
      });
    }

    // Update basic user preferences
    const updateData: any = {};
    
    if (preferredSports !== undefined) updateData.preferredSports = preferredSports;
    if (preferredPolitics !== undefined) updateData.preferredPolitics = preferredPolitics;
    if (preferredTech !== undefined) updateData.preferredTech = preferredTech;
    if (preferredBusiness !== undefined) updateData.preferredBusiness = preferredBusiness;
    if (preferredEntertainment !== undefined) updateData.preferredEntertainment = preferredEntertainment;
    if (preferredScience !== undefined) updateData.preferredScience = preferredScience;
    if (preferredLifestyle !== undefined) updateData.preferredLifestyle = preferredLifestyle;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (dailyDigest !== undefined) updateData.dailyDigest = dailyDigest;
    if (breakingNewsAlerts !== undefined) updateData.breakingNewsAlerts = breakingNewsAlerts;
    if (preferredReadingTime !== undefined) updateData.preferredReadingTime = preferredReadingTime;
    if (preferredArticleLength !== undefined) updateData.preferredArticleLength = preferredArticleLength;

    // Update user preferences
    if (Object.keys(updateData).length > 0) {
      await db.user.update({
        where: { id: dbUser.id },
        data: updateData
      });
    }

    // Update category preferences
    if (categoryPreferences) {
      // Clear existing preferences
      await db.userPreference.deleteMany({
        where: { userId: dbUser.id }
      });

      // Add new preferences
      for (const pref of categoryPreferences) {
        if (pref.categoryId && pref.weight !== undefined) {
          await db.userPreference.create({
            data: {
              userId: dbUser.id,
              categoryId: pref.categoryId,
              weight: pref.weight
            }
          });
        }
      }
    }

    // Update keywords
    if (keywords) {
      // Clear existing keywords
      await db.userKeyword.deleteMany({
        where: { userId: dbUser.id }
      });

      // Add new keywords
      for (const keyword of keywords) {
        if (keyword.keyword) {
          await db.userKeyword.create({
            data: {
              userId: dbUser.id,
              keyword: keyword.keyword,
              category: keyword.category,
              weight: keyword.weight || 1.0
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    return NextResponse.json(
      { error: 'Failed to update user preferences' },
      { status: 500 }
    );
  }
} 