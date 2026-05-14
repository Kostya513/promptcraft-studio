interface FetchOptions extends RequestInit {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class ApiError extends Error {
  constructor(message: string, public status?: number, public data?: unknown) {
    super(message);
    this.name = "ApiError";
  }
}

async function fetchWithRetries<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    timeout = 10000,
    ...fetchOptions
  } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          (errorData && (errorData as any).message) || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json().catch(() => null);
      return data as T;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Если последняя попытка — выбрасываем
      if (attempt === maxRetries) break;

      // Подождём с экспоненциальным backoff
      await new Promise((resolve) => setTimeout(resolve, retryDelay * Math.pow(2, attempt)));
    }
  }

  throw lastError || new ApiError("Неизвестная ошибка");
}

export const apiClient = {
  fetch: fetchWithRetries,

  get<T>(url: string, options?: FetchOptions) {
    return fetchWithRetries<T>(url, { ...options, method: "GET" });
  },

  post<T>(url: string, data?: unknown, options?: FetchOptions) {
    return fetchWithRetries<T>(url, {
      ...options,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string> | undefined),
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put<T>(url: string, data?: unknown, options?: FetchOptions) {
    return fetchWithRetries<T>(url, {
      ...options,
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers as Record<string, string> | undefined),
      },
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete<T>(url: string, options?: FetchOptions) {
    return fetchWithRetries<T>(url, { ...options, method: "DELETE" });
  },
};