import { NextResponse } from 'next/server';
import axios from 'axios';
import { db } from '@/lib/db';
import SentimentAnalyzer from 'sentiment';

// Initialize the sentiment analyzer
const sentimentAnalyzer = new SentimentAnalyzer();

// Using string literals instead of importing from Prisma
type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

// Simple extractive summarization function
function extractiveSummarize(text: string, sentenceCount: number = 3): string {
  if (!text || text.trim().length === 0) {
    return '';
  }

  // Split text into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  // If there are fewer sentences than requested, return the whole text
  if (sentences.length <= sentenceCount) {
    return text.trim();
  }

  // Score each sentence based on its position (earlier sentences usually have more importance in news)
  // and length (very short sentences are less likely to be informative)
  const scoredSentences = sentences.map((sentence, index) => {
    const words = sentence.trim().split(/\s+/);
    const lengthScore = Math.min(words.length / 20, 1); // Normalize length score
    const positionScore = 1 - (index / sentences.length); // Earlier sentences get higher scores
    
    return {
      sentence: sentence.trim(),
      score: (positionScore * 0.6) + (lengthScore * 0.4), // Weight position more than length
      index
    };
  });

  // Sort by score and take the top N sentences
  const topSentences = scoredSentences
    .sort((a, b) => b.score - a.score)
    .slice(0, sentenceCount);

  // Sort by original position to maintain narrative flow
  topSentences.sort((a, b) => a.index - b.index);

  // Join the sentences back together
  return topSentences.map(item => item.sentence).join(' ');
}

// Sample news data for when API key is not available
const sampleNewsData = {
  status: "ok",
  totalResults: 4,
  articles: [
    {
      source: { id: "sample-source-1", name: "Tech Daily" },
      author: "Jane Doe",
      title: "AI Breakthrough in Natural Language Processing",
      description: "Researchers have made a significant breakthrough in teaching AI to understand and process natural language in context, with potential applications across multiple industries.",
      url: "https://example.com/article1",
      urlToImage: "https://placehold.co/600x400/5271ff/ffffff?text=AI+News",
      publishedAt: new Date().toISOString(),
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    },
    {
      source: { id: "sample-source-2", name: "Financial Times" },
      author: "John Smith",
      title: "Global Market Trends Indicate Economic Slowdown",
      description: "Recent global market indicators point to a potential economic slowdown in the coming quarters, with experts advising caution to investors.",
      url: "https://example.com/article2",
      urlToImage: "https://placehold.co/600x400/ff5252/ffffff?text=Economy",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      content: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    },
    {
      source: { id: "sample-source-3", name: "Environmental News" },
      author: "Emily Clark",
      title: "New Renewable Energy Project Launches",
      description: "A major renewable energy project has been launched, aiming to provide clean energy to over 100,000 homes and reduce carbon emissions significantly.",
      url: "https://example.com/article3",
      urlToImage: "https://placehold.co/600x400/52ff7a/000000?text=Green+Energy",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      content: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
    },
    {
      source: { id: "sample-source-4", name: "Sports Update" },
      author: "Michael Johnson",
      title: "Sports Team Announces New Stadium Plans",
      description: "The local sports team has announced plans for a new state-of-the-art stadium, set to be completed in the next three years.",
      url: "https://example.com/article4",
      urlToImage: "https://placehold.co/600x400/f8f8f8/333333?text=Sports+News",
      publishedAt: new Date(Date.now() - 10800000).toISOString(),
      content: "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
    }
  ]
};

// Define types for articles
interface NewsArticle {
  source: {
    id: string | null;
    name: string;
  };
  author?: string;
  title: string;
  description?: string;
  content?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
}

// Analyze sentiment directly using sentiment.js library
async function analyzeSentiment(content: string): Promise<Sentiment> {
  try {
    if (!content) {
      return 'NEUTRAL';
    }
    
    // Analyze sentiment using the sentiment.js library
    const result = sentimentAnalyzer.analyze(content);
    
    // Determine sentiment category based on the score
    let sentimentCategory: Sentiment = 'NEUTRAL';
    
    if (result.score > 2) {
      sentimentCategory = 'POSITIVE';
    } else if (result.score < -2) {
      sentimentCategory = 'NEGATIVE';
    }
    
    console.log(`Sentiment analysis: Score ${result.score}, Comparative: ${result.comparative}, Result: ${sentimentCategory}`);
    
    return sentimentCategory;
  } catch (error) {
    console.error('Error analyzing sentiment:', error);
    // Fallback to random sentiment if analysis fails
    return generateRandomSentiment();
  }
}

// Generate summary directly using extractive summarization
async function generateSummary(content: string): Promise<string | null> {
  try {
    if (!content) {
      return null;
    }
    
    // Generate summary using the extractive summarization method
    const summary = extractiveSummarize(content);
    return summary;
  } catch (error) {
    console.error('Error generating summary:', error);
    return null;
  }
}

// Generate a random sentiment for fallback
function generateRandomSentiment(): Sentiment {
  const sentiments: Sentiment[] = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'];
  return sentiments[Math.floor(Math.random() * sentiments.length)];
}

// Fetch news from the external API
async function fetchNewsFromAPI(category = 'general', page = 1) {
  const apiKey = process.env.NEWS_API_KEY;
  
  if (!apiKey) {
    console.warn('NEWS_API_KEY is not set. Using sample data instead.');
    return sampleNewsData;
  }
  
  try {
    const response = await axios.get('https://newsapi.org/v2/top-headlines', {
      params: {
        apiKey,
        country: 'us',
        category,
        page,
        pageSize: 10,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching news:', error);
    return sampleNewsData; // Use sample data as fallback
  }
}

// Save articles to database
async function saveArticlesToDB(articles: NewsArticle[], categoryName: string) {
  try {
    // Find or create the category
    let category = await db.category.findUnique({
      where: { name: categoryName },
    });

    if (!category) {
      category = await db.category.create({
        data: { name: categoryName }
      });
    }

    // Process each article
    for (const article of articles) {
      // Find or create the source
      let source = await db.source.findUnique({
        where: { name: article.source.name }
      });

      if (!source) {
        source = await db.source.create({
          data: {
            name: article.source.name,
            description: null,
            url: null,
            category: categoryName,
            language: 'en',
            country: 'us'
          }
        });
      }

      // Check if article already exists by URL
      const existingArticle = await db.article.findFirst({
        where: { url: article.url }
      });

      if (!existingArticle) {
        // Get the content for analysis and summarization
        const contentToAnalyze = article.content || article.description || article.title;
        
        // Call AI endpoints for sentiment and summary
        const [sentiment, summary] = await Promise.all([
          analyzeSentiment(contentToAnalyze),
          generateSummary(contentToAnalyze)
        ]);
        
        // Create the article with AI-generated sentiment and summary
        const newArticle = await db.article.create({
          data: {
            title: article.title,
            description: article.description || null,
            content: article.content || null,
            url: article.url,
            urlToImage: article.urlToImage || null,
            publishedAt: new Date(article.publishedAt),
            sourceId: source.id,
            sentiment: sentiment,
            summary: summary,
          }
        });

        // Link article to category
        await db.articleCategory.create({
          data: {
            articleId: newArticle.id,
            categoryId: category.id,
          }
        });
      }
    }

    return true;
  } catch (error) {
    console.error('Error saving to database:', error);
    return false;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'general';
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  try {
    // Fetch news from external API
    const newsData = await fetchNewsFromAPI(category, page);
    
    // Save to database in the background
    if (newsData.articles && newsData.articles.length > 0) {
      // Don't await this to make the API response faster
      saveArticlesToDB(newsData.articles, category).catch(err => 
        console.error('Background database save failed:', err)
      );
    }
    
    return NextResponse.json(newsData);
  } catch (error: any) {
    console.error('Error in news API:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch news articles' },
      { status: 500 }
    );
  }
} 