#!/bin/bash
# AeroJet Production Deploy Script
set -e

echo "=== AeroJet Production Deploy ==="

# 1. Generate Prisma client
echo "-> Generating Prisma client..."
npx prisma generate

# 2. Build
echo "-> Building..."
npm run build

# 3. Deploy to Vercel
echo "-> Deploying to Vercel production..."
vercel --prod

# 4. Run DB migrations on production
echo "-> Syncing DB schema..."
# Uncomment after verifying DATABASE_URL is set correctly for production:
# npx prisma db push

echo "=== Deploy complete ==="
echo "Visit: https://aerojet-private.com"
