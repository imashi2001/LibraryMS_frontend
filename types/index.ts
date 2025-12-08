export enum Role {
  USER = "USER",
  LIBRARIAN = "LIBRARIAN"
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: Role;
  isBlacklisted: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  name: string;
  role: Role;
  id: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  password: string;
  role: Role;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string, role: Role) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
}

export type BookStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';

export interface Book {
  id: number;
  title: string;
  author: string;
  isbn?: string;
  category?: Category;
  status: BookStatus;
  totalCopies: number;
  availableCopies: number;
  description?: string;
  genre?: string;
  language?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddBookRequest {
  title: string;
  author: string;
  isbn?: string;
  categoryId: number;
  totalCopies: number;
  description?: string;
  genre?: string;
  language?: string;
  image?: File;
}

export interface AddCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateBookRequest {
  title: string;
  author: string;
  isbn?: string;
  categoryId: number;
  totalCopies: number;
  description?: string;
  genre?: string;
  language?: string;
  imageUrl?: string;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
}

export interface BlacklistUserRequest {
  isBlacklisted: boolean;
}

export interface BookFilters {
  categoryId?: number | null;
  author?: string | null;
  genre?: string | null;
  language?: string | null;
  title?: string | null;
  page?: number;
  size?: number;
}

export interface PaginatedBooksResponse {
  content: Book[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

