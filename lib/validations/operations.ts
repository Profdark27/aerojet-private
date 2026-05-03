import { z } from 'zod'

export const TaskUpdateSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  assignedTo: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  vendorName: z.string().optional(),
  vendorContact: z.string().optional(),
  externalReference: z.string().optional(),
  cost: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  notesInternal: z.string().optional(),
  notesClient: z.string().optional(),
  isClientVisible: z.boolean().optional(),
})

export const BookingUpdateSchema = z.object({
  flightStatus: z.enum(['SCHEDULED', 'AIRBORNE', 'ARRIVED', 'DELAYED', 'CANCELLED']).optional(),
  tailNumber: z.string().max(20).optional(),
  handlingAgentFrom: z.string().optional(),
  handlingAgentTo: z.string().optional(),
  notesInternal: z.string().optional(),
})

export const DocumentUpdateSchema = z.object({
  status: z.enum(['PENDING', 'UPLOADED', 'VERIFIED', 'REJECTED']).optional(),
  notesInternal: z.string().optional(),
  notesClient: z.string().optional(),
})
