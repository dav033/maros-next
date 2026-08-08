"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { CurrentUser } from "./currentUser";
import type { Permission } from "./permissions";

interface CurrentUserContextValue {
  user: CurrentUser | null;
  hasPermission: (permission: Permission) => boolean;
}

const CurrentUserContext = createContext<CurrentUserContextValue | null>(null);

type Props = {
  user: CurrentUser | null;
  children: ReactNode;
};

/** Hydrated once from the server (see currentUser.ts) — no client refetch. */
export function CurrentUserProvider({ user, children }: Props) {
  const value = useMemo<CurrentUserContextValue>(() => {
    const granted = new Set(user?.permissions ?? []);
    return {
      user,
      hasPermission: (permission) => granted.has(permission),
    };
  }, [user]);

  return (
    <CurrentUserContext.Provider value={value}>{children}</CurrentUserContext.Provider>
  );
}

export function useCurrentUser(): CurrentUserContextValue {
  const context = useContext(CurrentUserContext);
  if (!context) {
    throw new Error("useCurrentUser must be used within CurrentUserProvider");
  }
  return context;
}
