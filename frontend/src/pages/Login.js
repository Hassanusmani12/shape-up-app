import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col, Container, InputGroup } from "react-bootstrap";
import {
  FaSignInAlt, FaUserCircle, FaEnvelope, FaLock,
  FaEye, FaEyeSlash
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { useLoginMutation } from "../slices/usersApiSlice";
import { setCredentials } from "../slices/authSlice";
import Loader from "../components/Loader";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (userInfo) {
      navigate("/");
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
        return;
    }

    try {
      const res = await login({ email, password, rememberMe }).unwrap();
      dispatch(setCredentials({ ...res }));

      if (rememberMe) {
          localStorage.setItem("rememberUser", email);
      } else {
          localStorage.removeItem("rememberUser");
      }

      navigate("/");
    } catch (err) {
      setError(err?.data?.message || err?.error || "Invalid credentials");
    }
  };

  const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
  };

  return (
    <div className="page-wrapper d-flex flex-column min-vh-100 position-relative overflow-hidden cinematic-section" data-scene>
      <Container className="flex-grow-1 d-flex flex-column align-items-center justify-content-center py-5">

        <Row className="justify-content-center w-100">
          <Col md={8} lg={5}>

            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-3"
                style={{
                  width: 100, height: 100, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
                  boxShadow: '0 0 30px rgba(0, 255, 136, 0.3)'
                }}
              >
                <FaUserCircle style={{ fontSize: '3rem', color: '#000' }} />
              </div>
              <h3 className="fw-bold mb-1 gradient-text" style={{ letterSpacing: '-1px' }} data-reveal>Welcome Back!</h3>
              <p className="text-adaptive small">Sign in to continue your fitness journey</p>
            </div>

            <div className="cinematic-card p-4" data-fade>

              <Form onSubmit={submitHandler}>

                <Form.Group className="mb-4" controlId="formEmail">
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
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-4" controlId="formPassword">
                  <Form.Label className="fw-bold small text-uppercase text-adaptive" style={{ fontSize: '0.75rem' }}>Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.15)', borderRight: 'none', color: 'var(--neon-green)' }}>
                      <FaLock />
                    </InputGroup.Text>
                    <Form.Control
                      className="neon-input"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
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

                <div className="d-flex justify-content-between align-items-center mb-4" style={{ gap: 12 }}>
                  <div
                    onClick={() => setRememberMe(!rememberMe)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
                      userSelect: 'none',
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: rememberMe ? 'var(--neon-green)' : 'rgba(15,23,42,0.8)',
                      border: rememberMe ? '2px solid var(--neon-green)' : '1px solid rgba(255,255,255,0.15)',
                      transition: 'all 0.2s',
                    }}>
                      {rememberMe && (
                        <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                          <path d="M1 5.5L4 8.5L11 1" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>
                    <span className="small fw-bold" style={{ color: 'var(--text-primary)' }}>Remember me for 30 days</span>
                  </div>
                  <Link to="/forgot-password" className="neon-text small" style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}>
                    Forgot Password?
                  </Link>
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
                    Sign In <FaSignInAlt className="ms-2" />
                  </Button>
                )}

                <div className="text-center pt-2">
                  <span className="text-adaptive small">
                    Don't have an account yet?
                    <Link to="/pages/register" className="ms-2" style={{ color: 'var(--neon-green)', textDecoration: 'none', fontWeight: 700 }}>Create Account</Link>
                  </span>
                </div>

              </Form>
            </div>

            <div className="text-center mt-4 opacity-75">
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                &copy; {new Date().getFullYear()} Shape Up Inc. By logging in, you agree to our Terms.
              </small>
            </div>

          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Login;
