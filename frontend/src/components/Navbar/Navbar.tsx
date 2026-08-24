import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isLoggedIn, logout } = useAuth();
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleNavClick = (path: string, hash?: string) => {
    setIsMenuOpen(false);
    setIsProfileOpen(false);
    if (hash) {
      navigate(path);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    navigate('/');
  };

  // Get initials for avatar
  const getInitials = () => {
    if (!user) return '?';
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="logo" onClick={() => handleNavClick('/')}>
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="#3f72af"/>
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="#3f72af"/>
          </svg>
          <span className="logo-text">SoulSpace AI</span>
        </Link>

        <div className="hamburger" onClick={toggleMenu}>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
          <span className={`bar ${isMenuOpen ? 'open' : ''}`}></span>
        </div>

        <div className={`nav-content ${isMenuOpen ? 'active' : ''}`}>
          <ul className="nav-links">
            <li>
              <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => handleNavClick('/')}>
                Home
              </NavLink>
            </li>
            <li>
              <NavLink to="/ai-support" className={({ isActive }) => `nav-ai-highlight ${isActive ? 'active' : ''}`} onClick={() => handleNavClick('/ai-support')}>
                AI-Support
              </NavLink>
            </li>
            <li>
              <NavLink to="/mental-health" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => handleNavClick('/mental-health')}>
                Mental Health
              </NavLink>
            </li>
            <li>
              <NavLink to="/appointment" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => handleNavClick('/appointment')}>
                Appointment
              </NavLink>
            </li>
            <li>
              <NavLink to="/mood-tracker" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => handleNavClick('/mood-tracker')}>
                Mood Tracker
              </NavLink>
            </li>
            <li>
              <NavLink to="/resources" className={({ isActive }) => (isActive ? 'active' : '')} onClick={() => handleNavClick('/resources')}>
                Resources
              </NavLink>
            </li>
          </ul>

          <div className="nav-actions">
            {isLoggedIn && user ? (
              /* ── PROFILE DROPDOWN ─────────────────────────────── */
              <div className="nav-profile-wrapper" ref={profileRef}>
                <button
                  className="nav-profile-btn"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  aria-label="Profile menu"
                >
                  <div className="nav-avatar">
                    {getInitials()}
                  </div>
                  <div className="nav-profile-info">
                    <span className="nav-profile-name">
                      {user.firstName} {user.lastName}
                    </span>
                    {user.isDemo && (
                      <span className="nav-demo-badge">Demo</span>
                    )}
                  </div>
                  <svg
                    className={`nav-chevron ${isProfileOpen ? 'rotated' : ''}`}
                    viewBox="0 0 24 24" width="14" height="14"
                    fill="none" stroke="currentColor" strokeWidth="2.5"
                  >
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </button>

                {isProfileOpen && (
                  <div className="nav-profile-dropdown">
                    {/* Profile Card Header */}
                    <div className="dropdown-profile-header">
                      <div className="dropdown-avatar-lg">{getInitials()}</div>
                      <div>
                        <div className="dropdown-name">{user.firstName} {user.lastName}</div>
                        <div className="dropdown-email">{user.email}</div>
                        {user.isDemo && (
                          <span className="dropdown-demo-tag">🎭 Demo Account</span>
                        )}
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    {/* Menu Items */}
                    <button className="dropdown-item" onClick={() => handleNavClick('/mood-tracker')}>
                      <span>📊</span> Mood Dashboard
                    </button>
                    <button className="dropdown-item" onClick={() => handleNavClick('/mental-health')}>
                      <span>🧠</span> My Assessments
                    </button>
                    <button className="dropdown-item" onClick={() => handleNavClick('/appointment')}>
                      <span>📅</span> My Appointments
                    </button>

                    <div className="dropdown-divider"></div>

                    {/* Logout */}
                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                      <span>🚪</span> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── LOGIN / REGISTER BUTTONS ─────────────────────── */
              <>
                <button className="btn btn-outline" onClick={() => handleNavClick('/login')}>Login</button>
                <button className="btn btn-primary" onClick={() => handleNavClick('/register')}>Register</button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
