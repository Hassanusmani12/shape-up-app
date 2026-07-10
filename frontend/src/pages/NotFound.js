import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import { FaHome, FaDumbbell } from "react-icons/fa";

const NotFoundPage = () => (
  <div className="page-wrapper cinematic-section position-relative overflow-hidden d-flex align-items-center" style={{ minHeight: '100vh' }} data-scene>
    <div className="background-wrapper" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.1, width: '500px', height: '500px', background: 'var(--accent-green)', top: '-100px', right: '-100px', animation: 'blobMove 12s infinite alternate' }} />
      <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.08, width: '400px', height: '400px', background: 'var(--accent-blue)', bottom: '-50px', left: '-50px', animation: 'blobMove 15s infinite alternate-reverse' }} />
    </div>
    <Container className="position-relative" style={{ zIndex: 2 }}>
      <Row className="justify-content-center">
        <Col md={8} lg={6} className="text-center">
          <div className="card-4d p-5">
            <div style={{ width: 80, height: 80, borderRadius: 20, background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '2rem' }}>
              <FaDumbbell />
            </div>
            <h1 className="gradient-text athletic-heading" style={{ fontSize: '6rem', fontWeight: 900, lineHeight: 1, marginBottom: 8 }} data-reveal>404</h1>
            <h2 className="fw-bold mb-3" style={{ color: 'var(--text-primary)' }}>Page Not Found</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: 32, fontSize: '1.05rem' }}>
              The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>
            <Link to="/" className="btn-cinematic btn-cinematic-green text-decoration-none" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 32px' }}>
              <FaHome /> Back to Home
            </Link>
          </div>
        </Col>
      </Row>
    </Container>
  </div>
);

export default NotFoundPage;
