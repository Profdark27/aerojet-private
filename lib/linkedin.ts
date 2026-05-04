/**
 * LinkedIn API Integration for AeroJet Private
 * Docs: https://learn.microsoft.com/en-us/linkedin/marketing/integrations/community-management/shares/posts-api
 */

export interface LinkedInPost {
  text: string;
  imageUrl?: string;
  linkUrl?: string;
}

export async function postToLinkedIn(accessToken: string, post: LinkedInPost) {
  try {
    // 1. Get User URN (me)
    const meRes = await fetch('https://api.linkedin.com/v2/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    const me = await meRes.json();
    const personUrn = `urn:li:person:${me.id}`;

    // 2. Construct post body
    const body = {
      author: personUrn,
      commentary: post.text,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      content: post.linkUrl || post.imageUrl ? {
        article: post.linkUrl ? {
          source: post.linkUrl,
          title: "AeroJet Private — Luxury Aviation",
          description: "Prenota il tuo volo privato con AeroJet."
        } : undefined,
        media: post.imageUrl ? {
          title: "AeroJet Private",
          id: post.imageUrl // Note: Media requires a multi-step upload in LinkedIn API
        } : undefined
      } : undefined,
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false
    };

    const response = await fetch('https://api.linkedin.com/v2/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'LinkedIn Post failed');
    }

    return await response.json();
  } catch (error) {
    console.error('[LinkedIn Service] Error:', error);
    throw error;
  }
}

// Helper to get Auth URL
export function getLinkedInAuthUrl(clientId: string, redirectUri: string) {
  const scope = encodeURIComponent('w_member_social r_liteprofile');
  return `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
}

export async function getLinkedInAccessToken(clientId: string, clientSecret: string, code: string, redirectUri: string) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri
  });

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  return await response.json();
}
