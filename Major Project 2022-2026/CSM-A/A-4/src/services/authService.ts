import { User } from '../types';
import { api } from './api';

class AuthService {
  private currentUser: User | null = null;

  async login(email: string, password: string): Promise<{ user: User; token: string } | null> {
    const user = await api.getUserByEmail(email);
    if (!user) return null;

    // Mock JWT token (in production, backend would generate this)
    const token = `jwt-${user.id}-${Date.now()}`;
    this.currentUser = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, token };
  }

  async register(userData: Omit<User, 'id' | 'createdAt'>): Promise<{ user: User; token: string }> {
    const user = await api.createUser(userData);
    const token = `jwt-${user.id}-${Date.now()}`;
    this.currentUser = user;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { user, token };
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  getCurrentUser(): User | null {
    if (this.currentUser) return this.currentUser;
    
    const stored = localStorage.getItem('user');
    if (stored) {
      this.currentUser = JSON.parse(stored);
      return this.currentUser;
    }
    
    return null;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
}

export const authService = new AuthService();