import React, { useState, useMemo, useRef } from 'react';
import './ResourcesPage.css';

interface Resource {
  id: number;
  title: string;
  description: string;
  type: 'Videos' | 'Calming Audio' | 'Awareness' | 'Self-Help Guides' | 'Books' | 'Quotes';
  moods: string[];
  actionText: string;
  image?: string;
  link?: string;
  playing?: boolean;
  audioUrl?: string;
  youtubeId?: string;
}

const resourcesData: Resource[] = [
  // Videos
  {
    id: 1,
    title: 'Breathing Exercises for Anxiety',
    description: 'Learn simple breathing techniques to manage anxiety and stress in daily life.',
    type: 'Videos',
    moods: ['Fear', 'Neutral'],
    actionText: 'Watch Video',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    youtubeId: 'LiUnFJ8P4gM'
  },
  {
    id: 2,
    title: 'Mindfulness Meditation for Students',
    description: 'A guided meditation session designed specifically for students to reduce stress and improve focus.',
    type: 'Videos',
    moods: ['Neutral', 'Sad'],
    actionText: 'Watch Video',
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    youtubeId: 'inpok4MKVLM'
  },
  {
    id: 3,
    title: 'Dealing with Academic Pressure',
    description: 'Tips and strategies for managing academic stress and maintaining mental health.',
    type: 'Videos',
    moods: ['Angry', 'Fear', 'Sad'],
    actionText: 'Watch Video',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    youtubeId: 'hnpQrMqDoqE'
  },
  
  // Calming Audio
  {
    id: 4,
    title: 'Calming Nature Sounds',
    description: 'Relaxing sounds of rain, forest, and ocean waves to help you unwind.',
    type: 'Calming Audio',
    moods: ['Neutral', 'Sad', 'Fear'],
    actionText: 'Listen Now',
    image: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    audioUrl: '/resource_audio/nature_audio.mp3'
  },
  {
    id: 5,
    title: 'Sleep Meditation',
    description: 'A gentle guided meditation to help you fall asleep peacefully.',
    type: 'Calming Audio',
    moods: ['Neutral', 'Sad'],
    actionText: 'Listen Now',
    image: '/sleepingmeditate_img.png',
    audioUrl: '/resource_audio/sleepmeditation_audio.mp3'
  },
  {
    id: 6,
    title: 'Confidence Boosting Affirmations',
    description: 'Positive affirmations to build self-confidence and self-esteem.',
    type: 'Calming Audio',
    moods: ['Happy', 'Neutral'],
    actionText: 'Listen Now',
    image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    audioUrl: '/resource_audio/confidenceboost_audio.mp3'
  },

  // Awareness
  {
    id: 7,
    title: 'Break the Stigma',
    description: 'A visual guide raising awareness and fostering open conversations for mental health acceptance.',
    type: 'Awareness',
    moods: ['Happy', 'Neutral'],
    actionText: 'View Guide',
    image: 'https://images.unsplash.com/photo-1584697964190-7cb52945a805?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 8,
    title: 'It Is Okay To Not Be Okay',
    description: 'A gentle daily reminder for your emotional wellness and mindful acceptance.',
    type: 'Awareness',
    moods: ['Sad', 'Fear'],
    actionText: 'View Guide',
    image: 'https://images.unsplash.com/photo-1528716321680-815a8cdb8cbe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },

  // Self-Help Guides
  {
    id: 9,
    title: 'CBT Journaling Guide',
    description: 'A printable PDF guide on how to structure Cognitive Behavioral Therapy journals.',
    type: 'Self-Help Guides',
    moods: ['Sad', 'Angry'],
    actionText: 'Download Guide',
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead2708?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 10,
    title: 'Overcoming Social Anxiety',
    description: 'A 7-day action plan to help you build confidence in social situations.',
    type: 'Self-Help Guides',
    moods: ['Fear', 'Neutral'],
    actionText: 'Download Guide',
    image: 'https://images.unsplash.com/photo-1506784951206-8d6bd6f5195c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },

  // Books
  {
    id: 11,
    title: 'The Body Keeps the Score Summary',
    description: 'Bessel van der Kolk\'s profound insight into healing from trauma.',
    type: 'Books',
    moods: ['Sad', 'Fear'],
    actionText: 'Read Summary',
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 12,
    title: 'Atomic Habits & Mental Wellness',
    description: 'How tiny changes in your routine can remarkably improve your mental health.',
    type: 'Books',
    moods: ['Happy', 'Neutral'],
    actionText: 'Read Summary',
    image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  },

  // Quotes
  {
    id: 13,
    title: 'Daily Mindful Inspiration',
    description: '"You don\'t have to control your thoughts. You just have to stop letting them control you."',
    type: 'Quotes',
    moods: ['Happy', 'Surprise'],
    actionText: 'Copy Quote',
    image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  }
];

const ResourcesPage: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string>('All Types');
  const [selectedMood, setSelectedMood] = useState<string>('All Moods');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Audio state
  const [activeAudioId, setActiveAudioId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Video hover state
  const [hoveredVideoId, setHoveredVideoId] = useState<number | null>(null);

  const types = ['All Types', 'Videos', 'Calming Audio', 'Awareness', 'Self-Help Guides', 'Books', 'Quotes'];
  const moods = ['All Moods', 'Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise'];

  const filteredResources = useMemo(() => {
    return resourcesData.filter(resource => {
      const matchesType = selectedType === 'All Types' || resource.type === selectedType;
      
      const matchesMood = selectedMood === 'All Moods' || 
        resource.moods.some(m => m.toLowerCase() === selectedMood.toLowerCase());
      
      const matchesSearch = searchQuery.trim() === '' || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesMood && matchesSearch;
    });
  }, [selectedType, selectedMood, searchQuery]);

  const handleClearFilters = () => {
    setSelectedType('All Types');
    setSelectedMood('All Moods');
    setSearchQuery('');
  };

  const handleToggleAudio = (resource: Resource) => {
    if (!resource.audioUrl) return;

    if (activeAudioId === resource.id && isPlaying) {
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      if (audioRef.current) {
        if (activeAudioId !== resource.id) {
          audioRef.current.src = resource.audioUrl;
          setActiveAudioId(resource.id);
        }
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.error('Audio playback error:', err);
          });
      }
    }
  };

  return (
    <div className="resources-page-container">
      {/* Hidden Audio Player for Resource Tracks */}
      <audio
        ref={audioRef}
        onEnded={() => {
          setIsPlaying(false);
          setActiveAudioId(null);
        }}
        onPause={() => {
          setIsPlaying(false);
        }}
        onPlay={() => {
          setIsPlaying(true);
        }}
      />

      {/* Top Hero Banner */}
      <section className="resources-hero">
        <div className="container">
          <span className="resources-eyebrow">PREMIUM MENTAL HEALTH LIBRARY</span>
          <h1 className="resources-title">Explore Mental Health Resources</h1>
          <p className="resources-subtitle">
            Access free educational videos, clinical guides, relaxing audio nature sounds, and expert-reviewed literature. No credentials required.
          </p>
        </div>
      </section>

      {/* Interactive Filters Panel */}
      <section className="resources-filters-section">
        <div className="container">
          <div className="resources-filter-card">
            <div className="filters-grid">
              
              {/* Type Select */}
              <div className="filter-group">
                <label className="filter-label">Resource Type:</label>
                <select 
                  className="filter-select" 
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                >
                  {types.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Mood Select */}
              <div className="filter-group">
                <label className="filter-label">Mood Tag:</label>
                <select 
                  className="filter-select" 
                  value={selectedMood}
                  onChange={(e) => setSelectedMood(e.target.value)}
                >
                  {moods.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* Search Box */}
              <div className="filter-group">
                <label className="filter-label">Search:</label>
                <div className="search-input-wrapper">
                  <input 
                    type="text"
                    className="filter-search-input"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="search-icon">🔍</span>
                </div>
              </div>

              {/* Clear Button */}
              <div className="filter-action-group">
                <button className="btn-clear-filters" onClick={handleClearFilters}>
                  ✕ Clear Filters
                </button>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Grid of Results */}
      <section className="resources-results-section">
        <div className="container">
          {filteredResources.length > 0 ? (
            <div className="resources-grid-layout">
              {filteredResources.map((resource) => {
                const isVideo = resource.type === 'Videos';
                const isAudio = resource.type === 'Calming Audio';
                const isThisAudioPlaying = isAudio && activeAudioId === resource.id && isPlaying;
                const isThisVideoHovered = isVideo && resource.youtubeId && hoveredVideoId === resource.id;

                return (
                  <div 
                    className={`resource-item-card ${isVideo ? 'video-card' : ''} ${isAudio ? 'audio-card' : ''} ${isThisAudioPlaying ? 'card-audio-active' : ''} ${isThisVideoHovered ? 'card-video-hovered' : ''}`}
                    key={resource.id}
                    style={isAudio && resource.image ? { backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.85)), url('${resource.image}')` } : {}}
                  >
                    
                    {/* Media Type Header Badge */}
                    <div className="media-badge-row">
                      {isVideo && (
                        <span className="media-type-tag video-tag">
                          <span className="tag-icon">▶</span> VIDEO
                        </span>
                      )}
                      {isAudio && (
                        <div className="audio-header-flex">
                          <span className="media-type-tag audio-tag">
                            <span className="tag-icon">🎧</span> AUDIO
                          </span>
                          {/* Animated Audio Visualizer */}
                          <div className={`audio-visualizer-container ${isThisAudioPlaying ? 'playing' : ''}`} title={isThisAudioPlaying ? "Audio playing" : "Audio ready"}>
                            <span className="visualizer-bar bar-1"></span>
                            <span className="visualizer-bar bar-2"></span>
                            <span className="visualizer-bar bar-3"></span>
                            <span className="visualizer-bar bar-4"></span>
                            <span className="visualizer-bar bar-5"></span>
                          </div>
                        </div>
                      )}
                      {!isVideo && !isAudio && (
                        <span className="media-type-tag general-tag">
                          {resource.type.toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Card Content Area */}
                    <div className="resource-card-body">
                      {isVideo && (
                        <div 
                          className="video-preview-thumb"
                          onMouseEnter={() => resource.youtubeId && setHoveredVideoId(resource.id)}
                          onMouseLeave={() => resource.youtubeId && setHoveredVideoId(null)}
                        >
                          {resource.youtubeId && hoveredVideoId === resource.id ? (
                            <iframe
                              className="video-preview-iframe"
                              src={`https://www.youtube.com/embed/${resource.youtubeId}?autoplay=1&mute=1&controls=0&loop=1&playlist=${resource.youtubeId}&enablejsapi=1&playsinline=1`}
                              title={resource.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <>
                              {resource.image && <img src={resource.image} alt={resource.title} />}
                              <div className="video-play-overlay">
                                <span className="play-button-triangle">▶</span>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      <h3 className="resource-item-title">{resource.title}</h3>
                      <p className="resource-item-description">{resource.description}</p>
                    </div>

                    {/* Footer Row (Tags & Action Link) */}
                    <div className="resource-card-footer">
                      <div className="mood-tag-pills">
                        {resource.moods.map((mood) => {
                          const lowerMood = mood.toLowerCase();
                          return (
                            <span key={mood} className={`mood-pill ${lowerMood}`}>
                              {mood.toUpperCase()}
                            </span>
                          );
                        })}
                      </div>

                      {isAudio && resource.audioUrl ? (
                        <button 
                          type="button" 
                          className={`resource-card-action-btn audio-action-btn ${isThisAudioPlaying ? 'is-playing' : ''}`}
                          onClick={() => handleToggleAudio(resource)}
                        >
                          {isThisAudioPlaying ? (
                            <>
                              <span>Pause Audio</span>
                              <span className="action-arrow">⏸</span>
                            </>
                          ) : (
                            <>
                              <span>Listen Now</span>
                              <span className="action-arrow">→</span>
                            </>
                          )}
                        </button>
                      ) : isVideo && resource.youtubeId ? (
                        <a 
                          href={`https://www.youtube.com/watch?v=${resource.youtubeId}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="resource-card-action-btn"
                        >
                          {resource.actionText} →
                        </a>
                      ) : (
                        <a href="#" className="resource-card-action-btn" onClick={(e) => e.preventDefault()}>
                          {resource.actionText} →
                        </a>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-results-notice">
              <span className="no-results-icon">📂</span>
              <h3>No Resources Match Your Selection</h3>
              <p>Try clearing or modifying your filter preferences to view other mental wellness materials.</p>
              <button className="btn btn-outline" onClick={handleClearFilters}>Reset Filters</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ResourcesPage;
