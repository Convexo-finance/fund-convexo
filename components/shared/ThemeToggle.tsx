import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button 
      onClick={toggleTheme} 
      className="theme-toggle" 
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="toggle-track">
        <div className={`toggle-thumb ${theme === 'dark' ? 'active' : ''}`}>
          <span className="toggle-icon">
            {theme === 'light' ? '🔆' : '🌙'}
          </span>
        </div>
      </div>
      
      <style jsx>{`
        .theme-toggle {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          width: 60px;
          height: 30px;
        }
        
        .toggle-track {
          position: relative;
          width: 52px;
          height: 26px;
          background: ${theme === 'light' ? '#4B66F3' : '#6B86FF'};
          border-radius: 30px;
          padding: 3px;
          transition: all 0.3s ease;
          box-shadow: 0 0 10px rgba(75, 102, 243, 0.3), 
                      inset 0 0 5px rgba(0, 0, 0, 0.2);
          border: 1px solid ${theme === 'light' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'};
          overflow: hidden;
        }
        
        .toggle-track:before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 30px;
          z-index: 1;
          background: ${theme === 'light' 
            ? 'linear-gradient(to right, rgba(255,255,255,0.2), rgba(255,255,255,0))' 
            : 'linear-gradient(to right, rgba(0,0,0,0.2), rgba(0,0,0,0))'};
        }
        
        .toggle-thumb {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 20px;
          height: 20px;
          background: #ffffff;
          border-radius: 50%;
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          transform: translateX(0);
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          z-index: 2;
        }
        
        .toggle-thumb.active {
          transform: translateX(26px);
          background: #121212;
        }
        
        .toggle-icon {
          font-size: 12px;
          line-height: 1;
          transition: opacity 0.3s ease;
        }
      `}</style>
    </button>
  );
};

export default ThemeToggle; 