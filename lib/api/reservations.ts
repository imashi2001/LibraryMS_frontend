import api from '../api';
import { Reservation, ReserveBookRequest } from '@/types';

// Reserve a book
export const reserveBook = async (bookId: number, reservationDays: 7 | 14 | 21): Promise<Reservation> => {
  const response = await api.post<{ status: string; message: string; data: Reservation }>(
    `/user/books/${bookId}/reserve`,
    { reservationDays } as ReserveBookRequest
  );
  return response.data.data;
};

// Get user's reservations
export const getMyReservations = async (): Promise<Reservation[]> => {
  const response = await api.get<{ status: string; message: string; data: Reservation[] }>('/reservations/my-reservations');
  return response.data.data;
};

// Cancel a reservation
export const cancelReservation = async (reservationId: number): Promise<void> => {
  await api.delete(`/reservations/${reservationId}`);
};

// Renew a reservation
export const renewReservation = async (reservationId: number): Promise<Reservation> => {
  const response = await api.post<{ status: string; message: string; data: Reservation }>(
    `/reservations/${reservationId}/renew`
  );
  return response.data.data;
};

// Get dashboard statistics
export interface DashboardStats {
  booksReserved: number;
  booksDueSoon: number;
  totalBorrowed: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get<{ status: string; message: string; data: DashboardStats }>('/user/dashboard/stats');
  return response.data.data;
};

