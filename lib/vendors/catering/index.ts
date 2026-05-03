import { mockCateringProvider } from './mock'
import { CateringProvider } from './types'

const PROVIDER = process.env.CATERING_PROVIDER || 'mock'
const IS_PROD = process.env.NODE_ENV === 'production'

function getProvider(): CateringProvider {
  if (PROVIDER === 'catering_real') {
    if (!process.env.CATERING_API_KEY) throw new Error('CATERING_API_KEY is not configured')
    // return realProvider
  }

  if (IS_PROD && PROVIDER === 'mock') {
    return {
      requestCateringQuote: async () => { throw new Error('Catering mock is disabled in production.') },
      confirmCateringOrder: async () => { throw new Error('Catering mock is disabled in production.') },
      updateCateringPreferences: async () => { throw new Error('Catering mock is disabled in production.') },
      cancelCateringOrder: async () => { throw new Error('Catering mock is disabled in production.') },
    }
  }
  
  return mockCateringProvider
}

export const catering = getProvider()
export * from './types'
