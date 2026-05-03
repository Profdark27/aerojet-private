/**
 * Utility for marketing tracking and analytics.
 */

export const trackMarketingEvent = (eventName: string, properties: Record<string, any> = {}) => {
  if (typeof window === "undefined") return;

  // LinkedIn Insight Tag Event
  if ((window as any).lintrk) {
    (window as any).lintrk('track', { conversion_id: process.env.NEXT_PUBLIC_LINKEDIN_INSIGHT_ID });
    console.log(`[Analytics] Tracked LinkedIn event: ${eventName}`, properties);
  }

  // Future: Add Meta Pixel, GA4, etc.
};

/**
 * Common event names for AeroJet.
 */
export const EVENTS = {
  INQUIRY_SUBMITTED: "inquiry_submitted",
  BOOKING_STARTED: "booking_started",
  BOOKING_SUCCESS: "booking_success",
  QUOTE_ACCEPTED: "quote_accepted",
};
