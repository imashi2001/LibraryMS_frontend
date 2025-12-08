import api from '../api';
import { Book, Category, User, AddBookRequest, AddCategoryRequest, UpdateBookRequest, UpdateCategoryRequest, BlacklistUserRequest } from '@/types';

// Get all users (LIBRARIAN only)
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<{ status: string; message: string; data: User[] }>('/librarian/users');
  return response.data.data;
};

// Blacklist/Unblacklist user
export const blacklistUser = async (userId: number, isBlacklisted: boolean): Promise<User> => {
  const response = await api.put<{ status: string; message: string; data: User }>(
    `/librarian/users/${userId}/blacklist`,
    { isBlacklisted } as BlacklistUserRequest
  );
  return response.data.data;
};

// Add new book
export const addBook = async (bookData: AddBookRequest): Promise<Book> => {
  const formData = new FormData();
  formData.append('title', bookData.title);
  formData.append('author', bookData.author);
  formData.append('categoryId', bookData.categoryId.toString());
  formData.append('totalCopies', bookData.totalCopies.toString());
  
  if (bookData.isbn) formData.append('isbn', bookData.isbn);
  if (bookData.description) formData.append('description', bookData.description);
  if (bookData.genre) formData.append('genre', bookData.genre);
  if (bookData.language) formData.append('language', bookData.language);
  if (bookData.image) formData.append('image', bookData.image);

  const response = await api.post<{ status: string; message: string; data: Book }>(
    '/librarian/books',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data.data;
};

// Add new category
export const addCategory = async (categoryData: AddCategoryRequest): Promise<Category> => {
  const response = await api.post<{ status: string; message: string; data: Category }>(
    '/librarian/categories',
    categoryData
  );
  return response.data.data;
};

// Get all categories (public endpoint)
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await api.get<{ status: string; message: string; data: Category[] }>('/categories');
  return response.data.data;
};

// Get single book by ID
export const getBookById = async (bookId: number): Promise<Book> => {
  const response = await api.get<{ status: string; message: string; data: Book }>(`/books/${bookId}`);
  return response.data.data;
};

// Get single category by ID
export const getCategoryById = async (categoryId: number): Promise<Category> => {
  const response = await api.get<{ status: string; message: string; data: Category }>(`/categories/${categoryId}`);
  return response.data.data;
};

// Update book
export const updateBook = async (bookId: number, bookData: UpdateBookRequest): Promise<Book> => {
  const response = await api.put<{ status: string; message: string; data: Book }>(
    `/books/${bookId}`,
    bookData
  );
  return response.data.data;
};

// Delete book
export const deleteBook = async (bookId: number): Promise<void> => {
  await api.delete(`/books/${bookId}`);
};

// Update category
export const updateCategory = async (categoryId: number, categoryData: UpdateCategoryRequest): Promise<Category> => {
  const response = await api.put<{ status: string; message: string; data: Category }>(
    `/categories/${categoryId}`,
    categoryData
  );
  return response.data.data;
};

// Delete category
export const deleteCategory = async (categoryId: number): Promise<void> => {
  await api.delete(`/categories/${categoryId}`);
};

