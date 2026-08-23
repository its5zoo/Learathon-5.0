import React from 'react';
import './ChatbotWidget.css';

const ChatbotWidget: React.FC = () => {
  return (
    <div className="chatbot-widget">
      <div className="notification-badge">1</div>
      <div className="chatbot-icon">
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>
      </div>
    </div>
  );
};

export default ChatbotWidget;
