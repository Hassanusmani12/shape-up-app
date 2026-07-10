import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Accordion, Form } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import {
  FaCheckCircle, FaPlay, FaStar,
  FaApple, FaGooglePlay,
  FaUtensils, FaChartLine, FaDumbbell,
  FaBrain, FaFire, FaArrowRight, FaTrophy, FaQuoteLeft, FaLightbulb
} from "react-icons/fa";
import { useGetReviewsQuery, useCreateReviewMutation } from "../slices/reviewsApiSlice";
import { toast } from "react-toastify";
import Loader from "../components/Loader";

const FEATURE_NUTRITION = "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1453&auto=format&fit=crop";

const FITNESS_QUOTES = [
  { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
  { text: "Strength does not come from physical capacity. It comes from an indomitable will.", author: "Mahatma Gandhi" },
  { text: "The groundwork for all happiness is good health.", author: "Leigh Hunt" },
  { text: "Take care of your body. It's the only place you have to live.", author: "Jim Rohn" },
];

const DAILY_TIPS = [
  "Drink at least 8 glasses of water today to stay hydrated and boost metabolism.",
  "Try a 10-minute walk after meals to improve digestion and blood sugar levels.",
  "Include protein in every meal to maintain muscle mass and stay full longer.",
  "Sleep 7-9 hours tonight — recovery is when your muscles actually grow.",
  "Stretch for 5 minutes every morning to improve flexibility and prevent injury.",
];

const Home = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);

  const { data: reviews, isLoading: loadingReviews, refetch } = useGetReviewsQuery();
  const [createReview, { isLoading: isCreating }] = useCreateReviewMutation();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const handler = (e) => {
      if (!heroRef.current) return;
      const rect = heroRef.current.getBoundingClientRect();
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
        y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
      });
    };
    window.addEventListener('mousemove', handler, { passive: true });
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  const dailyQuote = FITNESS_QUOTES[new Date().getDay() % FITNESS_QUOTES.length];
  const dailyTip = DAILY_TIPS[new Date().getDay() % DAILY_TIPS.length];

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!userInfo) { toast.error("You must be logged in!"); return; }
    try {
      await createReview({ rating, comment }).unwrap();
      toast.success("Review Added Successfully!");
      setComment(""); setRating(5); refetch();
    } catch (err) { toast.error(err?.data?.message || err.error); }
  };

  return (
    <div className="page-wrapper position-relative overflow-hidden">

      {/* ═══════════════════════════════════════════════
          MEGA HERO — Full viewport, mouse-reactive
          ═══════════════════════════════════════════════ */}
      <section ref={heroRef} className="mega-hero" style={{ perspective: 1000 }}>
        {/* Mouse-reactive orbs */}
        <div style={{
          position: 'absolute', top: '15%', left: '10%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,136,0.1), transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
          transform: `translate(${mousePos.x * 20}px, ${mousePos.y * 15}px)`,
          transition: 'transform 0.3s ease-out',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', right: '10%',
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.08), transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
          transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -10}px)`,
          transition: 'transform 0.3s ease-out',
        }} />
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          width: 300, height: 300, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,255,136,0.05), transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
          transform: `translate(-50%, -50%) translate(${mousePos.x * 10}px, ${mousePos.y * 8}px)`,
          transition: 'transform 0.3s ease-out',
        }} />

        {/* Floating decorative elements */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute', top: '20%', right: '15%',
            width: 60, height: 60, borderRadius: 16,
            background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--neon-green)', fontSize: '1.2rem', pointerEvents: 'none',
          }}
        >
          <FaDumbbell />
        </motion.div>
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [0, -3, 3, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          style={{
            position: 'absolute', bottom: '25%', left: '12%',
            width: 50, height: 50, borderRadius: 14,
            background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--neon-cyan)', fontSize: '1rem', pointerEvents: 'none',
          }}
        >
          <FaFire />
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          style={{
            position: 'absolute', top: '60%', right: '20%',
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(124,77,255,0.05)', border: '1px solid rgba(124,77,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-purple)', fontSize: '0.9rem', pointerEvents: 'none',
          }}
        >
          <FaBrain />
        </motion.div>

        <div className="mega-hero-badge">
          <span className="dot" />
          AI-Powered Fitness Platform
        </div>

        <h1 className="mega-hero-title" style={{ marginTop: 32, marginBottom: 0 }}>
          <span className="line">
            <span className="line-inner gradient-text">Train</span>
          </span>
          <span className="line">
            <span className="line-inner gradient-text">Smarter.</span>
          </span>
        </h1>

        <p className="mega-hero-sub">
          The all-in-one platform for nutrition tracking, workout planning,
          and AI-driven progress visualization.
        </p>

        <div className="mega-hero-cta">
          {userInfo ? (
            <Link to="/dashboard" className="btn-cinematic btn-cinematic-green text-decoration-none" style={{ fontSize: '1rem', padding: '16px 40px' }}>
              Launch Dashboard <FaArrowRight style={{ marginLeft: 4 }} />
            </Link>
          ) : (
            <>
              <Link to="/pages/register" className="btn-cinematic btn-cinematic-green text-decoration-none" style={{ fontSize: '1rem', padding: '16px 40px' }}>
                Start Free Trial <FaArrowRight style={{ marginLeft: 4 }} />
              </Link>
              <Link to="/pages/login" className="btn-cinematic btn-cinematic-outline text-decoration-none" style={{ fontSize: '1rem', padding: '16px 40px' }}>
                <FaPlay size={12} /> Member Login
              </Link>
            </>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          DAILY ENGAGEMENT — Quote + Tip + Challenge
          ═══════════════════════════════════════════════ */}
      <section style={{ padding: '60px 0' }} data-scene>
        <Container>
          <Row className="g-4">
            {/* Quote of the Day */}
            <Col md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                style={{
                  background: 'rgba(8,12,24,0.6)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
                  padding: 28, height: '100%', position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: -20, right: -10,
                  fontSize: '6rem', fontFamily: 'Georgia, serif',
                  background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                  opacity: 0.1, lineHeight: 1,
                }}>"</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--neon-green)',
                  }}>
                    <FaQuoteLeft size={14} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--neon-green)' }}>Daily Quote</span>
                </div>
                <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.7, fontWeight: 600, fontStyle: 'italic', marginBottom: 12 }}>
                  "{dailyQuote.text}"
                </p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>— {dailyQuote.author}</p>
              </motion.div>
            </Col>

            {/* Today's Fitness Tip */}
            <Col md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  background: 'rgba(8,12,24,0.6)', backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20,
                  padding: 28, height: '100%', position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', bottom: -20, right: -10,
                  fontSize: '5rem',
                  opacity: 0.05,
                }}>💡</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--neon-cyan)',
                  }}>
                    <FaLightbulb size={14} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--neon-cyan)' }}>Today's Tip</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.7 }}>
                  {dailyTip}
                </p>
              </motion.div>
            </Col>

            {/* AI Coach Preview */}
            <Col md={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                style={{
                  background: 'linear-gradient(135deg, rgba(0,255,136,0.04), rgba(0,212,255,0.02))',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(0,255,136,0.12)', borderRadius: 20,
                  padding: 28, height: '100%', position: 'relative', overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute', top: -30, right: -30,
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(0,255,136,0.08), transparent 70%)',
                }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: 'rgba(0,255,136,0.08)', border: '1px solid rgba(0,255,136,0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--neon-green)',
                  }}>
                    <FaBrain size={14} />
                  </div>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--neon-green)' }}>AI Coach</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.7, marginBottom: 16 }}>
                  Get personalized workout plans, nutrition advice, and progress insights powered by AI.
                </p>
                <Link to="/ai-hub" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  color: 'var(--neon-green)', fontWeight: 700, fontSize: '0.82rem',
                  textDecoration: 'none',
                }}>
                  Try AI Hub <FaArrowRight size={12} />
                </Link>
              </motion.div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════
          FEATURES — BENTO GRID
          ═══════════════════════════════════════════════ */}
      <section className="cinematic-section" style={{ padding: '80px 0' }} data-scene>
        <Container fluid style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
          <div className="section-header-premium" data-fade>
            <span className="label">Features</span>
            <h2>Why Shape Up?</h2>
            <p>Everything you need to transform your body and mind.</p>
          </div>

          <div className="bento-grid" data-card-stagger>
            <div className="bento-item bento-large anim-card">
              <div className="bento-image"><img src={FEATURE_NUTRITION} alt="Nutrition" loading="lazy" /></div>
              <div className="bento-icon bento-icon-green"><FaUtensils /></div>
              <div className="bento-title">Precision Nutrition</div>
              <div className="bento-desc">Smart calorie tracking with BMR calculation, macro breakdowns, and AI-powered meal suggestions.</div>
              <div className="bento-tag bento-tag-green">AI-Powered</div>
            </div>
            <div className="bento-item bento-medium anim-card">
              <div className="bento-icon bento-icon-cyan"><FaDumbbell /></div>
              <div className="bento-title">500+ Workouts</div>
              <div className="bento-desc">From bodyweight to advanced lifting, filter by equipment, muscle group, and difficulty.</div>
              <div className="bento-tag bento-tag-cyan">Browse Library</div>
            </div>
            <div className="bento-item bento-small anim-card">
              <div className="bento-icon bento-icon-purple"><FaChartLine /></div>
              <div className="bento-title">Visual Progress</div>
              <div className="bento-desc">Interactive charts tracking weight, volume, calories, and hydration over time.</div>
              <div className="bento-tag bento-tag-green">Real-Time</div>
            </div>
            <div className="bento-item bento-medium anim-card">
              <div className="bento-icon bento-icon-green"><FaBrain /></div>
              <div className="bento-title">AI Coach</div>
              <div className="bento-desc">AI-powered assistant analyzes your data and generates personalized plans.</div>
              <div className="bento-tag bento-tag-cyan">Smart</div>
            </div>
            <div className="bento-item bento-full anim-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 32, padding: '24px 40px' }}>
              <div className="bento-icon bento-icon-green" style={{ marginBottom: 0, flexShrink: 0 }}><FaFire /></div>
              <div style={{ flex: 1 }}>
                <div className="bento-title" style={{ marginBottom: 4 }}>Hydration & Habits</div>
                <div className="bento-desc" style={{ maxWidth: 'none' }}>Track water intake with smart reminders, log daily habits, and build consistency with streak tracking.</div>
              </div>
              <div className="bento-tag bento-tag-green" style={{ marginBottom: 0, flexShrink: 0 }}>Track Daily</div>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════
          REVIEWS
          ═══════════════════════════════════════════════ */}
      <section className="cinematic-section" style={{ padding: '80px 0' }} data-scene>
        <Container>
          <div className="section-header-premium" data-fade>
            <span className="label">Testimonials</span>
            <h2>Real Stories, Real Results</h2>
            <p>See what our community says about their transformation.</p>
          </div>

          {loadingReviews ? <Loader /> : (
            <Row className="g-4 mb-5" data-card-stagger>
              {Array.isArray(reviews) && reviews.length > 0 ? (
                reviews.slice(0, 6).map((review) => (
                  <Col lg={4} md={6} key={review._id}>
                    <div className="review-card-premium anim-card">
                      <div className="review-quote">"</div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 24, marginTop: 8 }}>
                        {review.comment}
                      </p>
                      <div className="d-flex align-items-center gap-3">
                        <div style={{
                          width: 44, height: 44, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#000', fontWeight: 800, fontSize: '0.85rem', flexShrink: 0,
                        }}>
                          {(review.name || "?")[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{review.name}</div>
                          <div style={{ display: 'flex', gap: 2, marginTop: 2 }}>
                            {[...Array(review.rating || 0)].map((_, i) => <FaStar key={i} size={12} style={{ color: 'var(--neon-green)' }} />)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                ))
              ) : (
                <Col className="text-center">
                  <div className="review-card-premium" style={{ maxWidth: 500, margin: '0 auto' }}>
                    <div className="review-quote">"</div>
                    <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: 8 }}>
                      No reviews yet. Be the first to share your journey!
                    </p>
                  </div>
                </Col>
              )}
            </Row>
          )}

          <Row className="justify-content-center">
            <Col md={8} lg={6}>
              <div className="review-card-premium" style={{ borderTop: '2px solid var(--neon-green)' }}>
                <div className="text-center mb-4">
                  <FaTrophy style={{ fontSize: '2rem', color: 'var(--neon-green)', marginBottom: 12 }} />
                  <h4 className="fw-bold" style={{ color: 'var(--text-primary)' }}>Share Your Success</h4>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Inspire others with your story</p>
                </div>
                {userInfo ? (
                  <Form onSubmit={submitHandler}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)' }}>Rating</Form.Label>
                      <div className="d-flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star} size={24}
                            style={{ color: star <= rating ? 'var(--neon-green)' : 'rgba(255,255,255,0.08)', cursor: 'pointer', transition: 'all 0.2s' }}
                            onClick={() => setRating(star)}
                          />
                        ))}
                      </div>
                    </Form.Group>
                    <Form.Group className="mb-4">
                      <Form.Label style={{ fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1.5, color: 'var(--text-muted)' }}>Your Story</Form.Label>
                      <Form.Control as="textarea" rows={3} placeholder="How has Shape Up helped you?" value={comment} onChange={(e) => setComment(e.target.value)} required className="neon-input" />
                    </Form.Group>
                    <motion.button type="submit" disabled={isCreating} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="btn-cinematic btn-cinematic-green" style={{ width: '100%' }}>
                      {isCreating ? "Posting..." : "Post Review"}
                    </motion.button>
                  </Form>
                ) : (
                  <div className="text-center py-4">
                    <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>Join the community to leave a review.</p>
                    <Link to="/pages/login" className="btn-cinematic btn-cinematic-outline text-decoration-none">
                      Login Now
                    </Link>
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════
          PRICING
          ═══════════════════════════════════════════════ */}
      <section className="cinematic-section" style={{ padding: '80px 0' }} data-scene>
        <Container>
          <div className="section-header-premium" data-fade>
            <span className="label">Pricing</span>
            <h2>Choose Your Plan</h2>
            <p>No hidden fees. Cancel anytime.</p>
          </div>

          <div className="pricing-premium" data-card-stagger>
            <div className="pricing-card-premium anim-card">
              <div style={{ marginBottom: 8, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--text-muted)' }}>Starter</div>
              <div className="pricing-price"><span className="currency">$</span>0<span className="period">/mo</span></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8, marginBottom: 24 }}>Perfect for getting started.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 32 }}>
                <div className="pricing-feature"><FaCheckCircle style={{ color: 'var(--neon-green)', flexShrink: 0 }} /> Basic Calorie Tracking</div>
                <div className="pricing-feature"><FaCheckCircle style={{ color: 'var(--neon-green)', flexShrink: 0 }} /> Access to 50 Workouts</div>
                <div className="pricing-feature"><FaCheckCircle style={{ color: 'var(--neon-green)', flexShrink: 0 }} /> Community Support</div>
                <div className="pricing-feature" style={{ opacity: 0.35, textDecoration: 'line-through' }}><FaCheckCircle style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> Advanced Analytics</div>
                <div className="pricing-feature" style={{ opacity: 0.35, textDecoration: 'line-through' }}><FaCheckCircle style={{ color: 'var(--text-muted)', flexShrink: 0 }} /> Custom Meal Plans</div>
              </div>
              <Link to="/pages/register" className="btn-cinematic btn-cinematic-outline text-decoration-none" style={{ width: '100%' }}>Get Started Free</Link>
            </div>

            <div className="pricing-card-premium featured anim-card">
              <div style={{ marginTop: 32 }} />
              <div style={{ marginBottom: 8, fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2, color: 'var(--neon-green)' }}>Pro Athlete</div>
              <div className="pricing-price"><span className="currency">$</span>9.99<span className="period">/mo</span></div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8, marginBottom: 24 }}>For serious athletes.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 32 }}>
                <div className="pricing-feature"><FaCheckCircle style={{ color: 'var(--neon-green)', flexShrink: 0 }} /> Unlimited Calorie Tracking</div>
                <div className="pricing-feature"><FaCheckCircle style={{ color: 'var(--neon-green)', flexShrink: 0 }} /> Full 500+ Exercise Library</div>
                <div className="pricing-feature"><FaCheckCircle style={{ color: 'var(--neon-green)', flexShrink: 0 }} /> Priority Support</div>
                <div className="pricing-feature"><FaCheckCircle style={{ color: 'var(--neon-green)', flexShrink: 0 }} /> Advanced Analytics</div>
                <div className="pricing-feature"><FaCheckCircle style={{ color: 'var(--neon-green)', flexShrink: 0 }} /> AI Meal Generator</div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="btn-cinematic btn-cinematic-green" style={{ width: '100%' }}>Coming Soon</motion.button>
            </div>
          </div>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════
          FAQ
          ═══════════════════════════════════════════════ */}
      <section className="cinematic-section" style={{ padding: '60px 0 80px' }} data-scene>
        <Container>
          <div className="section-header-premium" data-fade>
            <span className="label">FAQ</span>
            <h2>Got Questions?</h2>
          </div>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Accordion defaultActiveKey="0">
                {[
                  { q: "Is Shape Up suitable for beginners?", a: "Absolutely! We have tailored plans starting from absolute zero to pro athlete levels." },
                  { q: "Do I need gym equipment?", a: "No. You can filter workouts by 'Bodyweight Only' or select specific equipment you own." },
                  { q: "Can I track my water intake?", a: "Yes, we have a dedicated hydration logger with smart reminders." },
                  { q: "Is the diet plan customized?", a: "Our AI analyzes your BMR and goals to suggest precise macro targets." },
                ].map((faq, idx) => (
                  <Accordion.Item eventKey={idx.toString()} key={idx}>
                    <Accordion.Header>{faq.q}</Accordion.Header>
                    <Accordion.Body>{faq.a}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>

      {/* ═══════════════════════════════════════════════
          CTA
          ═══════════════════════════════════════════════ */}
      <section className="cta-section" data-scene>
        <Container>
          <div data-fade>
            <h2 className="cta-title">Get Fit on the Go</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: 500, margin: '0 auto 40px' }}>
              Download the Shape Up mobile app for iOS and Android.
            </p>
            <div className="d-flex justify-content-center gap-4 flex-wrap">
              <motion.button whileHover={{ scale: 1.05 }} className="btn-cinematic btn-cinematic-green" style={{ fontSize: '1rem', padding: '16px 36px' }}>
                <FaApple size={20} /> App Store
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} className="btn-cinematic btn-cinematic-outline" style={{ fontSize: '1rem', padding: '16px 36px' }}>
                <FaGooglePlay size={18} /> Google Play
              </motion.button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
