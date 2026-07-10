import React from "react";
import { Container } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaCookieBite, FaCog, FaChartBar, FaAd } from "react-icons/fa";
import { Link } from "react-router-dom";

const sections = [
  { icon: FaCookieBite, title: "What Are Cookies", content: "Cookies are small text files stored on your device when you visit our platform. They help us remember your preferences, authenticate your sessions, and improve your overall experience. Some cookies are essential for the platform to function, while others help us analyze usage and deliver relevant features." },
  { icon: FaChartBar, title: "Analytics Cookies", content: "We use analytics cookies to understand how you interact with ShapeUp — which features you use, how often you visit, and what content is most valuable to you. This data is anonymized and helps us prioritize improvements, fix issues, and build better fitness tools for our community." },
  { icon: FaCog, title: "Essential Cookies", content: "These cookies are necessary for the platform to work correctly. They enable core functionality such as user authentication, session management, and secure access to your fitness data. Essential cookies cannot be disabled, as the platform would not function without them." },
  { icon: FaAd, title: "Managing Cookies", content: "You can control and manage cookies through your browser settings. Most browsers allow you to block or delete cookies, though this may affect some platform functionality. We recommend keeping essential cookies enabled for the best experience. You can also clear cookies at any time." },
];

export default function CookiePolicy() {
  return (
    <div className="page-wrapper position-relative" style={{ padding: "60px 0" }}>
      <Container style={{ maxWidth: 900 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem' }}>
              <FaCookieBite />
            </div>
          </Link>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 8 }}>
            <span className="gradient-text">Cookie Policy</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: '0.85rem', maxWidth: 600, margin: "0 auto" }}>
            Last updated: June 2026 · How ShapeUp uses cookies and similar technologies
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'rgba(8,12,24,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: '#ff9100', opacity: 0.03, filter: 'blur(30px)' }} />
              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,145,0,0.08)', border: '1px solid rgba(255,145,0,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: '#ff9100', flexShrink: 0 }}>
                  <section.icon />
                </div>
                <h5 style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{section.title}</h5>
              </div>
              <p style={{ color: "var(--text-secondary)", fontSize: '0.85rem', lineHeight: 1.8, margin: 0 }}>{section.content}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          style={{ textAlign: 'center', marginTop: 40, padding: '24px', background: 'rgba(8,12,24,0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.04)' }}>
          <p style={{ color: "var(--text-muted)", fontSize: '0.82rem', margin: 0 }}>
            Need help managing cookies? Contact us at{" "}
            <span style={{ color: "#ff9100" }}>privacy@shapeup.app</span>
          </p>
        </motion.div>
      </Container>
    </div>
  );
}
