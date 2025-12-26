import type { HttpClientLike, RequestOptions } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export class ServerApiClient implements HttpClientLike {
  private readonly baseURL: string;

  constructor(baseURL: string = BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    method: string,
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<{ data: T; status: number }> {
    const fullUrl = url.startsWith("http") ? url : `${this.baseURL}${url}`;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    };

    const searchParams = options?.params
      ? new URLSearchParams(
          Object.entries(options.params).reduce(
            (acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = String(value);
              }
              return acc;
            },
            {} as Record<string, string>
          )
        ).toString()
      : "";

    const urlWithParams = searchParams ? `${fullUrl}?${searchParams}` : fullUrl;

    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials: options?.withCredentials ? "include" : "same-origin",
      signal: options?.signal,
    };
    
    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(urlWithParams, fetchOptions);
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(
          `Request failed: ${response.status} ${response.statusText} - ${errorText}`
        );
      }

      const data = await response.json().catch(() => ({} as T));
      return { data, status: response.status };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Request error: ${String(error)}`);
    }
  }

  get<T = unknown>(url: string, options?: RequestOptions) {
    return this.request<T>("GET", url, undefined, options);
  }

  post<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("POST", url, body, options);
  }

  put<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PUT", url, body, options);
  }

  delete<T = unknown>(url: string, options?: RequestOptions) {
    return this.request<T>("DELETE", url, undefined, options);
  }
}

export const serverApiClient = new ServerApiClient(BASE_URL);

