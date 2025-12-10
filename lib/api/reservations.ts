import api from '../api';
import { Reservation, ReserveBookRequest } from '@/types';

/**
 * Reserves a book for the authenticated user
 * @param bookId - The unique identifier of the book to reserve
 * @param reservationDays - The number of days for the reservation (7, 14, or 21)
 * @returns Promise resolving to the created reservation object
 * @throws Error if book is unavailable, user is blacklisted, or API request fails
 */
export const reserveBook = async (bookId: number, reservationDays: 7 | 14 | 21): Promise<Reservation> => {
  const response = await api.post<{ status: string; message: string; data: Reservation }>(
    `/user/books/${bookId}/reserve`,
    { reservationDays } as ReserveBookRequest
  );
  return response.data.data;
};

/**
 * Fetches all reservations for the authenticated user
 * @returns Promise resolving to an array of reservation objects
 * @throws Error if API request fails or user is not authenticated
 */
export const getMyReservations = async (): Promise<Reservation[]> => {
  const response = await api.get<{ status: string; message: string; data: Reservation[] }>('/reservations/my-reservations');
  return response.data.data;
};

/**
 * Cancels a reservation by its ID
 * @param reservationId - The unique identifier of the reservation to cancel
 * @returns Promise that resolves when cancellation is successful
 * @throws Error if reservation is not found, cannot be cancelled, or API request fails
 */
export const cancelReservation = async (reservationId: number): Promise<void> => {
  await api.delete(`/reservations/${reservationId}`);
};

/**
 * Renews an active reservation, extending the due date
 * @param reservationId - The unique identifier of the reservation to renew
 * @returns Promise resolving to the updated reservation object
 * @throws Error if reservation is not found, cannot be renewed, or API request fails
 */
export const renewReservation = async (reservationId: number): Promise<Reservation> => {
  const response = await api.post<{ status: string; message: string; data: Reservation }>(
    `/reservations/${reservationId}/renew`
  );
  return response.data.data;
};

/**
 * Dashboard statistics interface
 */
export interface DashboardStats {
  booksReserved: number;
  booksDueSoon: number;
  totalBorrowed: number;
}

// Cache to remember if the stats endpoint is available
let statsEndpointAvailable: boolean | null = null;

/**
 * Fetches dashboard statistics for the authenticated user
 * Note: This endpoint may not be implemented in the backend. If it fails,
 * the dashboard will calculate stats from reservations as a fallback.
 * @returns Promise resolving to dashboard statistics
 * @throws Error if API request fails (expected if endpoint is not implemented)
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Skip API call if we know the endpoint doesn't exist
  if (statsEndpointAvailable === false) {
    throw new Error('Stats endpoint not available');
  }

  try {
    const response = await api.get<{ status: string; message: string; data: DashboardStats }>('/user/dashboard/stats');
    statsEndpointAvailable = true;
    return response.data.data;
  } catch (error: any) {
    // Mark endpoint as unavailable if it returns 500 or 404
    if (error.response?.status === 500 || error.response?.status === 404) {
      statsEndpointAvailable = false;
    }
    // If endpoint doesn't exist or returns error, throw to trigger fallback
    // This is expected if the backend endpoint is not implemented
    throw error;
  }
};

