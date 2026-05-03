#!/bin/bash
# Setup Stripe webhook for production
# Requires: stripe CLI logged in, STRIPE_SECRET_KEY set

ENDPOINT="https://aerojet.app/api/webhooks/stripe"
EVENT="checkout.session.completed"

echo "-> Creating Stripe webhook endpoint: $ENDPOINT"
stripe webhooks create \
  --url="$ENDPOINT" \
  --events="$EVENT"

echo "-> Webhook created. Copy the signing secret (whsec_...) to:"
echo "   Vercel env: STRIPE_WEBHOOK_SECRET"
echo ""
echo "   Run: vercel env rm STRIPE_WEBHOOK_SECRET production --yes"
echo "   Then: printf 'whsec_YOUR_SECRET' | vercel env add STRIPE_WEBHOOK_SECRET production"
