"use client";

import { createContext, useContext } from "react";

const RouteSharedLayoutScopeContext = createContext(0);

export const RouteSharedLayoutScopeProvider = RouteSharedLayoutScopeContext.Provider;

export function useRouteSharedLayoutScope(): number {
  return useContext(RouteSharedLayoutScopeContext);
}
