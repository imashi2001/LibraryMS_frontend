'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import LibrarianNavbar from '@/components/layout/LibrarianNavbar';
import Footer from '@/components/layout/Footer';
import AddCategoryForm from '@/components/librarian/AddCategoryForm';
import EditCategoryForm from '@/components/librarian/EditCategoryForm';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { getAllCategories, deleteCategory } from '@/lib/api/librarian';
import { Category } from '@/types';

export default function CategoriesPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
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
      loadCategories();
    }
  }, [isAuthenticated, user]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await getAllCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSuccess = () => {
    setShowAddForm(false);
    loadCategories();
  };

  const handleEditSuccess = () => {
    setEditingCategoryId(null);
    loadCategories();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingCategoryId) return;

    try {
      setError('');
      await deleteCategory(deletingCategoryId);
      setDeletingCategoryId(null);
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete category. It may have associated books.');
      setDeletingCategoryId(null);
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
            alt="Categories Management Background"
            fill
            className="object-cover"
            priority
            quality={90}
          />
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-center">
          <div className="max-w-2xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight drop-shadow-lg">
              Categories Management
            </h1>
            <p className="text-lg md:text-xl text-white/90 drop-shadow-md">
              Organize and manage book categories and genres
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
            <p className="text-gray-600">Total Categories: <span className="font-semibold text-indigo-600">{categories.length}</span></p>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-md hover:shadow-lg flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Category</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                <div className="w-full h-32 bg-gradient-to-br from-indigo-200 to-purple-200"></div>
                <div className="p-5">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg mb-4">No categories found. Add your first category!</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
            >
              Add Your First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((category) => {
              const getCategoryColor = (name: string) => {
                const categoryName = name.toLowerCase();
                if (categoryName.includes('fiction') || categoryName.includes('novel')) {
                  return {
                    gradient: 'from-blue-500 via-blue-600 to-indigo-600',
                    iconBg: 'bg-blue-500',
                  };
                }
                if (categoryName.includes('technology') || categoryName.includes('tech')) {
                  return {
                    gradient: 'from-green-500 via-emerald-600 to-teal-600',
                    iconBg: 'bg-green-500',
                  };
                }
                if (categoryName.includes('science')) {
                  return {
                    gradient: 'from-purple-500 via-violet-600 to-indigo-600',
                    iconBg: 'bg-purple-500',
                  };
                }
                if (categoryName.includes('biography')) {
                  return {
                    gradient: 'from-orange-500 via-amber-600 to-yellow-600',
                    iconBg: 'bg-orange-500',
                  };
                }
                return {
                  gradient: 'from-indigo-500 via-purple-500 to-indigo-600',
                  iconBg: 'bg-indigo-500',
                };
              };

              const colors = getCategoryColor(category.name);

              return (
                <div key={category.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                  {/* Category Header with Gradient */}
                  <div className={`bg-gradient-to-br ${colors.gradient} px-5 py-6 relative overflow-hidden`}>
                    <div className="absolute inset-0 opacity-10">
                      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <path d="M0,0 Q50,50 100,0 L100,100 L0,100 Z" fill="white" />
                      </svg>
                    </div>
                    <div className="relative z-10 flex items-center justify-center">
                      <div className={`w-20 h-20 ${colors.iconBg} rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-6 transition-transform`}>
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Info */}
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 text-center line-clamp-2">
                      {category.name}
                    </h3>
                    
                    {/* Description */}
                    {category.description ? (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 text-center min-h-[3.75rem]">
                        {category.description}
                      </p>
                    ) : (
                      <div className="mb-4 min-h-[3.75rem] flex items-center justify-center">
                        <p className="text-gray-400 text-sm italic">No description provided</p>
                      </div>
                    )}
                    
                    {/* Date Info */}
                    <div className="flex items-center justify-center text-xs text-gray-500 mb-4">
                      <svg className="w-4 h-4 mr-1.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">
                        {new Date(category.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingCategoryId(category.id)}
                          className="flex-1 px-3 py-2.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm hover:shadow-md flex items-center justify-center space-x-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingCategoryId(category.id)}
                          className="flex-1 px-3 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium shadow-sm hover:shadow-md flex items-center justify-center space-x-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showAddForm && (
          <AddCategoryForm
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        )}

        {editingCategoryId && (
          <EditCategoryForm
            categoryId={editingCategoryId}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingCategoryId(null)}
          />
        )}

        <ConfirmDialog
          isOpen={deletingCategoryId !== null}
          title="Delete Category"
          message={`Are you sure you want to delete "${categories.find(c => c.id === deletingCategoryId)?.name}"? This action cannot be undone. If this category has associated books, the deletion will fail.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDestructive={true}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingCategoryId(null)}
        />
      </div>

      <Footer />
    </div>
  );
}

