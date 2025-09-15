import React from 'react';

const Logo = () => {
  return (
    <div className="flex items-center space-x-2">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4F46E5" /> 
            <stop offset="100%" stopColor="#10B981" /> 
          </linearGradient>
        </defs>
        <path 
          d="M8 24V8L16 16L24 8V24H18V14L16 12L14 14V24H8Z" 
          fill="url(#logoGradient)" 
        />
        <rect x="4" y="4" width="24" height="24" rx="4" stroke="url(#logoGradient)" strokeWidth="2" />
      </svg>
      <span className="text-xl font-bold text-gray-900">InvestApp</span>
    </div>
  );
};

export default Logo;