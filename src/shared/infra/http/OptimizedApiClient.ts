import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { HttpClientLike, RequestOptions } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export class OptimizedApiClient implements HttpClientLike {
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string = BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true, // Match backend CORS credentials: true
    });
  }

  private async request<T>(
    method: AxiosRequestConfig["method"],
    url: string,
    body?: unknown,
    options?: RequestOptions
  ): Promise<{ data: T; status: number }> {
    const config: AxiosRequestConfig = {
      method,
      url,
      data: body,
      params: options?.params,
      headers: options?.headers,
      withCredentials: options?.withCredentials,
      signal: options?.signal,
    };

    const response = await this.axiosInstance.request<T>(config);
    return { data: response.data, status: response.status };
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

export const optimizedApiClient = new OptimizedApiClient(BASE_URL);
