
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
    profileLoading,
    setProfileLoading,
    justSignedUp,
    setJustSignedUp,
    error,
    setError,
    fetchProfile,
    refreshProfile,
    signOut
  } = useAuthState();

  // Initialize auth state
  useAuthInitialization({
    setSession,
    setUser,
    setError,
    setProfileLoading,
    setLoading,
    fetchProfile
  });

  const isInfluencer = profile?.is_influencer === true;
  const isAgency = profile?.is_agency === true;
  const isAuthenticated = !!user;
  
  // Simple ready state - both auth and profile are loaded
  const isReady = !loading && (!user || !profileLoading);
  
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
      isAuthenticated,
      profileLoading,
      justSignedUp,
      setJustSignedUp,
      error
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
