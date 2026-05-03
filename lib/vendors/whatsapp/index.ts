import { mockWhatsAppProvider } from './mock'
import { WhatsAppProvider } from './types'

const PROVIDER = process.env.WHATSAPP_PROVIDER || 'mock'
const IS_PROD = process.env.NODE_ENV === 'production'

function getProvider(): WhatsAppProvider {
  if (PROVIDER === 'twilio' || PROVIDER === 'meta') {
    if (!process.env.WHATSAPP_API_KEY) throw new Error('WHATSAPP_API_KEY is not configured')
    const fromNumber = process.env.WHATSAPP_FROM_NUMBER || '+1234567890'
    console.log(`[WhatsApp] Initializing ${PROVIDER} provider with number ${fromNumber}`)
    // return realProvider
  }

  if (IS_PROD && PROVIDER === 'mock') {
    return {
      sendMessage: async () => { throw new Error('WhatsApp mock is disabled in production. Configure a real provider.') },
      buildPassengerUpdateMessage: mockWhatsAppProvider.buildPassengerUpdateMessage,
      buildDriverDetailsMessage: mockWhatsAppProvider.buildDriverDetailsMessage,
      buildFlightReadyMessage: mockWhatsAppProvider.buildFlightReadyMessage,
      buildDocumentsRequestMessage: mockWhatsAppProvider.buildDocumentsRequestMessage,
      buildCateringConfirmedMessage: mockWhatsAppProvider.buildCateringConfirmedMessage,
    }
  }
  
  return mockWhatsAppProvider
}

export const whatsapp = getProvider()
export * from './types'
