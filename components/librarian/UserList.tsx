'use client';

import { useState } from 'react';
import { getAllUsers, blacklistUser } from '@/lib/api/librarian';
import { User } from '@/types';
import UserDetailsCard from './UserDetailsCard';

interface UserListProps {
  users: User[];
  onUpdate: () => void;
}

export default function UserList({ users, onUpdate }: UserListProps) {
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const handleBlacklistToggle = async (user: User) => {
    if (user.role === 'LIBRARIAN') {
      setError('Cannot blacklist a librarian');
      return;
    }

    setUpdatingId(user.id);
    setError('');

    try {
      await blacklistUser(user.id, !user.isBlacklisted);
      onUpdate();
      // Update the selected user if it's the same user
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser({ ...user, isBlacklisted: !user.isBlacklisted });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update user');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg m-6">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-indigo-50 to-purple-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider align-middle">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider align-middle">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider align-middle">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider align-middle">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider align-middle">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className={`hover:bg-gray-50 transition ${user.isBlacklisted ? 'bg-red-50/50' : ''}`}>
                <td className="px-6 py-4 whitespace-nowrap align-middle">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                      <span className="text-indigo-600 font-semibold text-sm">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <button
                        onClick={() => handleUserClick(user)}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline transition cursor-pointer"
                      >
                        {user.name}
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-middle">
                  <div className="text-sm text-gray-600">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-middle">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${
                    user.role === 'LIBRARIAN' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-middle">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${
                    user.isBlacklisted 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {user.isBlacklisted ? 'Blacklisted' : 'Active'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap align-middle">
                  {user.role !== 'LIBRARIAN' && (
                    <button
                      onClick={() => handleBlacklistToggle(user)}
                      disabled={updatingId === user.id}
                      className={`px-4 py-2 rounded-lg text-xs font-medium transition ${
                        user.isBlacklisted
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-red-100 text-red-800 hover:bg-red-200'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {updatingId === user.id
                        ? 'Updating...'
                        : user.isBlacklisted
                        ? 'Unblacklist'
                        : 'Blacklist'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Details Card Modal */}
      {selectedUser && (
        <UserDetailsCard
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onBlacklistToggle={() => handleBlacklistToggle(selectedUser)}
          isUpdating={updatingId === selectedUser.id}
        />
      )}
    </div>
  );
}

