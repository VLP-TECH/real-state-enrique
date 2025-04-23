export type UserRole = 'seller_mandatary' | 'buyer_mandatary' | 'investor' | 'admin';


export type AssetPurpose = 'sale' | 'purchase' | 'need';
export type RequestStatus =
  | 'pending'
  | 'approved' 
  | 'rejected' 
  | 'nda_requested' 
  | 'nda_received' 
  | 'information_shared';

export interface User {
  id: string;
  role: UserRole;
  registrationDate: string;
  isApproved: boolean;
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  assetsCount?: number;
  requestsCount?: number;
  admin?: boolean;
}

export interface Asset {
  id: string;
  purpose: AssetPurpose;
  category?: string;
  subcategory1?: string;
  subcategory2?: string;
  country: string;
  city: string;
  area?: string;
  expectedReturn?: number;
  priceAmount: number;
  priceCurrency: string;
  description?: string;
  creado: string;
  user_id: string;
  files?: {
    type: 'pdf' | 'image' | 'video';
    name: string;
    url?: string;
  }[];
}

export interface AssetFormData {
  purpose: AssetPurpose;
  country: string;
  city: string;
  area?: string;
  expectedReturn?: number;
  priceAmount: number;
  priceCurrency: string;
  description: string;
  files?: File[];
  category?: string;
  subcategory1?: string;
  subcategory2?: string;
}

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

export interface RegistrationFormData {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  role: UserRole;
  message?: string;
}

export interface AssetFormData {
  purpose: AssetPurpose;
  country: string;
  city: string;
  area?: string;
  expectedReturn?: number;
  priceAmount: number;
  priceCurrency: string;
  description: string;
  files?: File[];
  category?: string;
  subcategory1?: string;
  subcategory2?: string;
}

export interface DashboardStats {
  userType: UserRole;
  assetsCount: number;
  pendingRequests: number;
  approvedRequests: number;
}
