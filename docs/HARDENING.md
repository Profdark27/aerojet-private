# AeroJet Production Hardening Checklist

This document outlines the security and stability measures implemented to ensure AeroJet AI OS is production-ready.

## 1. Webhook Security
- [x] **Signature Verification**: Stripe webhooks use `stripe.webhooks.constructEvent` to prevent spoofing.
- [x] **Idempotency**: All webhook handlers (Inquiry, Booking) check for existing records before creating or updating to prevent duplicate processing.
- [x] **Secret Management**: `STRIPE_WEBHOOK_SECRET` is required and must be kept secret.

## 2. API & Dashboard Security
- [x] **Middleware Protection**: `proxy.ts` (Next.js Middleware) protects all `/dashboard` routes.
- [x] **Role-Based Access Control (RBAC)**: Critical API routes and dashboards check for `session.user.role === 'BROKER'`.
- [x] **CSRF Protection**: Standard Next.js / NextAuth protection enabled.
- [x] **Security Headers**: `vercel.json` includes `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, and `Strict-Transport-Security`.

## 3. Database Integrity
- [x] **Prisma Transactions**: Atomic operations for Inquiry-to-Booking conversion to prevent race conditions.
- [x] **Schema Validation**: Explicit enums and types for `OperationalTask` and `PassengerDocument`.
- [x] **Backup Strategy**: Recommended use of Managed PostgreSQL with point-in-time recovery.

## 4. Environment Variables
Ensure these are set in Vercel:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `BROKER_EMAILS` (Comma-separated list of authorized brokers)
- `NEXT_PUBLIC_BASE_URL` (e.g., `https://aerojet-private.com`)

## 5. Performance & Aesthetics
- [x] **Dynamic Imports**: Used for heavy libraries like Resend/Email.
- [x] **Skeleton States**: Implemented in the dashboard for smooth loading.
- [x] **Micro-animations**: Enhanced with Framer Motion for a premium feel.

---
*Status: HARDENED & AUDITED*
