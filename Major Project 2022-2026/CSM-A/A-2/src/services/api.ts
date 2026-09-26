import { User, Donation, Organization, ChatMessage, Analytics } from '../types';

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

// API Service class
class ApiService {
  // User operations
  async getUsers(): Promise<User[]> {
    return apiCall<User[]>('/users');
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await apiCall<User>(`/users/${id}`);
    } catch (error) {
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      return await apiCall<User>(`/users/email/${email}`);
    } catch (error) {
      return null;
    }
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    return apiCall<User>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      return await apiCall<User>(`/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      return null;
    }
  }

  // Donation operations
  async getDonations(): Promise<Donation[]> {
    return apiCall<Donation[]>('/donations');
  }

  async getDonationById(id: string): Promise<Donation | null> {
    try {
      return await apiCall<Donation>(`/donations/${id}`);
    } catch (error) {
      return null;
    }
  }

  async getDonationsByDonor(donorId: string): Promise<Donation[]> {
    return apiCall<Donation[]>(`/donations/donor/${donorId}`);
  }

  async createDonation(donationData: Omit<Donation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Donation> {
    return apiCall<Donation>('/donations', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async updateDonation(id: string, updates: Partial<Donation>): Promise<Donation | null> {
    try {
      return await apiCall<Donation>(`/donations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      return null;
    }
  }

  // Organization operations
  async getOrganizations(): Promise<Organization[]> {
    return apiCall<Organization[]>('/organizations');
  }

  async createOrganization(orgData: Omit<Organization, 'id' | 'createdAt'>): Promise<Organization> {
    return apiCall<Organization>('/organizations', {
      method: 'POST',
      body: JSON.stringify(orgData),
    });
  }

  async updateOrganization(id: string, updates: Partial<Organization>): Promise<Organization | null> {
    try {
      const orgs = await this.getOrganizations();
      const org = orgs.find(o => o.id === id);
      if (!org) return null;
      
      return await apiCall<Organization>(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...org, ...updates }),
      });
    } catch (error) {
      return null;
    }
  }

  // Analytics
  async getAnalytics(): Promise<Analytics> {
    return apiCall<Analytics>('/analytics');
  }

  // Chat operations
  async createChatMessage(messageData: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    return apiCall<ChatMessage>('/chat', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getChatHistory(userId: string): Promise<ChatMessage[]> {
    return apiCall<ChatMessage[]>(`/chat/history/${userId}`);
  }
}

export const api = new ApiService();
