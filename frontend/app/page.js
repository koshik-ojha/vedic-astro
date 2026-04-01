"use client";
import { useState, useEffect } from "react";  
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";
import { FaSun, FaCalendarAlt, FaStar, FaUser, FaScroll, FaBolt, FaGlobe, FaStarOfDavid, FaHeart, FaPhone, FaTrophy, FaLock, FaMobileAlt, FaSpa, FaComments, FaPencilAlt, FaBinoculars, FaBook, FaSeedling, FaEnvelope, FaClock, FaMapMarkerAlt, FaTwitter, FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';
import { MdWbSunny } from 'react-icons/md';
import { GiCrystalBall, GiSparkles, GiFlowerEmblem, GiFire, GiMoon, GiTwirlyFlower } from 'react-icons/gi';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [loading, user, router]);

  const [scrolled, setScrolled] = useState(false);
  const [faqOpen, setFaqOpen] = useState(null);
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", message: "", service: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || "https://vedic-astro-backend-rox2.onrender.com";
      const response = await fetch(`${BACKEND}/contact/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        // Reset form
        setFormData({
          name: "", email: "", phone: "", message: "", service: "",
        });
      } else {
        setSubmitError(data.detail || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const navLinks = ["Features", "About", "Testimonials", "Pricing", "Contact"];

  const stats = [
    { value: "50K+", label: "Happy Users" },
    { value: "12", label: "Zodiac Signs" },
    { value: "4.9★", label: "App Rating" },
    { value: "100%", label: "Vedic Authentic" },
  ];

  const features = [
    { icon: <FaSun />, grad: "linear-gradient(135deg,#f97316,#ef4444)", title: "Daily Astrology", desc: "Personalised cosmic insights for your sun sign or full birth chart, delivered every morning." },
    { icon: <FaCalendarAlt />, grad: "linear-gradient(135deg,#6366f1,#3b82f6)", title: "Monthly Forecast", desc: "Plan the month ahead with detailed celestial guidance across love, career and wellbeing." },
    { icon: <FaStar />, grad: "linear-gradient(135deg,#f59e0b,#ea580c)", title: "Daily Panchang", desc: "Five Vedic time elements — Tithi, Nakshatra, Yoga, Karana, Vara — for your exact location." },
    { icon: <MdWbSunny />, grad: "linear-gradient(135deg,#ec4899,#f43f5e)", title: "Sun Timings", desc: "Precise sunrise, sunset and Choghadiya timings so you never miss an auspicious muhurat." },
    { icon: <FaUser />, grad: "linear-gradient(135deg,#14b8a6,#0e7490)", title: "Saved Profiles", desc: "Store birth charts for your entire family and access personalised readings instantly." },
    { icon: <GiCrystalBall />, grad: "linear-gradient(135deg,#8b5cf6,#6d28d9)", title: "Full Birth Chart", desc: "Complete Kundali with planetary positions, house lords and yogas calculated with precision." },
  ];

  const aboutPoints = [
    { icon: <FaScroll />, title: "Rooted in Tradition", desc: "Built on centuries-old Vedic texts and validated by practising Jyotish scholars from across India." },
    { icon: <FaBolt />, title: "Modern Precision", desc: "Swiss Ephemeris calculations with sub-minute accuracy for every planetary position." },
    { icon: <FaGlobe />, title: "Global Reach", desc: "Serving seekers across 40+ countries with localised timings and multilingual support." },
  ];

  const services = [
    { icon: <FaStar />, grad: "linear-gradient(135deg,rgba(124,58,237,0.35),rgba(79,70,229,0.35))", border: "rgba(124,58,237,0.45)", title: "Personal Horoscope", price: "Free", desc: "Daily, weekly and monthly readings based on your sun sign. Always free, always fresh.", points: ["Daily sun sign reading", "Monthly overview", "Yearly forecast preview", "Lucky colours & numbers"], featured: false },
    { icon: <FaStarOfDavid />, grad: "linear-gradient(135deg,rgba(236,72,153,0.35),rgba(190,24,93,0.35))", border: "rgba(236,72,153,0.65)", title: "Birth Chart Analysis", price: "₹499", desc: "Deep-dive into your Kundali with house-by-house analysis by our expert astrologers.", points: ["Full Lagna chart", "Navamsa & Dashamsa", "Planetary strength report", "Life predictions PDF"], featured: true },
    { icon: <FaHeart />, grad: "linear-gradient(135deg,rgba(249,115,22,0.35),rgba(220,38,38,0.35))", border: "rgba(249,115,22,0.45)", title: "Kundali Matching", price: "₹799", desc: "Comprehensive compatibility analysis for marriage using Ashtakoot and Dashakoot methods.", points: ["36-point Guna matching", "Mangal Dosha check", "Remedies & solutions", "Detailed PDF report"], featured: false },
    { icon: <FaPhone />, grad: "linear-gradient(135deg,rgba(20,184,166,0.35),rgba(8,145,178,0.35))", border: "rgba(20,184,166,0.45)", title: "Live Consultation", price: "₹1,499", desc: "One-on-one 45-minute session with a senior Vedic astrologer over video or phone.", points: ["45-min live session", "Any life topic covered", "Remedial measures", "Follow-up Q&A chat"], featured: false },
  ];

  const whyUs = [
    { icon: <FaTrophy />, title: "Award-Winning Accuracy", desc: "Recognised by the Indian Astrology Federation for computational accuracy three years running." },
    { icon: <FaLock />, title: "Privacy First", desc: "Your birth data stays on your device. We never sell or share personal information with anyone." },
    { icon: <FaMobileAlt />, title: "Works Everywhere", desc: "Seamless experience on web, iOS and Android. Your chart travels with you wherever you go." },
    { icon: <FaSpa />, title: "Holistic Guidance", desc: "Beyond predictions — practical remedies, meditation tips and Ayurvedic lifestyle integration." },
    { icon: <FaBolt />, title: "Instant Results", desc: "No waiting for a consultant. Get your Panchang, chart and readings in under three seconds." },
    { icon: <FaComments />, title: "24 / 7 Support", desc: "Our support team and in-app chatbot are always ready to help you interpret your readings." },
  ];

  const steps = [
    { num: "01", icon: <FaPencilAlt />, title: "Create Your Account", desc: "Sign up in 30 seconds with your name, birth date, time and place of birth." },
    { num: "02", icon: <FaBinoculars />, title: "We Calculate Your Chart", desc: "Our engine computes your precise Kundali using Swiss Ephemeris and Vedic house systems." },
    { num: "03", icon: <FaBook />, title: "Receive Your Readings", desc: "Get your daily briefing, birth chart analysis and monthly forecast — all in one dashboard." },
    { num: "04", icon: <FaSeedling />, title: "Apply & Transform", desc: "Act on actionable guidance, follow remedies and watch life align with cosmic rhythms." },
  ];

  const testimonials = [
    { name: "Priya Sharma", role: "Yoga Instructor, Mumbai", avatar: <GiFlowerEmblem />, sign: "Scorpio ♏", text: "I have tried many astrology apps but Vedic Astro stands apart. The Panchang is incredibly precise and the daily readings genuinely resonate with what I experience each day." },
    { name: "Rahul Mehta", role: "Software Engineer, Bangalore", avatar: <GiFire />, sign: "Aries ♈", text: "As a sceptic I was surprised by how accurate the birth chart analysis was. The planetary explanations are jargon-free. It feels like having a personal astrologer in your pocket." },
    { name: "Ananya Iyer", role: "Business Owner, Chennai", avatar: <FaStar />, sign: "Leo ♌", text: "I use the muhurat feature for every important business decision. The Kundali matching service saved my family months of uncertainty. Absolutely indispensable." },
    { name: "Deepak Verma", role: "Doctor, Delhi", avatar: <GiMoon />, sign: "Pisces ♓", text: "The interface is beautiful, the data is authentic and the live consultation with their astrologer was genuinely life-changing. Worth every rupee and more." },
    { name: "Meera Nair", role: "Teacher, Kochi", avatar: <GiSparkles />, sign: "Cancer ♋", text: "Finally an app that respects Vedic tradition without feeling outdated. The monthly forecast is detailed yet easy to understand. My whole family now uses it every week." },
    { name: "Arjun Patel", role: "Entrepreneur, Ahmedabad", avatar: <GiTwirlyFlower />, sign: "Taurus ♉", text: "The birth chart PDF was 40 pages of pure insight. The astrologer on the live call addressed questions I had carried for years. It has changed how I make decisions entirely." },
  ];

  const plans = [
    { name: "Seeker", price: "Free", period: "", grad: "linear-gradient(135deg,rgba(124,58,237,0.18),rgba(79,70,229,0.18))", border: "rgba(124,58,237,0.35)", featured: false, items: ["Daily sun sign reading", "Today's Panchang", "Sunrise & sunset times", "Basic birth chart view", "Up to 2 saved profiles"] },
    { name: "Explorer", price: "₹199", period: "/month", grad: "linear-gradient(135deg,rgba(236,72,153,0.25),rgba(190,24,93,0.25))", border: "rgba(236,72,153,0.65)", featured: true, items: ["Everything in Seeker", "Monthly forecast", "Full Kundali report", "Unlimited saved profiles", "Choghadiya & Muhurat", "Priority support"] },
    { name: "Guru", price: "₹499", period: "/month", grad: "linear-gradient(135deg,rgba(249,115,22,0.2),rgba(239,68,68,0.2))", border: "rgba(249,115,22,0.4)", featured: false, items: ["Everything in Explorer", "1 live consultation/month", "Compatibility reports", "Yearly predictions PDF", "Remedial stone reports", "Dedicated astrologer"] },
  ];

  const faqs = [
    { q: "Is Vedic Astro different from Western astrology?", a: "Yes. Vedic (Jyotish) astrology uses the sidereal zodiac aligned with actual star positions, while Western astrology uses the tropical zodiac. Vedic astrology also emphasises the Moon sign and rising sign (Lagna) more than the sun sign, and includes the detailed Panchang system not found in Western traditions." },
    { q: "How accurate are the birth chart calculations?", a: "We use the Swiss Ephemeris library, the same tool used by professional Vedic astrologers worldwide. Calculations are accurate to sub-arc-minute precision. Accuracy of predictions depends on the accuracy of your birth time — even a few minutes can shift house cusps." },
    { q: "Can I get readings in Hindi?", a: "Absolutely. Vedic Astro supports English and Hindi for all readings, Panchang details and notifications. More regional languages including Tamil, Telugu and Kannada are coming soon." },
    { q: "Are my birth details safe?", a: "Your data is encrypted end-to-end and never sold to advertisers or third parties. You can delete your account and all associated data permanently at any time from within the app." },
    { q: "What happens after I book a live consultation?", a: "You will receive a confirmation email with a video/call link within 2 hours. Our scheduling team matches you with an astrologer specialised in your area of concern — career, relationships, health or general life guidance." },
    { q: "Do you offer refunds?", a: "Paid one-time reports come with a 7-day satisfaction guarantee. Monthly subscriptions can be cancelled at any time. Consultation fees are non-refundable but we will reschedule once at no charge." },
  ];

  const S = {
    sectionLabel: {
      display: "inline-block", fontSize: "0.68rem", fontWeight: 600,
      letterSpacing: "0.18em", textTransform: "uppercase",
      padding: "5px 14px", borderRadius: 99,
      background: "rgba(124,58,237,0.14)", border: "1px solid rgba(124,58,237,0.35)",
      color: "#a78bfa", marginBottom: 16,
    },
    h2: {
      fontFamily: "'Playfair Display',serif", fontWeight: 700,
      fontSize: "clamp(1.9rem,3.8vw,2.8rem)", color: "#fff",
      lineHeight: 1.2, marginBottom: 16,
    },
    bodyText: {
      color: "rgba(255,255,255,0.52)", fontSize: "0.92rem", lineHeight: 1.8,
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

   return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=Outfit:wght@300;400;500;600;700&display=swap');

        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html{scroll-behavior:smooth;}
        body{font-family:'Outfit',sans-serif;background:#07030f;color:#fff;overflow-x:hidden;line-height:1.6;}
        ::-webkit-scrollbar{width:5px;}
        ::-webkit-scrollbar-track{background:#07030f;}
        ::-webkit-scrollbar-thumb{background:#7c3aed;border-radius:99px;}

        .display{font-family:'Playfair Display',serif;}

        .grad-text{
          background:linear-gradient(135deg,#f97316 0%,#ec4899 50%,#7c3aed 100%);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }
        .grad-text2{
          background:linear-gradient(135deg,#7c3aed,#ec4899);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
        }

        .glass{background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);backdrop-filter:blur(16px);}
        .glass2{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);backdrop-filter:blur(20px);}

        @keyframes fadeUp{from{opacity:0;transform:translateY(28px);}to{opacity:1;transform:none;}}
        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
        @keyframes spinSlow{from{transform:rotate(0);}to{transform:rotate(360deg);}}
        @keyframes ticker{0%{transform:translateX(0);}100%{transform:translateX(-50%);}}
        @keyframes pulseGlow{0%,100%{box-shadow:0 0 20px rgba(124,58,237,0.4);}50%{box-shadow:0 0 50px rgba(236,72,153,0.6);}}

        .fadeUp{animation:fadeUp 0.7s ease both;}
        .d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.35s}
        .d4{animation-delay:.5s}.d5{animation-delay:.65s}

        .floatAnim{animation:float 6s ease-in-out infinite;}
        .spinSlow{animation:spinSlow 50s linear infinite;}
        .pulseGlow{animation:pulseGlow 3s ease-in-out infinite;}

        .navSolid{background:rgba(7,3,15,0.92)!important;border-bottom:1px solid rgba(255,255,255,0.07);}

        .orb{position:absolute;border-radius:50%;filter:blur(90px);pointer-events:none;}

        .featCard{transition:transform .3s,box-shadow .3s;}
        .featCard:hover{transform:translateY(-8px);box-shadow:0 24px 60px rgba(0,0,0,0.5);}

        .svcCard{transition:transform .3s,box-shadow .3s;}
        .svcCard:hover{transform:translateY(-6px);box-shadow:0 20px 50px rgba(0,0,0,0.4);}

        .whyCard{transition:background .3s,border-color .3s;}
        .whyCard:hover{background:rgba(255,255,255,0.09)!important;border-color:rgba(124,58,237,0.5)!important;}

        .testiCard{transition:transform .3s;}
        .testiCard:hover{transform:translateY(-4px);}

        .planCard{transition:transform .3s;}
        .planCard:hover{transform:translateY(-7px);}

        .faqBody{overflow:hidden;transition:max-height .4s ease,opacity .3s ease;}

        .inp{
          width:100%;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);
          border-radius:12px;padding:14px 16px;color:#fff;
          font-family:'Outfit',sans-serif;font-size:.88rem;outline:none;
          transition:border-color .2s,background .2s;
        }
        .inp::placeholder{color:rgba(255,255,255,0.35);}
        .inp:focus{border-color:rgba(124,58,237,.7);background:rgba(255,255,255,.09);}

        .btnPrimary{
          display:inline-flex;align-items:center;gap:8px;
          background:linear-gradient(135deg,#7c3aed,#ec4899);
          color:#fff;font-weight:600;border:none;cursor:pointer;
          border-radius:14px;padding:14px 28px;font-size:.92rem;
          font-family:'Outfit',sans-serif;
          transition:transform .2s,box-shadow .2s;position:relative;overflow:hidden;
        }
        .btnPrimary::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,#ec4899,#7c3aed);opacity:0;transition:opacity .3s;}
        .btnPrimary:hover{transform:translateY(-2px);box-shadow:0 12px 40px rgba(124,58,237,.55);}
        .btnPrimary:hover::after{opacity:1;}
        .btnPrimary>span{position:relative;z-index:1;}

        .btnOutline{
          display:inline-flex;align-items:center;gap:8px;
          background:transparent;color:#fff;font-weight:500;
          border:1px solid rgba(255,255,255,.25);cursor:pointer;
          border-radius:14px;padding:14px 28px;font-size:.92rem;
          font-family:'Outfit',sans-serif;transition:background .2s,border-color .2s;
        }
        .btnOutline:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.45);}

        .divider{height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,.07),transparent);max-width:1200px;margin:0 auto;}

        .tickerTrack{display:flex;gap:48px;white-space:nowrap;animation:ticker 35s linear infinite;}

        @media(max-width:900px){
          .grid2{grid-template-columns:1fr!important;}
          .grid3{grid-template-columns:1fr 1fr!important;}
          .grid4{grid-template-columns:1fr 1fr!important;}
          .hideM{display:none!important;}
        }
        @media(max-width:600px){
          .grid3{grid-template-columns:1fr!important;}
          .grid4{grid-template-columns:1fr!important;}
          .heroFlex{flex-direction:column!important;}
        }
      `}</style>

      {/* ══════════════ NAV ══════════════ */}
      <nav className={scrolled ? "navSolid" : ""}
        style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, transition: "all .3s", backdropFilter: scrolled ? "blur(24px)" : "none" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 68, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}><FaStar /></div>
            <span className="display" style={{ fontSize: "1.2rem", fontWeight: 700, color: "#fff", letterSpacing: ".04em" }}>Vedic Astro</span>
          </div>
          </Link>
          <div className="hideM" style={{ display: "flex", gap: 30 }}>
            {navLinks.map(l => (
              <a key={l} href={`#${l.toLowerCase()}`}
                style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none", fontSize: ".85rem", fontWeight: 500, transition: "color .2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.6)")}>{l}</a>
            ))}
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="#contact" style={{ textDecoration: "none" }} className="hideM">
              <button className="btnOutline" style={{ padding: "9px 18px", fontSize: ".82rem" }}><span>Get Reading</span></button>
            </a>
            <a href="/login" style={{ textDecoration: "none" }}>
              <button className="btnPrimary" style={{ padding: "9px 18px", fontSize: ".82rem" }}><span className="flex items-center gap-2"><FaLock /> Login</span></button>
            </a>
          </div>
        </div>
      </nav>

      {/* ══════════════ HERO ══════════════ */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "130px 24px 90px", overflow: "hidden", background: "radial-gradient(ellipse 80% 60% at 50% 0%,#1c053a 0%,#07030f 70%)" }}>
        <div className="orb" style={{ width: 600, height: 600, background: "rgba(124,58,237,.2)", top: -150, left: -100 }} />
        <div className="orb" style={{ width: 500, height: 500, background: "rgba(236,72,153,.15)", top: 80, right: -100 }} />
        <div className="orb" style={{ width: 400, height: 400, background: "rgba(249,115,22,.1)", bottom: 0, left: "25%" }} />
        {/* Static star dots */}
        {[...Array(55)].map((_, i) => (
          <div key={i} style={{ position: "absolute", borderRadius: "50%", width: (i % 3) + 1, height: (i % 3) + 1, background: `rgba(255,255,255,${.15 + (i % 5) * .08})`, top: `${(i * 17 + 7) % 100}%`, left: `${(i * 23 + 11) % 100}%`, pointerEvents: "none" }} />
        ))}
        <div className="spinSlow" style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", fontSize: 700, opacity: .025, lineHeight: 1, pointerEvents: "none", fontFamily: "'Playfair Display',serif", color: "#fff" }}>✦</div>

        <div style={{ position: "relative", zIndex: 10, maxWidth: 860 }}>
          <div className="fadeUp d1" style={{ marginBottom: 24 }}>
            <span className="glass" style={{ display: "inline-flex", alignItems: "center", gap: 8, borderRadius: 99, padding: "6px 18px", fontSize: ".76rem", color: "#c4b5fd", fontWeight: 500 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#a78bfa", display: "inline-block" }} />
              Ancient Wisdom · Modern Precision
            </span>
          </div>

          <h1 className="fadeUp d2 display" style={{ fontSize: "clamp(2.8rem,7vw,5.5rem)", fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
            <span style={{ color: "#fff" }}>Discover Your </span>
            <span className="grad-text">Cosmic Path</span><br />
            <em style={{ color: "#fff" }}>with Vedic Wisdom</em>
          </h1>

          <p className="fadeUp d3" style={{ color: "rgba(255,255,255,.58)", fontSize: "1.05rem", maxWidth: 620, margin: "0 auto 40px", lineHeight: 1.8 }}>
            The most authentic Vedic astrology platform — daily Panchang, personalised Kundali, Muhurat timing and expert consultations, all in one beautiful app trusted by 50,000+ seekers worldwide.
          </p>

          <div className="fadeUp d4 heroFlex" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" style={{ textDecoration: "none" }}>
              <button className="btnPrimary pulseGlow" style={{ fontSize: "1rem", padding: "16px 36px", borderRadius: 16 }}>
                <span>Begin Your Journey ✦</span>
              </button>
            </a>
            <a href="#services" style={{ textDecoration: "none" }}>
              <button className="btnOutline" style={{ fontSize: "1rem", padding: "16px 36px", borderRadius: 16 }}>
                <span>Explore Services →</span>
              </button>
            </a>
          </div>

          <div className="fadeUp d5" style={{ marginTop: 56, display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {["50K+ Happy Users", "4.9★ Rating", "40+ Countries", "100% Vedic Authentic"].map(t => (
              <span key={t} style={{ color: "rgba(255,255,255,.35)", fontSize: ".78rem", display: "flex", alignItems: "center", gap: 6 }}>
                <FaStar style={{ color: "#7c3aed", fontSize: ".7rem" }} />{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,.06)", borderBottom: "1px solid rgba(255,255,255,.06)", background: "rgba(124,58,237,.07)", padding: "36px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, textAlign: "center" }} className="grid4">
          {stats.map(s => (
            <div key={s.label}>
              <p className="display grad-text" style={{ fontSize: "2.3rem", fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
              <p style={{ color: "rgba(255,255,255,.48)", fontSize: ".82rem", marginTop: 4, fontWeight: 500 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ ZODIAC TICKER ══════════════ */}
      <div style={{ overflow: "hidden", padding: "13px 0", background: "rgba(7,3,15,.7)", borderBottom: "1px solid rgba(255,255,255,.05)" }}>
        <div className="tickerTrack">
          {["♈ Aries","♉ Taurus","♊ Gemini","♋ Cancer","♌ Leo","♍ Virgo","♎ Libra","♏ Scorpio","♐ Sagittarius","♑ Capricorn","♒ Aquarius","♓ Pisces",
            "♈ Aries","♉ Taurus","♊ Gemini","♋ Cancer","♌ Leo","♍ Virgo","♎ Libra","♏ Scorpio","♐ Sagittarius","♑ Capricorn","♒ Aquarius","♓ Pisces"].map((z, i) => (
            <span key={i} style={{ color: "rgba(255,255,255,.28)", fontSize: ".78rem", fontWeight: 500, letterSpacing: ".1em", flexShrink: 0 }}>{z}</span>
          ))}
        </div>
      </div>

      {/* ══════════════ FEATURES ══════════════ */}
      <section id="features" style={{ padding: "100px 24px", background: "#07030f" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={S.sectionLabel}>What We Offer</span>
            <h2 className="display" style={S.h2}>
              Everything You Need to <span className="grad-text">Navigate the Cosmos</span>
            </h2>
            <p style={{ ...S.bodyText, maxWidth: 540, margin: "0 auto" }}>Six powerful features built on authentic Vedic astrology — all in one seamless platform.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="grid3">
            {features.map(f => (
              <div key={f.title} className="featCard glass" style={{ borderRadius: 24, padding: "28px 24px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: f.grad }} />
                <div style={{ width: 52, height: 52, borderRadius: 14, background: f.grad, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem", marginBottom: 18 }}>{f.icon}</div>
                <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "1rem", marginBottom: 10 }}>{f.title}</h3>
                <p style={{ ...S.bodyText, fontSize: ".86rem" }}>{f.desc}</p>
                <div style={{ marginTop: 18, fontSize: ".8rem", fontWeight: 600, color: "rgba(255,255,255,.55)", display: "flex", alignItems: "center", gap: 4 }}>Learn more ›</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ══════════════ ABOUT ══════════════ */}
      <section id="about" style={{ padding: "100px 24px", background: "linear-gradient(180deg,#07030f 0%,#0d0520 100%)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 72, alignItems: "center" }} className="grid2">
          <div>
            <span style={S.sectionLabel}>About Us</span>
            <h2 className="display" style={S.h2}>
              Bridging Ancient Jyotish<br /><em className="grad-text2">with Modern Life</em>
            </h2>
            <p style={{ ...S.bodyText, marginBottom: 16 }}>
              Founded in 2021 by a team of Vedic scholars, data engineers and product designers, Vedic Astro was born from a simple belief: ancient cosmic wisdom should be accessible to everyone, without compromise on accuracy or authenticity.
            </p>
            <p style={{ ...S.bodyText, marginBottom: 36 }}>
              We work with practising Jyotish pandits and computational astronomers to ensure every calculation, every reading and every recommendation is grounded in legitimate Vedic tradition — not algorithmic guesswork.
            </p>
            <a href="#contact" style={{ textDecoration: "none" }}>
              <button className="btnPrimary"><span>Our Story →</span></button>
            </a>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {aboutPoints.map(p => (
              <div key={p.title} className="glass" style={{ borderRadius: 20, padding: 24, display: "flex", gap: 18, alignItems: "flex-start" }}>
                <div style={{ fontSize: "2rem", lineHeight: 1, flexShrink: 0 }}>{p.icon}</div>
                <div>
                  <h4 style={{ color: "#fff", fontWeight: 600, marginBottom: 6 }}>{p.title}</h4>
                  <p style={{ ...S.bodyText, fontSize: ".86rem" }}>{p.desc}</p>
                </div>
              </div>
            ))}
            <div style={{ borderRadius: 20, padding: 24, background: "linear-gradient(135deg,rgba(124,58,237,.28),rgba(236,72,153,.18))", border: "1px solid rgba(124,58,237,.4)" }}>
              <p style={{ color: "#c4b5fd", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".14em", fontWeight: 600, marginBottom: 8 }}>Our Mission</p>
              <p className="display" style={{ color: "#fff", fontSize: "1.1rem", fontStyle: "italic", lineHeight: 1.6 }}>
                "To make authentic Vedic wisdom a daily companion for every seeking soul."
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ══════════════ SERVICES ══════════════ */}
      {/* <section id="services" style={{ padding: "100px 24px", background: "#0d0520" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={S.sectionLabel}>Our Services</span>
            <h2 className="display" style={S.h2}>
              Personalised <span className="grad-text">Cosmic Guidance</span>
            </h2>
            <p style={{ ...S.bodyText, maxWidth: 540, margin: "0 auto" }}>From free daily readings to expert one-on-one consultations — choose the depth of insight that suits your journey.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }} className="grid4">
            {services.map(s => (
              <div key={s.title} className="svcCard" style={{ borderRadius: 24, padding: "28px 22px", background: s.grad, border: `1px solid ${s.border}`, position: "relative", overflow: "hidden" }}>
                {s.featured && <div style={{ position: "absolute", top: 14, right: 14, background: "linear-gradient(135deg,#ec4899,#be185d)", color: "#fff", fontSize: ".62rem", fontWeight: 700, letterSpacing: ".1em", padding: "3px 10px", borderRadius: 99 }}>POPULAR</div>}
                <div style={{ position: "absolute", bottom: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,.06)" }} />
                <div style={{ fontSize: "2rem", marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ color: "#fff", fontWeight: 700, fontSize: "1rem", marginBottom: 4 }}>{s.title}</h3>
                <p style={{ color: "rgba(255,255,255,.75)", fontWeight: 700, fontSize: "1.3rem", marginBottom: 12 }}>{s.price}</p>
                <p style={{ ...S.bodyText, fontSize: ".82rem", marginBottom: 16 }}>{s.desc}</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 7, marginBottom: 22 }}>
                  {s.points.map(pt => (
                    <li key={pt} style={{ color: "rgba(255,255,255,.72)", fontSize: ".79rem", display: "flex", gap: 8 }}>
                      <span style={{ color: "#a78bfa", flexShrink: 0 }}>✓</span>{pt}
                    </li>
                  ))}
                </ul>
                <a href="#contact" style={{ textDecoration: "none", display: "block" }}>
                  <button style={{ width: "100%", padding: 11, background: "rgba(255,255,255,.15)", border: "1px solid rgba(255,255,255,.25)", borderRadius: 12, color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: ".83rem", transition: "background .2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,.26)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.15)")}>
                    Get Started →
                  </button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* ══════════════ WHY CHOOSE US ══════════════ */}
      <section id="why" style={{ padding: "100px 24px", background: "linear-gradient(180deg,#0d0520 0%,#07030f 100%)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={S.sectionLabel}>Why Choose Us</span>
            <h2 className="display" style={S.h2}>
              The Vedic Astro <span className="grad-text">Difference</span>
            </h2>
            <p style={{ ...S.bodyText, maxWidth: 500, margin: "0 auto" }}>We are not another generic horoscope app. Here is what genuinely sets us apart.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="grid3">
            {whyUs.map(w => (
              <div key={w.title} className="whyCard glass" style={{ borderRadius: 20, padding: "28px 24px" }}>
                <div style={{ fontSize: "2.2rem", marginBottom: 16 }}>{w.icon}</div>
                <h4 style={{ color: "#fff", fontWeight: 600, fontSize: ".98rem", marginBottom: 10 }}>{w.title}</h4>
                <p style={{ ...S.bodyText, fontSize: ".86rem" }}>{w.desc}</p>
              </div>
            ))}
          </div>
          {/* Press quote */}
          <div style={{ marginTop: 52, borderRadius: 28, padding: "44px 40px", textAlign: "center", background: "linear-gradient(135deg,rgba(124,58,237,.14),rgba(236,72,153,.09))", border: "1px solid rgba(124,58,237,.24)" }}>
            <p className="display" style={{ fontSize: "clamp(1.2rem,2.8vw,1.8rem)", color: "#fff", fontStyle: "italic", lineHeight: 1.55, maxWidth: 700, margin: "0 auto" }}>
              "Vedic Astro is the only app I trust to give me authentic Jyotish guidance — not watered-down sun-sign forecasts."
            </p>
            <p style={{ color: "rgba(255,255,255,.35)", fontSize: ".78rem", marginTop: 16 }}>— Featured in Times of India · The Hindu · YourStory</p>
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section style={{ padding: "100px 24px", background: "#07030f" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={S.sectionLabel}>How It Works</span>
            <h2 className="display" style={S.h2}>
              Four Steps to <span className="grad-text">Cosmic Clarity</span>
            </h2>
          </div>
          <div style={{ position: "relative" }}>
            <div className="hideM" style={{ position: "absolute", top: 38, left: "11%", right: "11%", height: 1, background: "linear-gradient(90deg,transparent,rgba(124,58,237,.45),rgba(236,72,153,.45),transparent)", pointerEvents: "none" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }} className="grid4">
              {steps.map(s => (
                <div key={s.num} style={{ textAlign: "center" }}>
                  <div style={{ width: 78, height: 78, borderRadius: "50%", margin: "0 auto 20px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,rgba(124,58,237,.28),rgba(236,72,153,.18))", border: "1px solid rgba(124,58,237,.4)", position: "relative" }}>
                    <span style={{ fontSize: "1.6rem" }}>{s.icon}</span>
                    <span style={{ position: "absolute", top: -8, right: -8, width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".6rem", fontWeight: 700, color: "#fff" }}>{s.num}</span>
                  </div>
                  <h4 style={{ color: "#fff", fontWeight: 600, fontSize: ".92rem", marginBottom: 10 }}>{s.title}</h4>
                  <p style={{ ...S.bodyText, fontSize: ".83rem" }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "center", marginTop: 52 }}>
            <a href="#contact" style={{ textDecoration: "none" }}>
              <button className="btnPrimary" style={{ fontSize: "1rem", padding: "16px 36px" }}>
                <span>Start For Free — No Credit Card ✦</span>
              </button>
            </a>
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section id="testimonials" style={{ padding: "100px 24px", background: "linear-gradient(180deg,#07030f 0%,#0d0520 100%)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ ...S.sectionLabel, background: "rgba(236,72,153,.12)", borderColor: "rgba(236,72,153,.3)", color: "#f9a8d4" }}>Testimonials</span>
            <h2 className="display" style={S.h2}>
              Loved by <span className="grad-text">50,000+ Seekers</span>
            </h2>
            <p style={{ ...S.bodyText, maxWidth: 500, margin: "0 auto" }}>Real stories from real users whose lives have aligned with cosmic guidance.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }} className="grid3">
            {testimonials.map(t => (
              <div key={t.name} className="testiCard glass" style={{ borderRadius: 22, padding: "28px 24px" }}>
                <div style={{ color: "#fbbf24", letterSpacing: 2, fontSize: ".82rem", marginBottom: 16 }}>★★★★★</div>
                <p style={{ ...S.bodyText, fontSize: ".86rem", fontStyle: "italic", marginBottom: 20 }}>"{t.text}"</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,.07)" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,rgba(124,58,237,.3),rgba(236,72,153,.3))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>{t.avatar}</div>
                  <div>
                    <p style={{ color: "#fff", fontWeight: 600, fontSize: ".86rem" }}>{t.name}</p>
                    <p style={{ color: "rgba(255,255,255,.38)", fontSize: ".74rem" }}>{t.role}</p>
                  </div>
                  <span style={{ marginLeft: "auto", color: "#a78bfa", fontSize: ".7rem", fontWeight: 500 }}>{t.sign}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 48, display: "flex", justifyContent: "center", gap: 36, flexWrap: "wrap" }}>
            {["Google Play 4.9★", "App Store 4.8★", "10M+ Readings", "40+ Countries"].map(item => (
              <span key={item} style={{ color: "rgba(255,255,255,.38)", fontSize: ".8rem", display: "flex", alignItems: "center", gap: 8 }}>
                <FaStar style={{ color: "#7c3aed", fontSize: ".7rem" }} />{item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ PRICING ══════════════ */}
      <section id="pricing" style={{ padding: "100px 24px", background: "#0d0520" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={{ ...S.sectionLabel, background: "rgba(249,115,22,.12)", borderColor: "rgba(249,115,22,.3)", color: "#fdba74" }}>Pricing</span>
            <h2 className="display" style={S.h2}>
              Simple, <span className="grad-text">Transparent Plans</span>
            </h2>
            <p style={{ ...S.bodyText, maxWidth: 460, margin: "0 auto" }}>Start free forever. Upgrade only when you want deeper insight. No hidden fees.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 22 }} className="grid3">
            {plans.map(p => (
              <div key={p.name} className="planCard" style={{ borderRadius: 28, padding: "36px 28px", background: p.grad, border: `1px solid ${p.border}`, position: "relative", overflow: "hidden" }}>
                {p.featured && <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg,#ec4899,#7c3aed)" }} />}
                {p.featured && <div style={{ position: "absolute", top: 14, right: 14, background: "linear-gradient(135deg,#ec4899,#be185d)", color: "#fff", fontSize: ".62rem", fontWeight: 700, padding: "3px 10px", borderRadius: 99 }}>POPULAR</div>}
                <p style={{ color: "rgba(255,255,255,.5)", fontSize: ".72rem", textTransform: "uppercase", letterSpacing: ".14em", fontWeight: 600, marginBottom: 8 }}>{p.name}</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 22 }}>
                  <span className="display" style={{ fontSize: "2.4rem", fontWeight: 700, color: "#fff" }}>{p.price}</span>
                  <span style={{ color: "rgba(255,255,255,.4)", fontSize: ".82rem" }}>{p.period}</span>
                </div>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
                  {p.items.map(f => (
                    <li key={f} style={{ color: "rgba(255,255,255,.7)", fontSize: ".84rem", display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(124,58,237,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".55rem", flexShrink: 0 }}>✓</span>{f}
                    </li>
                  ))}
                </ul>
                <a href="#contact" style={{ textDecoration: "none", display: "block" }}>
                  <button style={{ width: "100%", padding: 13, borderRadius: 14, cursor: "pointer", fontFamily: "'Outfit',sans-serif", fontSize: ".88rem", fontWeight: 600, transition: "all .2s", ...(p.featured ? { background: "linear-gradient(135deg,#ec4899,#7c3aed)", color: "#fff", border: "none" } : { background: "rgba(255,255,255,.1)", color: "#fff", border: "1px solid rgba(255,255,255,.2)" }) }}>
                    {p.price === "Free" ? "Get Started Free" : "Choose Plan"} →
                  </button>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ FAQ ══════════════ */}
      <section style={{ padding: "100px 24px", background: "linear-gradient(180deg,#0d0520 0%,#07030f 100%)" }}>
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <span style={S.sectionLabel}>FAQ</span>
            <h2 className="display" style={S.h2}>
              Frequently Asked <span className="grad-text">Questions</span>
            </h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {faqs.map((f, i) => (
              <div key={i} className="glass" style={{ borderRadius: 18, overflow: "hidden", borderColor: faqOpen === i ? "rgba(124,58,237,.5)" : "rgba(255,255,255,.1)" }}>
                <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{ width: "100%", textAlign: "left", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "none", border: "none", cursor: "pointer", color: "#fff", fontFamily: "'Outfit',sans-serif", fontSize: ".92rem", fontWeight: 500 }}>
                  <span>{f.q}</span>
                  <span style={{ fontSize: "1.3rem", color: "#7c3aed", flexShrink: 0, marginLeft: 16, transition: "transform .3s", transform: faqOpen === i ? "rotate(45deg)" : "none" }}>+</span>
                </button>
                <div className="faqBody" style={{ maxHeight: faqOpen === i ? 220 : 0, opacity: faqOpen === i ? 1 : 0 }}>
                  <p style={{ padding: "0 24px 22px", ...S.bodyText, fontSize: ".86rem" }}>{f.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="divider" />

      {/* ══════════════ CONTACT ══════════════ */}
      <section id="contact" style={{ padding: "100px 24px", background: "#07030f" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1.35fr", gap: 72, alignItems: "start" }} className="grid2">
          {/* Info */}
          <div>
            <span style={{ ...S.sectionLabel, background: "rgba(20,184,166,.12)", borderColor: "rgba(20,184,166,.3)", color: "#5eead4" }}>Get In Touch</span>
            <h2 className="display" style={S.h2}>
              Let the Stars<br /><em className="grad-text2">Guide Your Next Step</em>
            </h2>
            <p style={{ ...S.bodyText, marginBottom: 40 }}>
              Have questions about a reading? Want to book a consultation? Or just curious about Vedic astrology? We are here for you — and so are the stars.
            </p>
            {[
              { icon: <FaEnvelope />, label: "Email", val: "hello@vedicastro.app" },
              { icon: <FaPhone />, label: "Phone", val: "+91 8128305710" },
              { icon: <FaClock />, label: "Support Hours", val: "Mon–Sat, 9 AM – 7 PM IST" },
              { icon: <FaMapMarkerAlt />, label: "Office", val: "Ahmedabad, Gujarat, India" },
            ].map(c => (
              <div key={c.label} style={{ display: "flex", gap: 16, marginBottom: 22, alignItems: "center" }}>
                <div style={{ width: 46, height: 46, borderRadius: 13, background: "linear-gradient(135deg,rgba(124,58,237,.28),rgba(236,72,153,.18))", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", flexShrink: 0 }}>{c.icon}</div>
                <div>
                  <p style={{ color: "rgba(255,255,255,.38)", fontSize: ".7rem", textTransform: "uppercase", letterSpacing: ".1em", fontWeight: 600 }}>{c.label}</p>
                  <p style={{ color: "#fff", fontSize: ".88rem", fontWeight: 500 }}>{c.val}</p>
                </div>
              </div>
            ))}
            <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
              {[<FaTwitter />, <FaFacebookF />, <FaInstagram />, <FaYoutube />].map((icon, i) => (
                <div key={i} style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.1)", cursor: "pointer", fontSize: "1.1rem", color: "rgba(255,255,255,.55)", transition: "background .2s", display: "flex", alignItems: "center", justifyContent: "center" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(124,58,237,.3)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.06)")}>{icon}</div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="glass2" style={{ borderRadius: 28, padding: "40px 36px" }}>
            {submitted ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <div style={{ fontSize: "3.5rem", marginBottom: 20 }}><FaStar style={{ color: "#fbbf24" }} /></div>
                <h3 className="display" style={{ color: "#fff", fontSize: "1.6rem", fontWeight: 700, marginBottom: 12 }}>Message Received!</h3>
                <p style={{ ...S.bodyText, fontSize: ".9rem" }}>
                  Thank you for reaching out. Our team will respond within 24 hours. The cosmos is already aligning in your favour. <FaStar style={{ fontSize: ".8rem", display: "inline" }} />
                </p>
                <button className="btnPrimary" style={{ marginTop: 24 }} onClick={() => { setSubmitted(false); setSubmitError(""); }}>
                  <span>Send Another Message</span>
                </button>
              </div>
            ) : (
              <>
                <h3 style={{ color: "#fff", fontWeight: 600, fontSize: "1.15rem", marginBottom: 4 }}>Send Us a Message</h3>
                <p style={{ ...S.bodyText, fontSize: ".82rem", marginBottom: 28 }}>We typically respond within a few hours.</p>
                
                {submitError && (
                  <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", borderRadius: 12, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#fca5a5", fontSize: "1.1rem" }}>⚠</span>
                    <p style={{ color: "#fca5a5", fontSize: ".85rem" }}>{submitError}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div>
                      <label style={{ color: "rgba(255,255,255,.5)", fontSize: ".72rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Full Name *</label>
                      <input required className="inp" placeholder="Arjun Sharma" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} disabled={isSubmitting} />
                    </div>
                    <div>
                      <label style={{ color: "rgba(255,255,255,.5)", fontSize: ".72rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Phone</label>
                      <input className="inp" placeholder="+91 98765 43210" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} disabled={isSubmitting} />
                    </div>
                  </div>
                  <div>
                    <label style={{ color: "rgba(255,255,255,.5)", fontSize: ".72rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Email Address *</label>
                    <input required type="email" className="inp" placeholder="arjun@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} disabled={isSubmitting} />
                  </div>
                  <div>
                    <label style={{ color: "rgba(255,255,255,.5)", fontSize: ".72rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Service Interested In</label>
                    <select className="inp" style={{ appearance: "none" }} value={formData.service} onChange={e => setFormData({ ...formData, service: e.target.value })} disabled={isSubmitting}>
                      <option value="" style={{ background: "#1a0533" }}>Select a service…</option>
                      <option value="daily" style={{ background: "#1a0533" }}>Daily / Monthly Readings</option>
                      <option value="kundali" style={{ background: "#1a0533" }}>Birth Chart Analysis</option>
                      <option value="matching" style={{ background: "#1a0533" }}>Kundali Matching</option>
                      <option value="consultation" style={{ background: "#1a0533" }}>Live Consultation</option>
                      <option value="other" style={{ background: "#1a0533" }}>Other / General Query</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ color: "rgba(255,255,255,.5)", fontSize: ".72rem", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Your Message *</label>
                    <textarea required className="inp" rows={4} placeholder="Tell us what you are looking for, or ask us anything about Vedic astrology…" style={{ resize: "vertical", minHeight: 110 }} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })} disabled={isSubmitting} />
                  </div>
                  <button type="submit" className="btnPrimary" style={{ width: "100%", justifyContent: "center", fontSize: ".95rem", padding: 15, opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? "not-allowed" : "pointer" }} disabled={isSubmitting}>
                    <span>{isSubmitting ? "Sending..." : "Send Message ✦"}</span>
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA BANNER ══════════════ */}
      <section style={{ padding: "90px 24px", position: "relative", overflow: "hidden", background: "linear-gradient(135deg,#1a0533 0%,#0f0520 50%,#07030f 100%)" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle,rgba(124,58,237,.2) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center", position: "relative" }}>
          <h2 className="display" style={{ fontSize: "clamp(2rem,5vw,3.4rem)", fontWeight: 800, color: "#fff", lineHeight: 1.2, marginBottom: 20 }}>
            Your Chart. Your Destiny.<br /><span className="grad-text"><em>Your Time is Now.</em></span>
          </h2>
          <p style={{ ...S.bodyText, maxWidth: 500, margin: "0 auto 36px", fontSize: ".98rem" }}>
            Join 50,000+ seekers already navigating life with authentic Vedic wisdom. Free to start — no credit card required.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#contact" style={{ textDecoration: "none" }}>
              <button className="btnPrimary pulseGlow" style={{ fontSize: "1rem", padding: "16px 36px" }}>
                <span>Start Free Today ✦</span>
              </button>
            </a>
            <a href="#services" style={{ textDecoration: "none" }}>
              <button className="btnOutline" style={{ fontSize: "1rem", padding: "16px 36px" }}>
                <span>View All Services</span>
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════ FOOTER ══════════════ */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,.06)", background: "#04010a", padding: "64px 24px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48, marginBottom: 52 }} className="grid4">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}><FaStar /></div>
                <span className="display" style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>Vedic Astro</span>
              </div>
              <p style={{ ...S.bodyText, fontSize: ".83rem", maxWidth: 270 }}>Authentic Vedic astrology for the modern seeker. Read the stars. Know thyself.</p>
              <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
                {[<FaTwitter />, <FaFacebookF />, <FaInstagram />, <FaYoutube />].map((icon, i) => (
                  <div key={i} style={{ width: 34, height: 34, borderRadius: 8, background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: ".9rem", transition: "background .2s" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(124,58,237,.3)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,.07)")}>{icon}</div>
                ))}
              </div>
            </div>
            {[
              { heading: "Platform", links: ["Daily Astrology", "Monthly Forecast", "Panchang", "Birth Chart", "Kundali Matching"] },
              { heading: "Company", links: ["About Us", "Our Team", "Blog", "Careers", "Press Kit"] },
              { heading: "Support", links: ["Help Centre", "Privacy Policy", "Terms of Service", "Refund Policy", "Contact Us"] },
            ].map(col => (
              <div key={col.heading}>
                <p style={{ color: "#fff", fontWeight: 600, fontSize: ".82rem", marginBottom: 18, letterSpacing: ".05em" }}>{col.heading}</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 11 }}>
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" style={{ color: "rgba(255,255,255,.38)", textDecoration: "none", fontSize: ".81rem", transition: "color .2s" }}
                        onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,.8)")}
                        onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.38)")}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <p style={{ color: "rgba(255,255,255,.22)", fontSize: ".76rem" }}>© 2026 Vedic Astro · Built with ♥ for seekers worldwide · Bengaluru, India</p>
            <div style={{ display: "flex", gap: 24 }}>
              {["Privacy", "Terms", "Cookies"].map(l => (
                <a key={l} href="#" style={{ color: "rgba(255,255,255,.28)", fontSize: ".76rem", textDecoration: "none", transition: "color .2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,.7)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,.28)")}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
