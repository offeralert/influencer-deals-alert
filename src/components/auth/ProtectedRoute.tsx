import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAgency?: boolean;
  redirectTo?: string;
}

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireAgency = false, 
  redirectTo = "/login" 
}: ProtectedRouteProps) => {
  const { user, profile, isReady, isAgency } = useAuth();

  // Show loading while auth is initializing
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Check if authentication is required
  if (requireAuth && !user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if agency status is required
  if (requireAgency && (!user || !isAgency)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;