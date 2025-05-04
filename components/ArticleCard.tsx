"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ArticleSaveButton } from "@/components/ArticleSaveButton";

interface ArticleCardProps {
  article: {
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
  };
  onSave?: (articleId: string) => void;
}

export function ArticleCard({ article, onSave }: ArticleCardProps) {
  // Get sentiment color
  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment) {
      case "POSITIVE":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "NEGATIVE":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "NEUTRAL":
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };
  
  const formattedDate = formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });
  
  // Create a safe URL for the article detail page
  // Use the MongoDB ObjectID when possible, or properly encode the URL for external articles
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(article.id); // MongoDB ObjectIDs are 24 hex characters
  const articleDetailPath = isMongoId 
    ? `/dashboard/article/${article.id}` 
    : `/dashboard/article/${encodeURIComponent(article.url)}`;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md h-full flex flex-col">
      {article.urlToImage && (
        <div className="relative w-full h-48 overflow-hidden">
          <Link href={articleDetailPath} prefetch={true}>
            <img 
              src={article.urlToImage} 
              alt={article.title} 
              className="w-full h-full object-cover transition-transform hover:scale-105"
            />
          </Link>
        </div>
      )}
      
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start gap-2 mb-2">
          <Link 
            href={articleDetailPath}
            className="text-lg font-semibold hover:underline line-clamp-2"
            prefetch={true}
          >
            {article.title}
          </Link>
          
          <ArticleSaveButton 
            articleId={article.id} 
            articleUrl={article.url}
            initialSaved={article.isSaved} 
          />
        </div>
        
        <p className="text-muted-foreground text-sm line-clamp-3 mb-3 flex-1">
          {article.description}
        </p>
        
        <div className="mt-auto">
          <div className="flex justify-between items-center w-full">
            <div className="text-sm text-muted-foreground">
              {formattedDate}
            </div>
            
            <HoverCard>
              <HoverCardTrigger>
                <Badge className={`${getSentimentColor(article.sentiment)} cursor-help`}>
                  {article.sentiment?.toLowerCase() || "neutral"}
                </Badge>
              </HoverCardTrigger>
              <HoverCardContent className="w-80">
                {article.summary ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Summary</h4>
                    <p className="text-sm">{article.summary}</p>
                  </div>
                ) : (
                  <p className="text-sm">No summary available</p>
                )}
              </HoverCardContent>
            </HoverCard>
          </div>
          
          <div className="text-xs text-muted-foreground mt-2">
            Source: {article.source.name}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 