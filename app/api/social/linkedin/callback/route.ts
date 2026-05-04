import { NextRequest, NextResponse } from 'next/server'
import { getLinkedInAccessToken } from '@/lib/linkedin'
import { prisma } from '@/lib/prisma'

/**
 * LinkedIn OAuth Callback
 * This route receives the 'code' from LinkedIn and exchanges it for an Access Token.
 */
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    console.error('[LinkedIn Callback] Error from LinkedIn:', error)
    return NextResponse.redirect(new URL('/dashboard?error=linkedin_denied', req.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?error=no_code', req.url))
  }

  try {
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET!
    const redirectUri = `${new URL(req.url).origin}/api/social/linkedin/callback`

    const tokenData = await getLinkedInAccessToken(clientId, clientSecret, code, redirectUri)

    if (tokenData.access_token) {
      // Store token in DB for the current user/broker
      // Note: In a real multi-tenant app, we'd use the current session ID
      // For now, we'll store it in a generic SocialConfig table or similar
      await prisma.socialConfig.upsert({
        where: { platform: 'LINKEDIN' },
        update: { 
          accessToken: tokenData.access_token,
          expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000))
        },
        create: {
          platform: 'LINKEDIN',
          accessToken: tokenData.access_token,
          expiresAt: new Date(Date.now() + (tokenData.expires_in * 1000))
        }
      })

      return NextResponse.redirect(new URL('/dashboard?tab=social&success=linkedin_connected', req.url))
    } else {
      throw new Error('No access token in response')
    }
  } catch (err) {
    console.error('[LinkedIn Callback] Token exchange failed:', err)
    return NextResponse.redirect(new URL('/dashboard?error=linkedin_token_failed', req.url))
  }
}
