/**
 * Server-Sent Events endpoint per notifiche real-time al broker dashboard.
 * Il browser apre una connessione persistente e riceve eventi push.
 * Nessuna libreria esterna richiesta — built-in Next.js.
 */

// Shared notification store (in prod: use Redis pub/sub)
export const notificationStore: {
  events: Array<{ id: string; type: string; data: Record<string, unknown>; ts: number }>
  listeners: Set<(event: string) => void>
} = {
  events: [],
  listeners: new Set(),
}

export function pushNotification(type: string, data: Record<string, unknown>) {
  const event = { id: Date.now().toString(), type, data, ts: Date.now() }
  notificationStore.events.unshift(event)
  if (notificationStore.events.length > 50) notificationStore.events.pop()

  // Notify all connected clients
  const msg = `data: ${JSON.stringify({ type, data, id: event.id })}\n\n`
  notificationStore.listeners.forEach(fn => fn(msg))
}

export async function GET() {
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection confirmation
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Notifiche attive' })}\n\n`))

      // Send recent events on connect
      notificationStore.events.slice(0, 5).reverse().forEach(ev => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: ev.type, data: ev.data, id: ev.id })}\n\n`))
      })

      // Register listener
      const listener = (msg: string) => {
        try { controller.enqueue(encoder.encode(msg)) } catch { /* client disconnected */ }
      }
      notificationStore.listeners.add(listener)

      // Heartbeat every 30s to keep connection alive
      const heartbeat = setInterval(() => {
        try { controller.enqueue(encoder.encode(': heartbeat\n\n')) } catch { clearInterval(heartbeat) }
      }, 30_000)

      // Cleanup on close
      const cleanup = () => {
        clearInterval(heartbeat)
        notificationStore.listeners.delete(listener)
      }

      // Close signal
      setTimeout(cleanup, 5 * 60 * 1000) // max 5 min connection
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Nginx: disable buffering
    },
  })
}
