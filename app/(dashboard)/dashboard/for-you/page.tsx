"use client";

import { useState, useEffect } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

// Article type definition for API responses
interface NewsArticle {
  id: string;
  title: string;
  description: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    id: string | null;
    name: string;
  };
  sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
  summary?: string;
  isSaved?: boolean;
}

export default function ForYouPage() {
  const { user } = useUser();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to create a consistent hash from URL for unique IDs
  const createArticleId = (url: string, index: number): string => {
    if (!url) return `article-${index}`;
    return btoa(url).replace(/[^a-zA-Z0-9]/g, '').substring(0, 24);
  };

  // Helper function to deduplicate articles
  const deduplicateArticles = (newArticles: NewsArticle[], existingArticles: NewsArticle[]): NewsArticle[] => {
    const existingUrls = new Set(existingArticles.map(article => article.url.toLowerCase()));
    return newArticles.filter(article => !existingUrls.has(article.url.toLowerCase()));
  };
  
  const fetchPersonalizedNews = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the personalized news API
      const response = await axios.get(`/api/news/personalized?page=${pageNum}&limit=10`);
      
      if (response.data && response.data.articles) {
        const newsArticles = response.data.articles.map((article: any, index: number) => ({
          id: article.id || createArticleId(article.url, index),
          title: article.title || "No title available",
          description: article.description || "No description available",
          url: article.url,
          urlToImage: article.urlToImage || undefined,
          publishedAt: article.publishedAt,
          source: {
            id: article.source?.id || null,
            name: article.source?.name || "Unknown Source"
          },
          sentiment: article.sentiment || "NEUTRAL",
          summary: article.summary || `This is a summary of the article about ${article.title.split(' ').slice(0, 5).join(' ')}...`,
          isSaved: article.isSaved || false
        }));
        
        if (pageNum === 1) {
          setArticles(newsArticles);
        } else {
          const uniqueNewArticles = deduplicateArticles(newsArticles, articles);
          setArticles(prev => [...prev, ...uniqueNewArticles]);
        }
        
        setHasMore(response.data.hasMore || false);
      }
    } catch (error) {
      console.error("Error fetching personalized news:", error);
      setError("Failed to load personalized news. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPersonalizedNews();
  }, []);
  
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPersonalizedNews(nextPage);
  };

  const handleSaveArticle = (articleId: string) => {
    console.log(`Article ${articleId} saved from personalized feed`);
    // Update the article's saved status in the local state
    setArticles(prev => 
      prev.map(article => 
        article.id === articleId 
          ? { ...article, isSaved: !article.isSaved }
          : article
      )
    );
  };

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">For You</h1>
          <p className="text-muted-foreground">
            Personalized news based on your interests and preferences
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={() => fetchPersonalizedNews(1)}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">For You</h1>
        <p className="text-muted-foreground">
          Personalized news based on your interests and preferences
        </p>
      </div>
      
      {articles.length === 0 && !isLoading ? (
        <div className="flex flex-col items-center justify-center space-y-4 py-12">
          <p className="text-muted-foreground">No personalized articles found.</p>
          <p className="text-sm text-muted-foreground">
            Try updating your preferences in Settings to see more relevant articles.
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onSave={() => handleSaveArticle(article.id)}
            />
          ))}
          
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              ))}
            </div>
          )}
          
          {hasMore && !isLoading && (
            <div className="flex justify-center">
              <Button onClick={handleLoadMore} variant="outline">
                Load More Articles
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 