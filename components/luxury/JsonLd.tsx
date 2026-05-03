import React from 'react'

export default function JsonLd() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "PrivateJetCharter",
    "name": "AeroJet Private",
    "url": "https://aerojet-private.com",
    "logo": "https://aerojet-private.com/logo.png",
    "description": "Servizio di brokeraggio aereo di lusso. Voli privati esclusivi, empty legs e gestione flotta con intelligenza artificiale.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Milan",
      "addressCountry": "IT"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+39-331-8824030",
      "contactType": "concierge",
      "areaServed": "IT",
      "availableLanguage": ["Italian", "English", "French"]
    },
    "sameAs": [
      "https://www.linkedin.com/company/aerojet-private",
      "https://www.instagram.com/aerojetprivate"
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
    />
  )
}
