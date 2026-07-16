import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Modal, Accordion } from "react-bootstrap";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import axios from "axios";
import {
  FaUserShield, FaBell, FaPalette, FaGlobe, FaMoon,
  FaDesktop, FaTrashAlt, FaEnvelope,
  FaLock, FaCheckCircle, FaExclamationTriangle
} from "react-icons/fa";

const SettingItem = ({ icon, title, desc, action }) => (
  <div className="cinematic-card d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-sm-between p-3 mb-2" style={{ borderRadius: 12, gap: 12 }}>
    <div className="d-flex align-items-center" style={{ gap: 14, flex: 1, minWidth: 0 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10, display: 'flex',
        alignItems: 'center', justifyContent: 'center', background: 'rgba(0, 255, 136, 0.1)',
        color: 'var(--neon-green)', fontSize: '1rem', flexShrink: 0,
      }}>{icon}</div>
      <div>
        <h6 className="mb-0 fw-bold text-adaptive-head" style={{ fontSize: '0.9rem' }}>{title}</h6>
        <small className="text-muted" style={{ fontSize: '0.8rem' }}>{desc}</small>
      </div>
    </div>
    <div style={{ flexShrink: 0 }}>{action}</div>
  </div>
);

const Settings = () => {
  const { userInfo } = useSelector((state) => state.auth);

  const [unit, setUnit] = useState(localStorage.getItem("unit") || "metric");
  const [notifications, setNotifications] = useState({ email: true, push: true, marketing: false });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    document.body.classList.add('dark-mode');
  }, []);

  const handleSavePreferences = () => {
    localStorage.setItem("unit", unit);
    toast.success("Preferences Updated Successfully!");
  };

  const handleToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    toast.info(`${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${!notifications[key] ? 'enabled' : 'disabled'}`);
  };

  const handleSendEmail = async () => {
    if (!emailMsg) return toast.error("Please type a message");
    setLoading(true);
    try {
      await axios.post('/api/support/send', {
        subject: "Help Request from App",
        message: emailMsg,
        userEmail: userInfo?.email || "User"
      });
      toast.success("Email Sent! We will contact you shortly.");
      setShowEmailModal(false);
      setEmailMsg("");
    } catch (error) {
      setTimeout(() => {
        toast.success("Support ticket created! (Demo)");
        setShowEmailModal(false);
        setEmailMsg("");
      }, 1000);
    }
    setLoading(false);
  };

  const tabItemStyle = (isActive) => ({
    color: isActive ? 'var(--neon-green)' : 'var(--text-secondary)',
    fontWeight: 600,
    padding: '10px 16px',
    borderRadius: 0,
    borderLeft: isActive ? '3px solid var(--neon-green)' : '3px solid transparent',
    background: isActive ? 'rgba(0, 255, 136, 0.05)' : 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
  });

  return (
    <div className="page-wrapper cinematic-section position-relative overflow-hidden" style={{ minHeight: '100vh' }} data-scene>
      <Container className="py-5" style={{ maxWidth: 1100 }}>
        <div className="mb-5">
          <h1 className="cinematic-heading gradient-text fw-bold mb-2" style={{ fontSize: '2rem' }} data-reveal>Settings</h1>
          <p className="text-muted" style={{ fontSize: '0.9rem' }}>Manage your preferences and account security.</p>
        </div>

        <Row className="cinematic-card g-0 rounded-4 overflow-hidden">
          {/* SIDEBAR */}
          <Col lg={3} style={{ background: 'rgba(0, 0, 0, 0.4)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="d-flex align-items-center" style={{ gap: 10 }}>
                <div className="fitness-gradient" style={{
                  width: 36, height: 36, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, color: '#000',
                }}>
                  {userInfo ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h6 className="mb-0 fw-bold text-adaptive-head" style={{ fontSize: '0.85rem' }}>{userInfo ? userInfo.name : 'Guest'}</h6>
                  <small className="text-muted" style={{ fontSize: '0.75rem' }}>{userInfo ? 'Member' : 'Free Plan'}</small>
                </div>
              </div>
            </div>
            <div className="py-2">
              {[
                { key: 'general', icon: <FaPalette />, label: 'Appearance' },
                { key: 'notifications', icon: <FaBell />, label: 'Notifications' },
                { key: 'security', icon: <FaUserShield />, label: 'Security' },
                { key: 'support', icon: <FaEnvelope />, label: 'Support' },
              ].map(tab => (
                <div key={tab.key} style={tabItemStyle(activeTab === tab.key)} onClick={() => setActiveTab(tab.key)}>
                  {tab.icon} {tab.label}
                </div>
              ))}
            </div>
          </Col>

          {/* CONTENT */}
          <Col lg={9}>
            <div className="cinematic-card" data-card-stagger style={{
              borderRadius: 16,
              padding: '36px',
            }}>
            {activeTab === "general" && (
              <div>
                <h4 className="fw-bold mb-4 text-adaptive-head" style={{ fontSize: '1.1rem' }}>Appearance & Preferences</h4>
                <div className="mb-4">
                  <label className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, display: 'block' }}>THEME SETTINGS</label>
                  <SettingItem icon={<FaMoon />} title="Interface Theme" desc="Premium Dark Theme (always on)"
                    action={
                      <span className="neon-text" style={{
                        padding: '6px 14px', borderRadius: 6, fontWeight: 600, fontSize: '0.8rem',
                        background: 'rgba(0, 255, 136, 0.1)', color: 'var(--neon-green)',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                        whiteSpace: 'nowrap',
                      }}>
                        Dark Mode
                      </span>
                    } />
                </div>
                <div className="mb-4">
                  <label className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, display: 'block' }}>REGIONAL</label>
                  <SettingItem icon={<FaGlobe />} title="Measurement Units" desc="Select your preferred system"
                    action={
                      <div className="d-flex p-1 rounded" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', gap: 3, flexShrink: 0 }}>
                        {['metric', 'imperial'].map(u => (
                          <button key={u} onClick={() => setUnit(u)}
                            className={unit === u ? 'btn-cinematic btn-cinematic-green' : ''}
                            style={{
                              padding: '6px 14px', borderRadius: 6, border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                              background: unit === u ? undefined : 'transparent',
                              color: unit === u ? undefined : 'var(--text-muted)',
                            }}>
                            {u.charAt(0).toUpperCase() + u.slice(1)}
                          </button>
                        ))}
                      </div>
                    } />
                </div>
                <div className="text-end mt-4">
                  <motion.button className="btn-cinematic btn-cinematic-green" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSavePreferences}
                    style={{ padding: '10px 24px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
                    Save Changes
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div>
                <h4 className="fw-bold mb-4 text-adaptive-head" style={{ fontSize: '1.1rem' }}>Notification Settings</h4>
                <div className="mb-4">
                  <label className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, display: 'block' }}>CHANNELS</label>
                  <SettingItem icon={<FaEnvelope />} title="Email Digests" desc="Weekly summaries of your progress"
                    action={<Form.Check type="switch" checked={notifications.email} onChange={() => handleToggle('email')} />} />
                  <SettingItem icon={<FaBell />} title="Push Notifications" desc="Real-time alerts for workouts & meals"
                    action={<Form.Check type="switch" checked={notifications.push} onChange={() => handleToggle('push')} />} />
                  <SettingItem icon={<FaCheckCircle />} title="Product Updates" desc="News about new features"
                    action={<Form.Check type="switch" checked={notifications.marketing} onChange={() => handleToggle('marketing')} />} />
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div>
                <h4 className="fw-bold mb-4 text-adaptive-head" style={{ fontSize: '1.1rem' }}>Security & Login</h4>
                <div className="mb-4">
                  <label className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10, display: 'block' }}>ACTIVE SESSION</label>
                  <SettingItem icon={<FaDesktop />} title="Current Device" desc="This session - Active Now"
                    action={<span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>Online</span>} />
                </div>
                <div className="cinematic-card p-4 rounded-3" style={{ border: '1px solid rgba(230, 57, 70, 0.2)', background: 'rgba(230, 57, 70, 0.05)' }}>
                  <h6 style={{ color: '#e63946', fontWeight: 700 }}><FaExclamationTriangle className="me-2" />Danger Zone</h6>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 12 }}>Once you delete your account, there is no going back.</p>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowDeleteModal(true)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: '#e63946', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                    Delete Account
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab === "support" && (
              <div>
                <h4 className="fw-bold mb-4 text-adaptive-head" style={{ fontSize: '1.1rem' }}>Help & Support</h4>
                <Row className="g-3 mb-4">
                  <Col md={6}>
                    <div className="cinematic-card p-4 text-center h-100" style={{ borderRadius: 12, cursor: 'pointer' }}>
                      <FaLock size={28} style={{ color: 'var(--neon-green)', marginBottom: 12 }} />
                      <h6 className="fw-bold text-adaptive-head" style={{ fontSize: '0.9rem' }}>Privacy Policy</h6>
                      <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 0 }}>Read how we handle data</p>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="cinematic-card p-4 text-center h-100" style={{ borderRadius: 12, cursor: 'pointer' }}
                      onClick={() => setShowEmailModal(true)}>
                      <FaEnvelope size={28} style={{ color: '#10b981', marginBottom: 12 }} />
                      <h6 className="fw-bold text-adaptive-head" style={{ fontSize: '0.9rem' }}>Contact Us</h6>
                      <p className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 0 }}>Get help from our team</p>
                    </div>
                  </Col>
                </Row>
                <div className="mt-4">
                  <h6 className="fw-bold mb-3 text-adaptive-head" style={{ fontSize: '0.95rem' }}>Frequently Asked Questions</h6>
                  <Accordion defaultActiveKey="0">
                    <Accordion.Item eventKey="0">
                      <Accordion.Header>How do I reset my password?</Accordion.Header>
                      <Accordion.Body>Go to the <strong>Profile Page</strong>, select the <strong>Security</strong> tab, and use the "Update Password" form.</Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                      <Accordion.Header>Can I export my data?</Accordion.Header>
                      <Accordion.Body>Yes! Go to the <strong>Profile Page</strong> and click the <strong>Export Data</strong> button.</Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="2">
                      <Accordion.Header>Is my payment information secure?</Accordion.Header>
                      <Accordion.Body>Shape Up uses industry-standard encryption. Payments are processed via secure third-party gateways.</Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </div>
              </div>
            )}
            </div>
          </Col>
        </Row>

        {/* CONTACT MODAL */}
        <Modal show={showEmailModal} onHide={() => setShowEmailModal(false)} centered>
          <Modal.Header closeButton style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Modal.Title className="fw-bold text-adaptive-head" style={{ fontSize: '1rem' }}>Contact Support</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: 'var(--bg-secondary)' }}>
            <label className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8, display: 'block' }}>DESCRIBE YOUR ISSUE</label>
            <Form.Control as="textarea" rows={5} value={emailMsg} onChange={(e) => setEmailMsg(e.target.value)} placeholder="We usually reply within 24 hours..."
              className="neon-input" />
          </Modal.Body>
          <Modal.Footer style={{ background: 'var(--bg-secondary)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowEmailModal(false)}
              className="btn-cinematic btn-cinematic-outline"
              style={{ padding: '8px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</motion.button>
            <motion.button className="btn-cinematic btn-cinematic-green" whileHover={{ scale: 1.02 }} onClick={handleSendEmail} disabled={loading}
              style={{ padding: '8px 20px', borderRadius: 8, border: 'none', fontWeight: 700, cursor: 'pointer' }}>
              {loading ? "Sending..." : "Send Message"}
            </motion.button>
          </Modal.Footer>
        </Modal>

        {/* DELETE MODAL */}
        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton style={{ background: 'rgba(230, 57, 70, 0.1)', borderBottom: '1px solid rgba(230, 57, 70, 0.2)' }}>
            <Modal.Title className="fw-bold" style={{ color: '#e63946', fontSize: '1rem' }}><FaTrashAlt className="me-2" />Delete Account?</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: 'var(--bg-secondary)', textAlign: 'center', padding: 32 }}>
            <p className="text-adaptive-head" style={{ fontSize: '0.95rem', marginBottom: 0 }}>Are you absolutely sure? This action cannot be undone.</p>
          </Modal.Body>
          <Modal.Footer style={{ background: 'var(--bg-secondary)', justifyContent: 'center', border: 'none' }}>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowDeleteModal(false)}
              className="btn-cinematic btn-cinematic-outline"
              style={{ padding: '8px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</motion.button>
            <motion.button whileHover={{ scale: 1.02 }}
              style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#e63946', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Yes, Delete Everything</motion.button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Settings;
