// ============================================
// TYPES PARTAGÉS WRNC - UTILISABLES SUR WEB ET MOBILE
// ============================================

// Types d'utilisateurs
export type UserType = 'buyer' | 'seller' | 'surveyor' | 'legal' | 'admin'

export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  userType: UserType
  kycVerified: boolean
  avatar?: string
  createdAt: Date
  updatedAt: Date
}

// Types de biens immobiliers
export type PropertyType = 'land' | 'house' | 'building'
export type VerificationStatus = 'pending' | 'in_progress' | 'verified' | 'rejected'
export type LegalBadge = '🔴 Non vérifié' | '🟡 En cours' | '🟢 Validé'

export interface Location {
  latitude: number
  longitude: number
  address: string
  city: string
  country: string
}

export interface PropertyFeatures {
  bedrooms?: number
  bathrooms?: number
  hasWater?: boolean
  hasElectricity?: boolean
  hasRoad?: boolean
  yearBuilt?: number
}

export interface PropertyDocuments {
  photos: string[]
  videos?: string[]
  cadastralPlan?: string[]
  urbanCertificate?: string[]
  ownershipProof?: string[]
}

export interface Property {
  id: string
  title: string
  description: string
  type: PropertyType
  surfaceArea: number
  price: number
  location: Location
  features?: PropertyFeatures
  documents: PropertyDocuments
  legalStatus: string
  verificationStatus: VerificationStatus
  legalBadge: LegalBadge
  ownerId: string
  surveyorId?: string
  legalOfficialId?: string
  views: number
  createdAt: Date
  updatedAt: Date
}

// Types de transactions
export type TransactionStatus = 
  | 'offer_sent'
  | 'accepted'
  | 'survey_in_progress'
  | 'legal_review'
  | 'payment_pending'
  | 'completed'
  | 'cancelled'

export interface Transaction {
  id: string
  propertyId: string
  buyerId: string
  sellerId: string
  surveyorId?: string
  legalOfficialId?: string
  amount: number
  status: TransactionStatus
  offerDate: Date
  acceptanceDate?: Date
  completionDate?: Date
  documents: {
    surveyReport?: string[]
    legalDocuments?: string[]
    contract?: string
    paymentProof?: string
  }
  timeline: TransactionEvent[]
}

export interface TransactionEvent {
  status: TransactionStatus
  date: Date
  actorId: string
  notes?: string
}

// Types de messages
export interface Message {
  id: string
  transactionId: string
  senderId: string
  receiverId: string
  content: string
  attachments?: string[]
  read: boolean
  createdAt: Date
}

// Types de notifications
export interface Notification {
  id: string
  userId: string
  type: 'offer' | 'message' | 'verification' | 'payment' | 'system'
  title: string
  content: string
  data?: any
  read: boolean
  createdAt: Date
}

// Types pour les filtres de recherche
export interface PropertyFilters {
  type?: PropertyType
  minPrice?: number
  maxPrice?: number
  minSurface?: number
  maxSurface?: number
  city?: string
  location?: {
    latitude: number
    longitude: number
    radius: number // en km
  }
  verificationStatus?: VerificationStatus
  sortBy?: 'price_asc' | 'price_desc' | 'date_desc' | 'surface_asc'
  page?: number
  limit?: number
}

// Types pour les formulaires
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  fullName: string
  phone: string
  userType: UserType
}

export interface PropertyFormData {
  title: string
  description: string
  type: PropertyType
  surfaceArea: string
  price: string
  address: string
  city: string
  latitude?: number
  longitude?: number
  features?: PropertyFeatures
  photos: any[] // File[] côté web, asset côté mobile
  documents?: any[]
}

// Types pour les réponses API
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
  status: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}