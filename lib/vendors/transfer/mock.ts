import { TransferProvider, TransferDetails } from './types'

export const mockTransferProvider: TransferProvider = {
  async requestTransferQuote(details: Partial<TransferDetails>) {
    console.log(`[TransferMock] Requesting quote for ${details.pickupLocation}...`)
    return { 
      success: true, 
      estimatedCost: 150, 
      reference: `MOCK-NCC-${Math.random().toString(36).substring(7).toUpperCase()}` 
    }
  },

  async confirmTransfer(reference: string) {
    console.log(`[TransferMock] Confirming transfer ${reference}`)
    return { success: true }
  },

  async getDriverDetails(reference: string) {
    return {
      driverName: 'Marco Rossi',
      driverPhone: '+39 347 123 4567',
      vehicleModel: 'Mercedes S-Class',
      licensePlate: 'AJ 007 JET'
    }
  },

  async cancelTransfer(reference: string) {
    return { success: true }
  }
}
