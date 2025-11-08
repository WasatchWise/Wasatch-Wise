import React, { useState, useEffect } from 'react';

interface UpdateIndicatorProps {
  lastUpdated: Date;
}

export const UpdateIndicator: React.FC<UpdateIndicatorProps> = ({ lastUpdated }) => {
  const [timeAgo, setTimeAgo] = useState('Just now');

  useEffect(() => {
    const updateTimeAgo = () => {
      const now = new Date();
      const seconds = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000);

      if (seconds < 5) {
        setTimeAgo('Just now');
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else {
        const minutes = Math.floor(seconds / 60);
        setTimeAgo(`${minutes}m ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);

    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center gap-2 text-xs" style={{ color: '#6B7280' }}>
      <div
        className="rounded-full"
        style={{
          width: '8px',
          height: '8px',
          backgroundColor: '#2A5F3E',
          animation: 'pulse-soft 2s ease-in-out infinite'
        }}
      ></div>
      <span style={{ textDecoration: 'none' }}>Updated {timeAgo}</span>
    </div>
  );
};
