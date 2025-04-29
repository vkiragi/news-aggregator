"use client";

import { useState, useEffect } from "react";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
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

export default function AllNewsPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  const fetchNews = async (pageNum = 1) => {
    try {
      setIsLoading(true);
      // Use the general category for "All News" page
      const response = await axios.get(`/api/news?category=general&page=${pageNum}`);
      
      if (response.data && response.data.articles) {
        const newsArticles = response.data.articles.map((article: any, index: number) => ({
          id: article.url || `article-${index}-${Date.now()}`, // Use URL as ID or generate one
          title: article.title || "No title available",
          description: article.description || "No description available", // Ensure description is never null
          url: article.url,
          urlToImage: article.urlToImage || undefined, // Convert null to undefined for optional prop
          publishedAt: article.publishedAt,
          source: {
            id: article.source?.id || null,
            name: article.source?.name || "Unknown Source"
          },
          // Add mock sentiment and summary until we implement AI processing
          sentiment: getRandomSentiment(),
          summary: `This is a summary of the article about ${article.title.split(' ').slice(0, 5).join(' ')}...`,
          isSaved: false
        }));
        
        if (pageNum === 1) {
          setArticles(newsArticles);
        } else {
          setArticles(prev => [...prev, ...newsArticles]);
        }
        
        setHasMore(newsArticles.length > 0);
      }
    } catch (error) {
      console.error("Error fetching news:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to generate random sentiment for demo purposes
  const getRandomSentiment = (): "POSITIVE" | "NEUTRAL" | "NEGATIVE" => {
    const sentiments: ["POSITIVE", "NEUTRAL", "NEGATIVE"] = ["POSITIVE", "NEUTRAL", "NEGATIVE"];
    return sentiments[Math.floor(Math.random() * sentiments.length)];
  };
  
  useEffect(() => {
    fetchNews();
  }, []);
  
  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage);
  };
  
  const handleSaveArticle = (articleId: string) => {
    // In a real app, this would call an API to save the article to the user's account
    console.log(`Article ${articleId} saved`);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">All News</h1>
        <p className="text-muted-foreground">
          Latest news from a variety of sources
        </p>
      </div>
      
      {isLoading && articles.length === 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="overflow-hidden rounded-lg border bg-background">
              <Skeleton className="h-48 w-full" />
              <div className="p-6">
                <Skeleton className="h-6 w-2/3 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                onSave={handleSaveArticle} 
              />
            ))}
          </div>
          
          {articles.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found.</p>
              <p className="text-sm mt-2">Try again later or check your internet connection.</p>
            </div>
          )}
          
          {hasMore && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={handleLoadMore}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
} 