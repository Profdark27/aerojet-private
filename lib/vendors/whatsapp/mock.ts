import { WhatsAppProvider, WhatsAppMessage } from './types'

export const mockWhatsAppProvider: WhatsAppProvider = {
  async sendMessage(msg: WhatsAppMessage) {
    console.log(`\n📱 WHATSAPP MOCK (to: ${msg.to})`)
    console.log(`  Body: ${msg.body}\n`)
    return { success: true, messageId: `MOCK-WA-${Date.now()}` }
  },

  buildPassengerUpdateMessage(name: string, route: string, status: string) {
    return `Gentile ${name}, il suo volo ${route} è ora in stato: ${status}. Il suo concierge AeroJet.`
  },

  buildDriverDetailsMessage(paxName: string, driverName: string, phone: string, car: string) {
    return `Gentile ${paxName}, il suo chauffeur ${driverName} (${phone}) la attende con una ${car}.`
  },

  buildFlightReadyMessage(paxName: string, tailNumber: string, fbo: string) {
    return `Gentile ${paxName}, il suo velivolo (${tailNumber}) è pronto presso l'FBO ${fbo}. Welcome on board.`
  },
  
  buildDocumentsRequestMessage(paxName: string, portalUrl: string) {
    return `✦ AeroJet: Gentile ${paxName}, la preghiamo di completare il caricamento dei documenti nel Suo portale: ${portalUrl}`
  },

  buildCateringConfirmedMessage(paxName: string, route: string) {
    return `✦ AeroJet: Gentile ${paxName}, il menu per il Suo volo ${route} è stato confermato.`
  }
}
