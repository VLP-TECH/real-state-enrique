
import React from 'react';

const BuildingGraphic: React.FC = () => {
  return (
    <div className="relative w-full h-full min-h-[400px]">
      <div className="absolute inset-0">
        <svg
          viewBox="0 0 400 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Main Building Structure */}
          <rect x="100" y="50" width="200" height="450" fill="url(#buildingGradient)" />
          
          {/* Building Details - Windows */}
          <g className="windows">
            {/* Left Side Windows */}
            {Array.from({ length: 10 }).map((_, i) => (
              <rect key={`left-${i}`} x="120" y={80 + i * 40} width="30" height="20" fill="rgba(255, 255, 255, 0.2)" />
            ))}
            
            {/* Middle Windows */}
            {Array.from({ length: 10 }).map((_, i) => (
              <rect key={`middle-${i}`} x="170" y={80 + i * 40} width="60" height="20" fill="rgba(255, 255, 255, 0.15)" />
            ))}
            
            {/* Right Side Windows */}
            {Array.from({ length: 10 }).map((_, i) => (
              <rect key={`right-${i}`} x="250" y={80 + i * 40} width="30" height="20" fill="rgba(255, 255, 255, 0.2)" />
            ))}
          </g>
          
          {/* Building Top */}
          <polygon points="100,50 300,50 270,20 130,20" fill="url(#topGradient)" />
          
          {/* Building Side Reflection */}
          <rect x="300" y="50" width="20" height="450" fill="url(#sideGradient)" />
          
          {/* Additional Decorative Elements - Antenna */}
          <line x1="200" y1="20" x2="200" y2="-10" stroke="rgba(212, 175, 55, 0.7)" strokeWidth="2" />
          <circle cx="200" cy="-10" r="3" fill="rgba(212, 175, 55, 0.9)" />
          
          {/* Gradients */}
          <defs>
            <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(42, 57, 40, 0.95)" />
              <stop offset="50%" stopColor="rgba(42, 57, 40, 0.8)" />
              <stop offset="100%" stopColor="rgba(42, 57, 40, 0.7)" />
            </linearGradient>
            
            <linearGradient id="topGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(42, 57, 40, 0.9)" />
              <stop offset="100%" stopColor="rgba(42, 57, 40, 0.7)" />
            </linearGradient>
            
            <linearGradient id="sideGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(42, 57, 40, 0.7)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>
      </div>
      
      {/* Gold Accent Lights */}
      <div className="absolute top-1/4 right-1/3 w-1 h-1 bg-estate-gold rounded-full opacity-70 animate-pulse"></div>
      <div className="absolute top-1/2 right-1/4 w-1 h-1 bg-estate-gold rounded-full opacity-70 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <div className="absolute bottom-1/3 right-1/2 w-1 h-1 bg-estate-gold rounded-full opacity-70 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
      
      {/* Overlay for better integration with background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent to-estate-navy/30 mix-blend-overlay"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-transparent to-estate-navy/20 mix-blend-overlay"></div>
    </div>
  );
};

export default BuildingGraphic;
