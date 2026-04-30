/**
 * Server-Sent Events endpoint per notifiche real-time al broker dashboard.
 * Protetto da auth — solo broker/admin.
 */
import { auth } from '@/lib/auth'

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

  const msg = `data: ${JSON.stringify({ type, data, id: event.id })}\n\n`
    notificationStore.listeners.forEach(fn => fn(msg))
}

export async function GET(request: Request) {
    // Auth guard — solo broker/admin
  const session = await auth()
    if (!session?.user || !['BROKER', 'ADMIN'].includes(session.user.role)) {
          return new Response(JSON.stringify({ error: 'Non autorizzato' }), {
                  status: 401,
                  headers: { 'Content-Type': 'application/json' },
          })
    }

  const encoder = new TextEncoder()
    const stream = new ReadableStream({
          start(controller) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'Notifiche attive' })}\n\n`))

            notificationStore.events.slice(0, 5).reverse().forEach(ev => {
                      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: ev.type, data: ev.data, id: ev.id })}\n\n`))
            })

            const listener = (msg: string) => {
                      try { controller.enqueue(encoder.encode(msg)) } catch { /* client disconnected */ }
            }
                  notificationStore.listeners.add(listener)

            const heartbeat = setInterval(() => {
                      try { controller.enqueue(encoder.encode(': heartbeat\n\n')) } catch { clearInterval(heartbeat) }
            }, 30_000)

            const cleanup = () => {
                      clearInterval(heartbeat)
                      notificationStore.listeners.delete(listener)
            }

            // Max 5 min connection
            setTimeout(cleanup, 5 * 60 * 1000)
          },
    })

  return new Response(stream, {
        headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
                'X-Accel-Buffering': 'no',
        },
  })
}
