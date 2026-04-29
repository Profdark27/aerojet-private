import Navbar from '@/components/luxury/Navbar'
import Footer from '@/components/luxury/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Informativa sul trattamento dei dati personali di Aerojet Private, conforme al GDPR.',
}

const sections = [
  {
    title: '1. Titolare del Trattamento',
    body: `Aerojet Private S.r.l., con sede legale in Milano, Italia, è il Titolare del Trattamento dei dati personali raccolti tramite la piattaforma.

Per esercitare i diritti previsti dal GDPR o per qualsiasi richiesta relativa alla privacy, scrivere a: privacy@aerojet.app`,
  },
  {
    title: '2. Dati Raccolti',
    body: `Raccogliamo i seguenti dati personali:

• Dati identificativi: nome, cognome, indirizzo email, numero di telefono
• Dati aziendali: ragione sociale, partita IVA (facoltativi)
• Dati di navigazione: indirizzo IP, cookie tecnici, pagine visitate
• Dati di prenotazione: rotte richieste, date di volo, numero di passeggeri
• Dati di pagamento: gestiti esclusivamente da Stripe (non conserviamo dati della carta)`,
  },
  {
    title: '3. Finalità del Trattamento',
    body: `I dati personali sono trattati per:

• Erogazione del servizio di intermediazione charter (base giuridica: esecuzione del contratto)
• Comunicazioni relative alla prenotazione, preventivi e conferme (base giuridica: esecuzione del contratto)
• Alert Empty Legs e comunicazioni commerciali, solo con consenso esplicito (base giuridica: consenso)
• Obblighi fiscali e legali (base giuridica: obbligo legale)
• Miglioramento della piattaforma tramite analytics aggregati (base giuridica: legittimo interesse)`,
  },
  {
    title: '4. Conservazione dei Dati',
    body: `I dati vengono conservati per il tempo strettamente necessario alle finalità indicate:

• Dati di prenotazione: 10 anni (obblighi fiscali)
• Dati di contatto (marketing): fino alla revoca del consenso
• Log di navigazione: 12 mesi
• Dati degli account inattivi: eliminati dopo 36 mesi di inattività`,
  },
  {
    title: '5. Condivisione dei Dati',
    body: `I dati personali possono essere comunicati a:

• Operatori aerei certificati, per la realizzazione del volo prenotato
• Stripe Inc., per il processamento dei pagamenti (soggetto a Privacy Shield / clausole contrattuali standard)
• Resend Inc., per l'invio delle comunicazioni email
• Autorità competenti, ove richiesto dalla legge

I dati non vengono mai venduti a terzi né utilizzati per finalità pubblicitarie di terze parti.`,
  },
  {
    title: '6. I Suoi Diritti (GDPR)',
    body: `In qualità di interessato, ha diritto a:

• Accesso: ottenere copia dei dati personali in nostro possesso
• Rettifica: correggere dati inesatti o incompleti
• Cancellazione ("diritto all'oblio"): richiedere la cancellazione dei dati
• Limitazione: richiedere la limitazione del trattamento
• Portabilità: ricevere i dati in formato strutturato e leggibile
• Opposizione: opporsi al trattamento per legittimo interesse

Per esercitare questi diritti: privacy@aerojet.app. Risposta entro 30 giorni.`,
  },
  {
    title: '7. Cookie',
    body: `Utilizziamo esclusivamente cookie tecnici necessari al funzionamento della piattaforma (sessione, autenticazione). Non utilizziamo cookie di profilazione o di terze parti per scopi pubblicitari.

La navigazione sulla piattaforma implica il consenso all'uso dei cookie tecnici. Per i cookie analitici (dati aggregati anonimi), richiediamo il consenso esplicito.`,
  },
]

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#0A0C14', paddingTop: 100 }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '64px 32px' }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>LEGAL</div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 300, marginBottom: 12, letterSpacing: 1 }}>Privacy Policy</h1>
          <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 60 }}>
            Ultimo aggiornamento: Aprile 2026 · Conforme al GDPR (Reg. UE 2016/679)
          </p>
          {sections.map(({ title, body }) => (
            <div key={title} style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
              <h2 style={{ fontSize: 22, fontWeight: 400, marginBottom: 20, color: '#F0EDE6' }}>{title}</h2>
              {body.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontSize: 15, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.85, marginBottom: 16, whiteSpace: 'pre-line' }}>{para}</p>
              ))}
            </div>
          ))}
          <div style={{ padding: '24px 32px', background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)' }}>
            <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.7, margin: 0 }}>
              Per reclami o richieste riguardanti la privacy:{' '}
              <a href="mailto:privacy@aerojet.app" style={{ color: '#C9A84C', textDecoration: 'none' }}>privacy@aerojet.app</a>
              <br />
              Garante Privacy Italiano:{' '}
              <a href="https://www.garanteprivacy.it" target="_blank" rel="noopener noreferrer" style={{ color: '#C9A84C', textDecoration: 'none' }}>garanteprivacy.it</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
