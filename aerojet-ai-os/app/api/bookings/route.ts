import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const bookings = await (prisma as any).booking.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        tasks: {
          select: { id: true, status: true, priority: true, type: true },
        },
      },
    });

    const enriched = bookings.map(
      (b: {
        tasks: Array<{ status: string; priority: string }>;
        [key: string]: unknown;
      }) => {
        const total = b.tasks.length;
        const done = b.tasks.filter((t) => t.status === "DONE").length;
        const urgent = b.tasks.filter(
          (t) => t.priority === "URGENT" && t.status !== "DONE"
        ).length;
        const { tasks, ...rest } = b;
        return { ...rest, taskSummary: { total, done, urgent } };
      }
    );

    return NextResponse.json({ bookings: enriched });
  } catch (err) {
    console.error("[GET /api/bookings]", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
