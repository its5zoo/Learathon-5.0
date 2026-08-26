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
          <img src="/logo_main.png" alt="SoulSpace Logo" className="logo-icon-img" />
          <span className="logo-text">SoulSpace</span>
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
                    <div className="dropdown-profile-header" onClick={() => handleNavClick('/profile')} style={{ cursor: 'pointer' }}>
                      <div className="dropdown-avatar-lg">{getInitials()}</div>
                      <div>
                        <div className="dropdown-name">{user.firstName} {user.lastName}</div>
                        <div className="dropdown-email">{user.email}</div>
                      </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    {/* Menu Items */}
                    <button className="dropdown-item" onClick={() => handleNavClick('/profile')}>
                      <span>👤</span> My Profile &amp; Records
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
