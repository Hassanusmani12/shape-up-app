import React, { useEffect, useState, useRef } from "react";
import { Container, Row, Col, Accordion, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FaDumbbell, FaAppleAlt, FaCalculator, FaUtensils, FaTint,
  FaArrowRight, FaCheckCircle, FaBolt, FaChartPie,
  FaGoogle, FaApple, FaHeartbeat, FaSpotify, FaStrava, FaRobot
} from "react-icons/fa";

const IMG_AI_SCAN = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop";
const IMG_WORKOUT_ANALYTICS = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop";
const IMG_MEAL_PLAN = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=1000&auto=format&fit=crop";

const FEATURES_LIST = [
  { id: 1, title: "Workout Database", icon: FaDumbbell, color: "#00ff88", description: "Access 500+ exercises with video guides. Filter by muscle group, difficulty, and equipment.", link: "/pages/workouts" },
  { id: 2, title: "AI Nutrition Checker", icon: FaAppleAlt, color: "#00d4ff", description: "Instantly analyze food quality. Get detailed macronutrient breakdowns for millions of items.", link: "/pages/nutrition-checker" },
  { id: 3, title: "BMR Calculator", icon: FaCalculator, color: "#7c4dff", description: "Scientific metabolic rate calculation. Know exactly how many calories you need.", link: "/pages/bmr-calculator" },
  { id: 4, title: "AI Hub", icon: FaRobot, color: "#ff6b9d", description: "Chat with your personal AI fitness coach. Get workout plans, nutrition advice and wellness tips instantly.", link: "/ai-hub" },
  { id: 5, title: "Hydration Tracking", icon: FaTint, color: "#00d4ff", description: "Log water intake effortlessly. Set daily goals and get smart reminders.", link: "/dashboard" },
  { id: 6, title: "Progress Analytics", icon: FaChartPie, color: "#00ff88", description: "Visualize weight loss trends, strength gains, and consistency streaks.", link: "/dashboard" },
];

const FAQS = [
  { q: "Do I need a wearable device?", a: "No, Shape Up works perfectly with manual logging, though we support syncing with major devices." },
  { q: "Is the food database global?", a: "Yes! We cover local cuisines from over 100 countries, including specific regional dishes." },
  { q: "Can I export my data?", a: "Pro users can export their nutrition and workout logs to PDF or CSV formats for sharing with trainers." },
];

const useInView = (threshold = 0.15) => {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const Reveal = ({ children, className = "", delay = 0 }) => {
  const [ref, vis] = useInView();
  return (
    <div ref={ref} className={className} style={{
      opacity: vis ? 1 : 0,
      transform: vis ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
};

const IntegrationBadge = ({ icon: Icon, name }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 16px',
    borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
    color: 'var(--text-secondary)', fontSize: '0.8rem', fontWeight: 500,
    transition: 'all 0.2s', cursor: 'default',
  }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,255,136,0.2)'; e.currentTarget.style.color = 'var(--neon-green)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
  >
    <Icon size={16} /> {name}
  </div>
);

const FeatureCard = ({ title, description, link, icon: Icon, color, delay }) => (
  <Reveal delay={delay}>
    <Link to={link} className="text-decoration-none h-100 d-block">
      <motion.div
        whileHover={{ y: -6, scale: 1.01 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="h-100"
        style={{
          background: 'rgba(8, 12, 24, 0.6)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
          padding: 32, position: 'relative', overflow: 'hidden', cursor: 'pointer',
          minHeight: 280,
        }}
      >
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          opacity: 0, transition: 'opacity 0.3s',
        }} className="card-glow-line" />
        <style>{`.card-glow-line { opacity: 0; } div:hover > .card-glow-line { opacity: 1; }`}</style>
        <div style={{
          width: 52, height: 52, borderRadius: 14, background: `${color}15`,
          border: `1px solid ${color}25`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.3rem', color, marginBottom: 20,
        }}>
          <Icon />
        </div>
        <h4 style={{ fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)', marginBottom: 10 }}>{title}</h4>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.7, marginBottom: 20 }}>{description}</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color, fontWeight: 700, fontSize: '0.82rem', marginTop: 'auto' }}>
          Launch Tool <FaArrowRight size={12} />
        </div>
      </motion.div>
    </Link>
  </Reveal>
);

const DetailedFeatureSection = ({ title, text, img, isReversed, badge }) => (
  <div className="py-5 my-4">
    <Row className={`align-items-center g-4 ${isReversed ? 'flex-row-reverse' : ''}`}>
      <Col lg={6}>
        <Reveal>
          <div style={{
            borderRadius: 20, overflow: 'hidden', position: 'relative',
            border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <img src={img} alt={title} loading="lazy" style={{ width: '100%', height: 350, objectFit: 'cover', display: 'block' }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.7) 100%)',
            }} />
          </div>
        </Reveal>
      </Col>
      <Col lg={6}>
        <Reveal delay={200}>
          <div style={{
            padding: '8px 16px', borderRadius: 999, display: 'inline-block', fontSize: '0.65rem',
            fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.12)',
            color: 'var(--neon-green)', marginBottom: 16,
          }}>
            {badge}
          </div>
          <h2 style={{ fontWeight: 800, fontSize: '1.8rem', color: 'var(--text-primary)', marginBottom: 16 }}>{title}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.8, marginBottom: 24 }}>{text}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {["Smart Recommendations", "Real-time Sync", "Exportable Reports"].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <FaCheckCircle style={{ color: 'var(--neon-green)', flexShrink: 0 }} /> {item}
              </div>
            ))}
          </div>
        </Reveal>
      </Col>
    </Row>
  </div>
);

const ComparisonTable = () => (
  <Reveal>
    <div style={{
      background: 'rgba(8,12,24,0.6)', backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
      padding: 40, marginTop: 40,
    }}>
      <div className="text-center mb-5">
        <h3 style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.6rem' }}>Free vs Pro</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Choose the power you need.</p>
      </div>
      <div className="table-responsive">
        <Table className="align-middle text-center" borderless>
          <thead>
            <tr>
              <th className="text-start ps-4" style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }}>Features</th>
              <th style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Starter (Free)</th>
              <th style={{ color: 'var(--neon-green)', fontWeight: 700, fontSize: '0.85rem' }}>Pro Athlete</th>
            </tr>
          </thead>
          <tbody>
            {[
              { f: "Workout Logging", free: true, pro: true },
              { f: "Calorie Counter", free: true, pro: true },
              { f: "Advanced Analytics", free: false, pro: true },
              { f: "AI Meal Plans", free: false, pro: true },
              { f: "Priority Support", free: false, pro: true },
            ].map((row, i) => (
              <tr key={i}>
                <td className="text-start ps-4" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{row.f}</td>
                <td>{row.free ? <FaCheckCircle style={{ color: 'var(--neon-green)' }} /> : <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
                <td>{row.pro ? <FaCheckCircle style={{ color: 'var(--neon-green)' }} /> : <span style={{ color: 'var(--text-muted)' }}>-</span>}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  </Reveal>
);

const Features = () => {
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="page-wrapper position-relative" style={{ overflow: 'visible' }}>

      {/* HERO */}
      <section style={{ padding: '100px 0 60px' }}>
        <Container>
          <Reveal>
            <div className="text-center">
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '8px 20px',
                borderRadius: 999, background: 'rgba(0,255,136,0.06)', border: '1px solid rgba(0,255,136,0.12)',
                color: 'var(--neon-green)', fontSize: '0.72rem', fontWeight: 700, letterSpacing: 2,
                textTransform: 'uppercase', marginBottom: 24,
              }}>
                <FaBolt size={14} /> Feature Suite 2.0
              </div>
              <h1 style={{
                fontWeight: 900, fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: 'var(--text-primary)',
                marginBottom: 16, lineHeight: 1.1,
              }}>
                Powerful Tools <br /> For Your Goals
              </h1>
              <p style={{
                color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.7,
                maxWidth: 600, margin: '0 auto 40px',
              }}>
                Unlock the ultimate fitness ecosystem. Everything you need to track, analyze, and improve your performance.
              </p>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>Compatible With</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
                <IntegrationBadge icon={FaApple} name="Health" />
                <IntegrationBadge icon={FaGoogle} name="Fit" />
                <IntegrationBadge icon={FaHeartbeat} name="Wearables" />
                <IntegrationBadge icon={FaSpotify} name="Spotify" />
                <IntegrationBadge icon={FaStrava} name="Strava" />
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* MAIN FEATURE CARDS */}
      <section style={{ padding: '40px 0 80px' }}>
        <Container>
          <Reveal>
            <div className="text-center mb-5">
              <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'var(--text-primary)' }}>Core Modules</h2>
              <div style={{ height: 3, width: 50, background: 'linear-gradient(90deg, var(--neon-green), var(--neon-cyan))', margin: '12px auto', borderRadius: 2 }} />
            </div>
          </Reveal>

          <Row className="g-4">
            {FEATURES_LIST.map((feature, index) => (
              <Col key={feature.id} xs={12} md={6} lg={4}>
                <FeatureCard {...feature} delay={index * 80} />
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      {/* DEEP DIVE SECTIONS */}
      <section style={{ padding: '40px 0' }}>
        <Container>
          <DetailedFeatureSection
            title="AI-Powered Nutrition"
            text="Stop guessing what's on your plate. Our advanced computer vision algorithms analyze your meals instantly, providing accurate calorie counts and macro breakdowns. It's like having a nutritionist in your pocket."
            img={IMG_AI_SCAN}
            badge="SMART SCAN"
          />
          <DetailedFeatureSection
            title="Advanced Workout Analytics"
            text="Go beyond simple logs. Visualize your strength curves, 1RM progression, and volume load over time. Identify plateaus before they happen and optimize your training blocks."
            img={IMG_WORKOUT_ANALYTICS}
            isReversed={true}
            badge="DATA DRIVEN"
          />
          <DetailedFeatureSection
            title="Dynamic Meal Planning"
            text="Eating healthy shouldn't be hard. Generate weekly shopping lists and recipes tailored to your taste buds and caloric needs."
            img={IMG_MEAL_PLAN}
            badge="AUTOMATION"
          />
        </Container>
      </section>

      {/* COMPARISON TABLE */}
      <section style={{ padding: '40px 0' }}>
        <Container>
          <ComparisonTable />
        </Container>
      </section>

      {/* FAQ */}
      <section style={{ padding: '60px 0 80px' }}>
        <Container>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Reveal>
                <div className="text-center mb-5">
                  <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', color: 'var(--text-primary)' }}>Common Questions</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Everything you need to know about the platform.</p>
                </div>
                <Accordion defaultActiveKey="0">
                  {FAQS.map((faq, idx) => (
                    <Accordion.Item eventKey={idx.toString()} key={idx}>
                      <Accordion.Header>{faq.q}</Accordion.Header>
                      <Accordion.Body>{faq.a}</Accordion.Body>
                    </Accordion.Item>
                  ))}
                </Accordion>
              </Reveal>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA */}
      {!userInfo && (
        <section style={{ padding: '0 0 80px' }}>
          <Container>
            <Reveal>
              <motion.div
                whileHover={{ y: -4 }}
                style={{
                  borderRadius: 24, padding: 60, textAlign: 'center', position: 'relative', overflow: 'hidden',
                  background: 'linear-gradient(135deg, rgba(0,255,136,0.12), rgba(0,212,255,0.06))',
                  border: '1px solid rgba(0,255,136,0.2)',
                }}
              >
                <h2 style={{ fontWeight: 800, fontSize: 'clamp(1.5rem, 3vw, 2.5rem)', color: 'var(--text-primary)', marginBottom: 12 }}>Ready to Transform?</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: 32 }}>Join thousands of others hitting their goals today.</p>
                <Link to="/pages/register" className="btn-cinematic btn-cinematic-green text-decoration-none" style={{ padding: '14px 40px', fontSize: '0.95rem', borderRadius: 14 }}>
                  Create Free Account <FaCheckCircle style={{ marginLeft: 6 }} />
                </Link>
              </motion.div>
            </Reveal>
          </Container>
        </section>
      )}
    </div>
  );
};

export default Features;
