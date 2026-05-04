import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Resend from 'next-auth/providers/resend'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

import { PrismaAdapter } from '@auth/prisma-adapter'
import prisma from '@/lib/prisma'

// In-memory user store (replace with Prisma when DB is configured)
const users: Record<string, { id: string; email: string; name?: string; role: string; image?: string }> = {}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY || 're_dummy_dev_key',
      from: process.env.RESEND_FROM_EMAIL || 'concierge@aerojet.app',
      sendVerificationRequest: async ({ identifier: email, url }) => {
        // Fallback: log magic link if Resend not configured
        if (!process.env.RESEND_API_KEY) {
          if (process.env.NODE_ENV === 'production') {
            throw new Error('Resend API Key is missing in production')
          }
          console.log('\n─────────────────────────────────────')
          console.log('🔑 MAGIC LINK (dev mode, no Resend key):')
          console.log(url)
          console.log('─────────────────────────────────────\n')
          return
        }
        const { Resend: ResendClient } = await import('resend')
        const resend = new ResendClient(process.env.RESEND_API_KEY)
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || 'concierge@aerojet.app',
          to: email,
          subject: 'Accesso ad Aerojet Private',
          html: `
            <div style="background:#0A0C14;color:#F0EDE6;padding:48px;font-family:Georgia,serif;max-width:560px;margin:0 auto;">
              <div style="color:#C9A84C;font-size:24px;letter-spacing:6px;font-weight:700;margin-bottom:8px;">AEROJET</div>
              <div style="color:#C9A84C;font-size:11px;letter-spacing:4px;margin-bottom:40px;">PRIVATE</div>
              <h2 style="font-weight:300;font-size:28px;margin-bottom:16px;">Il suo accesso esclusivo</h2>
              <p style="color:rgba(240,237,230,0.6);line-height:1.8;margin-bottom:32px;font-family:Helvetica Neue,sans-serif;font-size:15px;">
                Clicchi il pulsante qui sotto per accedere alla sua area riservata Aerojet Private.<br>
                Il link è valido per 15 minuti.
              </p>
              <a href="${url}" style="display:inline-block;background:#C9A84C;color:#0A0C14;padding:16px 40px;text-decoration:none;font-family:Helvetica Neue,sans-serif;font-size:12px;letter-spacing:2px;font-weight:500;">
                ACCEDI ORA
              </a>
              <p style="color:rgba(240,237,230,0.3);font-size:12px;margin-top:40px;font-family:Helvetica Neue,sans-serif;">
                Se non ha richiesto questo accesso, ignori questa email.
              </p>
              <div style="border-top:1px solid rgba(201,168,76,0.15);margin-top:40px;padding-top:24px;color:rgba(240,237,230,0.2);font-size:11px;font-family:Helvetica Neue,sans-serif;">
                © 2026 Aerojet Private · Il lusso del tempo. La libertà del cielo.
              </div>
            </div>
          `,
        })
      },
    }),
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.password) return null

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
    verifyRequest: '/verify',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as { role?: string }).role || 'CLIENT'
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) || 'CLIENT'
        session.user.id = token.id as string
      }
      return session
    },
    async signIn({ user, account }) {
      // Auto-assign BROKER role to specific emails
      const brokerEmails = (process.env.BROKER_EMAILS || '').split(',').map(e => e.trim())
      if (user.email && brokerEmails.includes(user.email)) {
        (user as { role?: string }).role = 'BROKER'
      }
      return true
    },
  },
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
})

// Extend session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
