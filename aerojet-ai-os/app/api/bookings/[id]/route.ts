import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const booking = await (prisma as any).booking.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { createdAt: "asc" } },
        quote: { include: { inquiry: true } },
      },
    });
    if (!booking)
      return NextResponse.json({ error: "Non trovato" }, { status: 404 });
    return NextResponse.json({ booking });
  } catch (err) {
    console.error("[GET /api/bookings/[id]]", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    // Whitelist campi aggiornabili
    const allowed = [
      "status",
      "assignedTo",
      "internalNotes",
      "transferRequired",
      "cateringRequired",
      "cateringNotes",
      "transferNotes",
    ];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) data[key] = body[key];
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const booking = await (prisma as any).booking.update({
      where: { id },
      data,
    });
    return NextResponse.json({ booking });
  } catch (err) {
    console.error("[PATCH /api/bookings/[id]]", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
