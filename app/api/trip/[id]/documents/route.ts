import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

// GET /api/trip/[id]/documents
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const documents = await prisma.passengerDocument.findMany({
      where: { bookingId: id },
      select: {
        id: true,
        type: true,
        passengerName: true,
        fileUrl: true,
        status: true,
        notesClient: true,
      }
    })
    return NextResponse.json(documents)
  } catch (error) {
    return NextResponse.json({ error: 'Errore nel recupero documenti' }, { status: 500 })
  }
}

// POST /api/trip/[id]/documents
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { documentId, fileUrl } = await req.json()
    
    // Production Safeguard
    const isProd = process.env.NODE_ENV === 'production'
    const storageProvider = process.env.DOCUMENT_STORAGE_PROVIDER || 'mock'
    
    if (isProd && storageProvider === 'mock') {
      return NextResponse.json({ 
        error: 'Storage non configurato. Contattare il concierge.' 
      }, { status: 503 })
    }

    if (!documentId || !fileUrl) {
      return NextResponse.json({ error: 'Dati mancanti' }, { status: 400 })
    }

    const updated = await prisma.passengerDocument.update({
      where: { id: documentId, bookingId: id },
      data: {
        fileUrl,
        status: 'UPLOADED',
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'upload del documento' }, { status: 500 })
  }
}
