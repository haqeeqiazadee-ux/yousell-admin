"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Profile } from "@/lib/types/database";

const UserContext = createContext<Profile | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: Profile | null;
  children: ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
