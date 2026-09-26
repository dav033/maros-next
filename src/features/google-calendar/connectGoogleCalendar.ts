import { API_BASE_URL } from "@/shared/infra/http/OptimizedApiClient";

export function connectGoogleCalendar(returnTo: string): void {
  const base = API_BASE_URL.replace(/\/$/, "");
  const query = new URLSearchParams({ returnTo });
  window.location.assign(`${base}/google-calendar/connect?${query.toString()}`);
}
