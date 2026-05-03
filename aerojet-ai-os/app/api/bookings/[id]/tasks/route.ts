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
    const tasks = await (prisma as any).operationalTask.findMany({
      where: { bookingId: id },
      orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
    });
    return NextResponse.json({ tasks });
  } catch (err) {
    console.error("[GET /api/bookings/[id]/tasks]", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
