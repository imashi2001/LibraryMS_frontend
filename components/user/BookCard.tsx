'use client';

import { Book } from '@/types';
import { getImageUrl } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';

interface BookCardProps {
  book: Book;
}

export default function BookCard({ book }: BookCardProps) {
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
  const isAvailable = book.status === 'AVAILABLE' && book.availableCopies > 0;

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
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      {/* Book Cover */}
      <Link href={`/user/books/${book.id}`} className="block">
        {book.imageUrl ? (
          <div className="relative w-full h-80 overflow-hidden">
            <Image
              src={getImageUrl(book.imageUrl) || ''}
              alt={book.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover hover:scale-105 transition-transform duration-300"
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
      </Link>
      
      {/* Book Info */}
      <div className="p-5 flex-1 flex flex-col">
        <Link href={`/user/books/${book.id}`}>
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 hover:text-indigo-600 transition">
            {book.title}
          </h3>
        </Link>
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
        
        {/* Action Button */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          {isAvailable ? (
            <Link
              href={`/user/books/${book.id}`}
              className="block w-full text-center px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm hover:shadow-md"
            >
              Reserve
            </Link>
          ) : (
            <button
              disabled
              className="w-full px-4 py-2.5 bg-gray-300 text-gray-600 rounded-lg cursor-not-allowed font-medium"
            >
              {statusInfo.text === 'Checked Out' ? 'Unavailable' : 'Reserved'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

