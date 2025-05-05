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
  // Ensure params is properly awaited
  const resolvedParams = await Promise.resolve(params);
  console.log("🔍 ArticlePage: Starting with params.id:", resolvedParams.id);
  
  try {
    const user = await currentUser();
    
    console.log("🔍 ArticlePage: User check result:", user ? "User found" : "No user");
    
    if (!user) {
      console.log("❌ ArticlePage: No user found, redirecting to sign-in");
      return redirect(`/sign-in?redirect_url=${encodeURIComponent("/dashboard")}`);
    }
    
    // Find our user in the database
    let dbUser = await db.user.findUnique({
      where: { clerkId: user.id },
    });
    
    console.log("🔍 ArticlePage: Database user check:", dbUser ? "DB User found" : "No DB user");
    
    // If user doesn't exist in the database, create them
    if (!dbUser) {
      console.log("🔍 ArticlePage: Creating new database user for", user.id);
      dbUser = await db.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || "",
          name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          image: user.imageUrl,
        },
      });
      console.log("✅ ArticlePage: User created in database");
    }
    
    // Safely decode the ID
    const decodedId = decodeURIComponent(resolvedParams.id);
    console.log("🔍 ArticlePage: Decoded ID:", decodedId);
    
    // Check if the URL is from a problematic domain
    const isProblematicDomain = PROBLEMATIC_DOMAINS.some(domain => decodedId.includes(domain));
    console.log("🔍 ArticlePage: Is problematic domain?", isProblematicDomain, 
      isProblematicDomain ? "Matching domain: " + PROBLEMATIC_DOMAINS.find(domain => decodedId.includes(domain)) : "");
    
    if (isProblematicDomain) {
      console.log("ℹ️ ArticlePage: Handling as problematic domain, showing external link page");
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
        console.log("🔍 ArticlePage: Further decoded ID:", finalDecodedId);
      }
    } catch (e) {
      console.error("❌ ArticlePage: Error decoding URL:", e);
    }
    
    // Check if the ID is a MongoDB ID (24 hex characters)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(finalDecodedId);
    console.log("🔍 ArticlePage: Is MongoDB ID?", isMongoId);
    
    // Find the article
    let article;
    
    try {
      if (isMongoId) {
        // Query by MongoDB ID
        console.log("🔍 ArticlePage: Querying by MongoDB ID:", finalDecodedId);
        article = await db.article.findUnique({
          where: { id: finalDecodedId },
          include: {
            source: true,
            savedBy: {
              where: { userId: dbUser.id }
            }
          }
        });
        console.log("🔍 ArticlePage: MongoDB ID query result:", article ? "Found" : "Not found");
      } else {
        // Try to find by exact URL match
        console.log("🔍 ArticlePage: Querying by exact URL match:", finalDecodedId);
        article = await db.article.findFirst({
          where: { url: finalDecodedId },
          include: {
            source: true,
            savedBy: {
              where: { userId: dbUser.id }
            }
          }
        });
        console.log("🔍 ArticlePage: Exact URL query result:", article ? "Found" : "Not found");
        
        // If no article found, try simpler partial matching
        if (!article) {
          try {
            // Try to extract just the domain and path
            const simpleUrl = finalDecodedId.split('?')[0].split('#')[0];
            console.log("🔍 ArticlePage: Trying partial URL match with simplified URL:", simpleUrl);
            
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
            console.log("🔍 ArticlePage: Partial URL query result:", article ? "Found" : "Not found");
          } catch (urlError) {
            console.error("❌ ArticlePage: Error parsing URL:", urlError);
          }
        }
      }
    } catch (error) {
      console.error("❌ ArticlePage: Error fetching article:", error);
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
      console.log("❌ ArticlePage: No article found, showing not found page");
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

    console.log("✅ ArticlePage: Article found, rendering detail page for:", article.title);
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
  } catch (error) {
    console.error("❌ ArticlePage: Unexpected error:", error);
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4">
        <h1 className="text-2xl font-bold">Error loading article</h1>
        <p className="text-muted-foreground">There was an unexpected error loading this article.</p>
        <Button asChild>
          <Link href="/dashboard">Go back to dashboard</Link>
        </Button>
      </div>
    );
  }
} 