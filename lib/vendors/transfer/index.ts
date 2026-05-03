import { mockTransferProvider } from './mock'
import { TransferProvider } from './types'

const PROVIDER = process.env.TRANSFER_PROVIDER || 'mock'
const IS_PROD = process.env.NODE_ENV === 'production'

function getProvider(): TransferProvider {
  if (PROVIDER === 'ncc_real') {
    if (!process.env.TRANSFER_API_KEY) throw new Error('TRANSFER_API_KEY is not configured')
    // return realProvider
  }

  if (IS_PROD && PROVIDER === 'mock') {
    return {
      requestTransferQuote: async () => { throw new Error('Transfer mock is disabled in production.') },
      confirmTransfer: async () => { throw new Error('Transfer mock is disabled in production.') },
      getDriverDetails: async () => { throw new Error('Transfer mock is disabled in production.') },
      cancelTransfer: async () => { throw new Error('Transfer mock is disabled in production.') },
    }
  }
  
  return mockTransferProvider
}

export const transfer = getProvider()
export * from './types'
