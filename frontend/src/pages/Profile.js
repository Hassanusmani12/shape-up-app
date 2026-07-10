import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Form, Alert, Badge, Modal, Image, InputGroup } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import { useNavigate } from "react-router-dom";
import {
  useUpdateUserProfileMutation,
} from "../slices/usersApiSlice";
import { setCredentials, logout } from "../slices/authSlice";
import {
  FaUser, FaLock, FaDumbbell, FaRulerVertical, FaWeight,
  FaVenusMars, FaBirthdayCake, FaSave, FaCheckCircle,
  FaChartLine, FaDownload, FaExclamationTriangle,
} from "react-icons/fa";

const StatCard = ({ icon, label, value, unit, color }) => (
  <div className="cinematic-card d-flex align-items-center p-3 rounded-3 h-100">
    <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `${color}15`, color, marginRight: 12 }}>
      {icon}
    </div>
    <div>
      <small className="text-adaptive-head" style={{ textTransform: 'uppercase', fontWeight: 700, fontSize: '0.65rem', letterSpacing: 1 }}>{label}</small>
      <h5 className="mb-0 fw-bold" style={{ color: 'var(--text-primary)' }}>{value} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 400 }}>{unit}</span></h5>
    </div>
  </div>
);

const BMICard = ({ bmi, status, color }) => (
  <div className="cinematic-card" style={{
    background: `linear-gradient(135deg, ${color === 'success' ? '#10b981' : color === 'warning' ? '#f59e0b' : '#e63946'}, ${color === 'success' ? '#059669' : color === 'warning' ? '#d97706' : '#c1121f'})`,
    borderRadius: 16, padding: 28, textAlign: 'center', color: '#fff',
  }}>
    <h6 className="mb-1" style={{ opacity: 0.8, fontSize: '0.75rem', fontWeight: 700, letterSpacing: 1 }}>YOUR BMI SCORE</h6>
    <h1 className="gradient-text athletic-heading" style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: 4 }}>{bmi}</h1>
    <Badge style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 700 }}>{status}</Badge>
  </div>
);

const Profile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  const [updateProfile, { isLoading }] = useUpdateUserProfileMutation();

  const [activeTab, setActiveTab] = useState("general");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [gender, setGender] = useState("Male");
  const [goal, setGoal] = useState("Maintain");
  const [activityLevel] = useState("Moderate");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (userInfo) {
      setName(userInfo.name || "");
      setEmail(userInfo.email || "");
      setAge(userInfo.age || "");
      setHeight(userInfo.height || "");
      setWeight(userInfo.weight || "");
      setGender(userInfo.gender || "Male");
      setGoal(userInfo.goal || "Maintain");
      setAvatar(userInfo.image || "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const bmiStats = useMemo(() => {
    if (!weight || !height) return { value: 0, status: "Unknown", color: "secondary" };
    const hM = height / 100;
    const val = (weight / (hM * hM)).toFixed(1);
    if (val < 18.5) return { value: val, status: "Underweight", color: "warning" };
    if (val >= 25 && val < 30) return { value: val, status: "Overweight", color: "warning" };
    if (val >= 30) return { value: val, status: "Obese", color: "danger" };
    return { value: val, status: "Normal", color: "success" };
  }, [weight, height]);

  const avatarInitial = userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : "?";

  const submitHandler = async (e) => {
    e.preventDefault();
    if (activeTab === 'security') return;
    try {
      const res = await updateProfile({ name, email, age, height, weight, gender, goal }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success("Profile Updated Successfully!");
    } catch (err) { toast.error(err?.data?.message || "Update failed."); }
  };

  const handlePasswordUpdate = async () => {
    if (!currentPassword || !password || !confirmPassword) { toast.error("Please fill all password fields."); return; }
    if (password !== confirmPassword) { toast.error("New passwords do not match."); return; }
    if (password.length < 6) { toast.error("Password needs to be at least 6 characters."); return; }
    try {
      const res = await updateProfile({ name, email, password, currentPassword }).unwrap();
      dispatch(setCredentials({ ...res }));
      toast.success("Password Updated Successfully!");
      setCurrentPassword(""); setPassword(""); setConfirmPassword("");
    } catch (err) { toast.error(err?.data?.message || "Password update failed."); }
  };

  const handleDeleteAccount = async () => {
    try { dispatch(logout()); navigate('/login'); toast.success("Account Deleted."); }
    catch (err) { toast.error("Delete failed"); setShowDeleteModal(false); }
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(userInfo));
    const a = document.createElement('a');
    a.setAttribute("href", dataStr);
    a.setAttribute("download", "shape_up_profile.json");
    document.body.appendChild(a);
    a.click();
    a.remove();
    toast.success("Data exported!");
  };

  const labelStyle = { fontWeight: 600, color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 };

  const tabItemStyle = (isActive) => ({
    color: isActive ? 'var(--neon-green)' : 'var(--text-secondary)',
    fontWeight: 600,
    padding: '10px 16px',
    borderRadius: 10,
    borderLeft: isActive ? '3px solid var(--neon-green)' : '3px solid transparent',
    background: isActive ? 'rgba(0, 255, 136, 0.05)' : 'transparent',
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontSize: '0.9rem',
  });

  return (
    <div className="page-wrapper cinematic-section position-relative overflow-hidden" style={{ minHeight: '100vh', paddingBottom: 60 }} data-scene>
      <Container className="py-5" style={{ maxWidth: 1200 }}>
        <div className="mb-5">
          <Row className="align-items-center">
            <Col md={8}>
              <h1 className="cinematic-heading gradient-text fw-bold mb-1" style={{ fontSize: '2rem' }} data-reveal>Profile Settings</h1>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: 0 }}>Manage your personal information, security, and fitness metrics.</p>
            </Col>
            <Col md={4} className="text-md-end mt-3 mt-md-0">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleExportData}
                className="btn-cinematic btn-cinematic-outline"
                style={{ padding: '10px 20px', cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <FaDownload /> Export Data
              </motion.button>
            </Col>
          </Row>
        </div>

        <Row className="g-3">
          {/* LEFT NAV */}
          <Col lg={3}>
            <div className="cinematic-card" style={{ padding: 28, borderRadius: 20, height: '100%' }}>
              <div className="text-center mb-4">
                <div style={{ width: 110, height: 110, margin: '0 auto 12px', borderRadius: '50%' }}>
                  {avatar ? (
                    <Image src={avatar} roundedCircle style={{ width: '100%', height: '100%', objectFit: 'cover', border: '3px solid rgba(0, 255, 136, 0.3)' }} alt="Profile" />
                  ) : (
                    <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,255,136,0.2), rgba(0,212,255,0.1))', border: '3px solid rgba(0,255,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-athletic)', fontSize: '2.5rem', fontWeight: 800, color: 'var(--neon-green)' }}>{avatarInitial}</span>
                    </div>
                  )}
                </div>

                <h5 className="fw-bold mb-0 text-adaptive-head" style={{ fontSize: '1rem' }}>{name}</h5>
                <small className="text-muted" style={{ fontSize: '0.8rem' }}>{email}</small>
                <div className="mt-2">
                  <Badge style={{ background: 'rgba(0, 255, 136, 0.15)', color: 'var(--neon-green)', padding: '3px 12px', borderRadius: 6, textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 700 }}>
                    {goal}
                  </Badge>
                </div>
              </div>
              <hr className="neon-divider" style={{ margin: '16px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { key: 'general', icon: <FaUser />, label: 'General Info' },
                  { key: 'body', icon: <FaDumbbell />, label: 'Body Stats' },
                  { key: 'security', icon: <FaLock />, label: 'Security' },
                  { key: 'advanced', icon: <FaExclamationTriangle />, label: 'Danger Zone', danger: true },
                ].map(tab => (
                  <div key={tab.key} style={tabItemStyle(activeTab === tab.key)} onClick={() => setActiveTab(tab.key)}>
                    {tab.icon} {tab.label}
                  </div>
                ))}
              </div>
            </div>
          </Col>

          {/* RIGHT CONTENT */}
          <Col lg={9}>
            <Form onSubmit={submitHandler}>
              {activeTab === 'general' && (
                <motion.div className="cinematic-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 36, borderRadius: 20 }}>
                  <h4 className="fw-bold mb-4 text-adaptive-head" style={{ fontSize: '1.1rem' }}>General Information</h4>
                  <Row className="g-3">
                    <Col md={6}><Form.Group><Form.Label style={labelStyle}>FULL NAME</Form.Label><Form.Control type="text" value={name} onChange={(e) => setName(e.target.value)} className="neon-input" /></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label style={labelStyle}>EMAIL ADDRESS</Form.Label><Form.Control type="email" value={email} disabled className="neon-input" style={{ opacity: 0.5 }} /><Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>Contact support to change email.</Form.Text></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label style={labelStyle}>AGE</Form.Label><InputGroup><InputGroup.Text className="neon-input"><FaBirthdayCake /></InputGroup.Text><Form.Control type="number" value={age} onChange={(e) => setAge(e.target.value)} className="neon-input" /></InputGroup></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label style={labelStyle}>GENDER</Form.Label><InputGroup><InputGroup.Text className="neon-input"><FaVenusMars /></InputGroup.Text><Form.Select value={gender} onChange={(e) => setGender(e.target.value)} className="neon-input"><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></Form.Select></InputGroup></Form.Group></Col>
                  </Row>
                  <div className="mt-4 d-flex justify-content-end">
                    <motion.button type="submit" className="btn-cinematic btn-cinematic-green" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      style={{ padding: '10px 32px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isLoading ? <Loader size="sm" color="white" /> : <><FaSave /> Save Changes</>}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'body' && (
                <motion.div className="cinematic-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 36, borderRadius: 20 }}>
                  <h4 className="fw-bold mb-4 text-adaptive-head" style={{ fontSize: '1.1rem' }}>Body Metrics & Goals</h4>
                  <Row className="g-3 mb-4" data-card-stagger>
                    <Col md={4}><BMICard bmi={bmiStats.value} status={bmiStats.status} color={bmiStats.color} /></Col>
                    <Col md={8}>
                        <Row className="g-2 h-100" data-card-stagger>
                        <Col xs={6}><StatCard icon={<FaWeight />} label="Current Weight" value={weight || "--"} unit="kg" color="#3b82f6" /></Col>
                        <Col xs={6}><StatCard icon={<FaRulerVertical />} label="Height" value={height || "--"} unit="cm" color="#06b6d4" /></Col>
                        <Col xs={12}>
                          <div className="cinematic-card d-flex align-items-center justify-content-between p-3 rounded-3 h-100">
                            <div><small className="fw-bold text-muted" style={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: 1 }}>Activity Level</small><h5 className="mb-0 fw-bold text-adaptive-head" style={{ fontSize: '1rem' }}>{activityLevel}</h5></div>
                            <FaChartLine className="text-muted" style={{ opacity: 0.3 }} />
                          </div>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <hr className="neon-divider" style={{ margin: '20px 0' }} />
                  <Row className="g-3">
                    <Col md={6}><Form.Group><Form.Label style={labelStyle}>UPDATE WEIGHT (KG)</Form.Label><Form.Control type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} className="neon-input" /></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label style={labelStyle}>UPDATE HEIGHT (CM)</Form.Label><Form.Control type="number" value={height} onChange={(e) => setHeight(e.target.value)} className="neon-input" /></Form.Group></Col>
                    <Col md={12}>
                      <Form.Group>
                        <Form.Label style={labelStyle}>PRIMARY GOAL</Form.Label>
                        <div className="d-flex gap-2">
                          {['Cut', 'Maintain', 'Bulk'].map(g => (
                            <motion.button key={g} type="button" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                              onClick={() => setGoal(g)}
                              className={goal === g ? 'btn-cinematic btn-cinematic-green' : 'btn-cinematic btn-cinematic-outline'}
                              style={{
                                flex: 1, padding: '10px', borderRadius: 10, fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                              }}>
                              {g}
                            </motion.button>
                          ))}
                        </div>
                      </Form.Group>
                    </Col>
                  </Row>
                  <div className="mt-4 d-flex justify-content-end">
                    <motion.button type="submit" className="btn-cinematic btn-cinematic-green" disabled={isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      style={{ padding: '10px 32px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isLoading ? <Loader size="sm" color="white" /> : <><FaSave /> Update Stats</>}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'security' && (
                <motion.div className="cinematic-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 36, borderRadius: 20 }}>
                  <h4 className="fw-bold mb-4 text-adaptive-head" style={{ fontSize: '1.1rem' }}>Security Settings</h4>
                  <Alert style={{ background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.15)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <FaCheckCircle style={{ color: '#3b82f6', fontSize: '1.5rem' }} />
                    <div><strong className="text-adaptive-head">Secure Verification Required</strong><div className="text-muted" style={{ fontSize: '0.85rem' }}>You must enter your current password to make changes.</div></div>
                  </Alert>
                  <Form.Group className="mb-4">
                    <Form.Label style={labelStyle}>CURRENT PASSWORD <span style={{ color: '#e63946' }}>*</span></Form.Label>
                    <Form.Control type="password" placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="neon-input" />
                  </Form.Group>
                  <hr className="neon-divider" />
                  <Row className="g-3">
                    <Col md={6}><Form.Group><Form.Label style={labelStyle}>NEW PASSWORD</Form.Label><Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="neon-input" /></Form.Group></Col>
                    <Col md={6}><Form.Group><Form.Label style={labelStyle}>CONFIRM NEW PASSWORD</Form.Label><Form.Control type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="neon-input" /></Form.Group></Col>
                  </Row>
                  <div className="mt-4 d-flex justify-content-end">
                    <motion.button type="button" className="btn-cinematic btn-cinematic-green" onClick={handlePasswordUpdate} disabled={!currentPassword || !password || !confirmPassword || isLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      style={{ padding: '10px 32px', borderRadius: 10, border: 'none', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, opacity: (!currentPassword || !password || !confirmPassword) ? 0.5 : 1 }}>
                      {isLoading ? <Loader size="sm" color="white" /> : <><FaLock /> Update Password</>}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'advanced' && (
                <motion.div className="cinematic-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: 36, borderRadius: 20, borderColor: 'rgba(230, 57, 70, 0.2)' }}>
                  <h4 className="fw-bold mb-4" style={{ color: '#e63946', fontSize: '1.1rem' }}>Danger Zone</h4>
                  <div className="cinematic-card p-4 rounded-3 mb-3" style={{ border: '1px solid rgba(230, 57, 70, 0.2)', background: 'rgba(230, 57, 70, 0.05)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div><h6 className="fw-bold mb-1" style={{ color: '#e63946' }}>Delete Account</h6><p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 0 }}>Permanently remove your account and all data.</p></div>
                       <motion.button type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowDeleteModal(true)}
                         style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#e63946', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Delete</motion.button>
                    </div>
                  </div>
                  <div className="cinematic-card p-4 rounded-3" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <div><h6 className="fw-bold mb-1 text-adaptive-head">Export Data</h6><p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: 0 }}>Download a JSON file with all your profile info.</p></div>
                       <motion.button type="button" whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleExportData}
                         className="btn-cinematic btn-cinematic-outline"
                         style={{ padding: '8px 20px', borderRadius: 8, fontWeight: 700, cursor: 'pointer' }}>Export</motion.button>
                    </div>
                  </div>
                </motion.div>
              )}
            </Form>
          </Col>
        </Row>

        <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
          <Modal.Header closeButton style={{ background: 'rgba(230, 57, 70, 0.1)', borderBottom: '1px solid rgba(230, 57, 70, 0.2)' }}>
            <Modal.Title className="fw-bold" style={{ color: '#e63946', fontSize: '1rem' }}>Confirm Deletion</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ background: 'var(--bg-secondary)', textAlign: 'center', padding: 32 }}>
            <FaExclamationTriangle size={40} style={{ color: '#f59e0b', marginBottom: 16 }} />
            <h5 className="text-adaptive-head">Are you absolutely sure?</h5>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>This will permanently delete your account <strong>{email}</strong> and all data.</p>
          </Modal.Body>
          <Modal.Footer style={{ background: 'var(--bg-secondary)', justifyContent: 'center', border: 'none' }}>
            <motion.button whileHover={{ scale: 1.02 }} onClick={() => setShowDeleteModal(false)}
              className="btn-cinematic btn-cinematic-outline"
              style={{ padding: '8px 20px', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Cancel</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} onClick={handleDeleteAccount}
              style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#e63946', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Yes, Delete</motion.button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default Profile;
