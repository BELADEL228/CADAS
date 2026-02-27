import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'
import 'react-native-url-polyfill/auto'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export type Profile = {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  user_type: 'buyer' | 'seller' | 'surveyor' | 'legal' | 'admin'
  kyc_verified: boolean
  avatar_url: string | null
  created_at: string
}

export type Property = {
  id: string
  title: string
  description: string | null
  property_type: 'land' | 'house' | 'building'
  surface_area: number
  price: number
  address: string
  city: string
  latitude: number | null
  longitude: number | null
  photos_url: string[]
  features: {
    bedrooms?: number
    bathrooms?: number
    has_water?: boolean
    has_electricity?: boolean
    has_road?: boolean
  }
  verification_status: 'pending' | 'in_progress' | 'verified' | 'rejected'
  legal_badge: '🔴 Non vérifié' | '🟡 En cours' | '🟢 Validé'
  owner_id: string
  views: number
  created_at: string
}

export type Transaction = {
  id: string
  property_id: string
  buyer_id: string
  seller_id: string
  surveyor_id?: string
  legal_official_id?: string
  status: 'offer_sent' | 'accepted' | 'survey_in_progress' | 'legal_review' | 'payment_pending' | 'completed' | 'cancelled'
  offer_amount: number
  offer_date: string
  acceptance_date?: string
  completion_date?: string
  documents: any
  created_at: string
}

export type Message = {
  id: string
  transaction_id: string
  sender_id: string
  receiver_id: string
  content: string
  attachments_url?: string[]
  read: boolean
  created_at: string
}