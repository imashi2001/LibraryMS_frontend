'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LibrarianNavbar from '@/components/layout/LibrarianNavbar';
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
    <div className="min-h-screen bg-gray-50">
      <LibrarianNavbar />
      <div className="max-w-7xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
          >
            Add New Category
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
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No categories found. Add your first category!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{category.name}</h3>
                {category.description && (
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                )}
                <p className="text-xs text-gray-400 mb-4">
                  Created: {new Date(category.createdAt).toLocaleDateString()}
                </p>
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <button
                    onClick={() => setEditingCategoryId(category.id)}
                    className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingCategoryId(category.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
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

        {showAddForm && (
          <AddCategoryForm
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  );
}

