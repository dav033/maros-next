"use client";

import type { ReactNode } from "react";
import { ExternalLink, Loader2, Plug, RefreshCw, TriangleAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/shared/infra/http/OptimizedApiClient";
import { useQuickbooksConnectionStatus } from "../../application/queries";
import type { QuickbooksConnection } from "../../domain/models";

const dateTimeFormat = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateTimeFormat.format(date);
}

/**
 * El realm es el identificador de la empresa en QuickBooks. No es un secreto, pero
 * tampoco hace falta entero: con los últimos dígitos se reconoce el archivo.
 */
function maskRealmId(realmId: string): string {
  return realmId.length <= 4 ? realmId : `••••${realmId.slice(-4)}`;
}

function formatTokenExpiry(connection: QuickbooksConnection): string {
  if (!connection.accessTokenExpiresAt) return "—";
  const stamp = formatDateTime(connection.accessTokenExpiresAt);
  if (connection.accessTokenExpired) return `caducó el ${stamp}`;
  if (connection.accessTokenExpiresInSeconds == null) return stamp;
  const minutes = Math.max(1, Math.round(connection.accessTokenExpiresInSeconds / 60));
  return `${stamp} · en ${minutes} min`;
}

/** `authorizationUrl` llega relativo a la API, no al frontend. */
function authorizationHref(connection: QuickbooksConnection): string {
  return `${API_BASE_URL.replace(/\/$/, "")}${connection.authorizationUrl}`;
}

function StatusBadge({ connection }: { connection: QuickbooksConnection }) {
  if (!connection.oauthConfigured) {
    return (
      <Badge
        variant="outline"
        style={{ borderColor: "hsl(var(--badge-neutral))", color: "hsl(var(--badge-neutral))" }}
      >
        Sin configurar
      </Badge>
    );
  }
  if (!connection.connected) {
    return (
      <Badge
        variant="outline"
        style={{ borderColor: "hsl(var(--badge-red))", color: "hsl(var(--badge-red))" }}
      >
        Sin conectar
      </Badge>
    );
  }
  if (connection.accessTokenExpired) {
    return (
      <Badge
        variant="outline"
        style={{ borderColor: "hsl(var(--badge-amber))", color: "hsl(var(--badge-amber))" }}
      >
        Reautorización pendiente
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      style={{ borderColor: "hsl(var(--badge-green))", color: "hsl(var(--badge-green))" }}
    >
      Conectada
    </Badge>
  );
}

function statusHint(connection: QuickbooksConnection): string {
  if (!connection.oauthConfigured) return "La integración no está configurada en el servidor.";
  if (!connection.connected) {
    return "Nadie ha autorizado todavía a este servidor a leer la contabilidad.";
  }
  if (connection.accessTokenExpired) {
    return "El refresco automático no renovó el token: hay que volver a autorizar.";
  }
  return "El servidor puede leer facturas, pagos y gastos de QuickBooks.";
}

function StatusRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-t border-line py-2 first:border-t-0 first:pt-0">
      <dt className="font-display text-xs uppercase tracking-wide text-fg-faint">{label}</dt>
      <dd className="text-sm text-fg">{value}</dd>
    </div>
  );
}

export function QuickbooksConnectionStatusCard() {
  const { data, isPending, isError, isFetching, refetch } = useQuickbooksConnectionStatus();

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <Plug className="size-5" />
            Conexión con QuickBooks
          </CardTitle>
          <CardDescription>
            El servidor consulta QuickBooks con una autorización que caduca. Cuando se pierde,
            las cifras y los informes de los proyectos se quedan en blanco hasta que alguien
            vuelve a autorizar la conexión.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={() => void refetch()} disabled={isFetching}>
          <RefreshCw className={cn("size-4 mr-2", isFetching && "animate-spin")} />
          Actualizar
        </Button>
      </CardHeader>

      <CardContent className="space-y-4">
        {isPending ? (
          <div className="flex items-center gap-2 text-sm text-fg-dim" role="status">
            <Loader2 className="size-4 animate-spin" />
            Consultando el estado de la conexión…
          </div>
        ) : isError || !data ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm">
            <span className="flex items-center gap-2 text-destructive">
              <TriangleAlert className="size-4" />
              No se pudo consultar el estado de la conexión.
            </span>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge connection={data} />
              <span className="text-sm text-fg-dim">{statusHint(data)}</span>
            </div>

            <dl>
              <StatusRow
                label="Empresa"
                value={data.realmId ? maskRealmId(data.realmId) : "—"}
              />
              <StatusRow label="Conectada desde" value={formatDateTime(data.connectedAt)} />
              <StatusRow
                label="Último refresco"
                value={formatDateTime(data.lastRefreshedAt)}
              />
              <StatusRow label="Token de acceso" value={formatTokenExpiry(data)} />
              <StatusRow label="Consultado" value={formatDateTime(data.checkedAt)} />
            </dl>

            {!data.oauthConfigured ? (
              <p className="rounded-lg border border-line bg-elev-3 px-3 py-2 text-sm text-fg-dim">
                El servidor no tiene las credenciales de QuickBooks configuradas, así que no se
                puede autorizar la conexión desde aquí. Tiene que añadirlas un administrador de
                sistemas.
              </p>
            ) : (
              <div className="space-y-2">
                <Button
                  asChild
                  variant={data.connected && !data.accessTokenExpired ? "outline" : "default"}
                  size="sm"
                >
                  <a href={authorizationHref(data)} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4 mr-2" />
                    {data.connected ? "Reautorizar en QuickBooks" : "Conectar con QuickBooks"}
                  </a>
                </Button>
                <p className="text-xs text-fg-faint">
                  Se abre QuickBooks en otra pestaña para dar permiso. Al terminar, el servidor
                  confirma la conexión en esa misma pestaña: ciérrala y pulsa «Actualizar» aquí.
                  Si las cifras de QuickBooks aparecen vacías aunque esta tarjeta diga
                  «Conectada», es que Intuit revocó el permiso por su lado: reautoriza.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
