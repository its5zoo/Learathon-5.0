import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ChatbotWidget.css';

const ChatbotWidget: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const widgetRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0,
    hasMoved: false,
  });

  // Calculate default position and ensure widget stays within viewport bounds
  useEffect(() => {
    const updateBounds = () => {
      const widgetSize = 60;
      const margin = 24;
      const defaultX = window.innerWidth - widgetSize - margin;
      const defaultY = window.innerHeight - widgetSize - margin;

      setPosition((prev) => {
        if (!prev) return { x: defaultX, y: defaultY };
        const clampedX = Math.min(Math.max(margin, prev.x), window.innerWidth - widgetSize - margin);
        const clampedY = Math.min(Math.max(margin, prev.y), window.innerHeight - widgetSize - margin);
        return { x: clampedX, y: clampedY };
      });
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    
    const widget = widgetRef.current;
    if (!widget) return;
    const rect = widget.getBoundingClientRect();

    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top,
      hasMoved: false,
    };

    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
      dragStartRef.current.hasMoved = true;
    }

    const widgetSize = 60;
    const margin = 12;
    const minX = margin;
    const maxX = window.innerWidth - widgetSize - margin;
    const minY = margin;
    const maxY = window.innerHeight - widgetSize - margin;

    const newX = Math.min(Math.max(minX, dragStartRef.current.initialX + dx), maxX);
    const newY = Math.min(Math.max(minY, dragStartRef.current.initialY + dy), maxY);

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }

    // If it was a click (not dragged), navigate to AI Support
    if (!dragStartRef.current.hasMoved) {
      if (location.pathname !== '/ai-support') {
        navigate('/ai-support');
      }
    }
  };

  // Hide when already on the AI Support page
  if (location.pathname === '/ai-support') {
    return null;
  }

  return (
    <div
      ref={widgetRef}
      className={`chatbot-widget ${isDragging ? 'dragging' : ''}`}
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              right: 'auto',
              bottom: 'auto',
            }
          : undefined
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      title="Drag to move or click to open AI Support"
    >
      <div className="notification-badge">1</div>
      <div className="chatbot-icon">
        <svg
          viewBox="0 0 24 24"
          width="28"
          height="28"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="11" width="18" height="10" rx="2"></rect>
          <circle cx="12" cy="5" r="2"></circle>
          <path d="M12 7v4"></path>
          <line x1="8" y1="16" x2="8" y2="16"></line>
          <line x1="16" y1="16" x2="16" y2="16"></line>
        </svg>
      </div>
    </div>
  );
};

export default ChatbotWidget;
