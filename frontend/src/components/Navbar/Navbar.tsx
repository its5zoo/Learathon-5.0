import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavClick = (path: string, hash?: string) => {
    setIsMenuOpen(false);
    if (hash) {
      navigate(path);
      setTimeout(() => {
        const el = document.getElementById(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
              <NavLink 
                to="/" 
                end
                className={({ isActive }) => (isActive ? 'active' : '')} 
                onClick={() => handleNavClick('/')}
              >
                Home
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/ai-support" 
                className={({ isActive }) => (isActive ? 'active' : '')} 
                onClick={() => handleNavClick('/ai-support')}
              >
                AI-Support
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/mental-health" 
                className={({ isActive }) => (isActive ? 'active' : '')} 
                onClick={() => handleNavClick('/mental-health')}
              >
                Mental Health
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/appointment" 
                className={({ isActive }) => (isActive ? 'active' : '')} 
                onClick={() => handleNavClick('/appointment')}
              >
                Appointment
              </NavLink>
            </li>
            <li>
              <button 
                className="nav-link-btn" 
                onClick={() => handleNavClick('/', 'resources')}
              >
                Resources
              </button>
            </li>
          </ul>
          
          <div className="nav-actions">
            <button className="btn btn-outline">Login</button>
            <button className="btn btn-primary">Register</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
