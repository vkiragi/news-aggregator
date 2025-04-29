"use client";

import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArticleCard } from "@/components/ArticleCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Use the same sample data from the For You page
const sampleArticles = [
  {
    id: "1",
    title: "AI Breakthrough in Natural Language Processing",
    description: "Researchers have made a significant breakthrough in teaching AI to understand and process natural language in context, with potential applications across multiple industries.",
    url: "https://example.com/article1",
    urlToImage: "https://placehold.co/600x400/5271ff/ffffff?text=AI+News",
    publishedAt: new Date().toISOString(),
    source: { name: "Tech Daily" },
    sentiment: "POSITIVE" as const,
    summary: "Researchers have achieved a major breakthrough in NLP, enabling AI to understand context better than ever before. This development could revolutionize how we interact with AI systems across industries.",
  },
  {
    id: "2",
    title: "Global Market Trends Indicate Economic Slowdown",
    description: "Recent global market indicators point to a potential economic slowdown in the coming quarters, with experts advising caution to investors.",
    url: "https://example.com/article2",
    urlToImage: "https://placehold.co/600x400/ff5252/ffffff?text=Economy",
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    source: { name: "Financial Times" },
    sentiment: "NEGATIVE" as const,
    summary: "Global markets are showing signs of a slowdown. Experts recommend cautious investment strategies for the coming quarters as indicators suggest economic challenges ahead.",
  },
  {
    id: "3",
    title: "New Renewable Energy Project Launches",
    description: "A major renewable energy project has been launched, aiming to provide clean energy to over 100,000 homes and reduce carbon emissions significantly.",
    url: "https://example.com/article3", 
    urlToImage: "https://placehold.co/600x400/52ff7a/000000?text=Green+Energy",
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    source: { name: "Environmental News" },
    sentiment: "POSITIVE" as const,
    summary: "A new renewable energy project will power 100,000 homes with clean energy. The initiative represents a significant step in reducing carbon emissions and combating climate change.",
  },
  {
    id: "4",
    title: "Sports Team Announces New Stadium Plans",
    description: "The local sports team has announced plans for a new state-of-the-art stadium, set to be completed in the next three years.",
    url: "https://example.com/article4",
    urlToImage: "https://placehold.co/600x400/f8f8f8/333333?text=Sports+News",
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    source: { name: "Sports Update" },
    sentiment: "NEUTRAL" as const,
    summary: "A local sports team has unveiled plans for a new stadium to be built over the next three years. The facility promises state-of-the-art amenities for fans and players.",
  },
];

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSentiment, setSelectedSentiment] = useState("all");
  const [searchResults, setSearchResults] = useState<typeof sampleArticles>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const handleSearch = () => {
    setIsSearching(true);
    setHasSearched(true);
    
    // Simulate API call with delay
    setTimeout(() => {
      // In a real app, this would be a call to an API
      const filteredResults = sampleArticles.filter(article => {
        const matchesQuery = searchQuery 
          ? article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
            article.description.toLowerCase().includes(searchQuery.toLowerCase())
          : true;
          
        const matchesCategory = selectedCategory !== "all" 
          ? article.source.name.toLowerCase() === selectedCategory.toLowerCase()
          : true;
          
        const matchesSentiment = selectedSentiment !== "all" 
          ? article.sentiment === selectedSentiment
          : true;
          
        return matchesQuery && matchesCategory && matchesSentiment;
      });
      
      setSearchResults(filteredResults);
      setIsSearching(false);
    }, 1500);
  };
  
  const handleSaveArticle = (articleId: string) => {
    console.log(`Article ${articleId} saved from search`);
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Search Articles</h1>
        <p className="text-muted-foreground">
          Find articles by keyword, category, or sentiment
        </p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <Input
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>
        
        <div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tech daily">Tech Daily</SelectItem>
              <SelectItem value="financial times">Financial Times</SelectItem>
              <SelectItem value="environmental news">Environmental News</SelectItem>
              <SelectItem value="sports update">Sports Update</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Select value={selectedSentiment} onValueChange={setSelectedSentiment}>
            <SelectTrigger>
              <SelectValue placeholder="Sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Sentiments</SelectItem>
              <SelectItem value="POSITIVE">Positive</SelectItem>
              <SelectItem value="NEUTRAL">Neutral</SelectItem>
              <SelectItem value="NEGATIVE">Negative</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="md:col-span-4">
          <Button onClick={handleSearch} className="w-full">
            <SearchIcon className="mr-2 h-4 w-4" />
            Search
          </Button>
        </div>
      </div>
      
      {/* Search Results */}
      {hasSearched && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Search Results {searchResults.length > 0 && `(${searchResults.length})`}
          </h2>
          
          {isSearching ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-lg border bg-background">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-6 w-2/3 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {searchResults.map((article) => (
                <ArticleCard 
                  key={article.id} 
                  article={article} 
                  onSave={handleSaveArticle} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found matching your search criteria.</p>
              <p className="text-sm mt-2">Try adjusting your search terms or filters.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 