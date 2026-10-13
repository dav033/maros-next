"use client";

import type { ComponentType } from "react";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { usePrefersReducedMotion } from "@/shared/presentation/hooks/usePrefersReducedMotion";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export interface DetailTabDef<T extends string = string> {
  value: T;
  label: string;
  icon?: ComponentType<{ className?: string }>;
}

export interface UseUrlTabStateReturn<T extends string> {
  activeTab: T;
  setActiveTab: (value: string) => void;
}

/**
 * Pestaña activa guardada en la query string (`?tab=quickbooks`), para que el
 * enlace se pueda compartir y recargar no devuelva a la primera pestaña.
 *
 * El valor se lee con `useSearchParams`, así que el render del servidor ya sale
 * con la pestaña correcta: `?tab=notas` sirve el HTML de Notas, no el de Resumen.
 *
 * Al cambiar de pestaña se escribe la URL con `window.history.replaceState` —la
 * API nativa que el App Router intercepta y con la que sincroniza
 * `useSearchParams`— en lugar de `router.replace`. Ninguna de las dos recarga la
 * página, pero `router.replace` sí dispara una navegación blanda que vuelve a
 * ejecutar el loader del servidor (`loadProjectDetailsData`, `loadLeadDetailsData`)
 * en cada clic; es decir, una petición al backend por pestaña pulsada, justo lo
 * contrario de lo que se busca aquí. `replaceState` cambia la URL y nada más.
 *
 * El estado local es la fuente del render para que el cambio sea instantáneo, y
 * un efecto lo resincroniza si la URL cambia por fuera (atrás/adelante, o un
 * enlace pegado en la barra).
 */
export function useUrlTabState<T extends string>(
  tabs: readonly T[],
  defaultTab: T,
  paramName = "tab",
): UseUrlTabStateReturn<T> {
  const searchParams = useSearchParams();

  const resolve = useCallback(
    (value: string | null | undefined): T =>
      value && (tabs as readonly string[]).includes(value) ? (value as T) : defaultTab,
    [tabs, defaultTab],
  );

  const urlTab = resolve(searchParams.get(paramName));
  const [activeTab, setActiveTab] = useState<T>(urlTab);

  const lastUrlTab = useRef<T>(urlTab);
  useEffect(() => {
    if (lastUrlTab.current !== urlTab) {
      lastUrlTab.current = urlTab;
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const changeTab = useCallback(
    (value: string) => {
      const next = resolve(value);
      setActiveTab(next);
      lastUrlTab.current = next;
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      // La pestaña por defecto no ensucia la URL.
      if (next === defaultTab) url.searchParams.delete(paramName);
      else url.searchParams.set(paramName, next);
      window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
    },
    [resolve, defaultTab, paramName],
  );

  return { activeTab, setActiveTab: changeTab };
}

/**
 * Barra de pestañas de las fichas de detalle: compacta, con icono, y que se
 * desplaza en horizontal antes que romper la línea en pantallas estrechas.
 */
export function DetailTabsBar({
  tabs,
  activeTab,
  className,
}: {
  tabs: readonly DetailTabDef[];
  activeTab: string;
  className?: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const layoutId = useId();
  const shouldReduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const activeTrigger = Array.from(
      viewport.querySelectorAll<HTMLButtonElement>('[role="tab"]'),
    ).find((trigger) => trigger.dataset.state === "active");
    if (!activeTrigger) return;

    const viewportRect = viewport.getBoundingClientRect();
    const triggerRect = activeTrigger.getBoundingClientRect();
    const triggerStart = viewport.scrollLeft + triggerRect.left - viewportRect.left;
    const centeredScrollLeft = triggerStart + triggerRect.width / 2 - viewport.clientWidth / 2;
    const maxScrollLeft = viewport.scrollWidth - viewport.clientWidth;

    viewport.scrollTo({
      left: Math.max(0, Math.min(centeredScrollLeft, maxScrollLeft)),
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  }, [activeTab, shouldReduceMotion]);

  return (
    <div
      ref={viewportRef}
      role="region"
      aria-label="Secciones del detalle"
      className={cn("-mx-1 overflow-x-auto overscroll-x-contain px-1 pb-0.5", className)}
    >
      <TabsList className="h-9 w-max gap-1 rounded-lg border border-line bg-elev-1 p-1">
        {tabs.map(({ value, label, icon: Icon }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="relative isolate shrink-0 gap-1.5 whitespace-nowrap px-3 py-1 text-xs font-medium text-muted-foreground transition-colors motion-reduce:transition-none data-[state=active]:bg-transparent data-[state=active]:text-foreground"
          >
            {activeTab === value ? (
              <AnimatePresence initial={false}>
                <motion.span
                  aria-hidden="true"
                  className="absolute inset-0 z-0 rounded-md bg-elev-3"
                  layoutId={`maros-detail-tab-background-${layoutId}`}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : {
                          layout: {
                            type: "spring",
                            stiffness: 280,
                            damping: 28,
                            mass: 0.8,
                          },
                          opacity: { duration: 0.14, ease: [0.22, 1, 0.36, 1] },
                        }
                  }
                  initial={false}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              </AnimatePresence>
            ) : null}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              {Icon ? <Icon className="size-3.5" /> : null}
              {label}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  );
}
