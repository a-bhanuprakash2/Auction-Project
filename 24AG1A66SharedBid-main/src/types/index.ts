
export type UserRole = 'seller' | 'bidder';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  basePrice: number;
  currentBid: number;
  bidsCount: number;
  endTime: string;
  category: string;
  condition: string;
  collaborativeBidding?: CollaborativeBid;
  status: 'active' | 'sold' | 'expired';
}

export interface Bid {
  id: string;
  productId: string;
  bidderId: string;
  bidderName: string;
  amount: number;
  timestamp: string;
  isCollaborative?: boolean;
  collaborationId?: string;
}

export interface CollaborativeBid {
  id: string;
  productId: string;
  participantCount: number;
  totalAmount: number;
  status: 'forming' | 'active' | 'won' | 'lost';
  participants: CollaborativeBidParticipant[];
  createdAt: string;
}

export interface CollaborativeBidParticipant {
  userId: string;
  userName: string;
  contributionAmount: number;
  joinedAt: string;
}

export interface DashboardStats {
  totalSales?: number;
  activeListings?: number;
  averageBidPrice?: number;
  wonBids?: number;
  participatedBids?: number;
  pendingCollaborations?: number;
}
