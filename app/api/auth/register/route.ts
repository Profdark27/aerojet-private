import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import prisma from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email e password richiesti' }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Utente già registrato' }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'CLIENT',
      },
    })

    return NextResponse.json({
      message: 'Registrazione completata',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    })
  } catch (err) {
    console.error('Registration error:', err)
    return NextResponse.json({ error: 'Errore durante la registrazione' }, { status: 500 })
  }
}
