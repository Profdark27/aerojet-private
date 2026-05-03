import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (body.status !== undefined) data.status = body.status;
    if (body.notes !== undefined) data.notes = body.notes;
    if (body.assignedTo !== undefined) data.assignedTo = body.assignedTo;
    if (body.priority !== undefined) data.priority = body.priority;

    // Auto-set completedAt
    if (body.status === "DONE") {
      data.completedAt = new Date();
    } else if (body.status && body.status !== "DONE") {
      data.completedAt = null;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const task = await (prisma as any).operationalTask.update({
      where: { id },
      data,
    });

    return NextResponse.json({ task });
  } catch (err) {
    console.error("[PATCH /api/tasks/[id]]", err);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
