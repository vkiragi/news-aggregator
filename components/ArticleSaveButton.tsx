"use client";

import { useState, useEffect } from "react";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@clerk/nextjs";
import axios from "axios";

interface ArticleSaveButtonProps {
  articleId: string;
  articleUrl: string;
  initialSaved?: boolean;
}

export function ArticleSaveButton({ 
  articleId, 
  articleUrl, 
  initialSaved = false 
}: ArticleSaveButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { userId, isSignedIn } = useAuth();

  // Check if article is saved when component mounts
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (!isSignedIn || !userId) return;
      
      try {
        const response = await axios.get(`/api/articles/is-saved?url=${encodeURIComponent(articleUrl)}`);
        if (response.data && response.data.isSaved !== undefined) {
          setIsSaved(response.data.isSaved);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
      }
    };
    
    checkSavedStatus();
  }, [articleUrl, isSignedIn, userId]);

  const handleSave = async () => {
    if (!isSignedIn) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save articles",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post("/api/articles/save", {
        articleId,
        articleUrl,
        action: isSaved ? "unsave" : "save"
      });
      
      if (response.data && response.data.success) {
        setIsSaved(!isSaved);
        toast({
          title: isSaved ? "Article removed" : "Article saved",
          description: isSaved ? "Article removed from your saved items" : "Article added to your saved items",
          variant: "default"
        });
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast({
        title: "Error",
        description: "Could not save article. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={handleSave}
      disabled={isLoading}
      aria-label={isSaved ? "Unsave article" : "Save article"}
      title={isSaved ? "Remove from saved" : "Save for later"}
      className="transition-all hover:scale-110"
    >
      {isSaved ? (
        <BookmarkCheck className="h-5 w-5 text-primary" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
    </Button>
  );
} 