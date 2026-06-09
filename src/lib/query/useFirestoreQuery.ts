"use client";

import { useQuery } from "@tanstack/react-query";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";

interface WhereClause {
  field: string;
  op: string;
  value: unknown;
}

interface QueryOptions {
  where?: WhereClause[];
  limit?: number;
}

/**
 * Execute a Firestore collection query and return typed documents.
 */
async function fetchCollection<T>(
  collectionName: string,
  options: QueryOptions = {}
): Promise<T[]> {
  const q = query(collection(db, collectionName));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as T;
    return { id: doc.id, ...data };
  }) as T[];
}

/**
 * Generic hook that wraps Firestore getDocs() with React Query.
 *
 * Usage:
 *   const result = useFirestoreQuery<Story>({
 *     collectionName: "stories",
 *     queryKey: ["stories"],
 *   });
 */
interface UseFirestoreQueryParams<T> {
  collectionName: string;
  queryKey: unknown[];
  queryOptions?: QueryOptions;
  staleTime?: number;
  gcTime?: number;
  retries?: number;
  enabled?: boolean;
}

export function useFirestoreQuery<T>(params: UseFirestoreQueryParams<T>) {
  const {
    collectionName,
    queryKey,
    queryOptions,
    staleTime,
    gcTime,
    retries,
    enabled = true,
  } = params;

  return useQuery<T[], Error>({
    queryKey,
    queryFn: async () => {
      return fetchCollection<T>(collectionName, queryOptions);
    },
    enabled,
    staleTime: staleTime ?? 30_000,
    gcTime: gcTime ?? 5 * 60 * 1000,
    retry: retries ?? 2,
  });
}
