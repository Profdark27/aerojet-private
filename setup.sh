#!/bin/bash
# ═══════════════════════════════════════════════════════════
# AEROJET PRIVATE — Setup automatico per Windows (WSL/Linux)
# Esegui con: bash setup.sh
# ═══════════════════════════════════════════════════════════

set -e

GOLD='\033[0;33m'
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo ""
echo -e "${GOLD}  ✦  AEROJET PRIVATE — Setup${NC}"
echo -e "${GOLD}  ════════════════════════════${NC}"
echo ""

# Controlla Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js non trovato. Installalo prima:${NC}"
    echo "   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "   sudo apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js 18+ richiesto. Versione attuale: $(node --version)${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Node.js $(node --version) trovato${NC}"

# Installa dipendenze
echo ""
echo -e "${GOLD}📦 Installazione dipendenze...${NC}"
npm install

# Crea .env.local se non esiste
if [ ! -f ".env.local" ]; then
    echo ""
    echo -e "${GOLD}⚙️  Configurazione ambiente...${NC}"
    cp .env.example .env.local
    echo -e "${GREEN}✓ .env.local creato da .env.example${NC}"
    echo -e "  → Modifica .env.local con le tue chiavi API"
fi

# Genera Prisma client
echo ""
echo -e "${GOLD}🗄️  Setup database...${NC}"
npx prisma generate
npx prisma db push --accept-data-loss 2>/dev/null || echo -e "  → Database push opzionale (SQLite)"

# Seed
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts 2>/dev/null || echo -e "  → Seed skippato (ts-node non disponibile)"

echo ""
echo -e "${GOLD}  ════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}  ✅ Setup completato!${NC}"
echo ""
echo -e "  ${GOLD}npm run dev${NC}  →  http://localhost:3000"
echo ""
echo -e "  ${BOLD}Route principali:${NC}"
echo -e "  /               Landing page luxury"
echo -e "  /search         Ricerca voli"
echo -e "  /dashboard      Broker area"
echo ""
echo -e "  ${BOLD}Per abilitare l'AI concierge Marco:${NC}"
echo -e "  Aggiungi ${GOLD}ANTHROPIC_API_KEY${NC} in .env.local"
echo -e "  (https://console.anthropic.com/)"
echo ""
echo -e "  ${BOLD}Per prezzi live Avinode:${NC}"
echo -e "  Aggiungi ${GOLD}AVINODE_API_KEY${NC} in .env.local"
echo -e "  (https://www.avinode.com/become-a-member)"
echo ""
