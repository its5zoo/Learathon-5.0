import React from 'react';
import './About.css';

const About: React.FC = () => {
  return (
    <section className="about" id="about">
      <div className="container">
        <h2 className="section-title">About SoulSpace</h2>
        
        <div className="about-content-wrapper">
          <div className="about-text-content">
            <h3 className="about-subtitle">Empowering Mental Wellness</h3>
            
            <p className="about-text">
              SoulSpace is a comprehensive mental health platform dedicated to supporting individuals across India. Founded in 2021, we bridge the gap between people facing mental health challenges and professional support systems.
            </p>
            
            <p className="about-text">
              Our mission is to create a stigma-free environment where everyone can access quality mental health resources, counseling services, and peer support. We believe that mental well-being is essential for daily life and personal growth.
            </p>
            
            <div className="about-stats-grid">
              <div className="stat-item">
                <div className="stat-icon message-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                </div>
                <div className="stat-info">
                  <h4 className="stat-number">10K+</h4>
                  <p className="stat-label">Counselling Sessions</p>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon users-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
                <div className="stat-info">
                  <h4 className="stat-number">200+</h4>
                  <p className="stat-label">Experienced Volunteers</p>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon education-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c3 3 9 3 12 0v-5"></path></svg>
                </div>
                <div className="stat-info">
                  <h4 className="stat-number">500+</h4>
                  <p className="stat-label">Partner Organizations</p>
                </div>
              </div>
              
              <div className="stat-item">
                <div className="stat-icon location-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <div className="stat-info">
                  <h4 className="stat-number">28</h4>
                  <p className="stat-label">States Covered</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="about-image-wrapper">
            <img src="/counseling_session_1787470124323.jpg" alt="Counseling Session" className="about-image" />
            <div className="experience-badge">
              <span className="exp-years">3+</span>
              <span className="exp-text">Years of<br />Experience</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
