const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

interface ApiErrorBody {
  detail?: string;
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    const body: ApiErrorBody = await response
      .json()
      .catch((): ApiErrorBody => ({}));
    throw new ApiError(
      response.status,
      body.detail ?? `Request failed with ${response.status}`,
    );
  }
  return response.json() as T;
}
