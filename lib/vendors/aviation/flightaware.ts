import { AviationProvider, FlightStatus } from './types'

const API_KEY = process.env.FLIGHTAWARE_API_KEY

export const flightAwareProvider: AviationProvider = {
  async getFlightStatus(tailNumber: string): Promise<FlightStatus | null> {
    if (!API_KEY) throw new Error('FLIGHTAWARE_API_KEY is not configured')
    console.log(`[FlightAware] Fetching status for ${tailNumber}...`)
    // Placeholder: real API call to https://aeroapi.flightaware.com/aeroapi/
    return null
  },

  async getAircraftPosition(tailNumber: string) {
    if (!API_KEY) throw new Error('FLIGHTAWARE_API_KEY is not configured')
    return null
  },

  async sendOperatorConfirmation(bookingId: string, operatorId: string) {
    // Note: FlightAware is mostly for tracking, but some providers might have booking APIs
    console.log(`[FlightAware] Confirmation not implemented via tracking provider`)
    return { success: false, reference: '' }
  }
}
