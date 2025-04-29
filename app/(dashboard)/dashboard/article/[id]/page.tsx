import { ArrowLeft, CalendarIcon, Globe, Tag } from "lucide-react";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ArticleSaveButton } from "@/components/ArticleSaveButton";

interface ArticlePageProps {
  params: {
    id: string;
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await db.article.findUnique({
    where: {
      id: params.id
    },
    include: {
      source: true
    }
  });

  if (!article) {
    notFound();
  }

  // Get sentiment class
  const getSentimentClass = (sentiment: string | null) => {
    if (!sentiment) return "";
    
    switch(sentiment) {
      case "POSITIVE":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "NEGATIVE":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden">
        {article.urlToImage && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={article.urlToImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            {article.source && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Globe className="mr-1 h-3 w-3" />
                {article.source.name}
              </div>
            )}
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarIcon className="mr-1 h-3 w-3" />
              {formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}
            </div>
            {article.sentiment && (
              <Badge variant="outline" className={getSentimentClass(article.sentiment)}>
                {article.sentiment.toLowerCase()}
              </Badge>
            )}
          </div>

          <h1 className="text-3xl font-bold tracking-tight mb-4">{article.title}</h1>
          
          {article.description && (
            <p className="text-lg text-muted-foreground mb-6">{article.description}</p>
          )}

          {article.content ? (
            <div className="prose dark:prose-invert max-w-none">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <div className="prose dark:prose-invert max-w-none">
              <p>No content available. <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Read the full article on the source website.</a></p>
            </div>
          )}

          {article.summary && (
            <div className="mt-8 p-4 bg-muted rounded-lg">
              <h3 className="font-semibold mb-2">AI Summary</h3>
              <p>{article.summary}</p>
            </div>
          )}

          <div className="mt-6 flex gap-2">
            <Button asChild>
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                Read Original Article
              </a>
            </Button>
            <ArticleSaveButton articleId={article.id} />
          </div>
        </div>
      </Card>
    </div>
  );
} 