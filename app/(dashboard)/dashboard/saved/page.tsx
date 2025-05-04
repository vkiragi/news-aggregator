import { Button } from "@/components/ui/button";
import { Bookmark } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { ArticleCard } from "@/components/ArticleCard";

export default async function SavedArticlesPage() {
  const user = await currentUser();
  
  // Initialize empty array for saved articles
  let savedArticles: any[] = [];
  
  if (user) {
    // Find the user in our database
    const dbUser = await db.user.findUnique({
      where: { clerkId: user.id }
    });
    
    if (dbUser) {
      // Get saved articles for this user
      savedArticles = await db.article.findMany({
        where: {
          savedBy: {
            some: {
              userId: dbUser.id
            }
          }
        },
        orderBy: {
          publishedAt: 'desc'
        },
        include: {
          source: true
        }
      });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Saved Articles</h1>
        <p className="text-muted-foreground">
          Articles you've saved for later reading
        </p>
      </div>

      {savedArticles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {savedArticles.map((article) => (
            <ArticleCard 
              key={article.id} 
              article={{
                id: article.id,
                title: article.title,
                description: article.description || '',
                url: article.url,
                urlToImage: article.urlToImage || undefined,
                publishedAt: article.publishedAt.toString(),
                source: article.source || { id: null, name: 'Unknown' },
                sentiment: article.sentiment as "POSITIVE" | "NEUTRAL" | "NEGATIVE" | undefined,
                summary: article.summary || undefined,
                isSaved: true
              }} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Bookmark className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No saved articles yet</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-6">
            When you find articles you want to read later, click the bookmark icon to save them here.
          </p>
          <Button asChild>
            <Link href="/dashboard">Browse Articles</Link>
          </Button>
        </div>
      )}
    </div>
  );
} 