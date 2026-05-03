import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Task operativi standard — creati automaticamente dopo ogni pagamento
const DEFAULT_TASKS = [
  {
    type: "FLIGHT" as const,
    title: "Confirm flight availability",
    description:
      "Verify aircraft availability with operator for the requested date and route. Obtain verbal confirmation.",
    priority: "URGENT" as const,
    dueDaysOffset: 0, // entro oggi
  },
  {
    type: "FLIGHT" as const,
    title: "Reserve aircraft / operator",
    description:
      "Formally reserve the aircraft. Send operator contract/LOI. Obtain written confirmation number.",
    priority: "HIGH" as const,
    dueDaysOffset: 1,
  },
  {
    type: "CLIENT_CONFIRMATION" as const,
    title: "Send client booking confirmation",
    description:
      "Send official confirmation email with all flight details, aircraft info, and next steps.",
    priority: "HIGH" as const,
    dueDaysOffset: 0,
  },
  {
    type: "BROKER_ACTION" as const,
    title: "Assign Aviation Advisor",
    description:
      "Assign internal Aviation Advisor to this booking. Brief them on client profile and requirements.",
    priority: "HIGH" as const,
    dueDaysOffset: 0,
  },
  {
    type: "DOCUMENTS" as const,
    title: "Collect passenger documents",
    description:
      "Request passenger manifest from client. Collect IDs/passports. Verify visa requirements for route.",
    priority: "HIGH" as const,
    dueDaysOffset: 2,
  },
  {
    type: "TRANSFER" as const,
    title: "Arrange ground transfer",
    description:
      "Coordinate transfer to/from private terminal (FBO). Confirm vehicle type, timing, and pickup address.",
    priority: "MEDIUM" as const,
    dueDaysOffset: 3,
  },
  {
    type: "CATERING" as const,
    title: "Arrange catering & onboard services",
    description:
      "Confirm catering preferences with client. Brief operator on dietary requirements. Arrange champagne/special requests.",
    priority: "MEDIUM" as const,
    dueDaysOffset: 3,
  },
  {
    type: "FLIGHT" as const,
    title: "Final pre-flight check (D-24h)",
    description:
      "24h before: confirm all services, transfer, catering. Send final flight briefing to client. Check weather/NOTAMs.",
    priority: "URGENT" as const,
    dueDaysOffset: -1, // giorno prima del volo
  },
];

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event: { type: string; data: { object: Record<string, unknown> } };

  // ── Verifica firma Stripe ────────────────────────────────────────
  if (
    process.env.STRIPE_WEBHOOK_SECRET &&
    process.env.STRIPE_SECRET_KEY?.startsWith("sk_")
  ) {
    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });
    try {
      event = stripe.webhooks.constructEvent(
        body,
        sig!,
        process.env.STRIPE_WEBHOOK_SECRET
      ) as typeof event;
    } catch (err: unknown) {
      console.error("[Webhook] Firma non valida:", err);
      return NextResponse.json(
        { error: "Firma webhook non valida" },
        { status: 400 }
      );
    }
  } else {
    // Dev/mock — parse diretto senza firma
    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json({ error: "Body non valido" }, { status: 400 });
    }
  }

  // ── checkout.session.completed ───────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = (session.metadata as Record<string, string>) ?? {};
    const { quoteId, inquiryId, type } = metadata;

    if (type !== "deposit" || !quoteId) {
      return NextResponse.json({ received: true });
    }

    try {
      // 1. Aggiorna Quote
      const quote = await prisma.quote.update({
        where: { id: quoteId },
        data: {
          depositPaid: true,
          depositPaidAt: new Date(),
          stripeSessionId: session.id as string,
        } as Parameters<typeof prisma.quote.update>[0]["data"],
        include: { inquiry: true },
      });

      // 2. Aggiorna Inquiry
      if (inquiryId) {
        await prisma.inquiry
          .update({
            where: { id: inquiryId },
            data: { status: "CONFIRMED" } as Parameters<
              typeof prisma.inquiry.update
            >[0]["data"],
          })
          .catch(() => null);
      }

      // 3. Crea Booking (idempotente — non duplicare)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const existingBooking = await (prisma as any).booking
        ?.findUnique?.({ where: { quoteId } })
        .catch(() => null);

      if (!existingBooking) {
        const inq = (quote as { inquiry?: Record<string, unknown> }).inquiry;
        const depositAmount = Math.round(quote.totalPrice * 0.3);
        const flightDate =
          (inq?.departureDate as Date | null) ?? null;

        // Genera codice conferma deterministico
        const confirmationCode =
          "AJ-" + quoteId.slice(-6).toUpperCase();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const booking = await (prisma as any).booking.create({
          data: {
            quoteId,
            inquiryId: inquiryId ?? null,
            clientName:
              (inq?.clientName as string) ?? "Cliente",
            clientEmail:
              (inq?.clientEmail as string) ?? "",
            fromCity: (inq?.from as string) ?? "",
            toCity: (inq?.to as string) ?? "",
            flightDate,
            passengerCount: (inq?.passengerCount as number) ?? 1,
            aircraftType:
              (quote as Record<string, unknown>).aircraftType ?? null,
            totalPrice: quote.totalPrice,
            depositAmount,
            currency:
              ((quote as Record<string, unknown>).currency as string) ?? "EUR",
            depositPaid: true,
            depositPaidAt: new Date(),
            stripeSessionId: session.id as string,
            status: "CONFIRMED",
            confirmationCode,
          },
        });

        // 4. Crea task operativi automatici
        const now = new Date();
        const taskData = DEFAULT_TASKS.map((t) => {
          let dueAt: Date | null = null;
          if (flightDate) {
            dueAt = new Date(flightDate);
            dueAt.setDate(dueAt.getDate() + t.dueDaysOffset);
          } else {
            dueAt = new Date(now);
            dueAt.setDate(
              dueAt.getDate() + Math.max(0, t.dueDaysOffset + 7)
            );
          }
          return {
            bookingId: booking.id,
            type: t.type,
            title: t.title,
            description: t.description,
            priority: t.priority,
            status: "TODO" as const,
            dueAt,
          };
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (prisma as any).operationalTask.createMany({
          data: taskData,
        });

        console.log(
          `[Webhook] ✅ Booking ${booking.id} creato — ${taskData.length} task operativi generati`
        );

        // 5. Email cliente (fire & forget)
        sendConfirmationEmail({
          clientName: booking.clientName,
          clientEmail: booking.clientEmail,
          fromCity: booking.fromCity,
          toCity: booking.toCity,
          flightDate,
          depositAmount,
          currency: booking.currency,
          confirmationCode,
          bookingId: booking.id,
        }).catch(console.error);
      } else {
        console.log(
          `[Webhook] Booking già esistente per quote ${quoteId} — skip`
        );
      }
    } catch (err) {
      console.error("[Webhook] Errore processing:", err);
      return NextResponse.json({ error: "Errore interno" }, { status: 500 });
    }
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object;
    console.log(`[Webhook] Sessione scaduta: ${session.id as string}`);
  }

  return NextResponse.json({ received: true });
}

// ── Email conferma cliente ────────────────────────────────────────
async function sendConfirmationEmail(data: {
  clientName: string;
  clientEmail: string;
  fromCity: string;
  toCity: string;
  flightDate: Date | null;
  depositAmount: number;
  currency: string;
  confirmationCode: string;
  bookingId: string;
}) {
  if (!process.env.RESEND_API_KEY) return;

  const { Resend } = await import("resend");
  const resend = new Resend(process.env.RESEND_API_KEY);

  const dateStr = data.flightDate
    ? new Intl.DateTimeFormat("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }).format(data.flightDate)
    : "Da confermare";

  const depositStr = new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: data.currency,
    maximumFractionDigits: 0,
  }).format(data.depositAmount);

  await resend.emails.send({
    from: "Aerojet Private <noreply@aerojet.app>",
    to: [data.clientEmail],
    subject: `✦ Prenotazione Confermata — ${data.fromCity} → ${data.toCity}`,
    html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #080808; color: #fff; padding: 48px 40px;">
        <p style="color: #B8973A; letter-spacing: 4px; font-size: 11px; margin: 0 0 32px;">✦ AEROJET PRIVATE</p>
        <h1 style="font-weight: 400; font-size: 28px; margin: 0 0 8px; color: #fff;">Prenotazione Confermata</h1>
        <p style="color: #666; margin: 0 0 40px;">Gentile ${data.clientName},</p>

        <div style="background: #0f0f0f; border: 1px solid #1a1a1a; padding: 32px; margin-bottom: 32px;">
          <p style="color: #B8973A; font-size: 10px; letter-spacing: 3px; margin: 0 0 12px;">CODICE PRENOTAZIONE</p>
          <p style="font-size: 28px; letter-spacing: 6px; color: #C9A84C; font-weight: 300; margin: 0 0 24px;">${data.confirmationCode}</p>
          <table style="width: 100%; border-collapse: collapse;">
            <tr style="border-bottom: 1px solid #1a1a1a;">
              <td style="padding: 10px 0; color: #666; font-size: 13px;">Rotta</td>
              <td style="padding: 10px 0; text-align: right; font-size: 13px;">${data.fromCity} → ${data.toCity}</td>
            </tr>
            <tr style="border-bottom: 1px solid #1a1a1a;">
              <td style="padding: 10px 0; color: #666; font-size: 13px;">Data volo</td>
              <td style="padding: 10px 0; text-align: right; font-size: 13px;">${dateStr}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #666; font-size: 13px;">Deposito pagato</td>
              <td style="padding: 10px 0; text-align: right; font-size: 13px; color: #4ade80;">${depositStr} ✓</td>
            </tr>
          </table>
        </div>

        <p style="color: #888; font-size: 14px; line-height: 1.8;">
          Il nostro Aviation Advisor la contatterà entro <strong style="color: #fff;">2 ore</strong> per
          coordinare tutti i dettagli operativi del suo volo.
        </p>

        <hr style="border: none; border-top: 1px solid #1a1a1a; margin: 32px 0;" />
        <p style="color: #444; font-size: 12px; margin: 0;">
          Per assistenza immediata: <a href="mailto:concierge@aerojet.app" style="color: #B8973A;">concierge@aerojet.app</a>
        </p>
      </div>
    `,
  });
}
