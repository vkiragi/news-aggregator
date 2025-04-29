"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Bookmark, BookmarkCheck, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    description: string;
    url: string;
    urlToImage?: string;
    publishedAt: string;
    source: {
      name: string;
    };
    sentiment?: "POSITIVE" | "NEUTRAL" | "NEGATIVE";
    summary?: string;
    isSaved?: boolean;
  };
  onSave?: (id: string) => void;
}

export function ArticleCard({ article, onSave }: ArticleCardProps) {
  const [isSaved, setIsSaved] = useState(article.isSaved || false);
  
  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(article.id);
  };
  
  // Determine sentiment color
  const getSentimentColor = () => {
    switch (article.sentiment) {
      case "POSITIVE":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "NEGATIVE":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    }
  };
  
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {article.urlToImage && (
        <div 
          className="h-48 bg-muted bg-cover bg-center" 
          style={{ backgroundImage: `url(${article.urlToImage})` }}
        />
      )}
      {!article.urlToImage && <div className="h-48 bg-muted" />}
      
      <CardHeader className="flex-1">
        <div className="flex justify-between items-start">
          <CardTitle className="line-clamp-2">
            {article.title}
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleSave}>
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4 text-primary" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <CardDescription className="line-clamp-3 mt-2">
          {article.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-wrap gap-2">
          {article.sentiment && (
            <Badge variant="outline" className={getSentimentColor()}>
              {article.sentiment}
            </Badge>
          )}
          <Badge variant="outline" className="bg-secondary/50">
            {article.source.name}
          </Badge>
        </div>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
          </div>
          
          <div className="flex items-center gap-2">
            {article.summary && (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-80">
                  <div className="font-semibold mb-1">AI Summary</div>
                  <p className="text-sm">{article.summary}</p>
                </HoverCardContent>
              </HoverCard>
            )}
            
            <Link href={article.url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm">Read More</Button>
            </Link>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
} 