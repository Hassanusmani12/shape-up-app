import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";
import { FaDumbbell, FaBell, FaUser, FaCog, FaSignOutAlt, FaThLarge, FaUtensils, FaRobot, FaStar } from "react-icons/fa";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

const HEADER_NAV = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Workouts", path: "/pages/workouts" },
  { label: "Nutrition", path: "/pages/nutrition-checker" },
  { label: "AI Hub", path: "/ai-hub" },
  { label: "Features", path: "/pages/features" },
];

const HEADER_ICONS = {
  "/dashboard": FaThLarge,
  "/pages/workouts": FaDumbbell,
  "/pages/nutrition-checker": FaUtensils,
  "/ai-hub": FaRobot,
  "/pages/features": FaStar,
};

const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const [logoutApiCall] = useLogoutMutation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setExpanded(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = expanded ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [expanded]);

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/pages/login");
    } catch (err) {
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Navbar
      expand="lg"
      expanded={expanded}
      onToggle={setExpanded}
      fixed="top"
      style={{
        background: scrolled
          ? 'rgba(0,0,0,0.82)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(1.2)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,255,136,0.08)' : '1px solid transparent',
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        padding: '6px 0',
        zIndex: 1040,
      }}
    >
      <Container style={{ maxWidth: 1200 }}>
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2 text-decoration-none" style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: 1.5 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 12px rgba(0,255,136,0.2)',
          }}>
            <FaDumbbell style={{ color: '#000', fontSize: '0.9rem' }} />
          </div>
          <span style={{ fontFamily: 'var(--font-athletic)', textTransform: 'uppercase' }}>
            <span style={{ color: 'var(--neon-green)' }}>Shape</span>
            <span style={{ color: 'var(--text-primary)', opacity: 0.9 }}> Up</span>
          </span>
        </Link>

        <button
          aria-label="Toggle menu"
          onClick={() => setExpanded((p) => !p)}
          className="d-lg-none"
          style={{
            position: 'relative',
            zIndex: 1050,
            border: '1px solid rgba(0,255,136,0.15)',
            padding: '5px 8px',
            borderRadius: 8,
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          {expanded ? (
            <CloseIcon style={{ color: 'var(--neon-green)', fontSize: '1.1rem' }} />
          ) : (
            <MenuIcon style={{ color: 'var(--neon-green)', fontSize: '1.1rem' }} />
          )}
        </button>

        <Navbar.Collapse id="main-nav" className="d-none d-lg-flex">
          <Nav className="mx-auto gap-1">
            {HEADER_NAV.filter((item) => item.path !== "/ai-hub" || userInfo).map((item) => (
              <Nav.Link
                key={item.path}
                as={Link}
                to={item.path}
                style={{
                  color: isActive(item.path) ? 'var(--neon-green)' : 'var(--text-muted)',
                  fontWeight: isActive(item.path) ? 700 : 500,
                  fontSize: '0.78rem',
                  padding: '7px 14px',
                  borderRadius: 8,
                  background: isActive(item.path) ? 'rgba(0,255,136,0.06)' : 'transparent',
                  border: isActive(item.path) ? '1px solid rgba(0,255,136,0.12)' : '1px solid transparent',
                  letterSpacing: 0.5,
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-primary)',
                }}
                onMouseEnter={(e) => { if (!isActive(item.path)) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                onMouseLeave={(e) => { if (!isActive(item.path)) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; } }}
              >
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          <Nav className="align-items-lg-center gap-1">
            {userInfo ? (
              <>
                <Nav.Link as={Link} to="/notifications" style={{
                  position: 'relative', padding: '7px 10px',
                  color: isActive('/notifications') ? 'var(--neon-green)' : 'var(--text-muted)',
                  transition: 'color 0.2s',
                }}>
                  <FaBell size={15} />
                </Nav.Link>

                <NavDropdown
                  title={
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#000', fontWeight: 800, fontSize: '0.7rem',
                        boxShadow: '0 2px 8px rgba(0,255,136,0.2)',
                      }}>
                        {userInfo.name?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-primary)' }}>{userInfo.name}</span>
                    </span>
                  }
                  id="user-dropdown"
                  align="end"
                  style={{ background: 'transparent' }}
                >
                  <NavDropdown.Item as={Link} to="/pages/profile">
                    <FaUser size={12} style={{ marginRight: 8 }} /> Profile
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/pages/settings">
                    <FaCog size={12} style={{ marginRight: 8 }} /> Settings
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>
                    <FaSignOutAlt size={12} style={{ marginRight: 8 }} /> Logout
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            ) : (
              <div className="d-flex gap-2">
                <Link to="/pages/login" className="btn-cinematic btn-cinematic-outline text-decoration-none" style={{ padding: '7px 18px', fontSize: '0.78rem' }}>
                  Login
                </Link>
                <Link to="/pages/register" className="btn-cinematic btn-cinematic-green text-decoration-none" style={{ padding: '7px 18px', fontSize: '0.78rem' }}>
                  Sign Up
                </Link>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>

        {expanded && (
          <>
            <style>{`
              @keyframes drawerFadeIn { from { opacity: 0; } to { opacity: 1; } }
              @keyframes drawerSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
            `}</style>
            <div
              onClick={() => setExpanded(false)}
              style={{
                position: 'fixed', inset: 0, zIndex: 1041,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)',
                animation: 'drawerFadeIn 0.2s ease',
              }}
            />
            <div
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 280,
                zIndex: 1042,
                background: '#000',
                display: 'flex', flexDirection: 'column',
                padding: '68px 16px 20px',
                borderLeft: '1px solid rgba(255,255,255,0.04)',
                boxShadow: '-4px 0 24px rgba(0,0,0,0.6)',
                animation: 'drawerSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <button
                aria-label="Close menu"
                onClick={() => setExpanded(false)}
                style={{
                  position: 'absolute', top: 20, right: 16,
                  width: 28, height: 28,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  background: 'none', border: 'none',
                  color: 'rgba(255,255,255,0.3)',
                  transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--neon-green)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </button>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '0 4px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
                marginBottom: 12,
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 8,
                  background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FaDumbbell style={{ color: '#000', fontSize: '0.75rem' }} />
                </div>
                <span style={{ fontFamily: 'var(--font-athletic)', textTransform: 'uppercase', fontSize: '0.85rem', fontWeight: 800, letterSpacing: 1 }}>
                  <span style={{ color: 'var(--neon-green)' }}>Shape</span>
                  <span style={{ color: 'rgba(255,255,255,0.65)' }}> Up</span>
                </span>
              </div>

              <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {HEADER_NAV.filter((item) => item.path !== "/ai-hub" || userInfo).map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setExpanded(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '11px 12px', borderRadius: 12,
                      textDecoration: 'none',
                      color: isActive(item.path) ? 'var(--neon-green)' : 'rgba(255,255,255,0.6)',
                      fontWeight: isActive(item.path) ? 600 : 450,
                      fontSize: '0.85rem', letterSpacing: 0.15,
                      background: isActive(item.path) ? 'rgba(0,255,136,0.08)' : 'transparent',
                      borderLeft: isActive(item.path) ? '2px solid var(--neon-green)' : '2px solid transparent',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive(item.path)) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                      }
                    }}
                  >
                    <span style={{ width: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'inherit' }}>
                      {(() => { const Icon = HEADER_ICONS[item.path]; return Icon ? <Icon size={13} /> : null; })()}
                    </span>
                    {item.label}
                  </Link>
                ))}
              </nav>

              {userInfo && (
                <>
                  <div style={{
                    height: 1,
                    background: 'rgba(255,255,255,0.04)',
                    margin: '8px 4px 12px',
                  }} />
                  <div style={{
                    padding: '12px 0',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--neon-green), var(--neon-cyan))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#000', fontWeight: 700, fontSize: '0.8rem',
                        flexShrink: 0,
                      }}>
                        {userInfo.name?.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: '0.82rem', color: '#fff', lineHeight: 1.3 }}>{userInfo.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 1 }}>{userInfo.email}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Link to="/pages/profile" onClick={() => setExpanded(false)} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        padding: '8px 0', borderRadius: 8,
                        background: 'transparent', color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.72rem', fontWeight: 500,
                        textDecoration: 'none', border: '1px solid rgba(255,255,255,0.06)',
                        transition: 'all 0.15s ease',
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                        <FaUser size={10} /> Profile
                      </Link>
                      <Link to="/pages/settings" onClick={() => setExpanded(false)} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        padding: '8px 0', borderRadius: 8,
                        background: 'transparent', color: 'rgba(255,255,255,0.5)',
                        fontSize: '0.72rem', fontWeight: 500,
                        textDecoration: 'none', border: '1px solid rgba(255,255,255,0.06)',
                        transition: 'all 0.15s ease',
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}>
                        <FaCog size={10} /> Settings
                      </Link>
                      <button onClick={() => { setExpanded(false); logoutHandler(); }} style={{
                        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        padding: '8px 0', borderRadius: 8,
                        background: 'transparent', color: 'rgba(255,68,68,0.55)',
                        fontSize: '0.72rem', fontWeight: 500,
                        border: '1px solid rgba(255,68,68,0.12)', cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                        onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(255,68,68,0.3)'; e.currentTarget.style.color = '#ff6b6b'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,68,68,0.12)'; e.currentTarget.style.color = 'rgba(255,68,68,0.55)'; }}>
                        <FaSignOutAlt size={10} /> Logout
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </Container>
    </Navbar>
  );
};

export default Header;
