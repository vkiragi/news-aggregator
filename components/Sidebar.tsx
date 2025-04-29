"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Newspaper, 
  Bookmark, 
  Search, 
  Settings,
  HeartHandshake,
  Sparkles,
  Menu
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Newspaper, label: "All News", href: "/dashboard/all" },
  { icon: Sparkles, label: "For You", href: "/dashboard/for-you" },
  { icon: HeartHandshake, label: "Top Stories", href: "/dashboard/top" },
  { icon: Bookmark, label: "Saved Articles", href: "/dashboard/saved" },
  { icon: Search, label: "Search", href: "/dashboard/search" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed bottom-4 right-4 z-50 rounded-full shadow-lg bg-primary text-primary-foreground"
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      >
        <Menu />
      </Button>
      
      {/* Sidebar */}
      <div 
        className={cn(
          "w-56 border-r bg-background shrink-0",
          isMobileSidebarOpen ? "fixed inset-0 z-40" : "hidden md:block"
        )}
      >
        <nav className="flex flex-col gap-2 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    isActive ? "font-medium" : "font-normal"
                  )}
                  onClick={() => setIsMobileSidebarOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
} 