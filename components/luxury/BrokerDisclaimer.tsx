/**
 * BrokerDisclaimer — componente riusabile per disclaimer legali aviation.
 * Da includere in footer, pagine booking, form preventivo.
 * Testi legal-ready da far validare a consulente legale prima del go-live.
 */

interface BrokerDisclaimerProps {
  variant?: 'full' | 'compact' | 'pricing' | 'passenger_rights'
  style?: React.CSSProperties
}

const TEXTS = {
  broker: `Aerojet Private opera come intermediario/broker indipendente per richieste di voli privati e charter. Non è una compagnia aerea, non opera direttamente aeromobili e non emette autonomamente titoli di trasporto aereo. Le operazioni di volo sono eseguite esclusivamente da operatori aerei autorizzati e certificati. Ogni disponibilità, quotazione e conferma è soggetta a verifica operativa, meteorologica, aeroportuale, slot, equipaggio e approvazione dell'operatore.`,

  pricing: `Le tariffe indicate, ove presenti, sono stime indicative non vincolanti. Il prezzo finale dipende da disponibilità aeromobile, tratta, aeroporti, riposizionamento, tasse aeroportuali, handling, duty time equipaggio, catering, servizi accessori e condizioni operative al momento della conferma.`,

  passenger_rights: `In caso di disservizi, cancellazioni, ritardi o negato imbarco, i diritti del passeggero dipendono dal tipo di volo, dal vettore operativo, dall'aeroporto e dalla normativa applicabile, incluso il Regolamento (CE) n. 261/2004 ove applicabile. L'ente nazionale di controllo in Italia è ENAC.`,

  operator: `Aerojet Private seleziona e propone operatori sulla base delle informazioni disponibili relative ad autorizzazioni, certificazioni EASA/FAA, assicurazioni e idoneità operativa. La responsabilità dell'operazione di volo resta in capo al vettore operativo.`,
}

export default function BrokerDisclaimer({ variant = 'full', style }: BrokerDisclaimerProps) {
  const baseStyle: React.CSSProperties = {
    fontSize: 11,
    color: 'rgba(240,237,230,0.28)',
    fontFamily: 'Helvetica Neue, sans-serif',
    lineHeight: 1.7,
    ...style,
  }

  if (variant === 'compact') {
    return (
      <p style={baseStyle}>
        Aerojet Private opera come broker indipendente. Quotazioni indicative soggette a verifica operatore.{' '}
        <a href="/terms" style={{ color: 'rgba(201,168,76,0.5)', textDecoration: 'none' }}>Termini</a>
        {' · '}
        <a href="/privacy" style={{ color: 'rgba(201,168,76,0.5)', textDecoration: 'none' }}>Privacy</a>
      </p>
    )
  }

  if (variant === 'pricing') {
    return (
      <p style={baseStyle}>{TEXTS.pricing}</p>
    )
  }

  if (variant === 'passenger_rights') {
    return (
      <p style={baseStyle}>{TEXTS.passenger_rights}</p>
    )
  }

  // Full
  return (
    <div style={{ borderTop: '1px solid rgba(201,168,76,0.08)', paddingTop: 24, ...style }}>
      {[TEXTS.broker, TEXTS.pricing, TEXTS.operator].map((text, i) => (
        <p key={i} style={{ ...baseStyle, marginBottom: 10 }}>{text}</p>
      ))}
      <p style={{ ...baseStyle, marginBottom: 0 }}>
        <a href="/terms" style={{ color: 'rgba(201,168,76,0.45)', textDecoration: 'none' }}>Termini di Servizio</a>
        {' · '}
        <a href="/privacy" style={{ color: 'rgba(201,168,76,0.45)', textDecoration: 'none' }}>Privacy Policy</a>
        {' · '}
        <a href="/terms#passenger-rights" style={{ color: 'rgba(201,168,76,0.45)', textDecoration: 'none' }}>Diritti Passeggeri</a>
      </p>
    </div>
  )
}
