
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = "", size = "md" }) => {
  const sizes = {
    sm: "h-6 w-auto",
    md: "h-10 w-auto",
    lg: "h-16 w-auto"
  };
  
  return (
    <div className={`${sizes[size]} ${className} flex-shrink-0`}>
      <img 
        src="/lovable-uploads/c0d02d3c-dbea-49cd-b5a9-65616bf81b4e.png" 
        alt="HW Logo" 
        className="h-full w-auto"
      />
    </div>
  );
};

export default Logo;
