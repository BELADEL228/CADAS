import { supabase } from '../lib/supabase'
import { 
  Property, 
  Transaction, 
  User, 
  Message, 
  ApiResponse,
  PaginatedResponse,
  PropertyFilters 
} from '../types'

class ApiService {
  // ============================================
  // PROPERTIES
  // ============================================
  
  async getProperties(filters?: PropertyFilters): Promise<PaginatedResponse<Property>> {
    try {
      let query = supabase
        .from('properties')
        .select('*', { count: 'exact' })
        .eq('verification_status', 'verified')

      if (filters?.type) {
        query = query.eq('property_type', filters.type)
      }
      
      if (filters?.minPrice) {
        query = query.gte('price', filters.minPrice)
      }
      
      if (filters?.maxPrice) {
        query = query.lte('price', filters.maxPrice)
      }
      
      if (filters?.city) {
        query = query.ilike('city', `%${filters.city}%`)
      }

      // Pagination
      const page = filters?.page || 1
      const limit = filters?.limit || 20
      const from = (page - 1) * limit
      const to = from + limit - 1

      query = query.range(from, to)

      // Tri
      if (filters?.sortBy) {
        switch (filters.sortBy) {
          case 'price_asc':
            query = query.order('price', { ascending: true })
            break
          case 'price_desc':
            query = query.order('price', { ascending: false })
            break
          case 'date_desc':
            query = query.order('created_at', { ascending: false })
            break
          case 'surface_asc':
            query = query.order('surface_area', { ascending: true })
            break
        }
      } else {
        query = query.order('created_at', { ascending: false })
      }

      const { data, error, count } = await query

      if (error) throw error

      const properties = data.map(this.mapPropertyFromDB)
      
      return {
        items: properties,
        total: count || 0,
        page,
        totalPages: Math.ceil((count || 0) / limit),
        hasNext: page < Math.ceil((count || 0) / limit),
        hasPrevious: page > 1
      }
    } catch (error) {
      console.error('Error fetching properties:', error)
      throw error
    }
  }

  async getPropertyById(id: string): Promise<ApiResponse<Property>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          owner:profiles!owner_id(full_name, email, phone, kyc_verified)
        `)
        .eq('id', id)
        .single()

      if (error) throw error

      // Incrémenter le nombre de vues
      await supabase
        .from('properties')
        .update({ views: (data.views || 0) + 1 })
        .eq('id', id)

      return {
        data: this.mapPropertyFromDB(data),
        status: 200
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  async createProperty(propertyData: any): Promise<ApiResponse<Property>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('properties')
        .insert([{
          title: propertyData.title,
          description: propertyData.description,
          property_type: propertyData.type,
          surface_area: parseFloat(propertyData.surfaceArea),
          price: parseFloat(propertyData.price),
          address: propertyData.address,
          city: propertyData.city,
          latitude: propertyData.latitude,
          longitude: propertyData.longitude,
          photos_url: propertyData.photos,
          owner_id: user.id,
          verification_status: 'pending',
          legal_badge: '🔴 Non vérifié'
        }])
        .select()
        .single()

      if (error) throw error

      return {
        data: this.mapPropertyFromDB(data),
        message: 'Property created successfully',
        status: 201
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  async updateProperty(id: string, updates: Partial<Property>): Promise<ApiResponse<Property>> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(this.mapPropertyToDB(updates))
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data: this.mapPropertyFromDB(data),
        message: 'Property updated successfully',
        status: 200
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  async deleteProperty(id: string): Promise<ApiResponse<null>> {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error

      return {
        message: 'Property deleted successfully',
        status: 200
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  // ============================================
  // TRANSACTIONS
  // ============================================

  async createTransaction(propertyId: string, amount: number): Promise<ApiResponse<Transaction>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Récupérer le propriétaire du bien
      const { data: property } = await supabase
        .from('properties')
        .select('owner_id')
        .eq('id', propertyId)
        .single()

      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          property_id: propertyId,
          buyer_id: user.id,
          seller_id: property.owner_id,
          offer_amount: amount,
          status: 'offer_sent'
        }])
        .select()
        .single()

      if (error) throw error

      return {
        data: this.mapTransactionFromDB(data),
        message: 'Transaction created successfully',
        status: 201
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  async getUserTransactions(): Promise<ApiResponse<Transaction[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          property:properties(*),
          buyer:profiles!buyer_id(full_name, email),
          seller:profiles!seller_id(full_name, email)
        `)
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return {
        data: data.map(this.mapTransactionFromDB),
        status: 200
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  async updateTransactionStatus(id: string, status: Transaction['status']): Promise<ApiResponse<Transaction>> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({ 
          status,
          ...(status === 'accepted' && { acceptance_date: new Date().toISOString() }),
          ...(status === 'completed' && { completion_date: new Date().toISOString() })
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return {
        data: this.mapTransactionFromDB(data),
        message: 'Transaction updated successfully',
        status: 200
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  // ============================================
  // MESSAGES
  // ============================================

  async getMessages(transactionId: string): Promise<ApiResponse<Message[]>> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('transaction_id', transactionId)
        .order('created_at', { ascending: true })

      if (error) throw error

      return {
        data: data.map(this.mapMessageFromDB),
        status: 200
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  async sendMessage(transactionId: string, content: string, attachments?: string[]): Promise<ApiResponse<Message>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Récupérer le destinataire (l'autre partie de la transaction)
      const { data: transaction } = await supabase
        .from('transactions')
        .select('buyer_id, seller_id')
        .eq('id', transactionId)
        .single()

      const receiverId = transaction.buyer_id === user.id 
        ? transaction.seller_id 
        : transaction.buyer_id

      const { data, error } = await supabase
        .from('messages')
        .insert([{
          transaction_id: transactionId,
          sender_id: user.id,
          receiver_id: receiverId,
          content,
          attachments_url: attachments,
          read: false
        }])
        .select()
        .single()

      if (error) throw error

      return {
        data: this.mapMessageFromDB(data),
        message: 'Message sent successfully',
        status: 201
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  async markMessagesAsRead(transactionId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      await supabase
        .from('messages')
        .update({ read: true })
        .eq('transaction_id', transactionId)
        .eq('receiver_id', user.id)
        .eq('read', false)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  // ============================================
  // FAVORITES
  // ============================================

  async getFavorites(): Promise<ApiResponse<Property[]>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('favorites')
        .select(`
          property:properties(*)
        `)
        .eq('user_id', user.id)

      if (error) throw error

      const properties = data.map(item => this.mapPropertyFromDB(item.property))

      return {
        data: properties,
        status: 200
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  async addToFavorites(propertyId: string): Promise<ApiResponse<null>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('favorites')
        .insert([{
          user_id: user.id,
          property_id: propertyId
        }])

      if (error) throw error

      return {
        message: 'Added to favorites',
        status: 200
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  async removeFromFavorites(propertyId: string): Promise<ApiResponse<null>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('property_id', propertyId)

      if (error) throw error

      return {
        message: 'Removed from favorites',
        status: 200
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  // ============================================
  // USER PROFILE
  // ============================================

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error

      return {
        data: this.mapUserFromDB(data),
        status: 200
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  async updateUserProfile(updates: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(this.mapUserToDB(updates))
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      return {
        data: this.mapUserFromDB(data),
        message: 'Profile updated successfully',
        status: 200
      }
    } catch (error: any) {
      return {
        error: error.message,
        status: 400
      }
    }
  }

  // ============================================
  // MAPPERS (Conversion DB <-> Types)
  // ============================================

  private mapPropertyFromDB(data: any): Property {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      type: data.property_type,
      surfaceArea: data.surface_area,
      price: data.price,
      location: {
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address,
        city: data.city,
        country: data.country || 'Togo'
      },
      features: {
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        hasWater: data.has_water,
        hasElectricity: data.has_electricity,
        hasRoad: data.has_road,
        yearBuilt: data.year_built
      },
      documents: {
        photos: data.photos_url || [],
        videos: data.videos_url,
        cadastralPlan: data.cadastral_plan_url,
        urbanCertificate: data.urban_certificate_url,
        ownershipProof: data.ownership_proof_url
      },
      legalStatus: data.legal_status,
      verificationStatus: data.verification_status,
      legalBadge: data.legal_badge,
      ownerId: data.owner_id,
      surveyorId: data.surveyor_id,
      legalOfficialId: data.legal_official_id,
      views: data.views || 0,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  private mapPropertyToDB(property: Partial<Property>): any {
    return {
      title: property.title,
      description: property.description,
      property_type: property.type,
      surface_area: property.surfaceArea,
      price: property.price,
      latitude: property.location?.latitude,
      longitude: property.location?.longitude,
      address: property.location?.address,
      city: property.location?.city,
      country: property.location?.country,
      bedrooms: property.features?.bedrooms,
      bathrooms: property.features?.bathrooms,
      has_water: property.features?.hasWater,
      has_electricity: property.features?.hasElectricity,
      has_road: property.features?.hasRoad,
      year_built: property.features?.yearBuilt,
      photos_url: property.documents?.photos,
      videos_url: property.documents?.videos,
      cadastral_plan_url: property.documents?.cadastralPlan,
      urban_certificate_url: property.documents?.urbanCertificate,
      ownership_proof_url: property.documents?.ownershipProof,
      legal_status: property.legalStatus,
      verification_status: property.verificationStatus,
      legal_badge: property.legalBadge,
      surveyor_id: property.surveyorId,
      legal_official_id: property.legalOfficialId
    }
  }

  private mapTransactionFromDB(data: any): Transaction {
    return {
      id: data.id,
      propertyId: data.property_id,
      buyerId: data.buyer_id,
      sellerId: data.seller_id,
      surveyorId: data.surveyor_id,
      legalOfficialId: data.legal_official_id,
      amount: data.offer_amount,
      status: data.status,
      offerDate: new Date(data.offer_date),
      acceptanceDate: data.acceptance_date ? new Date(data.acceptance_date) : undefined,
      completionDate: data.completion_date ? new Date(data.completion_date) : undefined,
      documents: {
        surveyReport: data.survey_report_url,
        legalDocuments: data.legal_documents_url,
        contract: data.contract_url,
        paymentProof: data.payment_proof_url
      },
      timeline: data.timeline || []
    }
  }

  private mapMessageFromDB(data: any): Message {
    return {
      id: data.id,
      transactionId: data.transaction_id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      content: data.content,
      attachments: data.attachments_url,
      read: data.read,
      createdAt: new Date(data.created_at)
    }
  }

  private mapUserFromDB(data: any): User {
    return {
      id: data.id,
      email: data.email,
      fullName: data.full_name,
      phone: data.phone,
      userType: data.user_type,
      kycVerified: data.kyc_verified,
      avatar: data.avatar_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }

  private mapUserToDB(user: Partial<User>): any {
    return {
      full_name: user.fullName,
      phone: user.phone,
      user_type: user.userType,
      kyc_verified: user.kycVerified,
      avatar_url: user.avatar
    }
  }
}

export const apiService = new ApiService()