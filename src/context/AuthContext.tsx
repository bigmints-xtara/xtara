"use client";

import React, { createContext, useContext, useEffect } from "react";
import { auth, db } from "@/lib/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getUserProfile, UserProfile } from "@/lib/firebase/auth-helpers";

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

// React Query auth hooks — separate from context so they can be used anywhere
export function useUserProfileQuery(uid: string | null) {
  return useQuery<UserProfile | null, Error>({
    queryKey: ["auth", "userProfile", uid],
    queryFn: async (): Promise<UserProfile | null> => {
      if (!uid) return null;
      return getUserProfile(uid);
    },
    enabled: !!uid,
    staleTime: 300000, // 5 minutes
    gcTime: 1800000,   // 30 minutes
    retry: 2,
  });
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);
  const queryClient = useQueryClient();

  // Use React Query for user profile — caches by UID
  const userProfileQuery = useUserProfileQuery(user?.uid || null);
  const userProfile: UserProfile | null = userProfileQuery.data ?? null;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);

      // Pre-fetch or invalidate profile when auth state changes
      if (authUser) {
        queryClient.prefetchQuery({
          queryKey: ["auth", "userProfile", authUser.uid],
          queryFn: () => getUserProfile(authUser.uid),
        });
      } else {
        queryClient.setQueryData(["auth", "userProfile", null], null);
        queryClient.invalidateQueries({ queryKey: ["auth", "userProfile"] });
      }
    });

    return () => unsubscribe();
  }, [queryClient]);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);
