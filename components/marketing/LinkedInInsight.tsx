"use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const LINKEDIN_INSIGHT_ID = process.env.NEXT_PUBLIC_LINKEDIN_INSIGHT_ID;

export default function LinkedInInsight() {
  const pathname = usePathname();

  useEffect(() => {
    if (!LINKEDIN_INSIGHT_ID) return;
    
    // Tracking page views on route change
    if (typeof window !== "undefined" && (window as any).lintrk) {
      (window as any).lintrk('track', { conversion_id: LINKEDIN_INSIGHT_ID });
    }
  }, [pathname]);

  if (!LINKEDIN_INSIGHT_ID) return null;

  return (
    <>
      <Script id="linkedin-insight" strategy="afterInteractive">
        {`
          _linkedin_partner_id = "${LINKEDIN_INSIGHT_ID}";
          window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
          window._linkedin_data_partner_ids.push(_linkedin_partner_id);
          (function(l) {
            if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};
            window.lintrk.q=[]}
            var s = document.getElementsByTagName("script")[0];
            var b = document.createElement("script");
            b.type = "text/javascript";b.async = true;
            b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js";
            s.parentNode.insertBefore(b, s);
          })(window.lintrk);
        `}
      </Script>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          alt=""
          src={`https://py.adsdb.linkedin.com/collect/?pid=${LINKEDIN_INSIGHT_ID}&fmt=gif`}
        />
      </noscript>
    </>
  );
}
