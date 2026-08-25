import React from 'react';
import './Footer.css';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="logo footer-logo">
              <img src="/logo_main.png" alt="SoulSpace Logo" className="logo-icon-img" />
              <span className="logo-text">SoulSpace</span>
            </div>
            <p className="footer-description">
              A comprehensive mental health platform dedicated to supporting individuals across India with professional counseling and AI-guided resources.
            </p>
          </div>
          
          <div className="footer-links-group">
            <h4 className="footer-title">Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About Us</a></li>
              <li><a href="#services">Services</a></li>
              <li><a href="#resources">Resources</a></li>
            </ul>
          </div>
          
          <div className="footer-links-group">
            <h4 className="footer-title">Legal</h4>
            <ul className="footer-links">
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Cookie Policy</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SoulSpace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
