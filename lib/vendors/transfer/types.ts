/**
 * Transfer Vendor Types
 */

export interface TransferDetails {
  providerName: string
  driverName?: string
  driverPhone?: string
  vehicleModel?: string
  licensePlate?: string
  pickupTime: Date
  pickupLocation: string
  dropoffLocation: string
  status: 'PENDING' | 'CONFIRMED' | 'DISPATCHED' | 'ARRIVED' | 'COMPLETED' | 'CANCELLED'
}

export interface TransferProvider {
  requestTransferQuote(details: Partial<TransferDetails>): Promise<{ success: boolean; estimatedCost: number; reference: string }>
  confirmTransfer(reference: string): Promise<{ success: boolean }>
  getDriverDetails(reference: string): Promise<Partial<TransferDetails> | null>
  cancelTransfer(reference: string): Promise<{ success: boolean }>
}
