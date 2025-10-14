import React from 'react';

interface DecorativeGearProps {
  size?: string;
  position?: string;
  animation?: string;
  className?: string;
}

const DecorativeGear: React.FC<DecorativeGearProps> = ({
  size = 'w-16 h-16',
  position = '',
  animation = '',
  className = ''
}) => {
  return (
    <div
      className={`absolute ${size} ${position} ${animation} ${className}`}
      style={{
        background: `conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.1) 45deg, transparent 90deg, rgba(59, 130, 246, 0.1) 135deg, transparent 180deg, rgba(59, 130, 246, 0.1) 225deg, transparent 270deg, rgba(59, 130, 246, 0.1) 315deg, transparent 360deg)`,
        borderRadius: '50%',
        border: '2px solid rgba(59, 130, 246, 0.2)'
      }}
    />
  );
};

export default DecorativeGear;
