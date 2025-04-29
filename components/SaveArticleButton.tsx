"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface SaveArticleButtonProps {
  articleId: string;
  isSaved?: boolean;
}

export function SaveArticleButton({ articleId, isSaved = false }: SaveArticleButtonProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(isSaved);

  const handleSaveArticle = async () => {
    try {
      setSaving(true);
      
      const response = await fetch("/api/articles/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          articleId,
          action: saved ? "unsave" : "save",
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setSaved(!saved);
        toast(saved ? "Article removed from saved items" : "Article saved successfully", {
          icon: saved ? null : <CheckCircle className="h-4 w-4 text-green-500" />,
        });
      } else {
        throw new Error(data.error || "Something went wrong");
      }
    } catch (error) {
      console.error("Error saving article:", error);
      toast.error("Failed to save article. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Button
      variant={saved ? "default" : "outline"}
      size="sm"
      onClick={handleSaveArticle}
      disabled={saving}
      className={saved ? "bg-primary text-primary-foreground" : ""}
    >
      {saving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {saved ? "Removing..." : "Saving..."}
        </>
      ) : (
        <>
          <Bookmark className="mr-2 h-4 w-4" />
          {saved ? "Saved" : "Save Article"}
        </>
      )}
    </Button>
  );
} 