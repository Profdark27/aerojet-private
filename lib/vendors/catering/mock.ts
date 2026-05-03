import { CateringProvider, CateringOrder } from './types'

export const mockCateringProvider: CateringProvider = {
  async requestCateringQuote(order: Partial<CateringOrder>) {
    console.log(`[CateringMock] Requesting quote for ${order.deliveryLocation}...`)
    return { 
      success: true, 
      estimatedCost: 250, 
      reference: `MOCK-CAT-${Math.random().toString(36).substring(7).toUpperCase()}` 
    }
  },

  async confirmCateringOrder(reference: string) {
    console.log(`[CateringMock] Confirming order ${reference}`)
    return { success: true }
  },

  async updateCateringPreferences(reference: string, preferences: any) {
    return { success: true }
  },

  async cancelCateringOrder(reference: string) {
    return { success: true }
  }
}
