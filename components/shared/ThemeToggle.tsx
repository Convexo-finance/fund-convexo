import React from 'react';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <button 
      onClick={toggleTheme} 
      className="bg-transparent border-0 cursor-pointer p-0 flex items-center justify-center relative w-[60px] h-[30px]" 
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div className={`
        relative w-[52px] h-[26px] rounded-full p-[3px] transition-all duration-300 overflow-hidden
        ${isDark ? 'bg-blue-500/80 border-black/20' : 'bg-blue-600 border-white/20'}
        shadow-lg shadow-blue-500/30 border
      `}>
        <div className={`
          absolute inset-0 rounded-full z-10
          ${isDark 
            ? 'bg-gradient-to-r from-black/20 to-transparent' 
            : 'bg-gradient-to-r from-white/20 to-transparent'}
        `}></div>
        
        <div className={`
          relative flex items-center justify-center w-[20px] h-[20px] rounded-full 
          transition-transform duration-300 ease-out z-20
          ${isDark 
            ? 'bg-gray-900 translate-x-[26px]' 
            : 'bg-white translate-x-0'}
          shadow-md
        `}>
          <span className="text-xs leading-none transition-opacity duration-300">
            {isDark ? '🌙' : '🔆'}
          </span>
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle; 