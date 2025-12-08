import api from '../api';
import { Book, Category, PaginatedBooksResponse, BookFilters } from '@/types';

// Get books with filters and pagination
export const getBooks = async (filters: BookFilters = {}): Promise<PaginatedBooksResponse> => {
  const params = new URLSearchParams();
  
  if (filters.page !== undefined) params.append('page', filters.page.toString());
  if (filters.size !== undefined) params.append('size', filters.size.toString());
  if (filters.categoryId) params.append('categoryId', filters.categoryId.toString());
  if (filters.author) params.append('author', filters.author);
  if (filters.genre) params.append('genre', filters.genre);
  if (filters.language) params.append('language', filters.language);
  if (filters.title) params.append('title', filters.title);

  const response = await api.get<{ status: string; message: string; data: PaginatedBooksResponse }>(
    `/books?${params.toString()}`
  );
  return response.data.data;
};

// Get single book by ID
export const getBookById = async (bookId: number): Promise<Book> => {
  const response = await api.get<{ status: string; message: string; data: Book }>(`/books/${bookId}`);
  return response.data.data;
};

// Get all categories (for filter dropdown)
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await api.get<{ status: string; message: string; data: Category[] }>('/categories');
  return response.data.data;
};

