import React from 'react';
import './LoadingSpinner.css';

export const LoadingSpinner = ({ size = 'medium', center = true }) => {
  return (
    <div className={`loading-spinner-container ${center ? 'center' : ''} ${size}`}>
      <div className="spinner"></div>
    </div>
  );
};