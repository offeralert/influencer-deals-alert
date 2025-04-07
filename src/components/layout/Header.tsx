
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
                  <Link to="/" className="text-lg font-medium hover:text-brand-green">
                    Home
                  </Link>
                  <Link to="/search" className="text-lg font-medium hover:text-brand-green">
                    Search
                  </Link>
                  <Link to="/explore" className="text-lg font-medium hover:text-brand-green">
                    Explore
                  </Link>
                  <Link to="/my-deals" className="text-lg font-medium hover:text-brand-green">
                    My Deals
                  </Link>
                  {profile?.is_influencer ? (
                    <Link to="/influencer-dashboard" className="text-lg font-medium text-brand-green">
                      Influencer Dashboard
                    </Link>
                  ) : (
                    <Link to="/influencer-apply" className="text-lg font-medium text-brand-green">
                      Become an Influencer
                    </Link>
                  )}
                  <div className="mt-4 space-y-2">
                    {!user ? (
                      <>
                        <Button className="w-full bg-brand-green hover:bg-brand-green/90" asChild>
                          <Link to="/login">Sign In</Link>
                        </Button>
                        <Button variant="outline" className="w-full" asChild>
                          <Link to="/signup">Sign Up</Link>
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button className="w-full bg-brand-green hover:bg-brand-green/90" asChild>
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
            <span className="text-xl font-bold text-brand-green">Offer Alert</span>
          </Link>
        </div>

        {!isMobile && (
          <nav className="mx-6 flex items-center space-x-4 lg:space-x-6 hidden md:flex">
            <Link to="/" className="text-sm font-medium hover:text-brand-green transition-colors">
              Home
            </Link>
            <Link to="/search" className="text-sm font-medium hover:text-brand-green transition-colors">
              Search
            </Link>
            <Link to="/explore" className="text-sm font-medium hover:text-brand-green transition-colors">
              Explore
            </Link>
            <Link to="/my-deals" className="text-sm font-medium hover:text-brand-green transition-colors">
              My Deals
            </Link>
            {profile?.is_influencer ? (
              <Link to="/influencer-dashboard" className="text-sm font-medium text-brand-green transition-colors">
                Influencer Dashboard
              </Link>
            ) : (
              <Link to="/influencer-apply" className="text-sm font-medium hover:text-brand-green transition-colors">
                Become an Influencer
              </Link>
            )}
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
                <Button size="sm" className="bg-brand-green hover:bg-brand-green/90" asChild>
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
                    <Link to="/my-deals">My Deals</Link>
                  </DropdownMenuItem>
                  {profile?.is_influencer && (
                    <DropdownMenuItem asChild>
                      <Link to="/influencer-dashboard">Influencer Dashboard</Link>
                    </DropdownMenuItem>
                  )}
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
