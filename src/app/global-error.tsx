"use client";

import { useEffect } from "react";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[global-error.tsx]", error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          // globals.css is not loaded on this route: global-error.tsx replaces the
          // root layout, so CSS variables do not exist here. These are the contract
          // values from src/styles/globals.css, inlined out of necessity.
          backgroundColor: "#0E1211", // --elev-0
          color: "#E4E8E6", // --fg
          fontFamily: "system-ui, -apple-system, sans-serif",
          margin: 0,
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 12 }}>
            Algo no salió como esperábamos
          </h1>
          <p style={{ color: "#A6AEAB", marginBottom: 24 }}>
            Estamos teniendo un problema temporal. Intenta de nuevo en unos segundos.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              borderRadius: 8,
              backgroundColor: "#5FE3C4", // --primary-mint
              color: "#00352A", // --on-primary
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
