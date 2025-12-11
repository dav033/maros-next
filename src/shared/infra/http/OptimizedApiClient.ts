import axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";
import type { HttpClientLike, RequestOptions } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api";

export class OptimizedApiClient implements HttpClientLike {
  private readonly axiosInstance: AxiosInstance;

  constructor(baseURL: string = BASE_URL) {
    this.axiosInstance = axios.create({
      baseURL,
      withCredentials: true,
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

    // Log para debugging
    const fullUrl = `${this.axiosInstance.defaults.baseURL}${url}`;
    console.log(`🔍 OptimizedApiClient - Method: ${method}, URL: ${fullUrl}, Params:`, options?.params);

    try {
      const response = await this.axiosInstance.request<T>(config);
      console.log(`✅ OptimizedApiClient - Success: ${response.status}`, response.data);
      return { data: response.data, status: response.status };
    } catch (error: any) {
      const errorDetails = {
        url: fullUrl,
        method,
        params: options?.params,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        error: error,
      };
      console.error(`❌ OptimizedApiClient - Error:`, errorDetails);
      
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        throw new Error(
          `Request failed: ${error.response.status} ${error.response.statusText} - ${error.response.data?.message || error.message}`
        );
      } else if (error.request) {
        // La petición se hizo pero no se recibió respuesta
        throw new Error(`No response received: ${error.message}`);
      } else {
        // Algo pasó al configurar la petición
        throw new Error(`Request setup error: ${error.message}`);
      }
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

export const optimizedApiClient = new OptimizedApiClient(BASE_URL);
