'use client';

import { Book } from '@/types';
import { getImageUrl } from '@/lib/api';
import Link from 'next/link';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/user/books/${book.id}`}>
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col">
        {book.imageUrl ? (
          <img
            src={getImageUrl(book.imageUrl) || ''}
            alt={book.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              // Show placeholder if image fails to load
              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23e5e7eb" width="400" height="300"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
            <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
        )}
        
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">{book.title}</h3>
          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
          
          {book.category && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded mb-2 w-fit">
              {book.category.name}
            </span>
          )}
          
          <div className="mt-auto pt-3 border-t">
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                book.status === 'AVAILABLE'
                  ? 'bg-green-100 text-green-800'
                  : book.status === 'UNAVAILABLE'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {book.status}
              </span>
              <span className="text-sm text-gray-600">
                {book.availableCopies}/{book.totalCopies} copies
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

