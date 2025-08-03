import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    // Find user in database
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

    // Build query based on user preferences
    const whereConditions: any[] = [];

    // Add category-based filtering
    if (dbUser.userPreferences.length > 0) {
      const categoryIds = dbUser.userPreferences.map(pref => pref.categoryId);
      whereConditions.push({
        articleCategories: {
          some: {
            categoryId: {
              in: categoryIds
            }
          }
        }
      });
    }

    // Add keyword-based filtering
    if (dbUser.userKeywords.length > 0) {
      const keywords = dbUser.userKeywords.map(kw => kw.keyword.toLowerCase());
      whereConditions.push({
        OR: [
          {
            title: {
              contains: keywords.join('|'),
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: keywords.join('|'),
              mode: 'insensitive'
            }
          },
          {
            content: {
              contains: keywords.join('|'),
              mode: 'insensitive'
            }
          },
          {
            tags: {
              hasSome: keywords
            }
          }
        ]
      });
    }

    // Add specific interest filtering
    const allInterests = [
      ...dbUser.preferredSports,
      ...dbUser.preferredPolitics,
      ...dbUser.preferredTech,
      ...dbUser.preferredBusiness,
      ...dbUser.preferredEntertainment,
      ...dbUser.preferredScience,
      ...dbUser.preferredLifestyle
    ];

    if (allInterests.length > 0) {
      const interestKeywords = allInterests.map(interest => interest.toLowerCase());
      whereConditions.push({
        OR: [
          {
            title: {
              contains: interestKeywords.join('|'),
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: interestKeywords.join('|'),
              mode: 'insensitive'
            }
          },
          {
            content: {
              contains: interestKeywords.join('|'),
              mode: 'insensitive'
            }
          },
          {
            tags: {
              hasSome: interestKeywords
            }
          }
        ]
      });
    }

    // If no preferences set, return recent articles
    const finalWhere = whereConditions.length > 0 
      ? { OR: whereConditions }
      : {};

    // Fetch articles with scoring based on preferences
    const articles = await db.article.findMany({
      where: finalWhere,
      include: {
        source: true,
        articleCategories: {
          include: {
            category: true
          }
        },
        savedBy: {
          where: { userId: dbUser.id }
        }
      },
      orderBy: {
        publishedAt: 'desc'
      },
      skip,
      take: limit
    });

    // Score and sort articles based on user preferences
    const scoredArticles = articles.map(article => {
      let score = 0;
      
      // Score based on category preferences
      for (const userPref of dbUser.userPreferences) {
        const hasCategory = article.articleCategories.some(
          ac => ac.categoryId === userPref.categoryId
        );
        if (hasCategory) {
          score += userPref.weight;
        }
      }

      // Score based on keywords
      for (const userKeyword of dbUser.userKeywords) {
        const keyword = userKeyword.keyword.toLowerCase();
        const titleMatch = article.title.toLowerCase().includes(keyword);
        const descMatch = article.description?.toLowerCase().includes(keyword);
        const contentMatch = article.content?.toLowerCase().includes(keyword);
        const tagMatch = article.tags?.some(tag => tag.toLowerCase().includes(keyword));
        
        if (titleMatch || descMatch || contentMatch || tagMatch) {
          score += userKeyword.weight;
        }
      }

      // Score based on specific interests
      const allInterests = [
        ...dbUser.preferredSports,
        ...dbUser.preferredPolitics,
        ...dbUser.preferredTech,
        ...dbUser.preferredBusiness,
        ...dbUser.preferredEntertainment,
        ...dbUser.preferredScience,
        ...dbUser.preferredLifestyle
      ];

      for (const interest of allInterests) {
        const interestLower = interest.toLowerCase();
        const titleMatch = article.title.toLowerCase().includes(interestLower);
        const descMatch = article.description?.toLowerCase().includes(interestLower);
        const contentMatch = article.content?.toLowerCase().includes(interestLower);
        const tagMatch = article.tags?.some(tag => tag.toLowerCase().includes(interestLower));
        
        if (titleMatch || descMatch || contentMatch || tagMatch) {
          score += 0.5; // Lower weight for general interests
        }
      }

      // Bonus for recent articles
      const hoursSincePublished = (Date.now() - article.publishedAt.getTime()) / (1000 * 60 * 60);
      if (hoursSincePublished < 24) {
        score += 0.3;
      } else if (hoursSincePublished < 72) {
        score += 0.1;
      }

      return {
        ...article,
        score,
        isSaved: article.savedBy.length > 0
      };
    });

    // Sort by score (highest first) and then by publish date
    scoredArticles.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.publishedAt.getTime() - a.publishedAt.getTime();
    });

    // Remove score from response
    const finalArticles = scoredArticles.map(({ score, ...article }) => article);

    return NextResponse.json({
      articles: finalArticles,
      totalResults: finalArticles.length,
      page,
      hasMore: finalArticles.length === limit
    });

  } catch (error) {
    console.error('Error fetching personalized news:', error);
    return NextResponse.json(
      { error: 'Failed to fetch personalized news' },
      { status: 500 }
    );
  }
} 