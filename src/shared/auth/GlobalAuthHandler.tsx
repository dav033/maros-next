"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UNAUTHORIZED_EVENT,
  type UnauthorizedDetail,
} from "@/shared/errors";

export function GlobalAuthHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const redirectingRef = useRef(false);

  useEffect(() => {
    function handleUnauthorized(event: Event) {
      if (redirectingRef.current) return;
      if (pathname === "/login") return;

      const detail = (event as CustomEvent<UnauthorizedDetail>).detail;
      const message = detail?.message ?? "Tu sesión expiró. Inicia sesión nuevamente.";
      toast.error(message);

      redirectingRef.current = true;
      router.replace("/login");
    }

    window.addEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    return () => {
      window.removeEventListener(UNAUTHORIZED_EVENT, handleUnauthorized);
    };
  }, [pathname, router]);

  return null;
}
