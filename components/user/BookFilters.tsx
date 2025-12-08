'use client';

import { Category } from '@/types';
import { BookFilters } from '@/types';

interface BookFiltersProps {
  filters: BookFilters;
  categories: Category[];
  onFilterChange: (filters: BookFilters) => void;
  onClearFilters: () => void;
}

export default function BookFiltersComponent({
  filters,
  categories,
  onFilterChange,
  onClearFilters,
}: BookFiltersProps) {
  const handleCategoryChange = (categoryId: string) => {
    onFilterChange({
      ...filters,
      categoryId: categoryId ? parseInt(categoryId) : null,
      page: 0, // Reset to first page when filter changes
    });
  };

  const handleAuthorChange = (author: string) => {
    onFilterChange({
      ...filters,
      author: author || null,
      page: 0,
    });
  };

  const handleGenreChange = (genre: string) => {
    onFilterChange({
      ...filters,
      genre: genre || null,
      page: 0,
    });
  };

  const handleLanguageChange = (language: string) => {
    onFilterChange({
      ...filters,
      language: language || null,
      page: 0,
    });
  };

  const hasActiveFilters = filters.categoryId || filters.author || filters.genre || filters.language;

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Clear All
          </button>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          value={filters.categoryId || ''}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
        <input
          type="text"
          value={filters.author || ''}
          onChange={(e) => handleAuthorChange(e.target.value)}
          placeholder="Filter by author"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
        <input
          type="text"
          value={filters.genre || ''}
          onChange={(e) => handleGenreChange(e.target.value)}
          placeholder="Filter by genre"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
        <select
          value={filters.language || ''}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        >
          <option value="">All Languages</option>
          <option value="English">English</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Italian">Italian</option>
          <option value="Portuguese">Portuguese</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
          <option value="Arabic">Arabic</option>
          <option value="Hindi">Hindi</option>
        </select>
      </div>

      {hasActiveFilters && (
        <div className="pt-4 border-t">
          <div className="flex flex-wrap gap-2">
            {filters.categoryId && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                Category: {categories.find(c => c.id === filters.categoryId)?.name}
                <button
                  onClick={() => handleCategoryChange('')}
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.author && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                Author: {filters.author}
                <button
                  onClick={() => handleAuthorChange('')}
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.genre && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                Genre: {filters.genre}
                <button
                  onClick={() => handleGenreChange('')}
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.language && (
              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800">
                Language: {filters.language}
                <button
                  onClick={() => handleLanguageChange('')}
                  className="ml-1 text-indigo-600 hover:text-indigo-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

