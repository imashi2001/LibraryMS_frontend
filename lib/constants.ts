/**
 * Application-wide constants
 */

/** Available reservation periods in days */
export const RESERVATION_PERIODS = [7, 14, 21] as const;

/** Cookie expiration time in days */
export const COOKIE_EXPIRY_DAYS = 7;

/** Default page size for pagination */
export const DEFAULT_PAGE_SIZE = 12;

/** Toast notification display duration in milliseconds */
export const TOAST_DURATION = 3000;

/** Success message display duration in milliseconds */
export const SUCCESS_MESSAGE_DURATION = 3000;

/** Days before due date to show "due soon" warning */
export const DUE_SOON_THRESHOLD_DAYS = 7;

/** Image quality for Next.js Image component (0-100) */
export const IMAGE_QUALITY = 90;

/** Hero image quality for Next.js Image component */
export const HERO_IMAGE_QUALITY = 100;

