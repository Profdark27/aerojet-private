#!/bin/bash
# Sync Prisma schema to production DB
# Run once after first deploy or after schema changes
# Requires: DATABASE_URL env var set to Neon PostgreSQL URL

echo "-> Syncing Prisma schema to production..."
npx prisma db push --accept-data-loss
echo "Done"
