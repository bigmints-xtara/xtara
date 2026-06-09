"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
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
export function useUserProfile(uid: string | null) {
  return useQuery<UserProfile | null, Error>({
    queryKey: ["auth", "userProfile", uid],
    queryFn: async () => {
      if (!uid) return null;
      return getUserProfile(uid);
    },
    enabled: !!uid,
    staleTime: 60_000,
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // Use React Query for user profile — caches by UID
  const userProfileQuery = useUserProfile(user?.uid || null);
  const userProfile: UserProfile | null = userProfileQuery.data ?? null;

  useEffect(() =>{
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      setLoading(false);

      // Invalidate and refetch the profile query when UID changes
      if (authUser) {
        queryClient.invalidateQueries({ queryKey: ["auth", "userProfile", authUser.uid] });
      } else {
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

export const useAuth = () => useContext(AuthContext);
