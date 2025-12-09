'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMyReservations } from '@/lib/api/reservations';
import { Reservation } from '@/types';
import { getImageUrl } from '@/lib/api';

export default function HistoryPage() {
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
      loadHistory();
    }
  }, [isAuthenticated]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await getMyReservations();
      // Show all reservations (including returned ones) sorted by date
      const sorted = data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setReservations(sorted);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">History</h1>
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
                      {reservation.dueDate && (
                        <p className="text-sm text-gray-600">
                          Due: {new Date(reservation.dueDate).toLocaleDateString()}
                        </p>
                      )}
                      {reservation.returnDate && (
                        <p className="text-sm text-gray-600">
                          Returned: {new Date(reservation.returnDate).toLocaleDateString()}
                        </p>
                      )}
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        reservation.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                        reservation.status === 'RETURNED' ? 'bg-blue-100 text-blue-800' :
                        reservation.status === 'OVERDUE' ? 'bg-red-100 text-red-800' :
                        reservation.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {reservation.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <p className="text-gray-600">No history found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

