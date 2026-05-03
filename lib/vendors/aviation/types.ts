/**
 * Aviation Vendor Types
 */

export interface FlightStatus {
  status: 'SCHEDULED' | 'CONFIRMED' | 'TAXI' | 'AIRBORNE' | 'ARRIVED' | 'CANCELLED'
  tailNumber?: string
  actualDeparture?: Date
  actualArrival?: Date
  estimatedDeparture?: Date
  estimatedArrival?: Date
}

export interface OperatorDetails {
  name: string
  contactEmail: string
  contactPhone: string
  fleetType: string
  certifications: string[]
}

export interface AviationProvider {
  getFlightStatus(tailNumber: string): Promise<FlightStatus | null>
  getAircraftPosition(tailNumber: string): Promise<{ lat: number; lng: number } | null>
  sendOperatorConfirmation(bookingId: string, operatorId: string): Promise<{ success: boolean; reference: string }>
}
