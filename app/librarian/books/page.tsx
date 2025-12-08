'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LibrarianNavbar from '@/components/layout/LibrarianNavbar';
import AddBookForm from '@/components/librarian/AddBookForm';
import EditBookForm from '@/components/librarian/EditBookForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import api, { getImageUrl } from '@/lib/api';
import { deleteBook } from '@/lib/api/librarian';
import { Book } from '@/types';

export default function BooksPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [deletingBookId, setDeletingBookId] = useState<number | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (user && user.role !== 'LIBRARIAN') {
      router.push('/user/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'LIBRARIAN') {
      loadBooks();
    }
  }, [isAuthenticated, user]);

  const loadBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get<{ status: string; message: string; data: { content: Book[] } }>('/books?page=0&size=100');
      // Backend returns paginated response with content array
      setBooks(response.data.data.content || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadBooks();
  };

  const handleEditSuccess = () => {
    setEditingBookId(null);
    loadBooks();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingBookId) return;

    try {
      setError('');
      await deleteBook(deletingBookId);
      setDeletingBookId(null);
      loadBooks();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete book');
      setDeletingBookId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || user.role !== 'LIBRARIAN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <LibrarianNavbar />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Books Management</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Add New Book
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No books found. Add your first book!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {books.map((book) => (
              <div key={book.id} className="bg-white rounded-lg shadow overflow-hidden">
                {book.imageUrl && (
                  <img
                    src={getImageUrl(book.imageUrl) || ''}
                    alt={book.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      // Hide image if it fails to load
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{book.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                  {book.category && (
                    <p className="text-xs text-gray-500 mb-2">Category: {book.category.name}</p>
                  )}
                  <div className="flex justify-between items-center mt-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      book.status === 'AVAILABLE'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {book.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {book.availableCopies}/{book.totalCopies} copies
                    </span>
                  </div>
                  <div className="flex justify-end space-x-2 mt-4 pt-4 border-t">
                    <button
                      onClick={() => setEditingBookId(book.id)}
                      className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingBookId(book.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddForm && (
          <AddBookForm
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {editingBookId && (
          <EditBookForm
            bookId={editingBookId}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingBookId(null)}
          />
        )}

        <ConfirmDialog
          isOpen={deletingBookId !== null}
          title="Delete Book"
          message={`Are you sure you want to delete "${books.find(b => b.id === deletingBookId)?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingBookId(null)}
        />

        {showAddForm && (
          <AddBookForm
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  );
}

