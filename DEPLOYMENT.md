# AeroJet Private — Deployment Guide

## Production URLs
- **Live site:** https://aerojet-private.vercel.app (current production)
- **Custom domain (to configure):** https://aerojet-private.com

---

## 1. DNS Configuration (Registrar)

To point aerojet-private.com to Vercel, set these records in your domain registrar:

| Type  | Name | Value                    |
|-------|------|--------------------------|
| A     | @    | 76.76.21.21              |
| CNAME | www  | cname.vercel-dns.com     |

Then add the domain in Vercel Dashboard:
Settings > Domains > Add > aerojet-private.com

---

## 2. Required Environment Variables (Vercel Dashboard)

Go to: Settings > Environment Variables > Add New

### Critical (must be set for production)
```
DATABASE_URL=postgresql://...          # Neon/Supabase/PlanetScale connection string
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=https://aerojet-private.com
NEXT_PUBLIC_BASE_URL=https://aerojet-private.com
```

### Stripe (live keys for production)
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Email
```
BROKER_EMAIL=corrado@aerojet-private.com
RESEND_API_KEY=re_...
```

### Optional
```
NEXT_PUBLIC_WHATSAPP_NUMBER=+39...
NEXT_PUBLIC_USE_DEV_AUTH=false
ANTHROPIC_API_KEY=sk-ant-...
```

---

## 3. Stripe Webhook Configuration

After deploying, update the Stripe webhook endpoint:
1. Go to Stripe Dashboard > Developers > Webhooks
2. Set endpoint URL to: https://aerojet-private.com/api/webhooks/stripe
3. Select events: checkout.session.completed, payment_intent.payment_failed
4. Copy the webhook signing secret to STRIPE_WEBHOOK_SECRET env var

---

## 4. Build Notes

### Next.js 16 Compatibility
- The `eslint` key in `next.config.ts` is NOT supported in Next.js 16
- ESLint config must be in `eslint.config.mjs` or `.eslintrc`
- `typescript.ignoreBuildErrors: true` IS still supported

### Build Command (vercel.json)
```
npm run build
```

### Prisma
- Prisma Client is auto-generated during npm install via postinstall
- If Prisma errors occur, add to build command: `npx prisma generate && npm run build`

---

## 5. API Routes Reference

| Route | Auth Required | Description |
|-------|---------------|-------------|
| GET /api/bookings | BROKER/ADMIN | List all bookings (paginated) |
| GET /api/booking/by-session | No | Get booking by Stripe session ID |
| GET /api/quotes | BROKER/ADMIN | List quotes |
| GET /api/notifications | BROKER/ADMIN | Real-time SSE notifications |
| GET /api/track | BROKER/ADMIN | Analytics tracking data |
| POST /api/inquiries | No | Submit new inquiry |
| POST /api/checkout/quote | No | Start Stripe checkout for quote |
| POST /api/webhooks/stripe | Stripe signature | Handle payment events |
| GET /api/health | No | Health check |

---

## 6. Checklist Before Going Live

- [ ] Custom domain aerojet-private.com added in Vercel and DNS propagated
- [ ] NEXTAUTH_URL set to https://aerojet-private.com
- [ ] NEXT_PUBLIC_BASE_URL set to https://aerojet-private.com
- [ ] STRIPE_WEBHOOK_SECRET set to live webhook secret
- [ ] STRIPE_SECRET_KEY set to live key (not test)
- [ ] DATABASE_URL connected to production database
- [ ] BROKER_EMAIL set to real email address
- [ ] Verify /accept-quote/[valid-id] loads correctly with a real quote ID
- [ ] Verify /booking/success?session_id=... shows real booking data after payment
