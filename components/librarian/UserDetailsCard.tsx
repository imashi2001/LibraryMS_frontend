'use client';

import { User } from '@/types';

interface UserDetailsCardProps {
  user: User;
  onClose: () => void;
  onBlacklistToggle?: () => void;
  isUpdating?: boolean;
}

export default function UserDetailsCard({ user, onClose, onBlacklistToggle, isUpdating }: UserDetailsCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRoleColor = (role: string) => {
    return role === 'LIBRARIAN' 
      ? 'bg-purple-100 text-purple-800 border-purple-200' 
      : 'bg-indigo-100 text-indigo-800 border-indigo-200';
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-gray-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Avatar and Name */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-indigo-600 font-bold text-2xl">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="space-y-4 mb-6">
            {/* Role */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <p className="text-base font-semibold text-gray-900">{user.role}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getRoleColor(user.role)}`}>
                {user.role}
              </span>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Account Status</p>
                  <p className="text-base font-semibold text-gray-900">
                    {user.isBlacklisted ? 'Blacklisted' : 'Active'}
                  </p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                user.isBlacklisted 
                  ? 'bg-red-100 text-red-800 border border-red-200' 
                  : 'bg-green-100 text-green-800 border border-green-200'
              }`}>
                {user.isBlacklisted ? 'Blacklisted' : 'Active'}
              </span>
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-base font-semibold text-gray-900">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">User ID</p>
                  <p className="text-base font-semibold text-gray-900">#{user.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          {user.role !== 'LIBRARIAN' && onBlacklistToggle && (
            <div className="pt-6 border-t border-gray-200">
              <button
                onClick={onBlacklistToggle}
                disabled={isUpdating}
                className={`w-full px-6 py-3 rounded-lg font-medium transition ${
                  user.isBlacklisted
                    ? 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200'
                    : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isUpdating
                  ? 'Updating...'
                  : user.isBlacklisted
                  ? 'Remove from Blacklist'
                  : 'Add to Blacklist'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

