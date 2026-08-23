import React, { useState } from 'react';
import './Resources.css';

const Resources: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState('Videos');
  
  const filters = ['Videos', 'Calming Audio', 'Awareness Posters', 'Self-Help Guides', 'Books', 'Quotes'];
  
  const allResources = [
    // Videos
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Understanding Anxiety',
      description: 'Learn about the science behind anxiety and effective coping mechanisms.',
      type: 'Videos',
      actionText: 'Watch Now',
      playing: true
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Mindfulness Meditation Guide',
      description: 'A step-by-step meditation video guide for beginners to reduce stress.',
      type: 'Videos',
      actionText: 'Watch Now'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Stress Management',
      description: 'Practical techniques to manage daily stress and anxiety.',
      type: 'Videos',
      actionText: 'Watch Now'
    },
    
    // Calming Audio
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Rainforest Ambience',
      description: 'Immersive rainforest sounds to help you focus or fall asleep.',
      type: 'Calming Audio',
      actionText: 'Listen Now'
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Deep Sleep Binaural Beats',
      description: 'Scientifically designed audio waves for deep, restorative sleep.',
      type: 'Calming Audio',
      actionText: 'Listen Now'
    },
    {
      id: 14,
      image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Nature Soundscapes',
      description: 'Relaxing sounds of rivers and birds to calm an anxious mind.',
      type: 'Calming Audio',
      actionText: 'Listen Now'
    },
    
    // Awareness Posters
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1584697964190-7cb52945a805?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Break the Stigma',
      description: 'High-resolution poster raising awareness for mental health acceptance.',
      type: 'Awareness Posters',
      actionText: 'View Poster'
    },
    {
      id: 7,
      image: 'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'It Is Okay To Not Be Okay',
      description: 'A gentle daily reminder poster for your workspace or bedroom.',
      type: 'Awareness Posters',
      actionText: 'View Poster'
    },
    {
      id: 15,
      image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'You Are Not Alone',
      description: 'A supportive poster emphasizing the power of community.',
      type: 'Awareness Posters',
      actionText: 'View Poster'
    },

    // Self-Help Guides
    {
      id: 8,
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead2708?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'CBT Journaling Guide',
      description: 'A printable PDF guide on how to structure Cognitive Behavioral Therapy journals.',
      type: 'Self-Help Guides',
      actionText: 'Download Guide'
    },
    {
      id: 9,
      image: 'https://images.unsplash.com/photo-1506784951206-8d6bd6f5195c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Overcoming Social Anxiety',
      description: 'A 7-day action plan to help you build confidence in social situations.',
      type: 'Self-Help Guides',
      actionText: 'Download Guide'
    },
    {
      id: 16,
      image: 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Grounding Techniques',
      description: 'Quick exercises to bring yourself back to the present moment during a panic attack.',
      type: 'Self-Help Guides',
      actionText: 'Download Guide'
    },

    // Books
    {
      id: 10,
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'The Body Keeps the Score',
      description: 'Bessel van der Kolk\'s profound insight into healing from trauma.',
      type: 'Books',
      actionText: 'Read Summary'
    },
    {
      id: 11,
      image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Atomic Habits',
      description: 'How tiny changes in your routine can remarkably improve your mental health.',
      type: 'Books',
      actionText: 'Read Summary'
    },
    {
      id: 17,
      image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'The Power of Now',
      description: 'Eckhart Tolle\'s guide to spiritual enlightenment and living in the moment.',
      type: 'Books',
      actionText: 'Read Summary'
    },

    // Quotes
    {
      id: 12,
      image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Daily Inspiration',
      description: '"You don\'t have to control your thoughts. You just have to stop letting them control you."',
      type: 'Quotes',
      actionText: 'Share Quote'
    },
    {
      id: 13,
      image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Healing Words',
      description: '"Healing takes time, and asking for help is a courageous step." Keep pushing forward.',
      type: 'Quotes',
      actionText: 'Share Quote'
    },
    {
      id: 18,
      image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      title: 'Self-Compassion',
      description: '"Talk to yourself like you would to someone you love." - Brené Brown',
      type: 'Quotes',
      actionText: 'Share Quote'
    }
  ];

  const filteredResources = allResources.filter(resource => resource.type === activeFilter);

  return (
    <section className="resources" id="resources">
      <div className="container">
        <div className="resources-header">
          <h2 className="section-title">Explore Free Mental Health Resources</h2>
          <p className="resources-subtitle">
            Find calming sounds, educational videos, awareness posters, and more to support your mental well-being.
          </p>
        </div>
        
        <div className="filters-container">
          {filters.map(filter => (
            <button 
              key={filter} 
              className={`filter-btn ${activeFilter === filter ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === 'Videos' && <span className="filter-icon">▶</span>}
              {filter === 'Calming Audio' && <span className="filter-icon">🎧</span>}
              {filter === 'Awareness Posters' && <span className="filter-icon">🖼️</span>}
              {filter === 'Self-Help Guides' && <span className="filter-icon">📖</span>}
              {filter === 'Books' && <span className="filter-icon">📚</span>}
              {filter === 'Quotes' && <span className="filter-icon">💬</span>}
              {filter}
            </button>
          ))}
        </div>
        
        <div className="resources-grid">
          {filteredResources.length > 0 ? (
            filteredResources.map((resource) => (
              <div className="resource-card" key={resource.id}>
                <div className="resource-image-container">
                  <img src={resource.image} alt={resource.title} className="resource-image" />
                  {resource.playing && (
                    <div className="playing-badge">▶ Playing</div>
                  )}
                </div>
                <div className="resource-content">
                  <h3 className="resource-title">{resource.title}</h3>
                  <p className="resource-description">{resource.description}</p>
                  <a href="#" className="resource-link">
                    {resource.actionText} <span className="arrow">→</span>
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="no-resources-msg" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
              <p>More resources coming soon for this category.</p>
            </div>
          )}
        </div>
        
        <div className="explore-more-container">
          <button className="btn btn-primary">Explore All Resources</button>
        </div>
      </div>
    </section>
  );
};

export default Resources;
