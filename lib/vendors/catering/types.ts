/**
 * Catering Vendor Types
 */

export interface CateringOrder {
  orderId: string
  items: Array<{ name: string; quantity: number; notes?: string }>
  dietaryRequirements?: string[]
  deliveryTime: Date
  deliveryLocation: string
  status: 'PENDING' | 'ORDERED' | 'CONFIRMED' | 'DELIVERED' | 'CANCELLED'
  totalCost?: number
}

export interface CateringProvider {
  requestCateringQuote(order: Partial<CateringOrder>): Promise<{ success: boolean; estimatedCost: number; reference: string }>
  confirmCateringOrder(reference: string): Promise<{ success: boolean }>
  updateCateringPreferences(reference: string, preferences: any): Promise<{ success: boolean }>
  cancelCateringOrder(reference: string): Promise<{ success: boolean }>
}
