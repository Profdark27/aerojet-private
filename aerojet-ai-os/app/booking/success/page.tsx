"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

function fmt(amount: number, currency = "EUR") {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// ─────────────────────────────────────────────────────────────────
// Codice DETERMINISTICO — nessun Math.random()
// Usa il quoteId dal query param "ref" o il stripeSessionId "sid"
// ─────────────────────────────────────────────────────────────────
function buildConfirmationCode(ref: string | null, sid: string | null): string {
  const stable = ref || sid || "AEROJET";
  return "AJ-" + stable.slice(-6).toUpperCase();
}

function SuccessContent() {
  const params = useSearchParams();
  const from = params.get("from") ?? "Partenza";
  const to = params.get("to") ?? "Destinazione";
  const deposit = Number(params.get("deposit") ?? 0);
  const currency = params.get("currency") ?? "EUR";
  const ref = params.get("ref"); // quoteId
  const sid = params.get("sid"); // stripeSessionId
  const isMock = params.get("mock") === "true";

  // Deterministico — stabile tra server e client
  const confirmationCode = buildConfirmationCode(ref, sid);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#080808",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: "40px", textAlign: "center" }}>
        <span
          style={{ color: "#B8973A", fontSize: "11px", letterSpacing: "4px" }}
        >
          ✦ AEROJET PRIVATE
        </span>
      </div>

      {/* Icon */}
      <div
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "50%",
          border: "2px solid #B8973A",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "32px",
          fontSize: "24px",
        }}
      >
        ✦
      </div>

      <h1
        style={{
          fontSize: "32px",
          fontWeight: "400",
          marginBottom: "12px",
          textAlign: "center",
        }}
      >
        Prenotazione Confermata
      </h1>
      <p
        style={{
          color: "#888",
          fontSize: "15px",
          marginBottom: "48px",
          textAlign: "center",
        }}
      >
        Il suo volo privato{" "}
        <strong style={{ color: "#fff" }}>
          {from} → {to}
        </strong>
      </p>

      {/* Card */}
      <div
        style={{
          maxWidth: "540px",
          width: "100%",
          border: "1px solid #1e1e1e",
          background: "#0f0f0f",
          padding: "40px",
          marginBottom: "24px",
        }}
      >
        <p
          style={{
            color: "#B8973A",
            fontSize: "10px",
            letterSpacing: "3px",
            textAlign: "center",
            marginBottom: "16px",
          }}
        >
          CODICE PRENOTAZIONE
        </p>
        <p
          style={{
            fontSize: "32px",
            letterSpacing: "6px",
            color: "#C9A84C",
            fontWeight: "300",
            textAlign: "center",
            marginBottom: "32px",
          }}
        >
          {confirmationCode}
        </p>

        <div
          style={{
            borderTop: "1px solid #1a1a1a",
            paddingTop: "24px",
          }}
        >
          {[
            { label: "Rotta", value: `${from} → ${to}` },
            {
              label: "Deposito pagato",
              value: fmt(deposit, currency),
              color: "#4ade80",
            },
            {
              label: "Status",
              value: "Operativo in corso",
              color: "#4ade80",
            },
            {
              label: "Prossimo step",
              value: "Il concierge La contatterà entro 2 ore",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                padding: "12px 0",
                borderBottom: "1px solid #0f0f0f",
              }}
            >
              <span style={{ color: "#555", fontSize: "13px" }}>
                {item.label}
              </span>
              <span
                style={{
                  color: item.color ?? "#fff",
                  fontSize: "13px",
                  textAlign: "right",
                  maxWidth: "60%",
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
        </div>

        <p
          style={{
            color: "#444",
            fontSize: "12px",
            marginTop: "24px",
            lineHeight: "1.8",
          }}
        >
          Il team Aerojet sta finalizzando i dettagli operativi con
          l&apos;operatore, FBO e servizi a bordo. Riceverà un aggiornamento
          completo non appena la verifica sarà conclusa.
        </p>
      </div>

      {/* Mock badge */}
      {isMock && (
        <div
          style={{
            maxWidth: "540px",
            width: "100%",
            textAlign: "center",
            background: "#111100",
            border: "1px solid #2a2a00",
            padding: "12px",
            marginBottom: "24px",
            fontSize: "11px",
            color: "#666",
            letterSpacing: "1px",
          }}
        >
          MODALITÀ DEVELOPMENT — NESSUN PAGAMENTO REALE EFFETTUATO
        </div>
      )}

      {/* Email note */}
      <p
        style={{
          color: "#444",
          fontSize: "12px",
          marginBottom: "32px",
          textAlign: "center",
          lineHeight: "1.8",
        }}
      >
        Una conferma è stata inviata alla sua email.
        <br />
        Per assistenza:{" "}
        <a href="mailto:concierge@aerojet.app" style={{ color: "#B8973A" }}>
          concierge@aerojet.app
        </a>
      </p>

      {/* CTAs */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          href="/"
          style={{
            padding: "14px 32px",
            border: "1px solid #222",
            color: "#666",
            textDecoration: "none",
            fontSize: "11px",
            letterSpacing: "2px",
          }}
        >
          TORNA AL SITO
        </Link>
        <Link
          href="/dashboard"
          style={{
            padding: "14px 32px",
            background: "#B8973A",
            color: "#000",
            textDecoration: "none",
            fontSize: "11px",
            letterSpacing: "2px",
            fontWeight: "700",
          }}
        >
          AREA PERSONALE
        </Link>
      </div>
    </main>
  );
}

// Suspense obbligatorio per useSearchParams in Next.js App Router
export default function BookingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: "#080808",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#B8973A",
            fontFamily: "Georgia, serif",
            letterSpacing: "3px",
            fontSize: "12px",
          }}
        >
          CARICAMENTO...
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
