import React from "react";
import { Container } from "react-bootstrap";
import { motion } from "framer-motion";
import { FaShieldAlt, FaLock, FaEye, FaUserSecret } from "react-icons/fa";
import { Link } from "react-router-dom";

const sections = [
  { icon: FaShieldAlt, title: "Information We Collect", content: "We collect information you provide directly, including account details (email, username, password), profile information (age, weight, height, fitness goals), workout and nutrition data you log, and communications with our AI coaches. We also automatically collect usage data such as page views, feature interactions, and device information to improve our services." },
  { icon: FaLock, title: "How We Use Your Data", content: "Your data is used to personalize your fitness experience, provide AI-powered coaching and recommendations, improve our algorithms, communicate important updates, and ensure platform security. We never sell your personal information to third parties." },
  { icon: FaEye, title: "Data Sharing & Third Parties", content: "We may share anonymized, aggregate data for analytics and research purposes. Our AI features process data through encrypted API calls to our AI service providers. These providers are contractually bound to maintain data confidentiality and cannot use your data for their own purposes." },
  { icon: FaUserSecret, title: "Your Rights & Choices", content: "You can access, update, or delete your account data at any time through your profile settings. You may export your data, disable AI features, or request complete account deletion by contacting support. We retain your data only as long as necessary to provide our services." },
];

export default function Privacy() {
  return (
    <div className="page-wrapper position-relative" style={{ padding: "60px 0" }}>
      <Container style={{ maxWidth: 900 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-5">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem' }}>
              <FaShieldAlt />
            </div>
          </Link>
          <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', fontWeight: 900, marginBottom: 8 }}>
            <span className="gradient-text">Privacy Policy</span>
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: '0.85rem', maxWidth: 600, margin: "0 auto" }}>
            Last updated: June 2026 · How ShapeUp protects and handles your data
          </p>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {sections.map((section, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'rgba(8,12,24,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '24px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: 'var(--neon-green)', opacity: 0.03, filter: 'blur(30px)' }} />
              <div className="d-flex align-items-center gap-3 mb-3">
                <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', color: 'var(--neon-green)', flexShrink: 0 }}>
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
            Questions about our privacy practices? Contact us at{" "}
            <span style={{ color: "var(--neon-green)" }}>privacy@shapeup.app</span>
          </p>
        </motion.div>
      </Container>
    </div>
  );
}
