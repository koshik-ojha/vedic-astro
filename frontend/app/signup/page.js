"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await signup(form.email, form.name, form.password);
      router.push("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Pro:ital,wght@0,300;0,400;1,300&display=swap');

        .va-cosmos {
          min-height: 100vh;
          background: #0a0614;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1rem;
          position: relative;
          overflow: hidden;
          font-family: 'Crimson Pro', Georgia, serif;
        }

        .va-stars {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(1px 1px at 10% 15%, rgba(255,255,255,0.7) 0%, transparent 100%),
            radial-gradient(1px 1px at 25% 40%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 40% 8%, rgba(255,255,255,0.8) 0%, transparent 100%),
            radial-gradient(1px 1px at 55% 30%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 70% 12%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 85% 25%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 15% 60%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 92% 55%, rgba(255,255,255,0.6) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 5% 85%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(1px 1px at 78% 78%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 30% 88%, rgba(255,255,255,0.3) 0%, transparent 100%),
            radial-gradient(1px 1px at 62% 92%, rgba(255,255,255,0.4) 0%, transparent 100%),
            radial-gradient(2px 2px at 48% 50%, rgba(200,180,255,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 20% 70%, rgba(255,220,180,0.5) 0%, transparent 100%),
            radial-gradient(1px 1px at 88% 10%, rgba(255,255,255,0.5) 0%, transparent 100%),
            radial-gradient(1.5px 1.5px at 3% 35%, rgba(255,255,255,0.3) 0%, transparent 100%);
          pointer-events: none;
        }

        .va-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        .va-orb-1 {
          width: 360px; height: 360px;
          top: -100px; right: -80px;
          background: radial-gradient(circle, rgba(120,60,200,0.2) 0%, transparent 70%);
        }
        .va-orb-2 {
          width: 280px; height: 280px;
          bottom: -80px; left: -60px;
          background: radial-gradient(circle, rgba(200,120,40,0.15) 0%, transparent 70%);
        }
        .va-orb-3 {
          width: 200px; height: 200px;
          top: 45%; left: 8%;
          background: radial-gradient(circle, rgba(80,160,220,0.1) 0%, transparent 70%);
        }

        .va-card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: rgba(18, 10, 35, 0.88);
          border: 1px solid rgba(160,120,255,0.2);
          border-radius: 20px;
          padding: 2.2rem 2.5rem 2rem;
          backdrop-filter: blur(14px);
        }

        .va-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(160,100,255,0.3) 0%, transparent 40%, transparent 60%, rgba(220,140,60,0.2) 100%);
          pointer-events: none;
          z-index: 0;
        }

        .va-inner { position: relative; z-index: 1; }

        .va-brand { text-align: center; margin-bottom: 1.8rem; }

        .va-brand-title {
          font-family: 'Cinzel', 'Times New Roman', serif;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: #e8d9ff;
          text-shadow: 0 0 24px rgba(180,120,255,0.5);
          margin-top: 0.7rem;
        }

        .va-brand-sub {
          font-family: 'Crimson Pro', Georgia, serif;
          font-style: italic;
          font-size: 15px;
          color: rgba(180,150,220,0.65);
          letter-spacing: 0.05em;
          margin-top: 4px;
        }

        .va-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 1.6rem;
        }
        .va-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(160,100,255,0.3), transparent);
        }
        .va-divider-gem {
          width: 6px; height: 6px;
          background: rgba(200,150,255,0.55);
          transform: rotate(45deg);
          border-radius: 1px;
          flex-shrink: 0;
        }

        .va-error {
          background: rgba(200,50,50,0.12);
          border: 1px solid rgba(200,80,80,0.3);
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 14px;
          color: #f4a0a0;
          margin-bottom: 1.2rem;
        }

        .va-group { margin-bottom: 1.1rem; }

        .va-label {
          display: block;
          font-family: 'Cinzel', serif;
          font-size: 10.5px;
          font-weight: 600;
          letter-spacing: 0.16em;
          color: rgba(180,150,220,0.75);
          text-transform: uppercase;
          margin-bottom: 7px;
        }

        .va-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(160,100,255,0.25);
          border-radius: 10px;
          padding: 11px 14px;
          font-family: 'Crimson Pro', Georgia, serif;
          font-size: 16px;
          color: #e8d9ff;
          outline: none;
          transition: border-color 0.2s, background 0.2s;
        }
        .va-input::placeholder { color: rgba(180,150,220,0.3); }
        .va-input:focus {
          border-color: rgba(160,100,255,0.6);
          background: rgba(160,100,255,0.07);
        }

        .va-btn {
          width: 100%;
          margin-top: 1.4rem;
          padding: 13px;
          background: linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%);
          border: none;
          border-radius: 10px;
          font-family: 'Cinzel', serif;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.18em;
          color: #fff;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: opacity 0.2s, transform 0.15s;
        }
        .va-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .va-btn:active:not(:disabled) { transform: scale(0.99); }
        .va-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .va-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%);
          pointer-events: none;
        }

        .va-footer {
          text-align: center;
          margin-top: 1.4rem;
          font-family: 'Crimson Pro', Georgia, serif;
          font-style: italic;
          font-size: 15px;
          color: rgba(180,150,220,0.5);
        }
        .va-footer a {
          color: rgba(200,160,255,0.85);
          text-decoration: none;
          border-bottom: 1px solid rgba(200,160,255,0.3);
          transition: color 0.2s;
        }
        .va-footer a:hover { color: #c084fc; }
      `}</style>

      <div className="va-cosmos">
        <div className="va-stars" />
        <div className="va-orb va-orb-1" />
        <div className="va-orb va-orb-2" />
        <div className="va-orb va-orb-3" />

        <div className="va-card">
          <div className="va-inner">

            {/* Brand / Logo */}
            <div className="va-brand">
              <svg width="60" height="60" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="34" cy="34" r="32" stroke="rgba(160,100,255,0.25)" strokeWidth="1"/>
                <circle cx="34" cy="34" r="22" stroke="rgba(200,140,255,0.2)" strokeWidth="0.5"/>
                <circle cx="34" cy="34" r="12" stroke="rgba(220,160,255,0.3)" strokeWidth="0.5"/>
                <circle cx="34" cy="34" r="4" fill="rgba(200,150,255,0.75)"/>
                <line x1="34" y1="2" x2="34" y2="66" stroke="rgba(160,100,255,0.15)" strokeWidth="0.5"/>
                <line x1="2" y1="34" x2="66" y2="34" stroke="rgba(160,100,255,0.15)" strokeWidth="0.5"/>
                <line x1="6.7" y1="6.7" x2="61.3" y2="61.3" stroke="rgba(160,100,255,0.1)" strokeWidth="0.5"/>
                <line x1="61.3" y1="6.7" x2="6.7" y2="61.3" stroke="rgba(160,100,255,0.1)" strokeWidth="0.5"/>
                <polygon points="34,12 37,30 34,26 31,30" fill="rgba(220,160,255,0.55)"/>
                <polygon points="34,56 37,38 34,42 31,38" fill="rgba(220,160,255,0.35)"/>
                <polygon points="12,34 30,31 26,34 30,37" fill="rgba(220,160,255,0.35)"/>
                <polygon points="56,34 38,31 42,34 38,37" fill="rgba(220,160,255,0.35)"/>
                <circle cx="34" cy="12" r="2" fill="rgba(255,210,100,0.75)"/>
                <circle cx="34" cy="56" r="1.5" fill="rgba(180,130,255,0.5)"/>
                <circle cx="56" cy="34" r="1.5" fill="rgba(180,130,255,0.5)"/>
                <circle cx="12" cy="34" r="1.5" fill="rgba(180,130,255,0.5)"/>
                <circle cx="18" cy="18" r="1.5" fill="rgba(100,200,255,0.4)"/>
                <circle cx="50" cy="50" r="1.5" fill="rgba(255,160,80,0.4)"/>
              </svg>
              <div className="va-brand-title">Vedic Astro Bot</div>
              <div className="va-brand-sub">Begin your celestial journey.</div>
            </div>

            <div className="va-divider">
              <div className="va-divider-line" />
              <div className="va-divider-gem" />
              <div className="va-divider-line" />
            </div>

            {/* Error */}
            {error && (
              <div className="va-error">{error}</div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>
              <div className="va-group">
                <label className="va-label" htmlFor="name">Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="va-input"
                />
              </div>

              <div className="va-group">
                <label className="va-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="va-input"
                />
              </div>

              <div className="va-group">
                <label className="va-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Min 6 characters"
                  className="va-input"
                />
              </div>

              <div className="va-group">
                <label className="va-label" htmlFor="confirm">Confirm Password</label>
                <input
                  id="confirm"
                  type="password"
                  required
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  placeholder="Repeat your password"
                  className="va-input"
                />
              </div>

              <button type="submit" disabled={loading} className="va-btn">
                {loading ? "CHARTING YOUR STARS..." : "BEGIN THE JOURNEY"}
              </button>
            </form>

            <p className="va-footer">
              Already have an account?{" "}
              <Link href="/login">Sign in</Link>
            </p>

          </div>
        </div>
      </div>
    </>
  );
}