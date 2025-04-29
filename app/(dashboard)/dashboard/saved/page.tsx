import { Button } from "@/components/ui/button";
import { Bookmark, BookmarkX, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

type ArticleWithSource = {
  id: string;
  title: string;
  description: string | null;
  content: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: Date;
  source: {
    id: string;
    name: string;
  } | null;
};

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
        <div className="grid gap-6">
          {savedArticles.map((article) => (
            <Card key={article.id} className="overflow-hidden">
              <div className="md:flex">
                {article.urlToImage && (
                  <div className="md:w-1/3 h-48 md:h-auto">
                    <img 
                      src={article.urlToImage} 
                      alt={article.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
                <div className="md:w-2/3 p-6">
                  <CardHeader className="p-0 pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{article.title}</CardTitle>
                      <Button variant="ghost" size="icon" className="ml-2 flex-shrink-0">
                        <BookmarkX className="h-5 w-5" />
                        <span className="sr-only">Remove from saved</span>
                      </Button>
                    </div>
                    <CardDescription className="flex items-center text-sm mt-1">
                      <span>{article.source?.name || "Unknown source"}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0 py-4">
                    <p className="line-clamp-3">{article.description}</p>
                  </CardContent>
                  <CardFooter className="p-0 pt-2 flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/article/${article.id}`}>
                        Read Article
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={article.url} target="_blank" rel="noopener noreferrer" className="flex items-center">
                        <ExternalLink className="h-4 w-4 mr-1" />
                        Source
                      </a>
                    </Button>
                  </CardFooter>
                </div>
              </div>
            </Card>
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