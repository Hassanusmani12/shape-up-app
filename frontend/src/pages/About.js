import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { FaCheckCircle, FaDumbbell, FaHeartbeat } from "react-icons/fa";

const AboutUs = () => {
  return (
    <div className="page-wrapper cinematic-section position-relative overflow-hidden" style={{ minHeight: '100vh' }} data-scene>
      <div className="background-wrapper" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.1, width: '500px', height: '500px', background: 'var(--accent-green)', top: '-150px', right: '-100px', animation: 'blobMove 12s infinite alternate' }} />
        <div style={{ position: 'absolute', borderRadius: '50%', filter: 'blur(120px)', opacity: 0.08, width: '400px', height: '400px', background: 'var(--accent-blue)', bottom: '-50px', left: '-50px', animation: 'blobMove 15s infinite alternate-reverse' }} />
      </div>
      <Container className="py-5 position-relative" style={{ zIndex: 2 }}>
        <Row className="justify-content-center mb-5">
          <Col md="auto" className="text-center">
            <div className="card-4d p-5">
              <div style={{ width: 72, height: 72, borderRadius: 20, background: 'linear-gradient(135deg, var(--accent-green), var(--accent-blue))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem' }}>
                <FaHeartbeat />
              </div>
              <h1 className="gradient-text athletic-heading fw-bold" style={{ fontSize: '2.5rem', marginBottom: 8 }} data-reveal>About Shape Up</h1>
              <p style={{ color: 'var(--text-muted)', maxWidth: 500, margin: '0 auto' }} data-fade>
                Your all-in-one fitness operating system
              </p>
            </div>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="card-4d p-4 p-md-5">
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.8, marginBottom: 24 }} data-fade>
                Shape Up is a fitness web app that helps people reach their
                fitness goals. It provides users with a variety of tools and
                resources to track nutrition, plan workouts, analyze progress, and stay motivated.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[
                  "Personal Account", "Diet Profile", "Goal Settings", "Meal Planner",
                  "Water Intake Log", "Workout Database", "Nutrition Checker", "BMR Calculator"
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.04)' }}>
                    <FaCheckCircle style={{ color: 'var(--accent-green)', flexShrink: 0 }} size={14} />
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem', fontWeight: 500 }}>{item}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 12, background: 'rgba(0,230,118,0.05)', border: '1px solid rgba(0,230,118,0.1)', display: 'flex', alignItems: 'center', gap: 12 }}>
                <FaDumbbell style={{ color: 'var(--accent-green)' }} />
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>1,000+</strong> active users and growing
                </span>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutUs;
