
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
  
  // Helper to determine if the user is an agency
  const isAgency = profile?.is_agency === true;
  
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
                    onClick={() => handleNavigation("/explore?tab=deals")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    Deals
                  </button>
                  <button 
                    onClick={() => handleNavigation("/explore?tab=influencers")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    Influencers
                  </button>
                  <button 
                    onClick={() => handleNavigation("/explore?tab=brands")} 
                    className="text-left text-lg font-medium hover:text-brand-green"
                  >
                    Brands
                  </button>
                  <div className="text-left text-lg font-medium text-gray-400 cursor-not-allowed">
                    Credit Cards (Coming Soon)
                  </div>
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
            <NavigationMenu className="ml-6">
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-sm font-medium hover:text-brand-green">
                    Explore
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[200px]">
                      <NavigationMenuLink
                        className="cursor-pointer block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={() => navigate("/explore?tab=deals")}
                      >
                        <div className="text-sm font-medium leading-none">Deals</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Browse exclusive promo codes
                        </p>
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        className="cursor-pointer block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={() => navigate("/explore?tab=influencers")}
                      >
                        <div className="text-sm font-medium leading-none">Influencers</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Discover your favorite creators
                        </p>
                      </NavigationMenuLink>
                      <NavigationMenuLink
                        className="cursor-pointer block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
                        onClick={() => navigate("/explore?tab=brands")}
                      >
                        <div className="text-sm font-medium leading-none">Brands</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Shop from top brands
                        </p>
                      </NavigationMenuLink>
                      <div className="block select-none space-y-1 rounded-md p-3 leading-none text-muted-foreground cursor-not-allowed opacity-50">
                        <div className="text-sm font-medium leading-none">Credit Cards</div>
                        <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                          Coming Soon
                        </p>
                      </div>
                    </div>
                  </NavigationMenuContent>
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
                {isAgency && (
                  <NavigationMenuItem>
                    <NavigationMenuLink
                      className="cursor-pointer px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-600/90"
                      onClick={() => navigate("/agency-dashboard")}
                    >
                      Agency Dashboard
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
