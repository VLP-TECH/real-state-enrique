
// User roles
export type UserRole = 'seller_mandatary' | 'buyer_mandatary' | 'investor' | 'admin';

// Asset types
export type AssetType = 'residential' | 'commercial' | 'greenfield' | 'brownfield' | 'land' | 'hotel' | 'industrial' | 'mixed';

// Asset purpose
export type AssetPurpose = 'sale' | 'purchase' | 'need';

// Request status
export type RequestStatus = 
  | 'pending' 
  | 'approved' 
  | 'rejected' 
  | 'nda_requested' 
  | 'nda_received' 
  | 'information_shared';

// User interface
export interface User {
  id: string; // System-generated anonymous ID (e.g., ZX_2301)
  role: UserRole;
  registrationDate: string;
  isApproved: boolean;
  // Personal information (stored privately, not visible)
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  // Statistics
  assetsCount?: number;
  requestsCount?: number;
  admin?: boolean;
}

// Asset interface
export interface Asset {
  id: string;
  purpose: AssetPurpose;
  type: AssetType;
  country: string;
  city: string;
  area?: string;
  expectedReturn?: number; // As percentage
  priceAmount: number;
  priceCurrency: string;
  description?: string;
  creado: string;
  ownerId: string; // References User.id but never displayed
  files?: {
    type: 'pdf' | 'image' | 'video';
    name: string;
    url?: string; // Only available after approval
  }[];
}

export interface AssetFormData {
  purpose: AssetPurpose;
  type: AssetType;
  country: string;
  city: string;
  area?: string;
  expectedReturn?: number;
  priceAmount: number;
  priceCurrency: string;
  description: string;
  files?: File[];
}

// Request interface
export interface InformationRequest {
  id: string;
  assetId: string;
  requesterId: string;
  status: RequestStatus;
  creado: string;
  updatedAt: string;
  notes?: string;
  ndaLink?: string;
  ndaSignedDate?: string;
  sharedInfoLink?: string;
}

// Form data for registration
export interface RegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  role: UserRole;
  message?: string;
}

// Form data for asset creation
export interface AssetFormData {
  purpose: AssetPurpose;
  type: AssetType;
  country: string;
  city: string;
  area?: string;
  expectedReturn?: number;
  priceAmount: number;
  priceCurrency: string;
  description: string;
  files?: File[];
}

// Dashboard statistics
export interface DashboardStats {
  userType: UserRole;
  assetsCount: number;
  pendingRequests: number;
  approvedRequests: number;
}
