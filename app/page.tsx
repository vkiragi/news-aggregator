import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold">News Aggregator</h1>
          <div className="flex items-center space-x-4">
            <SignedOut>
              <Link 
                href="/sign-in/"
                className="text-primary hover:text-primary/80"
              >
                Sign In
              </Link>
              <Link 
                href="/sign-up/" 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-md"
              >
                Sign Up
              </Link>
            </SignedOut>
            <SignedIn>
              <Link 
                href="/dashboard" 
                className="text-primary hover:text-primary/80 mr-4"
              >
                Dashboard
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </nav>
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 max-w-7xl">
            <div className="flex flex-col items-center space-y-6 text-center">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter">
                AI-Powered News Aggregator
              </h1>
              <p className="max-w-[700px] text-muted-foreground md:text-xl">
                Stay informed with personalized news summaries, sentiment analysis, 
                and topic clustering powered by AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <SignedOut>
                  <Link href="/sign-in/">
                    <Button size="lg">Start Reading</Button>
                  </Link>
                  <Link href="/sign-up/">
                    <Button variant="outline" size="lg">Create Account</Button>
                  </Link>
                </SignedOut>
                <SignedIn>
                  <Link href="/dashboard">
                    <Button size="lg">Go to Dashboard</Button>
                  </Link>
                </SignedIn>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-muted/50">
          <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 max-w-7xl">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Smart Features
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="bg-background p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold mb-2">
                  AI Summarization
                </h3>
                <p className="text-muted-foreground">
                  Get concise summaries of long articles, saving you time while staying informed.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className="bg-background p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold mb-2">
                  Sentiment Analysis
                </h3>
                <p className="text-muted-foreground">
                  Understand the emotional tone of news articles with AI-powered sentiment detection.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className="bg-background p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold mb-2">
                  Topic Clustering
                </h3>
                <p className="text-muted-foreground">
                  Discover related stories grouped by topic, reducing information overload.
                </p>
              </div>
              
              {/* Feature 4 */}
              <div className="bg-background p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold mb-2">
                  Personalized Feed
                </h3>
                <p className="text-muted-foreground">
                  Set your interests and get news that matters to you.
                </p>
              </div>
              
              {/* Feature 5 */}
              <div className="bg-background p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold mb-2">
                  Search & Filter
                </h3>
                <p className="text-muted-foreground">
                  Find exactly what you're looking for with powerful search and filtering options.
                </p>
              </div>
              
              {/* Feature 6 */}
              <div className="bg-background p-6 rounded-lg shadow-sm border">
                <h3 className="text-xl font-semibold mb-2">
                  Save Articles
                </h3>
                <p className="text-muted-foreground">
                  Bookmark important stories to read later.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 max-w-7xl">
            <div className="flex flex-col items-center space-y-6 text-center">
              <h2 className="text-2xl md:text-3xl font-bold">
                Start Your Personalized News Experience
              </h2>
              <p className="max-w-[600px] text-muted-foreground">
                Create an account to unlock all features and personalize your news feed.
              </p>
              <Link href="/sign-up">
                <Button size="lg">Sign Up Now</Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © 2024 NewsAI. All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="/terms" className="text-sm text-muted-foreground hover:underline">
                Terms
              </Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:underline">
                Privacy
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
