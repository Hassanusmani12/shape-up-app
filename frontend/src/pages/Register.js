import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Container, InputGroup, ProgressBar } from "react-bootstrap";
import {
  FaUserPlus, FaUser, FaEnvelope, FaLock, FaCheckCircle,
  FaEye, FaEyeSlash
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useRegisterMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import Loader from "../components/Loader";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  useEffect(() => {
    let score = 0;
    if (password.length > 5) score += 25;
    if (password.length > 8) score += 25;
    if (/[A-Z]/.test(password)) score += 25;
    if (/[0-9]/.test(password)) score += 25;
    setPasswordStrength(score);
  }, [password]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !confirmPassword) {
        return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!agreeTerms) {
        return;
    }

    try {
      const res = await register({ name, email, password }).unwrap();
      dispatch(setCredentials({ ...res }));
      navigate("/");
    } catch (err) {
      setError(err?.data?.message || err?.error || "Registration failed");
    }
  };

  const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
  };

  const getStrengthColor = () => {
      if (passwordStrength < 50) return "danger";
      if (passwordStrength < 75) return "warning";
      return "success";
  };

  return (
    <div className="page-wrapper d-flex flex-column min-vh-100 position-relative overflow-hidden cinematic-section" data-scene>
      <Container className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-5">

        <Row className="justify-content-center w-100">
          <Col md={8} lg={6} xl={5}>

            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: 90, height: 90, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
                  boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)'
                }}
              >
                <FaUserPlus style={{ fontSize: '2.5rem', color: '#000' }} />
              </div>
              <h3 className="fw-bold mb-1 gradient-text" style={{ letterSpacing: '-1px' }} data-reveal>Start Your Journey</h3>
              <p className="text-adaptive small">Create an account to track your progress &amp; goals.</p>
            </div>

            <div className="cinematic-card p-4" data-fade>

              <Form onSubmit={submitHandler}>

                <Form.Group className="mb-3" controlId="formName">
                  <Form.Label className="fw-bold small text-uppercase text-adaptive" style={{ fontSize: '0.75rem' }}>Full Name</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRight: 'none', color: 'var(--neon-green)' }}>
                      <FaUser />
                    </InputGroup.Text>
                    <Form.Control
                      className="neon-input"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3" controlId="formEmail">
                  <Form.Label className="fw-bold small text-uppercase text-adaptive" style={{ fontSize: '0.75rem' }}>Email Address</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRight: 'none', color: 'var(--neon-green)' }}>
                      <FaEnvelope />
                    </InputGroup.Text>
                    <Form.Control
                      className="neon-input"
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-2" controlId="formPassword">
                  <Form.Label className="fw-bold small text-uppercase text-adaptive" style={{ fontSize: '0.75rem' }}>Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRight: 'none', color: 'var(--neon-green)' }}>
                      <FaLock />
                    </InputGroup.Text>
                    <Form.Control
                      className="neon-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      variant="outline-secondary"
                      className="border-start-0"
                      onClick={togglePasswordVisibility}
                      style={{
                        background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)',
                        borderLeft: 'none', color: 'var(--neon-green)',
                        borderTopRightRadius: 12, borderBottomRightRadius: 12
                      }}
                    >
                      {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                {password && (
                  <div className="mb-3">
                    <ProgressBar
                      now={passwordStrength}
                      variant={getStrengthColor()}
                      style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)' }}
                    />
                    <div className="d-flex justify-content-between mt-1">
                      <small className="text-muted" style={{ fontSize: '0.65rem' }}>Strength</small>
                      <small className={`text-${getStrengthColor()} fw-bold`} style={{ fontSize: '0.65rem' }}>
                        {passwordStrength < 50 ? 'Weak' : passwordStrength < 75 ? 'Medium' : 'Strong'}
                      </small>
                    </div>
                  </div>
                )}

                <Form.Group className="mb-4" controlId="formConfirmPassword">
                  <Form.Label className="fw-bold small text-uppercase text-adaptive" style={{ fontSize: '0.75rem' }}>Confirm Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRight: 'none', color: 'var(--neon-green)' }}>
                      <FaCheckCircle />
                    </InputGroup.Text>
                    <Form.Control
                      className="neon-input"
                      type="password"
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </InputGroup>
                </Form.Group>

                <div className="mb-4">
                  <div
                    onClick={() => setAgreeTerms(!agreeTerms)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: agreeTerms ? 'var(--neon-green)' : 'rgba(15,23,42,0.8)',
                      border: agreeTerms ? '2px solid var(--neon-green)' : '1px solid rgba(255,255,255,0.15)',
                      transition: 'all 0.2s',
                    }}>
                      {agreeTerms && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5.5L4 8.5L11 1" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="small text-adaptive">
                      I agree to the <Link to="#" className="text-decoration-none" style={{ color: 'var(--neon-green)' }} onClick={(e) => e.stopPropagation()}>Terms of Service</Link> &amp; <Link to="#" className="text-decoration-none" style={{ color: 'var(--neon-green)' }} onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>
                    </span>
                  </div>
                </div>

                {error && (
                  <div style={{ color: '#ff4d4d', fontSize: '0.78rem', fontWeight: 600, textAlign: 'center', marginBottom: 12, padding: '8px 12px', borderRadius: 8, background: 'rgba(255,77,77,0.1)', border: '1px solid rgba(255,77,77,0.2)' }}>
                    {error}
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-3"><Loader size="sm" /></div>
                ) : (
                  <Button variant="primary" type="submit" className="w-100 btn-cinematic btn-cinematic-green mb-4">
                    Create Account
                  </Button>
                )}

                <div className="text-center pt-2">
                  <span className="text-adaptive small">
                    Already have an account?
                    <Link to="/pages/login" className="ms-2" style={{ color: 'var(--neon-green)', textDecoration: 'none', fontWeight: 700 }}>Log In</Link>
                  </span>
                </div>

              </Form>
            </div>

            <div className="text-center mt-4 opacity-75">
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                &copy; {new Date().getFullYear()} Shape Up Inc. All rights reserved.
              </small>
            </div>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Register;
