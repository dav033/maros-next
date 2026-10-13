"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { PresenceTransitionLayer } from "@/components/shared/PresenceTransitionLayer";
import {
  projectRouteEntranceTransition,
  routeEntranceTransition,
} from "@/shared/presentation/motionTransitions";
import { RouteSharedLayoutScopeProvider } from "@/shared/presentation/RouteMotionContext";
import { SharedEntitySourceProvider } from "@/shared/presentation/SharedEntitySourceContext";

export function RouteTransition({ pathname, children }: { pathname: string; children: ReactNode }) {
  const currentPathname = useRef(pathname);
  const scrollPositions = useRef(new Map<string, number>());
  const transition = isSharedEntityRoute(pathname)
    ? projectRouteEntranceTransition
    : routeEntranceTransition;

  useEffect(() => {
    const scrollContainer = document.querySelector<HTMLElement>("[data-app-route-scroll]");
    if (!scrollContainer) return;

    const rememberScrollPosition = () => {
      scrollPositions.current.set(currentPathname.current, scrollContainer.scrollTop);
    };
    scrollContainer.addEventListener("scroll", rememberScrollPosition, { passive: true });
    return () => scrollContainer.removeEventListener("scroll", rememberScrollPosition);
  }, []);

  useLayoutEffect(() => {
    if (currentPathname.current === pathname) return;

    const scrollContainer = document.querySelector<HTMLElement>("[data-app-route-scroll]");
    if (scrollContainer) {
      currentPathname.current = pathname;
      scrollContainer.scrollTop = scrollPositions.current.get(pathname) ?? 0;
      scrollContainer.focus({ preventScroll: true });
      return;
    }

    currentPathname.current = pathname;
  }, [pathname]);

  const routeContent = (
    <PresenceTransitionLayer
      key={pathname}
      className="col-start-1 row-start-1 min-w-0 w-full"
      {...transition}
    >
      {children}
    </PresenceTransitionLayer>
  );

  return (
    // Keep the same pairing across history navigation so both directions can project.
    <RouteSharedLayoutScopeProvider value={0}>
      <SharedEntitySourceProvider>
      <div className="grid min-w-0">
        {/* App Router outlets must not be retained: they receive the incoming children too. */}
        {routeContent}
      </div>
      </SharedEntitySourceProvider>
    </RouteSharedLayoutScopeProvider>
  );
}

function isSharedEntityRoute(pathname: string): boolean {
  return /^\/(?:projects?|contacts?|company|customers|leads?|tasks|notes|analytics|receivables)(?:\/|$)/.test(pathname) ||
    /^\/finance\/invoices(?:\/|$)/.test(pathname);
}
