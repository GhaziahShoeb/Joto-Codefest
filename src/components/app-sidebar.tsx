import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Brain,
  Settings,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { useIsMobile } from "@/hooks/use-mobile";
import jotoLogo from "@/assets/joto_logo.png";

export function AppSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Auto-expand on desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(true);
    }
  }, [isMobile]);
  
  // Handle breakpoint changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Menu items configuration - removed redundant items
  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/",
    },
    {
      title: "Notes",
      icon: FileText,
      path: "/notes",
    },
    {
      title: "AI Assistant",
      icon: Brain,
      path: "/assistant",
    },
    {
      title: "Settings",
      icon: Settings,
      path: "/settings",
    },
  ];

  return (
    <>
      {/* Mobile menu toggle button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X /> : <Menu />}
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "bg-background border-r fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform duration-200 md:translate-x-0",
          !isOpen && "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-center py-6 border-b">
          <Link to="/" className="flex flex-col items-center">
            <div className="flex flex-col items-center">
              <img 
                src={jotoLogo} 
                alt="Joto Logo" 
                className="h-12 w-auto mb-1.5" 
              />
              <span className="text-lg font-semibold text-primary">Joto</span>
            </div>
          </Link>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm rounded-md transition-colors",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary"
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.title}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between">
          <ThemeToggle />
          <Button variant="outline" size="sm" className="ml-auto">
            Help
          </Button>
        </div>
      </div>
    </>
  );
}
