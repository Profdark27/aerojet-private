#!/bin/bash
# Register Stripe webhook via API (no CLI needed)
# Usage: STRIPE_SECRET_KEY=sk_live_xxx bash register-stripe-webhook.sh

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "ERROR: STRIPE_SECRET_KEY not set"
  echo "Usage: STRIPE_SECRET_KEY=sk_live_xxx bash register-stripe-webhook.sh"
  exit 1
fi

curl https://api.stripe.com/v1/webhook_endpoints \
  -u "$STRIPE_SECRET_KEY:" \
  -d "url=https://aerojet.app/api/webhooks/stripe" \
  -d "enabled_events[]=checkout.session.completed" \
  -d "enabled_events[]=payment_intent.payment_failed" \
  -d "description=AeroJet production webhook"
