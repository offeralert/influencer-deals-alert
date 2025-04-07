
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Search, Menu, X, Bell, User, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const isMobile = useIsMobile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-sm bg-background/75">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-1">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pt-10">
                <nav className="flex flex-col gap-4">
                  <Link to="/" className="text-lg font-medium hover:text-brand-purple">
                    Home
                  </Link>
                  <Link to="/explore" className="text-lg font-medium hover:text-brand-purple">
                    Explore
                  </Link>
                  <Link to="/brands" className="text-lg font-medium hover:text-brand-purple">
                    Brands
                  </Link>
                  <Link to="/categories" className="text-lg font-medium hover:text-brand-purple">
                    Categories
                  </Link>
                  <div className="mt-4 space-y-2">
                    {!user ? (
                      <>
                        <Button className="w-full" asChild>
                          <Link to="/login">Sign In</Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link to="/signup">Sign Up</Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full" asChild>
                          <Link to="/profile">My Profile</Link>
                        </Button>
                        <Button variant="outline" className="w-full" onClick={signOut}>
                          Sign Out
                        </Button>
                      </>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          )}
          
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold gradient-text">Offer Alert</span>
          </Link>
        </div>

        {!isMobile && (
          <nav className="mx-6 flex items-center space-x-4 lg:space-x-6 hidden md:flex">
            <Link to="/" className="text-sm font-medium hover:text-brand-purple transition-colors">
              Home
            </Link>
            <Link to="/explore" className="text-sm font-medium hover:text-brand-purple transition-colors">
              Explore
            </Link>
            <Link to="/brands" className="text-sm font-medium hover:text-brand-purple transition-colors">
              Brands
            </Link>
            <Link to="/categories" className="text-sm font-medium hover:text-brand-purple transition-colors">
              Categories
            </Link>
          </nav>
        )}

        <div className="flex items-center gap-2">
          {isSearchOpen && !isMobile ? (
            <div className="flex items-center border rounded-md overflow-hidden animate-in fade-in duration-300">
              <input
                type="text"
                placeholder="Search influencers, brands..."
                className="px-3 py-1.5 outline-none w-[200px]"
                autoFocus
                onBlur={() => setIsSearchOpen(false)}
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-full"
                onClick={() => setIsSearchOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          )}

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          {!user ? (
            !isMobile && (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )
          ) : (
            <>
              {!isMobile && (
                <span className="text-sm font-medium mr-2">
                  Hi, {profile?.username || user.email?.split('@')[0]}
                </span>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/saved-deals">Saved Deals</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-500" onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
