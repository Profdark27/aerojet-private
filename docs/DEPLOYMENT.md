# Aerojet Private - Deployment Checklist

**URL repository GitHub:** [https://github.com/Profdark27/aerojet-private](https://github.com/Profdark27/aerojet-private)

Questo documento traccia i passaggi e i requisiti necessari per portare con successo il progetto online sulla piattaforma Vercel. Il sistema implementa una forte resilienza agli errori ("graceful degradation"), pertanto gran parte dei servizi accessori può funzionare in "mock mode" qualora le relative chiavi API non fossero immediatamente fornite.

## 1. Importazione su Vercel

1.  Accedi alla tua dashboard su [Vercel](https://vercel.com/dashboard).
2.  Clicca su **Add New...** e seleziona **Project**.
3.  Seleziona il repository `aerojet-private` dalla lista dei tuoi progetti GitHub e clicca **Import**.
4.  Mantieni il "Framework Preset" rilevato in automatico (Next.js).

## 2. Variabili d'Ambiente (ENV)

Prima di cliccare "Deploy", devi popolare la sezione **Environment Variables**. Le variabili sono divise in due categorie in base alla loro criticità.

### 🔴 Obbligatorie Minime (Senza queste, il login e il database andranno in crash in produzione)
Queste tre variabili devono essere fornite *prima* del primo avvio per garantire l'accesso al sistema.
*   `DATABASE_URL`: La stringa di connessione fornita dal tuo database Postgres (es. Supabase, Neon, Vercel Postgres).
*   `NEXTAUTH_SECRET`: Stringa casuale (genera con `openssl rand -base64 32`) per criptare i token delle sessioni.
*   `RESEND_API_KEY`: API Key di Resend, necessaria per recapitare i Magic Link alla mail degli utenti.

### 🟡 Opzionali / Fallback (Il sistema continuerà a funzionare con mock o avvisi)
*   `STRIPE_SECRET_KEY`: Senza questa chiave, il checkout andrà in modalità "Mock", simulando un acquisto e saltando l'infrastruttura reale.
*   `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Vedi sopra.
*   `STRIPE_WEBHOOK_SECRET`: Senza questa chiave, le firme dei webhook non verranno verificate (comportamento "dev-mode").
*   `ANTHROPIC_API_KEY`: Se mancante, il concierge AI (Marco) restituirà in chat un elegante avviso di manutenzione.
*   `NEXT_PUBLIC_WHATSAPP_NUMBER`: Numero per la prenotazione manuale. Se mancante, il bottone reindirizzerà a un placeholder generico.

## 3. Sincronizzazione Database (Prisma)

Prima che Vercel termini la compilazione, devi instanziare lo schema sul tuo DB di produzione appena creato.
Apri PowerShell sul tuo computer locale, inserisci il `DATABASE_URL` effettivo, ed esegui il push dello schema:

```powershell
$env:DATABASE_URL="LA_TUA_STRINGA_DEL_DATABASE_PROD"
npx prisma db push
```

## 4. Checklist Test Post-Deploy

Una volta ottenuto il bollino verde su Vercel, visita l'URL di produzione ed esegui la seguente verifica incrociata:

- [ ] L'**Homepage** si carica istantaneamente senza artefatti o 404 (Placeholder o Immagini Live).
- [ ] La rotta `/api/health` restituisce un JSON formato con code `207 Multi-Status`.
- [ ] La rotta `/api/avinode/empty-legs` restituisce la lista json `200 OK`.
- [ ] La pagina `/login` renderizza il form.
- [ ] Inserendo l'email, l'invio restituisce successo. Il link "Magic Link" arriva nella casella email indicata tramite Resend.
- [ ] Cliccando il link dall'email, si accede a `/dashboard` con lo stato auth correttamente popolato in alto a destra.
- [ ] Il processo di checkout (deposito volo) raggiunge la /booking/success. A seconda degli ENV, usa il finto mock URL o le vere schermate Stripe.
- [ ] Interrogando la pagina, il widget Chat in basso a destra si apre. Risponde come "Marco" (Live via Anthropic) oppure restituisce il corretto testo di fallback di configurazione.
