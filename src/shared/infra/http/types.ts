import type { AxiosRequestHeaders } from "axios";

export type RequestOptions = {
  params?: Record<string, unknown>;
  headers?: AxiosRequestHeaders | Record<string, string>;
  withCredentials?: boolean;
  signal?: AbortSignal;
};

export interface HttpClientLike {
  get<T = unknown>(
    url: string,
    options?: RequestOptions
  ): Promise<{ data: T; status: number }>;
  post<T = unknown>(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<{ data: T; status: number }>;
  put<T = unknown>(
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<{ data: T; status: number }>;
  delete<T = unknown>(
    url: string,
    options?: RequestOptions
  ): Promise<{ data: T; status: number }>;
}
