import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import { AppError } from "@/shared/errors";
import { emitUnauthorized } from "@/shared/errors/authEvents";
import type { HttpClientLike, RequestOptions } from "./types";

// Fallback seguro para producción: nunca apuntar a localhost en un build desplegado.
// En local, `.env` puede definir NEXT_PUBLIC_API_BASE_URL con la API local.
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.marosconstruction.com/api";

export class OptimizedApiClient implements HttpClientLike {
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string = BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true,
    });

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error: unknown) => {
        const appError = AppError.from(error);
        if (appError.kind === "unauthorized") {
          emitUnauthorized(appError);
        }
        return Promise.reject(appError);
      }
    );
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

  patch<T = unknown>(url: string, body?: unknown, options?: RequestOptions) {
    return this.request<T>("PATCH", url, body, options);
  }

  delete<T = unknown>(url: string, options?: RequestOptions) {
    return this.request<T>("DELETE", url, undefined, options);
  }
}

export const optimizedApiClient = new OptimizedApiClient(BASE_URL);
