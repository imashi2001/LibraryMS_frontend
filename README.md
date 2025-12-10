# Library Management System - Frontend

A modern web application built with Next.js 14 and TypeScript for managing library operations, book reservations, and user management.

## 🚀 Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Book Browsing**: Search and filter books by category, author, genre, and language
- **Reservations**: Reserve books for 7, 14, or 21 days
- **Dashboard**: View reservation stats, due dates, and recent activity
- **Role-Based Access**: Separate interfaces for Users and Librarians
- **Librarian Panel**: Manage books, categories, and users
- **Responsive Design**: Modern UI with Tailwind CSS
- **Performance Optimized**: Parallel API calls and optimized image loading

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **Backend API** running on `http://localhost:8081` (see backend README)

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <your-frontend-repo-url>
cd LibraryMS_frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

**Note**: The frontend is configured to connect directly to the backend API. If you want to use the gateway instead, change this to `http://localhost:8080/api/backend`.

### 4. Start Development Server

```bash
npm run dev
```

The application will start on `http://localhost:3001` (or `3000` if available).

### 5. Open Your Browser

```
http://localhost:3001
```

## 📁 Project Structure

```
LibraryMS_frontend/
├── app/                        # Next.js app directory
│   ├── page.tsx               # Landing/Login page
│   ├── login/                 # Login page
│   ├── register/              # Registration page
│   ├── user/                  # User routes
│   │   ├── dashboard/         # User dashboard
│   │   ├── books/             # Book browsing
│   │   │   └── [id]/         # Book details
│   │   ├── reservations/      # My reservations
│   │   ├── history/           # Reservation history
│   │   └── profile/           # User profile
│   └── librarian/             # Librarian routes
│       ├── dashboard/         # Admin dashboard
│       ├── books/             # Book management
│       ├── categories/        # Category management
│       └── users/             # User management
├── components/                # Reusable components
│   ├── layout/               # Navbar, Footer
│   ├── user/                 # User-specific components
│   ├── librarian/            # Admin components
│   └── common/               # Shared components
├── contexts/                 # React Context providers
│   └── AuthContext.tsx       # Authentication context
├── lib/                      # Utilities and API
│   ├── api/                  # API functions
│   │   ├── books.ts
│   │   ├── reservations.ts
│   │   └── librarian.ts
│   ├── utils/                # Helper functions
│   │   └── errorHandler.ts
│   ├── api.ts                # Axios instance
│   ├── auth.ts               # Auth storage utilities
│   └── constants.ts          # App constants
├── types/                    # TypeScript type definitions
│   └── index.ts
├── public/                   # Static assets
│   ├── logo.png
│   └── images/
└── next.config.js            # Next.js configuration

```

## 🎯 Available Scripts

- `npm run dev` - Start development server (port 3001)
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8081
```

**Note:** The frontend is configured to connect directly to the backend API. If you want to use the gateway instead, change this to `http://localhost:8080/api/backend`.

### Port Configuration

Default port is `3001` (Next.js may use `3000` if available). To specify a port:

```bash
npm run dev -- -p 3001
```

Or modify `package.json`:
```json
"scripts": {
  "dev": "next dev -p 3001"
}
```

## 👥 User Roles

### User
- Browse and search books
- Reserve books (7, 14, or 21 days)
- View reservations and renewals
- View reservation history
- Update profile settings

### Librarian
- All user features
- Add, edit, and delete books
- Manage categories
- View and manage users
- Blacklist/unblacklist users
- Upload book cover images

## 🔐 Authentication

- JWT tokens stored in HTTP-only cookies
- Automatic token refresh on API calls
- Role-based route protection
- Session expiration handling
- Automatic redirect to login on unauthorized access

## 📡 API Integration

The frontend communicates with the backend API at `http://localhost:8081/api`. All API calls are made through:

- **API Client**: `lib/api.ts` - Axios instance with interceptors
- **API Functions**: `lib/api/*.ts` - Organized by feature
- **Error Handling**: `lib/utils/errorHandler.ts` - Consistent error handling

### Main API Endpoints Used:

- Authentication: `/api/auth/login`, `/api/auth/register`
- Books: `/api/books`, `/api/books/{id}`
- Categories: `/api/categories`
- Reservations: `/api/reservations/my-reservations`
- Librarian: `/api/librarian/*`

## 🎨 UI/UX Features

- **Modern Design**: Clean, responsive interface with Tailwind CSS
- **Loading States**: Skeleton loaders and spinners for better UX
- **Error Handling**: User-friendly error messages
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Image Optimization**: Next.js Image component for optimized loading
- **Toast Notifications**: Success and error notifications
- **Empty States**: Helpful messages when no data is available

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001 (Windows)
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Or use kill-port
npx kill-port 3001
```

### API Connection Errors
- Ensure backend is running on `http://localhost:8081`
- Check `.env.local` file has correct API URL
- Verify CORS settings in backend allow `http://localhost:3001`

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

### Image Loading Issues
- Check `next.config.js` has correct `remotePatterns` for backend images
- Verify backend file server is running
- Check image URLs in browser console

## 📦 Technologies Used

- **Next.js 14.2.18** - React framework with App Router
- **TypeScript 5.6.3** - Type safety
- **Tailwind CSS 3.4.14** - Utility-first CSS framework
- **Axios 1.13.2** - HTTP client for API calls
- **js-cookie 3.0.5** - Cookie management
- **React Context API** - Global state management (Auth)
- **Next.js Image** - Optimized image loading

## 🔄 Development Workflow

1. **Start Backend**: Ensure backend API is running on port 8081
2. **Start Frontend**: Run `npm run dev`
3. **Access Application**: Open `http://localhost:3001`
4. **Register/Login**: Create an account or login
5. **Test Features**: Browse books, make reservations, etc.

## 📝 Code Conventions

- **Components**: PascalCase (e.g., `BookCard.tsx`)
- **Functions**: camelCase (e.g., `getBooks()`)
- **Types/Interfaces**: PascalCase (e.g., `Book`, `User`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `RESERVATION_PERIODS`)
- **Files**: Match component/function name

## 🚀 Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔗 Using with Gateway (Optional)

If you want to use the API Gateway instead of direct backend connection:

1. Start the Gateway service (see gateway README)
2. Update `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080/api/backend
   ```
3. Restart the frontend

## 📄 License

This project is part of an internship assignment.

## 👤 Author

Developed as part of Library Management System internship project.

## 📞 Support

For issues or questions, please check the backend API documentation or open an issue on GitHub.
