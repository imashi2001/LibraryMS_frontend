'use client';

import { useState } from 'react';
import { reserveBook } from '@/lib/api/reservations';
import { Book } from '@/types';

interface ReserveBookButtonProps {
  book: Book;
  onReservationSuccess?: (reservation: any) => void;
}

export default function ReserveBookButton({ book, onReservationSuccess }: ReserveBookButtonProps) {
  const [selectedDays, setSelectedDays] = useState<7 | 14 | 21>(7);
  const [isReserving, setIsReserving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const isAvailable = book.status === 'AVAILABLE' && book.availableCopies > 0;

  const handleReserve = async () => {
    if (!isAvailable || isReserving) return;

    setIsReserving(true);
    setError('');
    setSuccess(false);

    try {
      const reservation = await reserveBook(book.id, selectedDays);
      setSuccess(true);
      
      if (onReservationSuccess) {
        onReservationSuccess(reservation);
      }

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reserve book. Please try again.');
    } finally {
      setIsReserving(false);
    }
  };

  if (!isAvailable) {
    return (
      <div className="pt-4 border-t">
        <button
          disabled
          className="w-full px-4 py-3 bg-gray-300 text-gray-500 rounded-md cursor-not-allowed"
        >
          Not Available for Reservation
        </button>
        <p className="text-sm text-gray-500 mt-2 text-center">
          This book is currently unavailable
        </p>
      </div>
    );
  }

  return (
    <div className="pt-4 border-t space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Reservation Period
        </label>
        <div className="grid grid-cols-3 gap-2">
          {([7, 14, 21] as const).map((days) => (
            <button
              key={days}
              onClick={() => setSelectedDays(days)}
              disabled={isReserving}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                selectedDays === days
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
          Book reserved successfully! You can view your reservations in your dashboard.
        </div>
      )}

      <button
        onClick={handleReserve}
        disabled={isReserving || !isAvailable}
        className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
      >
        {isReserving ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Reserving...
          </span>
        ) : (
          `Reserve for ${selectedDays} Days`
        )}
      </button>

      <p className="text-xs text-gray-500 text-center">
        Due date will be {selectedDays} days from reservation date
      </p>
    </div>
  );
}

