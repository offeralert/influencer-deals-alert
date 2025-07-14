
import React, { createContext, useContext, ReactNode } from "react";
import { AuthContextType } from "./auth/types";
import { useAuthState } from "./auth/useAuthState";
import { useAuthInitialization } from "./auth/useAuthInitialization";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    session,
    setSession,
    user,
    setUser,
    profile,
    setProfile,
    loading,
    setLoading,
    fetchProfile,
    refreshProfile,
    signOut
  } = useAuthState();

  // Initialize auth state
  useAuthInitialization({
    setSession,
    setUser,
    setLoading,
    fetchProfile
  });

  // Ultra-simple logic: Everyone is an influencer unless they're an agency or credit card
  const isInfluencer = profile ? !profile.is_agency && !profile.is_creditcard : true;
  const isAgency = profile?.is_agency === true;
  const isAuthenticated = !!user;
  
  // Ultra-simple ready state: not loading AND (has user with profile OR no user at all)
  const isReady = !loading && ((!user) || (user && profile !== null));
  
  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      profile, 
      loading,
      isLoading: loading,
      isReady,
      signOut, 
      refreshProfile,
      isInfluencer,
      isAgency,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
