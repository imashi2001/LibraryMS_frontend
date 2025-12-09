'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMyReservations, renewReservation, cancelReservation } from '@/lib/api/reservations';
import { Reservation } from '@/types';
import { getImageUrl } from '@/lib/api';

export default function MyReservationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadReservations();
    }
  }, [isAuthenticated]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await getMyReservations();
      setReservations(data);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (reservationId: number) => {
    try {
      await renewReservation(reservationId);
      await loadReservations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to renew reservation');
    }
  };

  const handleCancel = async (reservationId: number) => {
    if (!confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await cancelReservation(reservationId);
      await loadReservations();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to cancel reservation');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Reservations</h1>
        <div className="grid grid-cols-1 gap-6">
          {reservations.length > 0 ? (
            reservations.map((reservation) => (
              <div key={reservation.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start space-x-4">
                  {reservation.book.imageUrl && (
                    <img
                      src={getImageUrl(reservation.book.imageUrl) || ''}
                      alt={reservation.book.title}
                      className="w-20 h-28 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{reservation.book.title}</h3>
                    <p className="text-gray-600">{reservation.book.author}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-sm text-gray-600">
                        Reserved: {new Date(reservation.reservationDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        Due: {new Date(reservation.dueDate).toLocaleDateString()}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        reservation.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'RETURNED' ? 'bg-blue-100 text-blue-800' :
                        reservation.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {reservation.status}
                      </span>
                    </div>
                  </div>
                  {reservation.status === 'ACTIVE' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleRenew(reservation.id)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      >
                        Renew
                      </button>
                      <button
                        onClick={() => handleCancel(reservation.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No reservations found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

