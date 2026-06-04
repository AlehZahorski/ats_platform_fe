"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { presentationApi } from "@/services/api/partners";

/**
 * Password/token gate for the investor deck (route: /prezentacja).
 *
 * No token → a lock screen asking for the access code. Wrong code → stays
 * on the lock screen with an error ("wypad"). Correct code → the backend
 * returns the deck HTML, which we render in a sandboxed iframe so its
 * inline <script> (slide navigation) runs without touching the host app.
 *
 * Supports a `?token=` query param so an admin can send a one-click link;
 * the code is still verified server-side and never trusted on the client.
 */
export function PresentationGate() {
  const search = useSearchParams();
  const [code, setCode] = useState("");
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const triedQueryRef = useRef(false);

  async function unlock(token: string) {
    const value = token.trim();
    if (!value) return;
    setLoading(true);
    setError(null);
    try {
      const res = await presentationApi.access(value);
      setHtml(res.data.html);
    } catch {
      setError("Nieprawidłowy lub nieaktywny kod dostępu.");
      setHtml(null);
    } finally {
      setLoading(false);
    }
  }

  // Auto-attempt once if a ?token= is present in the URL.
  useEffect(() => {
    if (triedQueryRef.current) return;
    const fromUrl = search.get("token");
    if (fromUrl) {
      triedQueryRef.current = true;
      setCode(fromUrl);
      void unlock(fromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // ── Unlocked: full-screen deck ─────────────────────────────────────
  if (html) {
    return (
      <iframe
        title="Prezentacja Wakanta.pl"
        srcDoc={html}
        sandbox="allow-scripts allow-same-origin allow-fullscreen"
        style={{ position: "fixed", inset: 0, width: "100%", height: "100%", border: "none" }}
      />
    );
  }

  // ── Locked: access screen ──────────────────────────────────────────
  return (
    <div style={styles.wrap}>
      <div style={styles.bgA} />
      <div style={styles.bgB} />
      <form
        style={styles.card}
        onSubmit={(e) => {
          e.preventDefault();
          void unlock(code);
        }}
      >
        <div style={styles.lock}>🔒</div>
        <h1 style={styles.title}>Prezentacja dla partnerów</h1>
        <p style={styles.sub}>
          Ta prezentacja jest chroniona. Wprowadź kod dostępu, który otrzymałeś od
          zespołu Wakanta.pl.
        </p>
        <input
          autoFocus
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Kod dostępu"
          style={{ ...styles.input, ...(error ? styles.inputError : {}) }}
          aria-invalid={!!error}
        />
        {error && <div style={styles.error}>{error}</div>}
        <button type="submit" disabled={loading || !code.trim()} style={styles.btn}>
          {loading ? "Sprawdzanie…" : "Wejdź →"}
        </button>
        <div style={styles.foot}>
          Nie masz kodu? Napisz na <b style={{ color: "#fff" }}>kontakt@wakanta.pl</b>
        </div>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    position: "fixed",
    inset: 0,
    display: "grid",
    placeItems: "center",
    background: "radial-gradient(120% 120% at 50% 0%, #0a0d22 0%, #060814 55%, #04050d 100%)",
    fontFamily:
      "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Inter,Helvetica,Arial,sans-serif",
    padding: 24,
    overflow: "hidden",
  },
  bgA: {
    position: "absolute",
    width: 520,
    height: 520,
    top: -160,
    left: -120,
    borderRadius: "50%",
    background: "radial-gradient(circle,#7c3aed,transparent 70%)",
    filter: "blur(90px)",
    opacity: 0.5,
  },
  bgB: {
    position: "absolute",
    width: 480,
    height: 480,
    bottom: -160,
    right: -120,
    borderRadius: "50%",
    background: "radial-gradient(circle,#06b6d4,transparent 70%)",
    filter: "blur(90px)",
    opacity: 0.45,
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "min(440px, 100%)",
    background: "rgba(255,255,255,.045)",
    border: "1px solid rgba(255,255,255,.1)",
    backdropFilter: "blur(14px)",
    borderRadius: 24,
    padding: 40,
    boxShadow: "0 40px 120px rgba(0,0,0,.55)",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    textAlign: "center",
    color: "#eef1fb",
  },
  lock: {
    width: 64,
    height: 64,
    borderRadius: 18,
    margin: "0 auto 4px",
    display: "grid",
    placeItems: "center",
    fontSize: 30,
    background: "linear-gradient(135deg,#7c3aed,#22d3ee)",
    boxShadow: "0 12px 40px rgba(124,58,237,.5)",
  },
  title: { fontSize: 26, fontWeight: 800, letterSpacing: "-.02em", margin: 0 },
  sub: { fontSize: 14.5, lineHeight: 1.5, color: "#aab4d6", margin: "0 0 6px" },
  input: {
    width: "100%",
    background: "rgba(255,255,255,.05)",
    border: "1px solid rgba(255,255,255,.12)",
    borderRadius: 12,
    padding: "14px 16px",
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    outline: "none",
  },
  inputError: { borderColor: "#fb7185", boxShadow: "0 0 0 3px rgba(244,63,94,.25)" },
  error: { color: "#fb7185", fontSize: 13.5, fontWeight: 600 },
  btn: {
    width: "100%",
    background: "linear-gradient(135deg,#7c3aed,#22d3ee)",
    color: "#fff",
    fontWeight: 800,
    fontSize: 16,
    padding: "14px 18px",
    border: "none",
    borderRadius: 12,
    cursor: "pointer",
    boxShadow: "0 16px 40px rgba(124,58,237,.45)",
  },
  foot: { fontSize: 12.5, color: "#8a96ba", marginTop: 4 },
};
