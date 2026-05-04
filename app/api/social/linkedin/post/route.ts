import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { postToLinkedIn } from '@/lib/linkedin'

/**
 * API to trigger a LinkedIn Post
 */
export async function POST(req: NextRequest) {
  try {
    const { text, imageUrl, linkUrl } = await req.json()

    // 1. Get Access Token from DB
    const config = await prisma.socialConfig.findUnique({
      where: { platform: 'LINKEDIN' }
    })

    if (!config || !config.accessToken) {
      return NextResponse.json({ error: 'LinkedIn not connected' }, { status: 401 })
    }

    // 2. Post to LinkedIn
    const result = await postToLinkedIn(config.accessToken, {
      text,
      imageUrl,
      linkUrl
    })

    return NextResponse.json({ success: true, result })
  } catch (error: any) {
    console.error('[LinkedIn Post API] Error:', error)
    return NextResponse.json({ error: error.message || 'Post failed' }, { status: 500 })
  }
}
