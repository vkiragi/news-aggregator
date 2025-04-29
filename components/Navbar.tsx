"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import { UserCircle } from "lucide-react";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Dashboard", path: "/dashboard" },
  { name: "For You", path: "/dashboard/for-you" },
  { name: "Saved", path: "/dashboard/saved" },
];

export function Navbar() {
  const pathname = usePathname();
  // Mock authentication state for demo purposes
  const isSignedIn = true; // In a real app, this would come from your auth provider
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-6 md:px-12 lg:px-16 xl:px-24 max-w-7xl flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">NewsAI</span>
          </Link>
        </div>
        
        <div className="flex-1">
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`text-sm transition-colors hover:text-foreground/80 ${
                    isActive ? "text-foreground font-medium" : "text-foreground/60"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="flex items-center space-x-2">
          <ModeToggle />
          {!isSignedIn && (
            <>
              <Link href="/sign-in">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/sign-up">
                <Button>Sign Up</Button>
              </Link>
            </>
          )}
          {isSignedIn && (
            <Button variant="ghost" size="icon">
              <UserCircle className="h-6 w-6" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 