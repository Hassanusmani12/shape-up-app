import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { useLogoutMutation } from "../slices/usersApiSlice";
import { logout } from "../slices/authSlice";
import { FaDumbbell, FaBell, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
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
  "/dashboard": "📊",
  "/pages/workouts": "💪",
  "/pages/nutrition-checker": "🥗",
  "/ai-hub": "🤖",
  "/pages/features": "⚡",
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
          <div
            onClick={() => setExpanded(false)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 1041,
              background: 'rgba(0,0,0,0.6)',
            }}
          />
        )}

        {expanded && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 'min(300px, 80vw)',
              zIndex: 1042,
              background: '#0f0f17',
              display: 'flex',
              flexDirection: 'column',
              padding: '76px 20px 20px',
              borderLeft: '1px solid rgba(255,255,255,0.06)',
              boxShadow: '-4px 0 24px rgba(0,0,0,0.6)',
            }}
          >
            <button
              aria-label="Close menu"
              onClick={() => setExpanded(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#aaa',
                transition: 'all 0.2s',
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </button>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, marginTop: 4 }}>
              {HEADER_NAV.filter((item) => item.path !== "/ai-hub" || userInfo).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setExpanded(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '13px 14px',
                    borderRadius: 10,
                    textDecoration: 'none',
                    color: isActive(item.path) ? '#fff' : 'rgba(255,255,255,0.6)',
                    fontWeight: isActive(item.path) ? 600 : 400,
                    fontSize: '0.95rem',
                    background: isActive(item.path) ? 'rgba(255,255,255,0.06)' : 'transparent',
                    borderLeft: isActive(item.path) ? '3px solid #4ade80' : '3px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  <span style={{ fontSize: '1.05rem', width: 22, textAlign: 'center', flexShrink: 0 }}>
                    {HEADER_ICONS[item.path] || "•"}
                  </span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {userInfo && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4ade80, #22d3ee)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#000', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                  }}>
                    {userInfo.name?.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.85rem', color: '#fff', lineHeight: 1.3 }}>{userInfo.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userInfo.email}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <Link to="/pages/profile" onClick={() => setExpanded(false)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 0', borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textDecoration: 'none' }}>
                    <FaUser size={11} /> Profile
                  </Link>
                  <Link to="/pages/settings" onClick={() => setExpanded(false)} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 0', borderRadius: 8, background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', textDecoration: 'none' }}>
                    <FaCog size={11} /> Settings
                  </Link>
                  <button onClick={() => { setExpanded(false); logoutHandler(); }} style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5, padding: '9px 0', borderRadius: 8, background: 'rgba(255,68,68,0.08)', color: 'rgba(255,68,68,0.55)', fontSize: '0.75rem', border: 'none', cursor: 'pointer' }}>
                    <FaSignOutAlt size={11} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Container>
    </Navbar>
  );
};

export default Header;
