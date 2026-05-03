import prisma from '@/lib/prisma'

export async function createAuditLog({
  userId,
  action,
  entityType,
  entityId,
  oldValue,
  newValue,
  metadata
}: {
  userId?: string
  action: string
  entityType: string
  entityId: string
  oldValue?: any
  newValue?: any
  metadata?: any
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        entityType,
        entityId,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : undefined,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : undefined,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : undefined,
      }
    })
  } catch (error) {
    // We don't want to fail the main transaction if logging fails, 
    // but we should log it to the console for debugging
    console.error('CRITICAL: Audit logging failed:', error)
  }
}
