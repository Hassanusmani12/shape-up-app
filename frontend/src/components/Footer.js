import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaDumbbell, FaHeart, FaTwitter, FaGithub, FaLinkedin, FaInstagram } from "react-icons/fa";

const Footer = () => {
  return (
    <footer style={{
      position: 'relative',
      zIndex: 2,
      background: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      borderTop: '1px solid rgba(0,255,136,0.08)',
      padding: '60px 0 32px',
      marginTop: 0,
    }}>
      <Container>
        <Row className="g-5 mb-5">
          {/* Brand */}
          <Col lg={4} md={6}>
            <Link to="/" className="d-inline-flex align-items-center gap-2 text-decoration-none mb-3">
              <div style={{
                width: 40, height: 40, borderRadius: 12,
                background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <FaDumbbell style={{ color: '#000', fontSize: '1rem' }} />
              </div>
              <span style={{
                fontWeight: 800, fontSize: '1.2rem', letterSpacing: 1,
                background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>
                SHAPE UP
              </span>
            </Link>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7, maxWidth: 280 }}>
              The all-in-one AI-powered fitness platform for nutrition tracking, workout planning, and progress visualization.
            </p>
            <div className="d-flex gap-3 mt-3">
              {[
                { Icon: FaTwitter, label: "Twitter", href: "https://twitter.com" },
                { Icon: FaGithub, label: "GitHub", href: "https://github.com" },
                { Icon: FaLinkedin, label: "LinkedIn", href: "https://linkedin.com" },
                { Icon: FaInstagram, label: "Instagram", href: "https://instagram.com" },
              ].map(({ Icon, label, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-muted)', textDecoration: 'none',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,136,0.3)'; e.currentTarget.style.color = 'var(--neon-green)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <Icon size={14} aria-hidden="true" />
                </a>
              ))}
            </div>
          </Col>

          {/* Product */}
          <Col lg={2} md={6} sm={4}>
            <h6 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Product</h6>
            <ul className="list-unstyled" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Features', path: '/pages/features' },
                { label: 'Workouts', path: '/pages/workouts' },
                { label: 'Nutrition', path: '/pages/nutrition-checker' },
                { label: 'AI Hub', path: '/ai-hub' },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--neon-green)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >{item.label}</Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Company */}
          <Col lg={2} md={6} sm={4}>
            <h6 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Company</h6>
            <ul className="list-unstyled" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'About', path: '/pages/about' },
                { label: 'Dashboard', path: '/dashboard' },
                { label: 'BMR Calculator', path: '/pages/bmr-calculator' },
                { label: 'Settings', path: '/pages/settings' },
              ].map((item) => (
                <li key={item.path}>
                  <Link to={item.path} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--neon-green)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >{item.label}</Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Legal */}
          <Col lg={2} md={6} sm={4}>
            <h6 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Legal</h6>
            <ul className="list-unstyled" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Privacy Policy', path: '/pages/privacy' },
                { label: 'Terms of Service', path: '/pages/terms' },
                { label: 'Cookie Policy', path: '/pages/cookies' },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--neon-green)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                  >{item.label}</Link>
                </li>
              ))}
            </ul>
          </Col>

          {/* Newsletter */}
          <Col lg={2} md={6}>
            <h6 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20 }}>Stay Updated</h6>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: 12 }}>Get fitness tips and product updates.</p>
            <div style={{ display: 'flex', gap: 0 }}>
              <input
                type="email"
                placeholder="Email"
                className="neon-input"
                style={{ borderRadius: '10px 0 0 10px', padding: '10px 12px', fontSize: '0.8rem', borderRight: 'none' }}
              />
              <button className="btn-cinematic btn-cinematic-green" style={{ borderRadius: '0 10px 10px 0', padding: '10px 16px', fontSize: '0.75rem' }}>
                Join
              </button>
            </div>
          </Col>
        </Row>

        {/* Bottom bar */}
        <div style={{
          height: 1,
          background: 'linear-gradient(90deg, transparent, rgba(0,255,136,0.1), rgba(0,212,255,0.1), transparent)',
          marginBottom: 24,
        }} />
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
            &copy; {new Date().getFullYear()} Shape Up. All rights reserved.
          </p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>
            Made with <FaHeart style={{ color: 'var(--neon-green)', margin: '0 3px', fontSize: '0.65rem' }} /> for fitness enthusiasts
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
