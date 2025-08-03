"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@clerk/nextjs";
import { useToast } from "@/components/ui/use-toast";
import { 
  Trophy, 
  Building2, 
  Cpu, 
  TrendingUp, 
  Music, 
  FlaskConical, 
  Heart, 
  Plus, 
  X,
  Save,
  Bell,
  Clock,
  BookOpen
} from "lucide-react";
import axios from "axios";

interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface UserPreference {
  categoryId: string;
  weight: number;
  category: Category;
}

interface UserKeyword {
  id: string;
  keyword: string;
  category?: string;
  weight: number;
}

interface UserPreferences {
  preferredSports: string[];
  preferredPolitics: string[];
  preferredTech: string[];
  preferredBusiness: string[];
  preferredEntertainment: string[];
  preferredScience: string[];
  preferredLifestyle: string[];
  emailNotifications: boolean;
  dailyDigest: boolean;
  breakingNewsAlerts: boolean;
  preferredReadingTime: number;
  preferredArticleLength: string;
  userPreferences: UserPreference[];
  userKeywords: UserKeyword[];
}

const SPORTS_OPTIONS = [
  { value: "formula1", label: "Formula 1", icon: "🏎️" },
  { value: "tennis", label: "Tennis", icon: "🎾" },
  { value: "soccer", label: "Soccer", icon: "⚽" },
  { value: "basketball", label: "Basketball", icon: "🏀" },
  { value: "football", label: "Football", icon: "🏈" },
  { value: "baseball", label: "Baseball", icon: "⚾" },
  { value: "hockey", label: "Hockey", icon: "🏒" },
  { value: "golf", label: "Golf", icon: "⛳" },
  { value: "olympics", label: "Olympics", icon: "🏅" },
  { value: "esports", label: "Esports", icon: "🎮" }
];

const POLITICS_OPTIONS = [
  { value: "us-politics", label: "US Politics", icon: "🇺🇸" },
  { value: "international", label: "International", icon: "🌍" },
  { value: "elections", label: "Elections", icon: "🗳️" },
  { value: "congress", label: "Congress", icon: "🏛️" },
  { value: "supreme-court", label: "Supreme Court", icon: "⚖️" },
  { value: "foreign-policy", label: "Foreign Policy", icon: "🤝" },
  { value: "climate-policy", label: "Climate Policy", icon: "🌱" },
  { value: "healthcare-policy", label: "Healthcare Policy", icon: "🏥" }
];

const TECH_OPTIONS = [
  { value: "ai", label: "Artificial Intelligence", icon: "🤖" },
  { value: "startups", label: "Startups", icon: "🚀" },
  { value: "gaming", label: "Gaming", icon: "🎮" },
  { value: "cybersecurity", label: "Cybersecurity", icon: "🔒" },
  { value: "blockchain", label: "Blockchain", icon: "⛓️" },
  { value: "cloud-computing", label: "Cloud Computing", icon: "☁️" },
  { value: "mobile", label: "Mobile Tech", icon: "📱" },
  { value: "social-media", label: "Social Media", icon: "📱" }
];

const BUSINESS_OPTIONS = [
  { value: "stocks", label: "Stocks", icon: "📈" },
  { value: "crypto", label: "Cryptocurrency", icon: "₿" },
  { value: "real-estate", label: "Real Estate", icon: "🏠" },
  { value: "startups", label: "Startups", icon: "🚀" },
  { value: "venture-capital", label: "Venture Capital", icon: "💰" },
  { value: "economy", label: "Economy", icon: "📊" },
  { value: "trade", label: "Trade", icon: "📦" },
  { value: "markets", label: "Markets", icon: "📊" }
];

const ENTERTAINMENT_OPTIONS = [
  { value: "movies", label: "Movies", icon: "🎬" },
  { value: "music", label: "Music", icon: "🎵" },
  { value: "tv", label: "TV Shows", icon: "📺" },
  { value: "gaming", label: "Gaming", icon: "🎮" },
  { value: "celebrities", label: "Celebrities", icon: "⭐" },
  { value: "streaming", label: "Streaming", icon: "📺" },
  { value: "awards", label: "Awards", icon: "🏆" },
  { value: "comics", label: "Comics", icon: "📚" }
];

const SCIENCE_OPTIONS = [
  { value: "space", label: "Space", icon: "🚀" },
  { value: "health", label: "Health", icon: "🏥" },
  { value: "environment", label: "Environment", icon: "🌍" },
  { value: "physics", label: "Physics", icon: "⚛️" },
  { value: "biology", label: "Biology", icon: "🧬" },
  { value: "chemistry", label: "Chemistry", icon: "🧪" },
  { value: "climate", label: "Climate", icon: "🌡️" },
  { value: "research", label: "Research", icon: "🔬" }
];

const LIFESTYLE_OPTIONS = [
  { value: "health", label: "Health", icon: "💪" },
  { value: "fitness", label: "Fitness", icon: "🏃" },
  { value: "food", label: "Food", icon: "🍕" },
  { value: "travel", label: "Travel", icon: "✈️" },
  { value: "fashion", label: "Fashion", icon: "👗" },
  { value: "beauty", label: "Beauty", icon: "💄" },
  { value: "home", label: "Home", icon: "🏠" },
  { value: "relationships", label: "Relationships", icon: "💕" }
];

export default function SettingsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    preferredSports: [],
    preferredPolitics: [],
    preferredTech: [],
    preferredBusiness: [],
    preferredEntertainment: [],
    preferredScience: [],
    preferredLifestyle: [],
    emailNotifications: false,
    dailyDigest: false,
    breakingNewsAlerts: false,
    preferredReadingTime: 10,
    preferredArticleLength: "medium",
    userPreferences: [],
    userKeywords: []
  });
  const [newKeyword, setNewKeyword] = useState("");
  const [newKeywordCategory, setNewKeywordCategory] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchUserPreferences();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchUserPreferences = async () => {
    try {
      const response = await axios.get('/api/user/preferences');
      if (response.data.user) {
        setPreferences(response.data.user);
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }
  };

  const savePreferences = async () => {
    setIsLoading(true);
    try {
      await axios.post('/api/user/preferences', {
        categoryPreferences: preferences.userPreferences.map(pref => ({
          categoryId: pref.categoryId,
          weight: pref.weight
        })),
        keywords: preferences.userKeywords.map(kw => ({
          keyword: kw.keyword,
          category: kw.category,
          weight: kw.weight
        })),
        preferredSports: preferences.preferredSports,
        preferredPolitics: preferences.preferredPolitics,
        preferredTech: preferences.preferredTech,
        preferredBusiness: preferences.preferredBusiness,
        preferredEntertainment: preferences.preferredEntertainment,
        preferredScience: preferences.preferredScience,
        preferredLifestyle: preferences.preferredLifestyle,
        emailNotifications: preferences.emailNotifications,
        dailyDigest: preferences.dailyDigest,
        breakingNewsAlerts: preferences.breakingNewsAlerts,
        preferredReadingTime: preferences.preferredReadingTime,
        preferredArticleLength: preferences.preferredArticleLength
      });

      toast({
        title: "Preferences saved!",
        description: "Your news preferences have been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (category: string, value: string) => {
    const currentList = preferences[category as keyof UserPreferences] as string[];
    const newList = currentList.includes(value)
      ? currentList.filter(item => item !== value)
      : [...currentList, value];
    
    setPreferences(prev => ({
      ...prev,
      [category]: newList
    }));
  };

  const addKeyword = () => {
    if (newKeyword.trim()) {
      const keyword: UserKeyword = {
        id: Date.now().toString(),
        keyword: newKeyword.trim(),
        category: newKeywordCategory || undefined,
        weight: 1.0
      };
      
      setPreferences(prev => ({
        ...prev,
        userKeywords: [...prev.userKeywords, keyword]
      }));
      
      setNewKeyword("");
      setNewKeywordCategory("");
    }
  };

  const removeKeyword = (keywordId: string) => {
    setPreferences(prev => ({
      ...prev,
      userKeywords: prev.userKeywords.filter(kw => kw.id !== keywordId)
    }));
  };

  const updateCategoryWeight = (categoryId: string, weight: number) => {
    setPreferences(prev => ({
      ...prev,
      userPreferences: prev.userPreferences.map(pref =>
        pref.categoryId === categoryId ? { ...pref, weight } : pref
      )
    }));
  };

  const toggleCategory = (categoryId: string) => {
    const exists = preferences.userPreferences.some(pref => pref.categoryId === categoryId);
    
    if (exists) {
      setPreferences(prev => ({
        ...prev,
        userPreferences: prev.userPreferences.filter(pref => pref.categoryId !== categoryId)
      }));
    } else {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        setPreferences(prev => ({
          ...prev,
          userPreferences: [...prev.userPreferences, {
            categoryId,
            weight: 1.0,
            category
          }]
        }));
      }
    }
  };

  const renderInterestSection = (
    title: string,
    options: Array<{ value: string; label: string; icon: string }>,
    category: keyof UserPreferences
  ) => (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = (preferences[category] as string[]).includes(option.value);
          return (
            <Badge
              key={option.value}
              variant={isSelected ? "default" : "outline"}
              className={`cursor-pointer hover:bg-primary/80 ${
                isSelected ? "bg-primary text-primary-foreground" : ""
              }`}
              onClick={() => toggleInterest(category, option.value)}
            >
              <span className="mr-1">{option.icon}</span>
              {option.label}
            </Badge>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Customize your news experience and preferences
        </p>
      </div>

      <Tabs defaultValue="interests" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="interests">Interests</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        
        <TabsContent value="interests" className="space-y-6">
          <Card>
            <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                 <Trophy className="h-5 w-5" />
                 Sports Interests
               </CardTitle>
              <CardDescription>
                Select the sports you're most interested in
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderInterestSection("Sports", SPORTS_OPTIONS, "preferredSports")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                 <Building2 className="h-5 w-5" />
                 Politics & Government
               </CardTitle>
              <CardDescription>
                Choose your political interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderInterestSection("Politics", POLITICS_OPTIONS, "preferredPolitics")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                 <Cpu className="h-5 w-5" />
                 Technology
               </CardTitle>
              <CardDescription>
                Select your tech interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderInterestSection("Technology", TECH_OPTIONS, "preferredTech")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                 <TrendingUp className="h-5 w-5" />
                 Business & Finance
               </CardTitle>
              <CardDescription>
                Choose your business interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderInterestSection("Business", BUSINESS_OPTIONS, "preferredBusiness")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                 <Music className="h-5 w-5" />
                 Entertainment
               </CardTitle>
              <CardDescription>
                Select your entertainment interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderInterestSection("Entertainment", ENTERTAINMENT_OPTIONS, "preferredEntertainment")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
                             <CardTitle className="flex items-center gap-2">
                 <FlaskConical className="h-5 w-5" />
                 Science & Health
               </CardTitle>
              <CardDescription>
                Choose your science interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderInterestSection("Science", SCIENCE_OPTIONS, "preferredScience")}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                Lifestyle
              </CardTitle>
              <CardDescription>
                Select your lifestyle interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderInterestSection("Lifestyle", LIFESTYLE_OPTIONS, "preferredLifestyle")}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>News Categories</CardTitle>
              <CardDescription>
                Choose which news categories you want to see more of
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.map((category) => {
                const userPref = preferences.userPreferences.find(pref => pref.categoryId === category.id);
                const isSelected = !!userPref;
                
                return (
                  <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={isSelected}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <div>
                        <Label className="font-medium">{category.name}</Label>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}
                      </div>
                    </div>
                    {isSelected && (
                      <Select
                        value={userPref.weight.toString()}
                        onValueChange={(value) => updateCategoryWeight(category.id, parseFloat(value))}
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0.5">Low</SelectItem>
                          <SelectItem value="1.0">Medium</SelectItem>
                          <SelectItem value="1.5">High</SelectItem>
                          <SelectItem value="2.0">Very High</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="keywords" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Keywords</CardTitle>
              <CardDescription>
                Add specific keywords you want to see in your news feed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter keyword (e.g., 'Tesla', 'Bitcoin', 'AI')"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                />
                <Select value={newKeywordCategory} onValueChange={setNewKeywordCategory}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="sports">Sports</SelectItem>
                    <SelectItem value="politics">Politics</SelectItem>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={addKeyword} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {preferences.userKeywords.map((keyword) => (
                  <div key={keyword.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{keyword.keyword}</Badge>
                      {keyword.category && (
                        <Badge variant="outline">{keyword.category}</Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeKeyword(keyword.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how you want to receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive news updates via email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, emailNotifications: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Get a daily summary of top stories
                  </p>
                </div>
                <Switch
                  checked={preferences.dailyDigest}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, dailyDigest: checked }))
                  }
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Breaking News Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about breaking news
                  </p>
                </div>
                <Switch
                  checked={preferences.breakingNewsAlerts}
                  onCheckedChange={(checked) =>
                    setPreferences(prev => ({ ...prev, breakingNewsAlerts: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Reading Preferences
              </CardTitle>
              <CardDescription>
                Customize your reading experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Preferred Reading Time</Label>
                <Select
                  value={preferences.preferredReadingTime.toString()}
                  onValueChange={(value) =>
                    setPreferences(prev => ({ ...prev, preferredReadingTime: parseInt(value) }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Preferred Article Length</Label>
                <Select
                  value={preferences.preferredArticleLength}
                  onValueChange={(value) =>
                    setPreferences(prev => ({ ...prev, preferredArticleLength: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short (Quick reads)</SelectItem>
                    <SelectItem value="medium">Medium (Standard articles)</SelectItem>
                    <SelectItem value="long">Long (In-depth analysis)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={savePreferences} disabled={isLoading} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          {isLoading ? "Saving..." : "Save Preferences"}
        </Button>
      </div>
    </div>
  );
} 