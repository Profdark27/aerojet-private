import Navbar from '@/components/luxury/Navbar'
import Footer from '@/components/luxury/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termini di Servizio',
  description: 'Termini e condizioni di utilizzo della piattaforma Aerojet Private.',
}

const sections = [
  {
    title: '1. Definizioni e Ambito',
    body: `Aerojet Private ("la Piattaforma") è un servizio di intermediazione per la prenotazione di voli privati. L'utente ("Cliente") utilizza la Piattaforma per richiedere preventivi e prenotare servizi di charter aereo tramite operatori certificati EASA/FAA.

La Piattaforma agisce esclusivamente come broker e non è un operatore aereo. I contratti di trasporto vengono stipulati direttamente tra il Cliente e l'operatore aereo certificato.`,
  },
  {
    title: '2. Prenotazioni e Pagamenti',
    body: `Al momento della prenotazione, il Cliente versa un deposito del 30% del valore totale del charter. Il saldo residuo (70%) è dovuto entro 72 ore prima della partenza.

I pagamenti vengono processati tramite Stripe, provider certificato PCI DSS Level 1. Aerojet Private non conserva i dati della carta di credito del Cliente.

In caso di cancellazione da parte del Cliente entro 72 ore dalla partenza, il deposito non è rimborsabile salvo cause di forza maggiore documentate.`,
  },
  {
    title: '3. Commissioni del Broker',
    body: `Aerojet Private percepisce una commissione sull'importo del charter, tipicamente compresa tra il 10% e il 15%. La commissione è inclusa nel prezzo presentato al Cliente e non viene addebitata separatamente.

I broker registrati sulla piattaforma ricevono una percentuale della commissione concordata al momento della registrazione.`,
  },
  {
    title: '4. Responsabilità',
    body: `Aerojet Private non è responsabile per ritardi, cancellazioni o modifiche ai voli causate da condizioni meteorologiche avverse, decisioni delle autorità aeronautiche o cause di forza maggiore.

La responsabilità dell'operatore aereo verso il passeggero è regolata dalla normativa applicabile (Regolamento CE 261/2004 per i voli intracomunitari) e dalle condizioni generali di trasporto dell'operatore.`,
  },
  {
    title: '5. Privacy e Dati Personali',
    body: `Il trattamento dei dati personali è regolato dalla nostra Privacy Policy, conforme al GDPR (Regolamento UE 2016/679). I dati raccolti vengono utilizzati esclusivamente per l'erogazione del servizio e non vengono ceduti a terzi, salvo agli operatori aerei per la realizzazione del volo prenotato.`,
  },
  {
    title: '6. Broker Disclaimer',
    body: `Aerojet Private opera come intermediario/broker indipendente per richieste di voli privati e charter. Aerojet Private non è una compagnia aerea, non opera direttamente aeromobili e non emette autonomamente titoli di trasporto aereo. Le operazioni di volo sono eseguite esclusivamente da operatori aerei autorizzati e certificati secondo la normativa applicabile (inclusi Regolamento (UE) n. 965/2012 e relativi atti di esecuzione EASA).

Ogni disponibilità, quotazione e conferma di volo è soggetta a verifica operativa, documentale, meteorologica, aeroportuale, slot, equipaggio e approvazione dell'operatore certificato. Nessuna richiesta inoltrata tramite la Piattaforma costituisce prenotazione confermata fino alla ricezione di conferma scritta da parte dell'operatore aereo e al perfezionamento del contratto di trasporto.`,
  },
  {
    title: '7. Tariffe e Disclaimer Prezzi',
    body: `Le tariffe indicate sulla Piattaforma, ove presenti, sono stime indicative e non vincolanti. Il prezzo finale del servizio di charter dipende da: disponibilità dell'aeromobile, tratta e aeroporti selezionati, ore di volo effettive, riposizionamento (ferry flight), tasse aeroportuali e di handling, permessi di sorvolo, catering e servizi accessori, ore di duty time dell'equipaggio, operazioni di de-icing, slot availability e condizioni operative al momento della conferma.

Il Cliente riceverà una quotazione scritta personalizzata prima di qualsiasi impegno economico. Nessun addebito verrà effettuato senza previo accordo scritto.`,
  },
  {
    title: '8. Verifica Operatori',
    body: `Aerojet Private seleziona e propone operatori sulla base delle informazioni disponibili relative ad autorizzazioni, certificazioni (EASA Part-OPS, FAA, AOC), assicurazioni e idoneità operativa dichiarata. La Piattaforma effettua una verifica preliminare, ma non garantisce la completezza o l'aggiornamento continuo delle certificazioni degli operatori in ogni giurisdizione.

La responsabilità dell'operazione di volo e del trasporto aereo resta interamente in capo al vettore operativo certificato. Il contratto di trasporto viene stipulato direttamente tra il Cliente e l'operatore aereo.`,
  },
  {
    title: '9. Diritti del Passeggero',
    id: 'passenger-rights',
    body: `In caso di cancellazione del volo, ritardo prolungato o negato imbarco, i diritti del passeggero dipendono dal tipo di volo (charter vs. linea), dall'aeroporto di partenza e arrivo, dal vettore operativo e dalla normativa applicabile.

Il Regolamento (CE) n. 261/2004 (diritti passeggeri) può applicarsi in determinati casi ai voli charter operati in partenza da aeroporti dell'Unione Europea. L'ente nazionale di controllo designato in Italia è ENAC (Ente Nazionale per l'Aviazione Civile). Per informazioni: enac.gov.it.

Aerojet Private, in qualità di broker, supporta il Cliente nelle comunicazioni con l'operatore, ma la gestione delle compensazioni e degli obblighi verso il passeggero compete al vettore operativo.`,
  },
  {
    title: '10. Legge Applicabile e Foro Competente',
    body: `I presenti Termini sono regolati dalla legge italiana. Per qualsiasi controversia derivante dall'utilizzo della Piattaforma, il foro competente è quello di Milano, salvo diversa prescrizione inderogabile di legge applicabile al consumatore.`,
  },
]

export default function TermsPage() {
  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: '#0A0C14', paddingTop: 100 }}>
        <div style={{ maxWidth: 780, margin: '0 auto', padding: '64px 32px' }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#C9A84C', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 16 }}>LEGAL</div>
          <h1 style={{ fontSize: 'clamp(36px,5vw,52px)', fontWeight: 300, marginBottom: 12, letterSpacing: 1 }}>Termini di Servizio</h1>
          <p style={{ fontSize: 14, color: 'rgba(240,237,230,0.35)', fontFamily: 'Helvetica Neue, sans-serif', marginBottom: 60 }}>
            Ultimo aggiornamento: Aprile 2026
          </p>
          <p style={{ fontSize: 16, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.9, marginBottom: 56 }}>
            Utilizzando la piattaforma Aerojet Private, l&apos;utente accetta i presenti Termini di Servizio nella loro interezza. Si prega di leggerli attentamente prima di procedere con qualsiasi prenotazione.
          </p>
          {sections.map((section) => (
            <div key={section.title} id={'id' in section ? (section as { id?: string }).id : undefined} style={{ marginBottom: 48, paddingBottom: 48, borderBottom: '1px solid rgba(201,168,76,0.08)' }}>
              <h2 style={{ fontSize: 22, fontWeight: 400, marginBottom: 20, color: '#F0EDE6' }}>{section.title}</h2>
              {section.body.split('\n\n').map((para, i) => (
                <p key={i} style={{ fontSize: 15, color: 'rgba(240,237,230,0.6)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.85, marginBottom: 16 }}>{para}</p>
              ))}
            </div>
          ))}
          <div style={{ padding: '24px 32px', background: '#0F1220', border: '1px solid rgba(201,168,76,0.12)', marginTop: 16 }}>
            <p style={{ fontSize: 13, color: 'rgba(240,237,230,0.4)', fontFamily: 'Helvetica Neue, sans-serif', lineHeight: 1.7, margin: 0 }}>
              Per qualsiasi domanda relativa ai presenti Termini, contattare:{' '}
              <a href="mailto:legal@aerojet.app" style={{ color: '#C9A84C', textDecoration: 'none' }}>legal@aerojet.app</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
