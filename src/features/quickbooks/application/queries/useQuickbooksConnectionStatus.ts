"use client";

import { useQuery } from "@tanstack/react-query";
import { useQuickbooksApp } from "@/di";
import { quickbooksKeys } from "../keys/quickbooksKeys";
import { quickbooksQueryDefaults } from "./cacheConfig";

/**
 * El backend responde leyendo solo la conexión guardada, sin llamar a QuickBooks,
 * así que consultarlo es barato y sigue funcionando cuando la API de QuickBooks
 * está rechazando llamadas (que es justo cuando hace falta saber el estado).
 */
export function useQuickbooksConnectionStatus() {
  const ctx = useQuickbooksApp();

  return useQuery({
    queryKey: quickbooksKeys.connectionStatus(),
    queryFn: () => ctx.repos.quickbooks.getConnectionStatus(),
    ...quickbooksQueryDefaults,
    // Es un diagnóstico: quien abre la pantalla quiere el estado de ahora, no el
    // que quedó en caché hace cinco minutos.
    staleTime: 0,
    refetchOnMount: true,
  });
}
