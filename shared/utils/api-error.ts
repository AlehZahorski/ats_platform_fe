type ApiErrorDetail =
  | string
  | { message?: string; issues?: string[] }
  | undefined;

interface ApiErrorResponse {
  response?: {
    data?: {
      detail?: ApiErrorDetail;
    };
  };
}

export function getApiErrorMessage(error: unknown): string | null {
  const detail = (error as ApiErrorResponse)?.response?.data?.detail;

  if (typeof detail === "string") return detail;

  if (detail && typeof detail === "object") {
    if (Array.isArray(detail.issues) && detail.issues.length > 0) {
      return detail.issues.join("\n");
    }
    if (typeof detail.message === "string") return detail.message;
  }

  return null;
}
