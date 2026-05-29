import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [stats, setStats] = useState([
    { value: "...", label: "Active Pirates" },
    { value: "...", label: "Challenges" },
    { value: "...", label: "Competitions" },
    { value: "...", label: "Categories" },
  ]);

  useEffect(() => {
    Promise.all([
      fetch("http://127.0.0.1:8000/api/leaderboard").then(r => r.json()),
      fetch("http://127.0.0.1:8000/api/competitions").then(r => r.json()),
    ]).then(([users, competitions]) => {
      setStats([
        { value: (users.total ?? users.data?.length ?? "?").toString(), label: "Active Pirates" },
        { value: (competitions.data ?? competitions).length.toString(), label: "Competitions" },
        { value: "6", label: "Categories" },
        { value: "FREE", label: "Registration" },
      ]);
    }).catch(() => {});
  }, []);

  const features = [
    {
      icon: "⚔️",
      title: "Varied Challenges",
      desc: "Web, Crypto, Pwn, Forensics, Reverse — challenges for every level of pirate.",
    },
    {
      icon: "🏴‍☠️",
      title: "Teams & Crews",
      desc: "Build your crew, register for competitions, and dominate the rankings.",
    },
    {
      icon: "🗺️",
      title: "Live Competitions",
      desc: "Regular CTF events with real-time leaderboards and rewards.",
    },
    {
      icon: "💡",
      title: "Hint System",
      desc: "Stuck? Use strategic hints to move forward without spoiling the challenge.",
    },
    {
      icon: "🔐",
      title: "Advanced Security",
      desc: "Anti-brute force, IP detection, flag protection — everything is secured.",
    },
    {
      icon: "🏆",
      title: "Global Leaderboard",
      desc: "Climb the global rankings and prove you are the greatest pirate.",
    },
  ];

  return (
    <div style={{
      background: "#0B0F1A",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', sans-serif",
      color: "#F0F6FF",
      overflowX: "hidden",
    }}>

      {/* Nav */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
        padding: "0 40px", height: "70px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: scrollY > 50 ? "rgba(11,15,26,0.95)" : "transparent",
        borderBottom: scrollY > 50 ? "1px solid rgba(255,255,255,0.05)" : "none",
        backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
        transition: "all 0.3s ease",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            width: "36px", height: "36px", background: "#F0B429",
            borderRadius: "8px", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "18px",
          }}>⚓</div>
          <span style={{ fontFamily: "Georgia, serif", fontSize: "20px", letterSpacing: "2px" }}>
            PIRATE<span style={{ color: "#00D4FF" }}>.CYBER</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
              color: "#8B949E", padding: "8px 20px", borderRadius: "8px",
              fontFamily: "Consolas, monospace", fontSize: "12px",
              letterSpacing: "2px", cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => {
              (e.target as HTMLElement).style.color = "#F0F6FF";
              (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.3)";
            }}
            onMouseLeave={e => {
              (e.target as HTMLElement).style.color = "#8B949E";
              (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.15)";
            }}
          >
            LOGIN
          </button>
          <button
            onClick={() => navigate("/signup")}
            style={{
              background: "#F0B429", border: "none",
              color: "#000", padding: "8px 20px", borderRadius: "8px",
              fontFamily: "Consolas, monospace", fontSize: "12px",
              letterSpacing: "2px", cursor: "pointer", fontWeight: "700",
            }}
          >
            START ADVENTURE →
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: "120px 40px 80px",
        position: "relative",
        background: `
          radial-gradient(ellipse 80% 50% at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 60%),
          radial-gradient(ellipse 50% 40% at 80% 80%, rgba(240,180,41,0.06) 0%, transparent 50%),
          #0B0F1A
        `,
      }}>
        <div style={{
          position: "absolute", inset: 0, zIndex: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }} />

        <div style={{
          position: "relative", zIndex: 1,
          display: "inline-flex", alignItems: "center", gap: "8px",
          background: "rgba(0,212,255,0.08)",
          border: "1px solid rgba(0,212,255,0.2)",
          borderRadius: "20px", padding: "6px 16px", marginBottom: "32px",
          fontFamily: "Consolas, monospace", fontSize: "11px",
          color: "#00D4FF", letterSpacing: "2px",
        }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00CC66", display: "inline-block" }} />
          SEASON 01 · GRAND LINE IS OPEN
        </div>

        <h1 style={{
          position: "relative", zIndex: 1,
          fontFamily: "Georgia, serif",
          fontSize: "clamp(48px, 8vw, 96px)",
          lineHeight: 1.1, marginBottom: "24px", fontWeight: "normal",
        }}>
          Hack the seas.<br />
          <span style={{ color: "#F0B429" }}>Capture </span>
          <span style={{ color: "#00D4FF" }}>the flags.</span>
        </h1>

        <p style={{
          position: "relative", zIndex: 1,
          color: "#8B949E", fontSize: "18px", lineHeight: 1.7,
          maxWidth: "600px", marginBottom: "48px",
        }}>
          A new breed of CTF platform. Sail across a{" "}
          <span style={{ color: "#00D4FF", fontFamily: "Consolas, monospace" }}>digital ocean</span>,
          conquer islands of code, and stack bounty as the most feared ethical hacker on the Grand Line.
        </p>

        <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "16px", flexWrap: "wrap", justifyContent: "center" }}>
          <button
            onClick={() => navigate("/signup")}
            style={{
              background: "#F0B429", color: "#000", border: "none",
              padding: "16px 36px", borderRadius: "10px",
              fontFamily: "Consolas, monospace", fontSize: "13px",
              letterSpacing: "3px", fontWeight: "700", cursor: "pointer",
              boxShadow: "0 0 30px rgba(240,180,41,0.3)",
            }}
          >
            START ADVENTURE →
          </button>
          <button
            onClick={() => navigate("/login")}
            style={{
              background: "transparent",
              border: "1px solid rgba(0,212,255,0.3)",
              color: "#00D4FF", padding: "16px 36px", borderRadius: "10px",
              fontFamily: "Consolas, monospace", fontSize: "13px",
              letterSpacing: "3px", cursor: "pointer",
            }}
          >
            {">_ VIEW MISSIONS"}
          </button>
        </div>

        <div style={{
          position: "relative", zIndex: 1,
          display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1px", marginTop: "80px", width: "100%", maxWidth: "700px",
          background: "rgba(255,255,255,0.05)", borderRadius: "16px",
          overflow: "hidden", border: "1px solid rgba(255,255,255,0.05)",
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{ padding: "28px 20px", textAlign: "center", background: "rgba(11,15,26,0.8)" }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: "32px", color: "#F0B429", marginBottom: "6px" }}>
                {s.value}
              </div>
              <div style={{ fontFamily: "Consolas, monospace", fontSize: "10px", color: "#8B949E", letterSpacing: "2px", textTransform: "uppercase" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: "100px 40px", maxWidth: "1200px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px" }}>
          <p style={{ fontFamily: "Consolas, monospace", fontSize: "11px", color: "#00D4FF", letterSpacing: "4px", marginBottom: "16px" }}>
            // PIRATE ARSENAL
          </p>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: "42px", fontWeight: "normal" }}>
            Everything you need<br />
            <span style={{ color: "#F0B429" }}>to rule the seas</span>
          </h2>
        </div>

        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "1px", background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.05)",
          borderRadius: "16px", overflow: "hidden",
        }}>
          {features.map((f, i) => (
            <div key={i} style={{ padding: "36px 32px", background: "#0D1117", transition: "background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background = "#161B22")}
              onMouseLeave={e => (e.currentTarget.style.background = "#0D1117")}
            >
              <div style={{ fontSize: "32px", marginBottom: "16px" }}>{f.icon}</div>
              <h3 style={{ fontFamily: "Georgia, serif", fontSize: "20px", marginBottom: "12px", color: "#F0F6FF" }}>
                {f.title}
              </h3>
              <p style={{ color: "#8B949E", fontSize: "14px", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section style={{
        padding: "100px 40px", textAlign: "center",
        background: `radial-gradient(ellipse 60% 60% at 50% 50%, rgba(240,180,41,0.06) 0%, transparent 70%)`,
      }}>
        <p style={{ fontFamily: "Consolas, monospace", fontSize: "11px", color: "#00D4FF", letterSpacing: "4px", marginBottom: "24px" }}>
          // READY TO SAIL?
        </p>
        <h2 style={{ fontFamily: "Georgia, serif", fontSize: "48px", fontWeight: "normal", marginBottom: "16px" }}>
          Join the crew
        </h2>
        <p style={{ color: "#8B949E", marginBottom: "40px", fontSize: "16px" }}>
          Sign up for free and start your CTF adventure today.
        </p>
        <button
          onClick={() => navigate("/signup")}
          style={{
            background: "#F0B429", color: "#000", border: "none",
            padding: "18px 48px", borderRadius: "10px",
            fontFamily: "Consolas, monospace", fontSize: "14px",
            letterSpacing: "3px", fontWeight: "700", cursor: "pointer",
            boxShadow: "0 0 40px rgba(240,180,41,0.25)",
          }}
        >
          CREATE ACCOUNT →
        </button>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid rgba(255,255,255,0.05)",
        padding: "32px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: "#8B949E", fontSize: "12px", fontFamily: "Consolas, monospace",
      }}>
        <span>⚓ PIRATE.CYBER © 2026</span>
        <span style={{ color: "#00CC66" }}>● ONLINE</span>
      </footer>
    </div>
  );
}