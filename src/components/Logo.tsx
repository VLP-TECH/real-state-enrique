
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const sizes = {
    sm: "h-8 w-auto",
    md: "h-12 w-auto",
    lg: "h-20 w-auto"
  };
  
  return (
    <div className={`${sizes[size]} ${className}`}>
      <img 
        src="/lovable-uploads/c0d02d3c-dbea-49cd-b5a9-65616bf81b4e.png" 
        alt="HW Logo" 
        className="h-full w-auto"
      />
    </div>
  );
};

export default Logo;
