'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import LibrarianNavbar from '@/components/layout/LibrarianNavbar';
import Footer from '@/components/layout/Footer';
import AddBookForm from '@/components/librarian/AddBookForm';
import EditBookForm from '@/components/librarian/EditBookForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import api, { getImageUrl } from '@/lib/api';
import { deleteBook } from '@/lib/api/librarian';
import { getErrorMessage } from '@/lib/utils/errorHandler';
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
      setError(getErrorMessage(err, 'Failed to load books'));
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
      setError(getErrorMessage(err, 'Failed to delete book'));
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <LibrarianNavbar />
      
      {/* Hero Section */}
      <div className="relative w-full h-64 md:h-80 mb-8 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-background.jpg"
            alt="Books Management Background"
            fill
            sizes="100vw"
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
              Books Management
            </h1>
            <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
              Manage your library collection - add, edit, and organize books
            </p>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 -mt-4 flex-grow">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-gray-600">Total Books: <span className="font-semibold text-indigo-600">{books.length}</span></p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Book</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading books...</p>
          </div>
        ) : books.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-4">No books found. Add your first book!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Add Your First Book
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {books.map((book) => {
              const getStatusInfo = () => {
                if (book.status === 'AVAILABLE') {
                  return { text: 'Available', color: 'green', dot: 'bg-green-500' };
                } else if (book.status === 'UNAVAILABLE' || book.availableCopies === 0) {
                  return { text: 'Checked Out', color: 'red', dot: 'bg-red-500' };
                } else {
                  return { text: 'Reserved', color: 'yellow', dot: 'bg-yellow-500' };
                }
              };

              const statusInfo = getStatusInfo();

              const getGenreColor = (categoryName: string) => {
                const name = categoryName.toLowerCase();
                if (name.includes('fiction') || name.includes('novel')) return 'bg-blue-100 text-blue-800';
                if (name.includes('technology') || name.includes('tech')) return 'bg-green-100 text-green-800';
                if (name.includes('science')) return 'bg-purple-100 text-purple-800';
                if (name.includes('biography')) return 'bg-orange-100 text-orange-800';
                if (name.includes('non-fiction') || name.includes('nonfiction')) return 'bg-purple-100 text-purple-800';
                return 'bg-indigo-100 text-indigo-800';
              };

              return (
                <div key={book.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  {/* Book Cover */}
                  {book.imageUrl ? (
                    <div className="relative w-full h-80 overflow-hidden">
                      <Image
                        src={getImageUrl(book.imageUrl) || ''}
                        alt={book.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full h-80 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Book Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">by {book.author}</p>
                    
                    {/* Genre Badge */}
                    {book.category && (
                      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full mb-3 w-fit ${getGenreColor(book.category.name)}`}>
                        {book.category.name}
                      </span>
                    )}
                    
                    {/* Language */}
                    {book.language && (
                      <p className="text-xs text-gray-500 mb-3">Language: {book.language}</p>
                    )}
                    
                    {/* Status with Dot */}
                    <div className="flex items-center space-x-2 mb-4">
                      <div className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></div>
                      <span className="text-sm font-medium text-gray-700">{statusInfo.text}</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingBookId(book.id)}
                          className="flex-1 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingBookId(book.id)}
                          className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                        >
                          Delete
                        </button>
                      </div>
                      <p className="text-xs text-center text-gray-500">
                        {book.availableCopies}/{book.totalCopies} copies
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
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
      </div>

      <Footer />
    </div>
  );
}

