import React from "react";
import { Container } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaGavel, FaCheckCircle, FaBan, FaInfoCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

const sections = [
  { icon: FaCheckCircle, title: "Acceptance of Terms", content: "By creating an account or using ShapeUp, you agree to these Terms of Service. If you do not agree, please do not use our platform. We reserve the right to update these terms at any time, and continued use constitutes acceptance of changes." },
  { icon: FaGavel, title: "User Responsibilities", content: "You agree to provide accurate information during registration, maintain the confidentiality of your account credentials, use the platform in compliance with all applicable laws, and not misuse AI features for prohibited activities. You are solely responsible for your interactions and content." },
  { icon: FaBan, title: "Prohibited Activities", content: "You may not use ShapeUp for any unlawful purpose, impersonate others, attempt to access unauthorized systems, disrupt platform operations, scrape or harvest user data, reverse-engineer our AI systems, or engage in any activity that could harm our infrastructure or user community." },
  { icon: FaInfoCircle, title: "Limitation of Liability", content: "ShapeUp provides fitness guidance and AI-powered recommendations for informational purposes only. We are not a medical provider. Always consult a qualified healthcare professional before starting any fitness or nutrition program. We are not liable for injuries, losses, or damages resulting from use of our platform." },
];

export default function Terms() {
  return (
    <div className="page-wrapper position-relative" style={{ padding: "60px 0" }}>
      <Container style={{ maxWidth: 900 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem' }}>
              <FaGavel />
            </div>
          </Link>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 8 }}>
            <span className="gradient-text">Terms of Service</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: '0.85rem', maxWidth: 600, margin: "0 auto" }}>
            Last updated: June 2026 · Please read these terms carefully
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'rgba(8,12,24,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'var(--neon-cyan)', opacity: 0.03, filter: 'blur(30px)' }} />
              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'var(--neon-cyan)', flexShrink: 0 }}>
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
            Have questions about our terms? Contact us at{" "}
            <span style={{ color: "var(--neon-cyan)" }}>legal@shapeup.app</span>
          </p>
        </motion.div>
      </Container>
    </div>
  );
}
