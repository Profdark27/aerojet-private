import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { TaskUpdateSchema } from '@/lib/validations/operations'
import { createAuditLog } from '@/lib/audit/logger'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()

  if (!session || session.user.role !== 'BROKER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params
    const body = await req.json()

    // 1. Validate Input
    const validated = TaskUpdateSchema.safeParse(body)
    if (!validated.success) {
      return NextResponse.json({ error: 'Invalid data', details: validated.error.format() }, { status: 400 })
    }

    // 2. Get current state for audit log
    const currentTask = await prisma.operationalTask.findUnique({
      where: { id }
    })

    if (!currentTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    // 3. Update Task
    const updatedTask = await prisma.operationalTask.update({
      where: { id },
      data: validated.data
    })

    // 4. Audit Log
    void createAuditLog({
      userId: session.user.id,
      action: 'TASK_UPDATE',
      entityType: 'OperationalTask',
      entityId: id,
      oldValue: currentTask,
      newValue: updatedTask,
      metadata: {
        ip: req.headers.get('x-forwarded-for') || 'local',
        userAgent: req.headers.get('user-agent')
      }
    })

    // 5. Client Notification
    if (updatedTask.isClientVisible && updatedTask.status !== currentTask.status) {
      const { notifyClientOfTaskUpdate } = await import('@/lib/operations/notifications')
      void notifyClientOfTaskUpdate(id)
    }

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Failed to update operational task:', error)
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 })
  }
}
