/**
 * Utility functions for error handling
 */

/**
 * Extracts a user-friendly error message from an error object
 * @param error - The error object (can be from axios, fetch, or a generic Error)
 * @param defaultMessage - Default message to return if no specific error message is found
 * @returns A user-friendly error message string
 */
export const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  // Handle axios errors
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } };
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
  }

  // Handle standard Error objects
  if (error instanceof Error && error.message) {
    return error.message;
  }

  // Handle error objects with message property
  if (error && typeof error === 'object' && 'message' in error) {
    const errorWithMessage = error as { message: unknown };
    if (typeof errorWithMessage.message === 'string') {
      return errorWithMessage.message;
    }
  }

  return defaultMessage;
};

/**
 * Checks if an error is a network error (no response from server)
 * @param error - The error object to check
 * @returns True if the error is a network error, false otherwise
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: unknown };
    return !axiosError.response;
  }
  return false;
};

/**
 * Checks if an error is an authentication error (401 or 403)
 * @param error - The error object to check
 * @returns True if the error is an authentication error, false otherwise
 */
export const isAuthError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { status?: number } };
    const status = axiosError.response?.status;
    return status === 401 || status === 403;
  }
  return false;
};

