import Cookies from 'js-cookie';
import { User } from '@/types';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

export const authStorage = {
  getToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return Cookies.get(TOKEN_KEY) || null;
  },

  setToken: (token: string): void => {
    Cookies.set(TOKEN_KEY, token, { expires: 7 }); // 7 days
  },

  removeToken: (): void => {
    Cookies.remove(TOKEN_KEY);
  },

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const userStr = Cookies.get(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setUser: (user: User): void => {
    Cookies.set(USER_KEY, JSON.stringify(user), { expires: 7 });
  },

  removeUser: (): void => {
    Cookies.remove(USER_KEY);
  },

  clear: (): void => {
    authStorage.removeToken();
    authStorage.removeUser();
  },
};

