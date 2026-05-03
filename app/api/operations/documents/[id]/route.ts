import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session || session.user.role !== 'BROKER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  try {
    const data = await req.json()
    const updated = await prisma.passengerDocument.update({
      where: { id },
      data: {
        status: data.status,
        notesInternal: data.notesInternal,
        notesClient: data.notesClient,
        updatedAt: new Date()
      }
    })
    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json({ error: 'Errore nell\'aggiornamento documento' }, { status: 500 })
  }
}
