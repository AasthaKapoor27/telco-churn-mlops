import React, { useState, useEffect, useRef } from 'react'

// ─────────────────────────────────────────────
// Design System
// ─────────────────────────────────────────────
const COLORS = {
  pageBg:      "#0a0f1e",
  sectionDark: "#0f172a",
  indigo:      "#6366f1",
  indigoText:  "#a5b4fc",
  purple:      "#a855f7",
  textPrimary: "#f1f5f9",
  textMuted:   "rgba(148,163,184,0.85)",
  textFaint:   "rgba(100,116,139,0.7)",
  border:      "rgba(255,255,255,0.08)",
}

const RISK = {
  High:   { bg: "rgba(239,68,68,0.15)",  border: "rgba(239,68,68,0.5)",  text: "#f87171" },
  Medium: { bg: "rgba(234,179,8,0.15)",  border: "rgba(234,179,8,0.5)",  text: "#facc15" },
  Low:    { bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.5)",  text: "#4ade80" },
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

// ─────────────────────────────────────────────
// Shared input style helpers
// ─────────────────────────────────────────────
const inputBase = {
  background:   "rgba(15,23,42,0.6)",
  border:       "1px solid rgba(99,102,241,0.3)",
  borderRadius: 10,
  padding:      "10px 14px",
  color:        "#e2e8f0",
  fontSize:     15,
  fontFamily:   "'Inter',sans-serif",
  outline:      "none",
  width:        "100%",
  boxSizing:    "border-box",
  transition:   "border-color 0.2s,box-shadow 0.2s",
}

const labelStyle = {
  fontSize:      13,
  color:         COLORS.textMuted,
  fontFamily:    "'Inter',sans-serif",
  marginBottom:  6,
  display:       "block",
  lineHeight:    1.4,
}

// ─────────────────────────────────────────────
// FocusInput / FocusSelect
// ─────────────────────────────────────────────
function FocusInput({ type = "text", value, onChange, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        ...(focused
          ? { borderColor: "rgba(99,102,241,0.8)", boxShadow: "0 0 0 3px rgba(99,102,241,0.15)" }
          : {}),
      }}
      {...props}
    />
  )
}

function FocusSelect({ value, onChange, children, ...props }) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      value={value}
      onChange={onChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        ...inputBase,
        appearance: "none",
        cursor:     "pointer",
        ...(focused
          ? { borderColor: "rgba(99,102,241,0.8)", boxShadow: "0 0 0 3px rgba(99,102,241,0.15)" }
          : {}),
      }}
      {...props}
    >
      {children}
    </select>
  )
}

// ─────────────────────────────────────────────
// Main App
// ─────────────────────────────────────────────
export default function App() {
  const [form, setForm] = useState({
    tenure:          12,
    MonthlyCharges:  65,
    Contract:        "Month-to-month",
    InternetService: "Fiber optic",
    PaymentMethod:   "Electronic check",
    SeniorCitizen:   0,
    Partner:         "No",
    Dependents:      "No",
  })
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [logoHovered, setLogoHovered] = useState(false)

  const resultRef = useRef(null)

  // Scroll listener for navbar blur
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  // Smooth scroll to form
  const scrollToForm = () => {
    document.getElementById("form")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Submit handler
  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const res = await fetch(`${API_URL}/predict`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tenure:         parseInt(form.tenure),
          MonthlyCharges: parseFloat(form.MonthlyCharges),
          SeniorCitizen:  parseInt(form.SeniorCitizen),
        }),
      })
      if (!res.ok) throw new Error(`API error ${res.status}`)
      const data = await res.json()
      setResult(data)
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 100)
    } catch (err) {
      setError(err.message || "Prediction failed.")
    } finally {
      setLoading(false)
    }
  }

  const field = (key, val) => setForm(f => ({ ...f, [key]: val }))

  // ─── Steps for "How this works" ───
  const steps = [
    { num: "01", title: "Enter customer details", desc: "Fill in the 6 key fields about the customer below." },
    { num: "02", title: "Click Predict", desc: "Our ML model scores the customer in milliseconds." },
    { num: "03", title: "View churn risk", desc: "Get a risk level and probability — act before they leave." },
  ]

  const riskLegend = [
    { color: "#f87171", label: "High risk",   desc: "Likely to leave — act now" },
    { color: "#facc15", label: "Medium risk",  desc: "Needs attention" },
    { color: "#4ade80", label: "Low risk",     desc: "Stable customer" },
  ]

  return (
    <div style={{ fontFamily: "'Inter',sans-serif", background: COLORS.pageBg, minHeight: "100vh", position: "relative" }}>

      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:wght@400;600;700&family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #0a0f1e; }
        @keyframes fadeSlideUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin        { to{transform:rotate(360deg)} }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        select option { background: #0f172a; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0f1e; }
        ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.4); border-radius: 99px; }
      `}</style>

      {/* ── Grid overlay ── */}
      <div style={{
        position:        "fixed",
        inset:           0,
        zIndex:          0,
        pointerEvents:   "none",
        backgroundImage: "linear-gradient(rgba(99,102,241,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.03) 1px, transparent 1px)",
        backgroundSize:  "40px 40px",
      }} />

      {/* ══════════════════════════════
          A. NAVBAR
      ══════════════════════════════ */}
      <nav style={{
        position:       "fixed",
        top:            0,
        left:           0,
        right:          0,
        zIndex:         50,
        height:         60,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        padding:        "0 32px",
        transition:     "background 0.3s, border-bottom 0.3s, backdrop-filter 0.3s",
        background:     scrolled ? "rgba(10,15,30,0.88)" : "transparent",
        backdropFilter: scrolled ? "blur(16px)"          : "none",
        borderBottom:   scrolled ? "1px solid rgba(99,102,241,0.15)" : "1px solid transparent",
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
          <div
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            style={{
              width:          32,
              height:         32,
              borderRadius:   8,
              background:     "linear-gradient(135deg,#6366f1,#a855f7)",
              display:        "flex",
              alignItems:     "center",
              justifyContent: "center",
              fontSize:       16,
              transform:      logoHovered ? "rotate(180deg)" : "rotate(0deg)",
              transition:     "transform 500ms cubic-bezier(0.4,0,0.2,1)",
            }}
          >⚡</div>
          <span style={{
            fontFamily:    "'Space Grotesk',sans-serif",
            fontWeight:    700,
            fontSize:      17,
            color:         COLORS.textPrimary,
            letterSpacing: "-0.01em",
          }}>churniq</span>
        </div>

        {/* Get Demo CTA — scrolls to form */}
        <button
          id="nav-get-demo"
          onClick={scrollToForm}
          style={{
            background:   "linear-gradient(135deg,#6366f1,#8b5cf6)",
            borderRadius: 8,
            padding:      "8px 18px",
            boxShadow:    "0 0 20px rgba(99,102,241,0.35)",
            color:        "#fff",
            fontFamily:   "'Space Grotesk',sans-serif",
            fontWeight:   600,
            fontSize:     14,
            border:       "none",
            cursor:       "pointer",
            transition:   "opacity 0.2s,box-shadow 0.2s",
          }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 30px rgba(99,102,241,0.55)"; e.currentTarget.style.opacity = "0.9" }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(99,102,241,0.35)"; e.currentTarget.style.opacity = "1" }}
        >Get Demo</button>
      </nav>

      {/* ══════════════════════════════
          B. COMPACT HERO
      ══════════════════════════════ */}
      <section style={{
        paddingTop:     "110px",
        paddingBottom:  "40px",
        display:        "flex",
        flexDirection:  "column",
        alignItems:     "center",
        position:       "relative",
        zIndex:         1,
      }}>
        {/* Soft glow */}
        <div style={{
          position:      "absolute",
          top:           0,
          left:          "50%",
          transform:     "translateX(-50%)",
          width:         520,
          height:        320,
          borderRadius:  "50%",
          background:    "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />

        <h1 style={{
          fontFamily:    "'Lora',serif",
          fontSize:      "clamp(30px,5vw,52px)",
          fontWeight:    700,
          textAlign:     "center",
          maxWidth:      680,
          lineHeight:    1.15,
          letterSpacing: "-0.02em",
          margin:        "0 0 14px",
          background:    "linear-gradient(135deg,#f1f5f9 0%,#a5b4fc 55%,#c084fc 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor:  "transparent",
          padding:       "0 16px",
        }}>
          Predict Customer Churn Before It Happens
        </h1>

        <p style={{
          fontFamily: "'Inter',sans-serif",
          fontSize:   16,
          color:      "rgba(148,163,184,0.85)",
          textAlign:  "center",
          maxWidth:   480,
          lineHeight: 1.65,
          padding:    "0 16px",
        }}>
          Enter customer details below — get an instant churn risk score powered by ML.
        </p>
      </section>

      {/* ══════════════════════════════
          C. HOW THIS WORKS
      ══════════════════════════════ */}
      <section style={{
        maxWidth:  720,
        margin:    "0 auto 32px",
        padding:   "0 20px",
        position:  "relative",
        zIndex:    1,
      }}>
        {/* Glass card */}
        <div style={{
          background:     "rgba(15,23,42,0.7)",
          backdropFilter: "blur(16px)",
          border:         "1px solid rgba(99,102,241,0.18)",
          borderRadius:   18,
          padding:        "24px 28px",
        }}>
          <div style={{
            fontFamily:    "'Space Grotesk',sans-serif",
            fontSize:      11,
            color:         COLORS.indigoText,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight:    600,
            marginBottom:  18,
          }}>How this works</div>

          {/* Steps row */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ flex: "1 1 160px", display: "flex", gap: 12, alignItems: "flex-start" }}>
                <div style={{
                  width:          32,
                  height:         32,
                  borderRadius:   8,
                  background:     "rgba(99,102,241,0.15)",
                  border:         "1px solid rgba(99,102,241,0.3)",
                  display:        "flex",
                  alignItems:     "center",
                  justifyContent: "center",
                  fontFamily:     "'Space Grotesk',sans-serif",
                  fontWeight:     700,
                  fontSize:       12,
                  color:          COLORS.indigoText,
                  flexShrink:     0,
                }}>{s.num}</div>
                <div>
                  <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: COLORS.textPrimary, marginBottom: 3 }}>
                    {s.title}
                  </div>
                  <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: COLORS.textMuted, lineHeight: 1.5 }}>
                    {s.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Risk legend */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 16,
            display:    "flex",
            gap:        20,
            flexWrap:   "wrap",
          }}>
            <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: COLORS.textFaint, marginRight: 4, alignSelf: "center" }}>
              Risk levels:
            </div>
            {riskLegend.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width:        8,
                  height:       8,
                  borderRadius: "50%",
                  background:   r.color,
                  flexShrink:   0,
                }} />
                <span style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: COLORS.textMuted }}>
                  <strong style={{ color: r.color, fontWeight: 600 }}>{r.label}</strong>
                  {" — "}{r.desc}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          D. INPUT FORM  (id="form")
      ══════════════════════════════ */}
      <section id="form" style={{
        maxWidth:  720,
        margin:    "0 auto 40px",
        padding:   "0 20px",
        position:  "relative",
        zIndex:    1,
      }}>
        {/* Glow halo */}
        <div style={{
          position:     "absolute",
          inset:        -2,
          borderRadius: 22,
          zIndex:       0,
          background:   "linear-gradient(135deg,#6366f1,#a855f7,#ec4899)",
          filter:       "blur(20px)",
          opacity:      0.18,
        }} />

        {/* Glass card */}
        <div style={{
          position:       "relative",
          zIndex:         1,
          background:     "rgba(15,23,42,0.88)",
          backdropFilter: "blur(16px)",
          border:         "1px solid rgba(255,255,255,0.09)",
          borderRadius:   20,
          padding:        "28px 28px",
        }}>
          <div style={{
            fontFamily:    "'Space Grotesk',sans-serif",
            fontSize:      11,
            color:         COLORS.indigoText,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight:    600,
            marginBottom:  20,
          }}>Customer Details</div>

          {/* Input grid — 2 columns */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 24px", marginBottom: 24 }}>

            {/* Tenure */}
            <div>
              <label htmlFor="tenure" style={labelStyle}>
                How long has the customer been using the service? <span style={{ color: COLORS.textFaint }}>(months)</span>
              </label>
              <FocusInput
                id="tenure" type="number" min={0} max={72}
                value={form.tenure}
                onChange={e => field("tenure", e.target.value)}
                placeholder="e.g. 24"
              />
            </div>

            {/* Monthly Charges */}
            <div>
              <label htmlFor="monthly" style={labelStyle}>Monthly bill amount ($)</label>
              <FocusInput
                id="monthly" type="number" min={0} max={200} step={0.01}
                value={form.MonthlyCharges}
                onChange={e => field("MonthlyCharges", e.target.value)}
                placeholder="e.g. 65.00"
              />
            </div>

            {/* Contract */}
            <div>
              <label htmlFor="contract" style={labelStyle}>Type of plan</label>
              <FocusSelect
                id="contract"
                value={form.Contract}
                onChange={e => field("Contract", e.target.value)}
              >
                <option>Month-to-month</option>
                <option>One year</option>
                <option>Two year</option>
              </FocusSelect>
            </div>

            {/* Internet Service */}
            <div>
              <label htmlFor="internet" style={labelStyle}>Type of internet connection</label>
              <FocusSelect
                id="internet"
                value={form.InternetService}
                onChange={e => field("InternetService", e.target.value)}
              >
                <option>Fiber optic</option>
                <option>DSL</option>
                <option>No</option>
              </FocusSelect>
            </div>

            {/* Payment Method */}
            <div>
              <label htmlFor="payment" style={labelStyle}>How does the customer pay?</label>
              <FocusSelect
                id="payment"
                value={form.PaymentMethod}
                onChange={e => field("PaymentMethod", e.target.value)}
              >
                <option>Electronic check</option>
                <option>Mailed check</option>
                <option>Bank transfer (automatic)</option>
                <option>Credit card (automatic)</option>
              </FocusSelect>
            </div>

            {/* Senior Citizen */}
            <div>
              <label htmlFor="senior" style={labelStyle}>Is the customer a senior citizen?</label>
              <FocusSelect
                id="senior"
                value={form.SeniorCitizen}
                onChange={e => field("SeniorCitizen", parseInt(e.target.value))}
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </FocusSelect>
            </div>

          </div>

          {/* Submit row */}
          <div style={{
            display:    "flex",
            alignItems: "center",
            paddingTop: 4,
          }}>
            <button
              id="predict-btn"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                marginLeft:   "auto",
                background:   loading ? "rgba(99,102,241,0.4)" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                boxShadow:    loading ? "none" : "0 0 24px rgba(99,102,241,0.4)",
                borderRadius: 10,
                padding:      "12px 32px",
                color:        "#fff",
                fontSize:     15,
                fontFamily:   "'Space Grotesk',sans-serif",
                fontWeight:   600,
                border:       "none",
                cursor:       loading ? "not-allowed" : "pointer",
                transition:   "all 0.2s",
                display:      "flex",
                alignItems:   "center",
                gap:          8,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.boxShadow = "0 0 32px rgba(99,102,241,0.6)"; e.currentTarget.style.opacity = "0.92" }}}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 24px rgba(99,102,241,0.4)"; e.currentTarget.style.opacity = "1" }}
            >
              {loading ? (
                <>
                  <span style={{
                    width:          14,
                    height:         14,
                    borderRadius:   "50%",
                    border:         "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    display:        "inline-block",
                    animation:      "spin 0.7s linear infinite",
                  }} />
                  Analyzing…
                </>
              ) : "Predict Churn ↗"}
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          E. RESULT CARD  (id="results")
      ══════════════════════════════ */}
      <section id="results" style={{
        maxWidth:  720,
        margin:    "0 auto 60px",
        padding:   "0 20px",
        position:  "relative",
        zIndex:    1,
      }}>

        {/* Error */}
        {error && (
          <div style={{
            padding:      "14px 20px",
            background:   "rgba(239,68,68,0.1)",
            border:       "1px solid rgba(239,68,68,0.3)",
            borderRadius: 12,
            color:        "#f87171",
            fontSize:     14,
            textAlign:    "center",
            fontFamily:   "'Inter',sans-serif",
            animation:    "fadeSlideUp 0.3s ease-out",
          }}>
            ⚠ {error}
          </div>
        )}

        {/* Result */}
        {result && (
          <div
            ref={resultRef}
            style={{
              background:     "rgba(15,23,42,0.85)",
              backdropFilter: "blur(16px)",
              border:         `1px solid ${RISK[result.risk].border}`,
              borderRadius:   20,
              padding:        "28px 28px",
              boxShadow:      `0 0 40px ${RISK[result.risk].bg}`,
              animation:      "fadeSlideUp 0.4s ease-out",
            }}
          >
            {/* Top row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
              <div>
                <div style={{ fontSize: 11, fontFamily: "'Space Grotesk',sans-serif", color: COLORS.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                  Prediction Result
                </div>
                <div style={{
                  fontFamily: "'Lora',serif",
                  fontSize:   32,
                  fontWeight: 700,
                  color:      result.churn === "Yes" ? "#f87171" : "#4ade80",
                }}>
                  {result.churn === "Yes" ? "⚠ Will Churn" : "✓ Will Stay"}
                </div>
              </div>
              <div style={{
                background:   RISK[result.risk].bg,
                border:       `1px solid ${RISK[result.risk].border}`,
                borderRadius: 99,
                padding:      "6px 16px",
                fontFamily:   "'Space Grotesk',sans-serif",
                fontWeight:   700,
                fontSize:     13,
                color:        RISK[result.risk].text,
                whiteSpace:   "nowrap",
                marginLeft:   16,
                alignSelf:    "flex-start",
              }}>
                {result.risk} Risk
              </div>
            </div>

            {/* Probability bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: COLORS.textMuted, fontFamily: "'Inter',sans-serif" }}>Churn probability</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: RISK[result.risk].text, fontFamily: "'Space Grotesk',sans-serif" }}>
                  {Math.round(result.probability * 100)}%
                </span>
              </div>
              <div style={{ height: 7, background: "rgba(255,255,255,0.08)", borderRadius: 99, overflow: "hidden" }}>
                <div style={{
                  height:       "100%",
                  width:        `${Math.round(result.probability * 100)}%`,
                  background:   `linear-gradient(90deg,#6366f1,${RISK[result.risk].text})`,
                  borderRadius: 99,
                  transition:   "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                }} />
              </div>
            </div>

            {/* Message */}
            {result.message && (
              <p style={{ marginTop: 16, fontSize: 13, color: "rgba(148,163,184,0.75)", lineHeight: 1.6, fontFamily: "'Inter',sans-serif" }}>
                {result.message}
              </p>
            )}

            {/* Three metric cards */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 20 }}>
              {[
                { value: result.confidence,  label: "Confidence",         color: RISK[result.risk].text },
                { value: result.risk,        label: "Risk level",         color: RISK[result.risk].text },
                { value: result.churn === "Yes" ? "Act Now" : "Monitor",  label: "Recommended action", color: "#a5b4fc" },
              ].map((card, i) => (
                <div key={i} style={{
                  background:   "rgba(255,255,255,0.03)",
                  border:       "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 12,
                  padding:      "14px 16px",
                  textAlign:    "center",
                }}>
                  <div style={{ fontSize: 22, fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, color: card.color, marginBottom: 4 }}>
                    {card.value}
                  </div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted, fontFamily: "'Inter',sans-serif", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {card.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════════════
          F. MINIMAL FOOTER
      ══════════════════════════════ */}
      <footer style={{
        borderTop:  "1px solid rgba(255,255,255,0.06)",
        padding:    "20px 24px",
        textAlign:  "center",
        position:   "relative",
        zIndex:     1,
      }}>
        <div style={{ fontFamily: "'Space Grotesk',sans-serif", fontWeight: 700, fontSize: 14, color: COLORS.indigo, marginBottom: 4 }}>
          churniq
        </div>
        <div style={{ fontFamily: "'Inter',sans-serif", fontSize: 12, color: COLORS.textFaint }}>
          Telecom Churn Intelligence · Powered by scikit-learn + FastAPI
        </div>
      </footer>
    </div>
  )
}
