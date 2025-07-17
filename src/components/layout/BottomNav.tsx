
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, LayoutDashboard, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardRoute } from "@/utils/authRedirectUtils";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAuthenticated } = useAuth();
  const currentPath = location.pathname;

  const handleDashboardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/signup");
    } else {
      const dashboardRoute = getDashboardRoute(profile);
      navigate(dashboardRoute);
    }
  };

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/signup");
    } else {
      navigate("/profile");
    }
  };

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: Home,
      onClick: null,
    },
    {
      path: isAuthenticated ? getDashboardRoute(profile) : "/signup",
      label: "Dashboard",
      icon: LayoutDashboard,
      onClick: handleDashboardClick,
    },
    {
      path: isAuthenticated ? "/profile" : "/signup",
      label: "Profile",
      icon: User,
      onClick: handleProfileClick,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-white border-t md:hidden">
      <div className="grid h-16 grid-cols-3">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            onClick={item.onClick}
            className={cn(
              "flex flex-col items-center justify-center text-xs",
              currentPath === item.path ||
              (item.label === "Dashboard" && 
               (currentPath.includes("/influencer-dashboard") || currentPath.includes("/agency-dashboard")))
                ? "text-brand-green font-medium"
                : "text-gray-500"
            )}
          >
            <item.icon
              className={cn(
                "h-6 w-6 mb-1",
                currentPath === item.path ||
                (item.label === "Dashboard" && 
                 (currentPath.includes("/influencer-dashboard") || currentPath.includes("/agency-dashboard")))
                  ? "text-brand-green" 
                  : "text-gray-500"
              )}
            />
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
