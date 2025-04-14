
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const isMobile = useIsMobile();
  const { user, profile, signOut } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    setIsSheetOpen(false);
    navigate(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b backdrop-blur-sm bg-background/75">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          {isMobile && (
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-1">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pt-10">
                <nav className="flex flex-col gap-4">
                  <button 
                    onClick={() => handleNavigation("/")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    Home
                  </button>
                  <button 
                    onClick={() => handleNavigation("/search")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    Search
                  </button>
                  <button 
                    onClick={() => handleNavigation("/explore")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    Explore
                  </button>
                  <button 
                    onClick={() => handleNavigation("/my-deals")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    My Deals
                  </button>
                  {profile?.is_influencer && (
                    <button 
                      onClick={() => handleNavigation("/influencer-dashboard")} 
                      className="text-left text-lg font-medium text-brand-green"
                    >
                      Influencer Dashboard
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          )}
          
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-brand-green">Offer Alert</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          {!user ? (
            <>
              {!isMobile && (
                <>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="bg-brand-green hover:bg-brand-green/90" asChild>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
              {isMobile && (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button size="sm" className="bg-brand-green hover:bg-brand-green/90" asChild>
                    <Link to="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </>
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
