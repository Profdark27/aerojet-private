import { mockAviationProvider } from './mock'
import { flightAwareProvider } from './flightaware'
import { AviationProvider } from './types'

const PROVIDER = process.env.FLIGHT_TRACKING_PROVIDER || 'mock'
const IS_PROD = process.env.NODE_ENV === 'production'

function getProvider(): AviationProvider {
  if (PROVIDER === 'flightaware') return flightAwareProvider
  
  if (IS_PROD && PROVIDER === 'mock') {
    return {
      getFlightStatus: async () => { throw new Error('Aviation mock is disabled in production.') },
      getAircraftPosition: async () => { throw new Error('Aviation mock is disabled in production.') },
      sendOperatorConfirmation: async () => { throw new Error('Aviation mock is disabled in production.') },
    }
  }
  
  return mockAviationProvider
}

export const aviation = getProvider()
export * from './types'
