import React from 'react';
import './Hero.css';

const Hero: React.FC = () => {
  return (
    <section className="hero" id="home">
      <div className="container hero-container">
        <div className="hero-content">
          <h1 className="hero-title">Your Mental Wellbeing<br />Matters</h1>
          <p className="hero-description">
            Access confidential resources, professional counseling, and peer support to nurture your mental well-being - all in one seamless platform.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary">Get Started</button>
            <button className="btn btn-outline">Learn More</button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/hero_page_brain.png" alt="Neural Brain" className="brain-img" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
