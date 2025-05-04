"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveToggle = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch("/api/articles/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId,
          articleUrl,
          action: isSaved ? "unsave" : "save"
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save article");
      }

      setIsSaved(!isSaved);
      toast.success(isSaved ? "Article removed from saved items" : "Article saved successfully");
      
      // Refresh the current page to update the UI
      router.refresh();
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Failed to save article. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="icon"
      disabled={isLoading}
      onClick={handleSaveToggle}
      aria-label={isSaved ? "Unsave article" : "Save article"}
    >
      {isSaved ? (
        <CheckCircle2 className="h-5 w-5 text-green-500" />
      ) : (
        <Bookmark className="h-5 w-5" />
      )}
    </Button>
  );
} 