'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { getMyReservations, getDashboardStats, DashboardStats, renewReservation } from '@/lib/api/reservations';
import { Reservation } from '@/types';

export default function UserDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    booksReserved: 0,
    booksDueSoon: 0,
    totalBorrowed: 0,
  });
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [recentActivity, setRecentActivity] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const reservationsData = await getMyReservations();
      
      // Try to get stats from API, but calculate from reservations as fallback
      let statsData: DashboardStats;
      try {
        statsData = await getDashboardStats();
      } catch {
        // Calculate stats from reservations if API doesn't exist
        const activeReservations = reservationsData.filter(r => r.status === 'ACTIVE');
        const dueSoon = activeReservations.filter(r => {
          const dueDate = new Date(r.dueDate);
          const now = new Date();
          const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          return daysUntilDue <= 7 && daysUntilDue >= 0;
        });
        const returnedReservations = reservationsData.filter(r => r.status === 'RETURNED');

        statsData = {
          booksReserved: activeReservations.length,
          booksDueSoon: dueSoon.length,
          totalBorrowed: returnedReservations.length + activeReservations.length,
        };
      }

      setReservations(reservationsData);
      setStats(statsData);

      // Get recent activity (last 5 reservations, sorted by date)
      const recent = [...reservationsData]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);
      setRecentActivity(recent);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRenew = async (reservationId: number) => {
    try {
      await renewReservation(reservationId);
      await loadDashboardData(); // Reload data
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to renew reservation');
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const days = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const formatDateAgo = (date: string) => {
    const dateObj = new Date(date);
    const now = new Date();
    const days = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    return `${days} days ago`;
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

  if (!isAuthenticated || !user) {
    return null;
  }

  const upcomingDue = reservations
    .filter(r => r.status === 'ACTIVE')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero/Welcome Section with Background Image */}
      <div className="relative w-full h-80 md:h-96 mb-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-background.jpg"
            alt="Library Background"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          {/* Overlay matching landing page */}
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
              Welcome back, {user.name || 'User'}! 👋
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-6 drop-shadow-md">
              Find your next great read and explore our vast collection of books.
            </p>
            
            {/* Smaller Transparent Search Bar */}
            <div className="relative max-w-lg">
              <input
                type="text"
                placeholder="Search for books, authors, or genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && searchQuery.trim()) {
                    router.push(`/user/books?search=${encodeURIComponent(searchQuery)}`);
                  }
                }}
                className="w-full px-3 py-2.5 pl-10 pr-4 text-sm bg-white/80 backdrop-blur-xl border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-white/40 shadow-xl placeholder-gray-500"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 -mt-4">

        {/* Summary Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Books Reserved</p>
                <p className="text-4xl font-bold text-indigo-600">{stats.booksReserved}</p>
              </div>
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Books Due Soon</p>
                <p className="text-4xl font-bold text-indigo-600">{stats.booksDueSoon}</p>
              </div>
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Total Borrowed</p>
                <p className="text-4xl font-bold text-indigo-600">{stats.totalBorrowed}</p>
              </div>
              <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse Books</h3>
            <p className="text-gray-600 mb-4">Discover new books and explore our collection.</p>
            <Link
              href="/user/books"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              Start Browsing
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">My Reservations</h3>
            <p className="text-gray-600 mb-4">View and manage your book reservations.</p>
            <Link
              href="/user/reservations"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              View Reservations
            </Link>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Profile Settings</h3>
            <p className="text-gray-600 mb-4">Update your account and preferences.</p>
            <Link
              href="/user/profile"
              className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm font-medium"
            >
              Manage Profile
            </Link>
          </div>
        </div>

        {/* Recent Activity and Upcoming Due Dates */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
              <Link href="/user/history" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.book.title}
                      </p>
                      <p className="text-xs text-gray-500">{activity.book.author}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          activity.status === 'ACTIVE' 
                            ? 'bg-indigo-100 text-indigo-800' 
                            : activity.status === 'RETURNED'
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {activity.status}
                        </span>
                        <span className="text-xs text-gray-500">{formatDateAgo(activity.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">No recent activity</p>
              )}
            </div>
          </div>

          {/* Upcoming Due Dates */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Due Dates</h2>
              <Link href="/user/reservations" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {upcomingDue.length > 0 ? (
                upcomingDue.map((reservation) => {
                  const daysUntilDue = getDaysUntilDue(reservation.dueDate);
                  const isOverdue = daysUntilDue < 0;
                  const isDueTomorrow = daysUntilDue === 1;
                  const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

                  return (
                    <div key={reservation.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {reservation.book.title}
                          </p>
                          <p className="text-xs text-gray-500">{reservation.book.author}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          isOverdue
                            ? 'bg-red-100 text-red-800'
                            : isDueTomorrow
                            ? 'bg-indigo-100 text-indigo-800'
                            : isDueSoon
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {isOverdue
                            ? `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) > 1 ? 's' : ''}`
                            : isDueTomorrow
                            ? 'Due Tomorrow'
                            : `Due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`
                          }
                        </span>
                        <button
                          onClick={() => handleRenew(reservation.id)}
                          className="px-3 py-1.5 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          Renew
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-sm">No upcoming due dates</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
