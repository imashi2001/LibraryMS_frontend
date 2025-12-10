import api from '../api';
import { Book, Category, User, AddBookRequest, AddCategoryRequest, UpdateBookRequest, UpdateCategoryRequest, BlacklistUserRequest } from '@/types';

/**
 * Fetches all users in the system (LIBRARIAN only)
 * @returns Promise resolving to an array of user objects
 * @throws Error if user is not a librarian or API request fails
 */
export const getAllUsers = async (): Promise<User[]> => {
  const response = await api.get<{ status: string; message: string; data: User[] }>('/librarian/users');
  return response.data.data;
};

/**
 * Blacklists or unblacklists a user (LIBRARIAN only)
 * @param userId - The unique identifier of the user
 * @param isBlacklisted - True to blacklist, false to unblacklist
 * @returns Promise resolving to the updated user object
 * @throws Error if user is not found, user is a librarian, or API request fails
 */
export const blacklistUser = async (userId: number, isBlacklisted: boolean): Promise<User> => {
  const response = await api.put<{ status: string; message: string; data: User }>(
    `/librarian/users/${userId}/blacklist`,
    { isBlacklisted } as BlacklistUserRequest
  );
  return response.data.data;
};

/**
 * Adds a new book to the library (LIBRARIAN only)
 * @param bookData - Book information including title, author, category, and optional image
 * @returns Promise resolving to the created book object
 * @throws Error if validation fails, category not found, or API request fails
 */
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

/**
 * Adds a new book category (LIBRARIAN only)
 * @param categoryData - Category information including name and optional description
 * @returns Promise resolving to the created category object
 * @throws Error if category name already exists or API request fails
 */
export const addCategory = async (categoryData: AddCategoryRequest): Promise<Category> => {
  const response = await api.post<{ status: string; message: string; data: Category }>(
    '/librarian/categories',
    categoryData
  );
  return response.data.data;
};

/**
 * Fetches all available book categories (public endpoint)
 * @returns Promise resolving to an array of category objects
 * @throws Error if API request fails
 */
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await api.get<{ status: string; message: string; data: Category[] }>('/categories');
  return response.data.data;
};

/**
 * Fetches a single book by its ID
 * @param bookId - The unique identifier of the book
 * @returns Promise resolving to the book object
 * @throws Error if book is not found or API request fails
 */
export const getBookById = async (bookId: number): Promise<Book> => {
  const response = await api.get<{ status: string; message: string; data: Book }>(`/books/${bookId}`);
  return response.data.data;
};

/**
 * Fetches a single category by its ID
 * @param categoryId - The unique identifier of the category
 * @returns Promise resolving to the category object
 * @throws Error if category is not found or API request fails
 */
export const getCategoryById = async (categoryId: number): Promise<Category> => {
  const response = await api.get<{ status: string; message: string; data: Category }>(`/categories/${categoryId}`);
  return response.data.data;
};

/**
 * Updates an existing book (LIBRARIAN only)
 * @param bookId - The unique identifier of the book to update
 * @param bookData - Updated book information
 * @returns Promise resolving to the updated book object
 * @throws Error if book is not found, validation fails, or API request fails
 */
export const updateBook = async (bookId: number, bookData: UpdateBookRequest): Promise<Book> => {
  const response = await api.put<{ status: string; message: string; data: Book }>(
    `/books/${bookId}`,
    bookData
  );
  return response.data.data;
};

/**
 * Deletes a book from the library (LIBRARIAN only)
 * @param bookId - The unique identifier of the book to delete
 * @returns Promise that resolves when deletion is successful
 * @throws Error if book is not found, has active reservations, or API request fails
 */
export const deleteBook = async (bookId: number): Promise<void> => {
  await api.delete(`/books/${bookId}`);
};

/**
 * Updates an existing category (LIBRARIAN only)
 * @param categoryId - The unique identifier of the category to update
 * @param categoryData - Updated category information
 * @returns Promise resolving to the updated category object
 * @throws Error if category is not found, name already exists, or API request fails
 */
export const updateCategory = async (categoryId: number, categoryData: UpdateCategoryRequest): Promise<Category> => {
  const response = await api.put<{ status: string; message: string; data: Category }>(
    `/categories/${categoryId}`,
    categoryData
  );
  return response.data.data;
};

/**
 * Deletes a category (LIBRARIAN only)
 * @param categoryId - The unique identifier of the category to delete
 * @returns Promise that resolves when deletion is successful
 * @throws Error if category is not found, has associated books, or API request fails
 */
export const deleteCategory = async (categoryId: number): Promise<void> => {
  await api.delete(`/categories/${categoryId}`);
};

