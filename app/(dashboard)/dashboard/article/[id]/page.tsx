import Link from "next/link";
import { redirect } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, CalendarIcon, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArticleSaveButton } from "@/components/ArticleSaveButton";

interface ArticlePageProps {
  params: {
    id: string;
  };
}

// List of domains that are known to be problematic
const PROBLEMATIC_DOMAINS = [
  'wsj.com',
  'abcnews.go.com',
  'nytimes.com',
  'washingtonpost.com',
  'bloomberg.com'
];

export default async function ArticlePage({ params }: ArticlePageProps) {
  const user = await currentUser();
  
  if (!user) {
    return redirect(`/sign-in?redirect_url=${encodeURIComponent("/dashboard")}`);
  }
  
  // Find our user in the database
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
  });
  
  if (!dbUser) {
    return redirect(`/sign-in?redirect_url=${encodeURIComponent("/dashboard")}`);
  }
  
  // Safely decode the ID
  const decodedId = decodeURIComponent(params.id);
  
  // Check if the URL is from a problematic domain
  const isProblematicDomain = PROBLEMATIC_DOMAINS.some(domain => decodedId.includes(domain));
  
  if (isProblematicDomain) {
    // For problematic domains, show a direct link to the external article
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
          <div className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">External Article</h1>
            <p className="mb-6">This article is from a source that requires direct access.</p>
            
            <div className="flex justify-center mb-4">
              <ExternalLink size={48} className="text-muted-foreground" />
            </div>
            
            <p className="mb-8 text-muted-foreground break-all">{decodedId}</p>
            
            <div className="flex justify-center">
              <Button asChild size="lg">
                <a href={decodedId} target="_blank" rel="noopener noreferrer" className="flex items-center">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Original Article
                </a>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }
  
  // Improve URL decoding for complex URLs
  let finalDecodedId = decodedId;
  try {
    // Check if it still contains encoded characters
    if (decodedId.includes('%')) {
      finalDecodedId = decodeURIComponent(decodedId);
    }
  } catch (e) {
    console.error("Error decoding URL:", e);
  }
  
  // Check if the ID is a MongoDB ID (24 hex characters)
  const isMongoId = /^[0-9a-fA-F]{24}$/.test(finalDecodedId);
  
  // Find the article
  let article;
  
  try {
    if (isMongoId) {
      // Query by MongoDB ID
      article = await db.article.findUnique({
        where: { id: finalDecodedId },
        include: {
          source: true,
          savedBy: {
            where: { userId: dbUser.id }
          }
        }
      });
    } else {
      // Try to find by exact URL match
      article = await db.article.findFirst({
        where: { url: finalDecodedId },
        include: {
          source: true,
          savedBy: {
            where: { userId: dbUser.id }
          }
        }
      });
      
      // If no article found, try simpler partial matching
      if (!article) {
        try {
          // Try to extract just the domain and path
          const simpleUrl = finalDecodedId.split('?')[0].split('#')[0];
          
          article = await db.article.findFirst({
            where: {
              url: {
                contains: simpleUrl
              }
            },
            include: {
              source: true,
              savedBy: {
                where: { userId: dbUser.id }
              }
            },
            orderBy: {
              publishedAt: 'desc'
            }
          });
        } catch (urlError) {
          console.error("Error parsing URL:", urlError);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching article:", error);
    // Instead of failing, display a user-friendly error
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Error loading article</h1>
        <p className="text-muted-foreground">There was an error loading this article. The URL may be malformed.</p>
        <Button asChild>
          <Link href="/dashboard">Go back to dashboard</Link>
        </Button>
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Article not found</h1>
        <p className="text-muted-foreground">The article you're looking for doesn't exist or has been removed.</p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/dashboard">Go back to dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <a href={decodedId} target="_blank" rel="noopener noreferrer" className="flex items-center">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Original Link
            </a>
          </Button>
        </div>
      </div>
    );
  }

  const isSaved = article.savedBy.length > 0;
  
  // Get sentiment class
  const getSentimentClass = (sentiment: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'negative':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'neutral':
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
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
            <ArticleSaveButton 
              articleId={article.id} 
              articleUrl={article.url} 
              initialSaved={isSaved}
            />
          </div>
        </div>
      </Card>
    </div>
  );
} 