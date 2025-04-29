"use client";

import { useEffect, useState } from "react";
import { SaveArticleButton } from "@/components/SaveArticleButton";

interface ArticleSaveButtonProps {
  articleId: string;
}

export function ArticleSaveButton({ articleId }: ArticleSaveButtonProps) {
  const [isSaved, setIsSaved] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSavedStatus() {
      try {
        setLoading(true);
        const response = await fetch(`/api/articles/is-saved?articleId=${articleId}`);
        
        if (response.ok) {
          const data = await response.json();
          setIsSaved(data.isSaved);
        } else {
          console.error("Failed to check saved status");
          setIsSaved(false);
        }
      } catch (error) {
        console.error("Error checking saved status:", error);
        setIsSaved(false);
      } finally {
        setLoading(false);
      }
    }

    checkSavedStatus();
  }, [articleId]);

  if (loading || isSaved === null) {
    return null; // Or a loading spinner
  }

  return <SaveArticleButton articleId={articleId} isSaved={isSaved} />;
} 