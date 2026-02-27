import { create } from 'zustand'
import { Transaction } from '../types'
import { apiService } from '../services/api.service'

interface TransactionState {
  transactions: Transaction[]
  currentTransaction: Transaction | null
  loading: boolean
  error: string | null

  // Actions
  fetchUserTransactions: () => Promise<void>
  fetchTransactionById: (id: string) => Promise<void>
  createTransaction: (propertyId: string, amount: number) => Promise<void>
  updateTransactionStatus: (id: string, status: Transaction['status']) => Promise<void>
  clearCurrentTransaction: () => void
  clearError: () => void
}

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  currentTransaction: null,
  loading: false,
  error: null,

  fetchUserTransactions: async () => {
    try {
      set({ loading: true, error: null })
      const response = await apiService.getUserTransactions()
      
      if (response.data) {
        set({ transactions: response.data })
      }
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  fetchTransactionById: async (id: string) => {
    try {
      set({ loading: true, error: null })
      
      // À implémenter dans apiService
      const response = await apiService.getTransactionById(id)
      
      if (response.data) {
        set({ currentTransaction: response.data })
      }
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  createTransaction: async (propertyId: string, amount: number) => {
    try {
      set({ loading: true, error: null })
      const response = await apiService.createTransaction(propertyId, amount)
      
      if (response.data) {
        const transactions = [response.data, ...get().transactions]
        set({ transactions, currentTransaction: response.data })
      }
    } catch (error: any) {
      set({ error: error.message })
      throw error
    } finally {
      set({ loading: false })
    }
  },

  updateTransactionStatus: async (id: string, status: Transaction['status']) => {
    try {
      set({ loading: true, error: null })
      const response = await apiService.updateTransactionStatus(id, status)
      
      if (response.data) {
        // Mettre à jour dans la liste
        const transactions = get().transactions.map(t => 
          t.id === id ? response.data! : t
        )
        set({ transactions, currentTransaction: response.data })
      }
    } catch (error: any) {
      set({ error: error.message })
    } finally {
      set({ loading: false })
    }
  },

  clearCurrentTransaction: () => set({ currentTransaction: null }),
  clearError: () => set({ error: null })
}))