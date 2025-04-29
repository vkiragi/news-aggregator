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

export default function TopStoriesPage() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchTopNews = async () => {
    try {
      setIsLoading(true);
      // Fetch business news as our "top stories" for this demo
      const response = await axios.get('/api/news?category=business');
      
      if (response.data && response.data.articles) {
        // Take only the first 6 stories for "top stories"
        const topArticles = response.data.articles.slice(0, 6).map((article: any, index: number) => ({
          id: article.url || `article-${index}-${Date.now()}`,
          title: article.title || "No title available",
          description: article.description || "No description available",
          url: article.url,
          urlToImage: article.urlToImage || undefined,
          publishedAt: article.publishedAt,
          source: {
            id: article.source?.id || null,
            name: article.source?.name || "Unknown Source"
          },
          sentiment: getRandomSentiment(),
          summary: `This is a summary of this top story about ${article.title.split(' ').slice(0, 5).join(' ')}...`,
          isSaved: false
        }));
        
        setArticles(topArticles);
      }
    } catch (error) {
      console.error("Error fetching top news:", error);
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
    fetchTopNews();
  }, []);
  
  const handleSaveArticle = (articleId: string) => {
    console.log(`Top article ${articleId} saved`);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Top Stories</h1>
        <p className="text-muted-foreground">
          Most important and trending news stories
        </p>
      </div>
      
      {isLoading ? (
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={article} 
              onSave={handleSaveArticle} 
            />
          ))}
          
          {articles.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No top stories found.</p>
              <p className="text-sm mt-2">Try again later or check your internet connection.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 