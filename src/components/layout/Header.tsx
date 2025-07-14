
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl, DEFAULT_AVATAR_URL } from "@/utils/avatarUtils";

const Header = () => {
  const isMobile = useIsMobile();
  const { user, profile, signOut, isInfluencer, isAgency } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    setIsSheetOpen(false);
    navigate(path);
  };
  
  // Get avatar URL
  const avatarUrl = user ? getAvatarUrl(profile?.avatar_url) : null;

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
                    onClick={() => handleNavigation("/deals")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    Deals
                  </button>
                  <button 
                    onClick={() => handleNavigation("/influencers")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    Influencers
                  </button>
                  <button 
                    onClick={() => handleNavigation("/brands")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    Brands
                  </button>
                  <button 
                    onClick={() => handleNavigation("/credit-cards")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    Credit Cards
                  </button>
                  {isInfluencer && (
                    <button 
                      onClick={() => handleNavigation("/influencer-dashboard")} 
                      className="text-left text-lg font-medium text-brand-green"
                    >
                      Influencer Dashboard
                    </button>
                  )}
                  {isAgency && (
                    <button 
                      onClick={() => handleNavigation("/agency-dashboard")} 
                      className="text-left text-lg font-medium text-purple-600"
                    >
                      Agency Dashboard
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          )}
          
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-brand-green">Offer Alert</span>
          </Link>

          {!isMobile && (
            <nav className="ml-6 flex items-center space-x-6">
              <Link
                to="/deals"
                className="text-sm font-medium hover:text-brand-green transition-colors"
              >
                Deals
              </Link>
              <Link
                to="/influencers"
                className="text-sm font-medium hover:text-brand-green transition-colors"
              >
                Influencers
              </Link>
              <Link
                to="/brands"
                className="text-sm font-medium hover:text-brand-green transition-colors"
              >
                Brands
              </Link>
              <Link
                to="/credit-cards"
                className="text-sm font-medium hover:text-brand-green transition-colors"
              >
                Credit Cards
              </Link>
              {isInfluencer && (
                <Link
                  to="/influencer-dashboard"
                  className="text-sm font-medium text-brand-green hover:text-brand-green/90 transition-colors"
                >
                  Influencer Dashboard
                </Link>
              )}
              {isAgency && (
                <Link
                  to="/agency-dashboard"
                  className="text-sm font-medium text-purple-600 hover:text-purple-600/90 transition-colors"
                >
                  Agency Dashboard
                </Link>
              )}
            </nav>
          )}
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
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={avatarUrl || undefined} alt="User" />
                      <AvatarFallback>
                        <AvatarImage src={DEFAULT_AVATAR_URL} alt="User" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="sr-only">User menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>
                  {isInfluencer && (
                    <DropdownMenuItem asChild>
                      <Link to="/influencer-dashboard">Influencer Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  {isAgency && (
                    <DropdownMenuItem asChild>
                      <Link to="/agency-dashboard">Agency Dashboard</Link>
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
