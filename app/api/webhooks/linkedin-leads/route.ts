import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Webhook for LinkedIn Lead Gen Forms.
 * This endpoint receives leads directly from LinkedIn Ads.
 * Requires a "Secret Token" for validation.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { headers } = req;
    
    // Simple token validation (set this in Vercel env)
    const authToken = headers.get("x-linkedin-webhook-token");
    if (authToken !== process.env.LINKEDIN_WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Mapping LinkedIn fields to AeroJet Inquiry
    // Note: Field names depend on the form configuration in LinkedIn
    const lead = {
      name: body.user_data?.full_name || "LinkedIn Lead",
      email: body.user_data?.email_address,
      phone: body.user_data?.phone_number || "",
      message: `LinkedIn Lead from Form: ${body.form_name || "N/A"}`,
      status: "NEW",
      leadTier: "QUALIFIED", // LinkedIn leads are usually higher intent
      internalNotes: `Source: LinkedIn Ads\nForm: ${body.form_name}\nID: ${body.lead_id}`,
    };

    if (!lead.email) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    // Save to database
    const inquiry = await prisma.inquiry.create({
      data: lead as any,
    });

    console.log(`[LinkedIn Webhook] Created new inquiry: ${inquiry.id}`);

    return NextResponse.json({ success: true, id: inquiry.id });
  } catch (error) {
    console.error("[LinkedIn Webhook] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
