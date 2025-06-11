
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
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { getAvatarUrl, DEFAULT_AVATAR_URL } from "@/utils/avatarUtils";

const Header = () => {
  const isMobile = useIsMobile();
  const { user, profile, signOut } = useAuth();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    setIsSheetOpen(false);
    navigate(path);
  };

  // Helper to determine if the user is an influencer
  const isInfluencer = profile?.is_influencer === true;
  
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
                    onClick={() => handleNavigation("/explore")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    Explore
                  </button>
                  <button 
                    onClick={() => handleNavigation("/my-deals")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    My Alerts
                  </button>
                  {isInfluencer && (
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
            <img 
              src="/lovable-uploads/9472e1c9-d423-4c3d-98d6-a2bd7c6a7377.png" 
              alt="Offer Alert" 
              className="h-8 w-auto md:h-10"
            />
          </Link>

          {!isMobile && (
            <NavigationMenu className="ml-6">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="cursor-pointer px-4 py-2 text-sm font-medium hover:text-brand-green"
                    onClick={() => navigate("/explore")}
                  >
                    Explore
                  </NavigationMenuLink>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <NavigationMenuLink
                    className="cursor-pointer px-4 py-2 text-sm font-medium hover:text-brand-green"
                    onClick={() => navigate("/my-deals")}
                  >
                    My Alerts
                  </NavigationMenuLink>
                </NavigationMenuItem>
                {isInfluencer && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className="cursor-pointer px-4 py-2 text-sm font-medium text-brand-green hover:text-brand-green/90"
                      onClick={() => navigate("/influencer-dashboard")}
                    >
                      Influencer Dashboard
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                )}
              </NavigationMenuList>
            </NavigationMenu>
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
                  <DropdownMenuItem asChild>
                    <Link to="/my-deals">My Alerts</Link>
                  </DropdownMenuItem>
                  {isInfluencer && (
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
