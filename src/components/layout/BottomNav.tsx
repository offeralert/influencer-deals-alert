import { Link, useLocation } from "react-router-dom";
import { Home, Compass, Bookmark } from "lucide-react";
import { cn } from "@/lib/utils";

const BottomNav = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    {
      path: "/",
      label: "Home",
      icon: Home,
    },
    {
      path: "/explore",
      label: "Explore",
      icon: Compass,
    },
    {
      path: "/my-deals",
      label: "My Alerts",
      icon: Bookmark,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-white border-t md:hidden">
      <div className="grid h-16 grid-cols-3">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center justify-center text-xs",
              currentPath === item.path
                ? "text-brand-green font-medium"
                : "text-gray-500"
            )}
          >
            <item.icon
              className={cn(
                "h-6 w-6 mb-1",
                currentPath === item.path ? "text-brand-green" : "text-gray-500"
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
