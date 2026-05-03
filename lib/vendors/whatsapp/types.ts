/**
 * WhatsApp Concierge Types
 */

export interface WhatsAppMessage {
  to: string
  body: string
  templateId?: string
  variables?: Record<string, string>
}

export interface WhatsAppProvider {
  sendMessage(msg: WhatsAppMessage): Promise<{ success: boolean; messageId: string }>
  buildPassengerUpdateMessage(name: string, route: string, status: string): string
  buildDriverDetailsMessage(paxName: string, driverName: string, phone: string, car: string): string
  buildFlightReadyMessage(paxName: string, tailNumber: string, fbo: string): string
  buildDocumentsRequestMessage(paxName: string, portalUrl: string): string
  buildCateringConfirmedMessage(paxName: string, route: string): string
}
