'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMyReservations, renewReservation, cancelReservation } from '@/lib/api/reservations';
import { Reservation, ReservationStatus } from '@/types';
import { getImageUrl } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

type FilterTab = 'ALL' | 'ACTIVE' | 'OVERDUE' | 'RETURNED' | 'CANCELLED';

export default function MyReservationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [sortBy, setSortBy] = useState<'date' | 'dueDate' | 'title'>('dueDate');
  const [showCancelConfirm, setShowCancelConfirm] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
      setErrorMessage('Failed to load reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (reservationId: number) => {
    try {
      setActionLoading(reservationId);
      setErrorMessage('');
      setSuccessMessage('');
      await renewReservation(reservationId);
      await loadReservations();
      setSuccessMessage('Reservation renewed successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to renew reservation');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (reservationId: number) => {
    try {
      setActionLoading(reservationId);
      setErrorMessage('');
      setSuccessMessage('');
      await cancelReservation(reservationId);
      await loadReservations();
      setSuccessMessage('Reservation cancelled successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      setShowCancelConfirm(null);
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to cancel reservation');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setActionLoading(null);
    }
  };

  // Calculate statistics
  const stats = {
    active: reservations.filter(r => r.status === 'ACTIVE').length,
    overdue: reservations.filter(r => r.status === 'OVERDUE').length,
    returned: reservations.filter(r => r.status === 'RETURNED').length,
    cancelled: reservations.filter(r => r.status === 'CANCELLED').length,
    dueSoon: reservations.filter(r => {
      if (r.status !== 'ACTIVE') return false;
      const dueDate = new Date(r.dueDate);
      const now = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDue <= 7 && daysUntilDue >= 0;
    }).length,
  };

  // Filter reservations by active tab
  const filteredReservations = reservations.filter(reservation => {
    if (activeTab === 'ALL') return true;
    return reservation.status === activeTab;
  });

  // Sort reservations
  const sortedReservations = [...filteredReservations].sort((a, b) => {
    switch (sortBy) {
      case 'dueDate':
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      case 'date':
        return new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime();
      case 'title':
        return a.book.title.localeCompare(b.book.title);
      default:
        return 0;
    }
  });

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getDueDateStatus = (dueDate: string, status: ReservationStatus) => {
    if (status === 'RETURNED' || status === 'CANCELLED') return null;
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return { text: 'Overdue', color: 'red', days: Math.abs(days) };
    if (days === 0) return { text: 'Due Today', color: 'red', days: 0 };
    if (days === 1) return { text: 'Due Tomorrow', color: 'orange', days: 1 };
    if (days <= 3) return { text: `Due in ${days} days`, color: 'orange', days };
    if (days <= 7) return { text: `Due in ${days} days`, color: 'yellow', days };
    return { text: `Due in ${days} days`, color: 'green', days };
  };

  const getProgressPercentage = (reservation: Reservation) => {
    const reserved = new Date(reservation.reservationDate).getTime();
    const due = new Date(reservation.dueDate).getTime();
    const now = new Date().getTime();
    const total = due - reserved;
    const elapsed = now - reserved;
    if (reservation.status === 'RETURNED' && reservation.returnDate) {
      const returned = new Date(reservation.returnDate).getTime();
      return Math.min(100, ((returned - reserved) / total) * 100);
    }
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Image and Statistics */}
      <div className="relative w-full h-80 md:h-96 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/reservation-hero.png"
            alt="Reservations Background"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Overlay matching other pages */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 drop-shadow-lg">My Reservations</h1>
            <p className="text-white/90 drop-shadow-md">Manage and track all your book reservations</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-white/80 backdrop-blur-xl rounded-lg p-4 border border-white/30 shadow-lg">
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.active}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-lg p-4 border border-white/30 shadow-lg">
              <p className="text-sm text-gray-600 mb-1">Due Soon</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.dueSoon}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-lg p-4 border border-white/30 shadow-lg">
              <p className="text-sm text-gray-600 mb-1">Overdue</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.overdue}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-lg p-4 border border-white/30 shadow-lg">
              <p className="text-sm text-gray-600 mb-1">Returned</p>
              <p className="text-2xl font-bold text-indigo-600">{stats.returned}</p>
            </div>
            <div className="bg-white/80 backdrop-blur-xl rounded-lg p-4 border border-white/30 shadow-lg">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-indigo-600">{reservations.length}</p>
            </div>
          </div>
        </div>
        
        {/* Decorative Wave Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <svg className="w-full h-12 text-gray-50" fill="currentColor" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
            <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
            <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
          </svg>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-4 bg-green-50 border-l-4 border-green-500 text-green-700 px-4 py-3 rounded">
            <p className="font-medium">{successMessage}</p>
          </div>
        )}
        {errorMessage && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">{errorMessage}</p>
          </div>
        )}

        {/* Tabs and Sort Controls */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {(['ALL', 'ACTIVE', 'OVERDUE', 'RETURNED', 'CANCELLED'] as FilterTab[]).map((tab) => {
                const count = tab === 'ALL' 
                  ? reservations.length 
                  : reservations.filter(r => r.status === tab).length;
                
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      activeTab === tab
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tab}
                    {count > 0 && (
                      <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                        activeTab === tab ? 'bg-white/20' : 'bg-gray-300'
                      }`}>
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              >
                <option value="dueDate">Due Date</option>
                <option value="date">Date Reserved</option>
                <option value="title">Book Title</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reservations List */}
        {sortedReservations.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {activeTab === 'ALL' 
                ? 'No reservations yet' 
                : `No ${activeTab.toLowerCase()} reservations`}
            </h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'ALL' 
                ? 'Start exploring our collection to reserve your favorite books!'
                : 'Try selecting a different filter or browse our book collection.'}
            </p>
            {activeTab === 'ALL' && (
              <Link
                href="/user/books"
                className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
              >
                Browse Books
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {sortedReservations.map((reservation) => {
              const dueDateStatus = getDueDateStatus(reservation.dueDate, reservation.status);
              const progress = getProgressPercentage(reservation);

              return (
                <div
                  key={reservation.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row gap-6">
                      {/* Book Image */}
                      <div className="flex-shrink-0 relative w-32 h-44">
                        {reservation.book.imageUrl ? (
                          <Image
                            src={getImageUrl(reservation.book.imageUrl) || ''}
                            alt={reservation.book.title}
                            fill
                            className="object-cover rounded-lg shadow-md"
                          />
                        ) : (
                          <div className="w-32 h-44 bg-gray-200 rounded-lg flex items-center justify-center">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Book Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Link href={`/user/books/${reservation.book.id}`}>
                              <h3 className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition cursor-pointer">
                                {reservation.book.title}
                              </h3>
                            </Link>
                            <p className="text-gray-600 mt-1">{reservation.book.author}</p>
                            {reservation.book.category && (
                              <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                                {reservation.book.category.name}
                              </span>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              reservation.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-800'
                                : reservation.status === 'RETURNED'
                                ? 'bg-indigo-100 text-indigo-800'
                                : reservation.status === 'OVERDUE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {reservation.status}
                          </span>
                        </div>

                        {/* Date Information */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Reserved Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(reservation.reservationDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Due Date</p>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(reservation.dueDate).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            {dueDateStatus && (
                              <span
                                className={`inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full ${
                                  dueDateStatus.color === 'red'
                                    ? 'bg-red-100 text-red-800'
                                    : dueDateStatus.color === 'orange'
                                    ? 'bg-orange-100 text-orange-800'
                                    : dueDateStatus.color === 'yellow'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-green-100 text-green-800'
                                }`}
                              >
                                {dueDateStatus.text}
                              </span>
                            )}
                          </div>
                          {reservation.returnDate && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Returned Date</p>
                              <p className="text-sm font-medium text-gray-900">
                                {new Date(reservation.returnDate).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Progress Bar for Active Reservations */}
                        {reservation.status === 'ACTIVE' && (
                          <div className="mb-4">
                            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                              <span>Reservation Progress</span>
                              <span>{Math.round(progress)}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all ${
                                  dueDateStatus?.days !== undefined && dueDateStatus.days <= 3
                                    ? 'bg-red-500'
                                    : dueDateStatus?.days !== undefined && dueDateStatus.days <= 7
                                    ? 'bg-orange-500'
                                    : 'bg-indigo-600'
                                }`}
                                style={{ width: `${progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {reservation.status === 'ACTIVE' && (
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => handleRenew(reservation.id)}
                              disabled={actionLoading === reservation.id}
                              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                              {actionLoading === reservation.id ? (
                                <>
                                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  <span>Processing...</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  <span>Renew</span>
                                </>
                              )}
                            </button>
                            {showCancelConfirm === reservation.id ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">Are you sure?</span>
                                <button
                                  onClick={() => handleCancel(reservation.id)}
                                  disabled={actionLoading === reservation.id}
                                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-sm font-medium disabled:opacity-50"
                                >
                                  Yes, Cancel
                                </button>
                                <button
                                  onClick={() => setShowCancelConfirm(null)}
                                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition text-sm font-medium"
                                >
                                  No
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowCancelConfirm(reservation.id)}
                                disabled={actionLoading === reservation.id}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Cancel</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
