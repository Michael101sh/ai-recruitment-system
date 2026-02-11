/**
 * Extracts a user-friendly error message from API (Axios) errors.
 * Aligns with backend auth, rate limiting, and error handler responses.
 */
export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object' && 'response' in err) {
    const axiosErr = err as {
      response?: {
        status?: number;
        data?: { error?: { message?: string } };
      };
    };
    const status = axiosErr.response?.status;
    const serverMessage = axiosErr.response?.data?.error?.message;

    if (status === 401) return '❌ Authentication failed — Invalid or missing API key';
    if (status === 429) return '⚠️ Too many requests — please wait before trying again';
    if (status === 403) return '❌ Access forbidden';

    return serverMessage || fallback;
  }
  return fallback;
}
