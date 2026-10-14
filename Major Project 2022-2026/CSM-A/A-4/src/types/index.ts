export interface User {
  id: string;
  email: string;
  name: string;
  role: 'donor' | 'partner' | 'beneficiary' | 'admin';
  phone?: string;
  address?: string;
  verified: boolean;
  createdAt: string;
  profileImage?: string;
}

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  title: string;
  description: string;
  category: 'cooked' | 'packaged' | 'raw';
  quantity: number;
  expiryDate: string;
  pickupLocation: string;
  images: string[];
  status: 'pending' | 'review' | 'approved' | 'rejected' | 'in_transit' | 'delivered';
  aiAssessment?: AIAssessment;
  assignedBeneficiary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAssessment {
  qualityScore: number;
  freshness: 'excellent' | 'good' | 'fair' | 'poor';
  safetyRating: number;
  expiryExtracted: string;
  recommendations: string[];
  approved: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type: 'partner' | 'beneficiary';
  email: string;
  phone: string;
  address: string;
  description: string;
  verified: boolean;
  documents: string[];
  userId: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  timestamp: string;
}

export interface Analytics {
  totalDonations: number;
  activeDonors: number;
  beneficiariesServed: number;
  foodSaved: number;
  impactScore: number;
}