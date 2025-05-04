import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Bookmark, Sparkles, Newspaper } from "lucide-react";
import { db } from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { ArticleCard } from "@/components/ArticleCard";

export default async function DashboardPage() {
  const user = await currentUser();
  
  // Fetch real stats from the database
  const articlesCount = await db.article.count();
  const sourcesCount = await db.source.count();
  const categoriesCount = await db.category.count();
  
  // Later we can add user-specific stats like saved articles
  const savedCount = 0; // This will be implemented with user preferences

  const stats = [
    { title: "Total Sources", value: sourcesCount, icon: Newspaper },
    { title: "Articles Available", value: articlesCount, icon: TrendingUp },
    { title: "Categories", value: categoriesCount, icon: Sparkles },
    { title: "Saved Articles", value: savedCount, icon: Bookmark },
  ];

  // Fetch recent articles
  const recentArticles = await db.article.findMany({
    take: 6,
    orderBy: {
      publishedAt: 'desc'
    },
    include: {
      source: true
    }
  });

  return (
    <div className="space-y-8 mx-auto w-full">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.firstName || 'User'}! Here's your personalized news overview.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <h2 className="text-2xl font-bold tracking-tight mt-10">Recent Articles</h2>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {recentArticles.length > 0 ? (
          recentArticles.map((article) => (
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
              }} 
            />
          ))
        ) : (
          <div className="col-span-3 text-center py-10">
            <p className="text-muted-foreground">No articles found. They will appear here once available.</p>
          </div>
        )}
      </div>
    </div>
  );
} 