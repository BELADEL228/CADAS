import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import { User, ApiResponse } from '../types'
import { apiService } from '../services/api.service'

interface AuthState {
  user: User | null
  session: any | null
  loading: boolean
  initialized: boolean
  error: string | null
  
  // Actions
  initialize: () => Promise<void>
  signIn: (email: string, password: string) => Promise<ApiResponse<any>>
  signUp: (email: string, password: string, userData: any) => Promise<ApiResponse<any>>
  signOut: () => Promise<void>
  updateUser: (updates: Partial<User>) => Promise<ApiResponse<User>>
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  loading: true,
  initialized: false,
  error: null,

  initialize: async () => {
    try {
      set({ loading: true })
      
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        
        if (profile) {
          set({ 
            user: {
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              phone: profile.phone,
              userType: profile.user_type,
              kycVerified: profile.kyc_verified,
              avatar: profile.avatar_url,
              createdAt: new Date(profile.created_at),
              updatedAt: new Date(profile.updated_at)
            },
            session 
          })
        }
      }
      
      // Écouter les changements d'auth
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()
          
          set({ 
            user: profile ? {
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              phone: profile.phone,
              userType: profile.user_type,
              kycVerified: profile.kyc_verified,
              avatar: profile.avatar_url,
              createdAt: new Date(profile.created_at),
              updatedAt: new Date(profile.updated_at)
            } : null,
            session 
          })
        } else if (event === 'SIGNED_OUT') {
          set({ user: null, session: null })
        }
      })
      
    } catch (error) {
      console.error('Error initializing auth:', error)
    } finally {
      set({ loading: false, initialized: true })
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null })
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      if (error) throw error
      
      return {
        data: data.user,
        message: 'Connexion réussie',
        status: 200
      }
    } catch (error: any) {
      set({ error: error.message })
      return {
        error: error.message,
        status: 400
      }
    } finally {
      set({ loading: false })
    }
  },

  signUp: async (email: string, password: string, userData: any) => {
    try {
      set({ loading: true, error: null })
      
      // 1. Créer l'utilisateur dans Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password
      })
      
      if (authError) throw authError
      
      if (authData.user) {
        // 2. Créer le profil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: authData.user.id,
            email,
            full_name: userData.fullName,
            phone: userData.phone,
            user_type: userData.userType || 'buyer',
            kyc_verified: false
          }])
        
        if (profileError) throw profileError
      }
      
      return {
        data: authData.user,
        message: 'Inscription réussie. Vérifiez votre email.',
        status: 201
      }
    } catch (error: any) {
      set({ error: error.message })
      return {
        error: error.message,
        status: 400
      }
    } finally {
      set({ loading: false })
    }
  },

  signOut: async () => {
    try {
      set({ loading: true })
      await supabase.auth.signOut()
      set({ user: null, session: null })
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  updateUser: async (updates: Partial<User>) => {
    try {
      set({ loading: true, error: null })
      const response = await apiService.updateUserProfile(updates)
      
      if (response.data) {
        set({ user: response.data })
      }
      
      return response
    } catch (error: any) {
      set({ error: error.message })
      return {
        error: error.message,
        status: 400
      }
    } finally {
      set({ loading: false })
    }
  },

  clearError: () => set({ error: null })
}))