import { AviationProvider, FlightStatus } from './types'

export const mockAviationProvider: AviationProvider = {
  async getFlightStatus(tailNumber: string): Promise<FlightStatus | null> {
    console.log(`[AviationMock] Fetching status for ${tailNumber}...`)
    return {
      status: 'AIRBORNE',
      tailNumber,
      estimatedArrival: new Date(Date.now() + 3600000), // In 1 hour
    }
  },

  async getAircraftPosition(tailNumber: string) {
    console.log(`[AviationMock] Fetching position for ${tailNumber}...`)
    return { lat: 45.4642, lng: 9.1900 } // Milan
  },

  async sendOperatorConfirmation(bookingId: string, operatorId: string) {
    console.log(`[AviationMock] Sending confirmation for ${bookingId}`)
    return { success: true, reference: `MOCK-OP-${Math.random().toString(36).substring(7).toUpperCase()}` }
  }
}
