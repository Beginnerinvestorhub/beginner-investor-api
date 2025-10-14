import React from 'react';

interface AnimatedGridProps {
  className?: string;
}

const AnimatedGrid: React.FC<AnimatedGridProps> = ({ className = '' }) => (
  <div
    className={`absolute inset-0 opacity-5 pointer-events-none ${className}`}
    style={{
      backgroundImage: `
        repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(59, 130, 246, 0.1) 50px, rgba(59, 130, 246, 0.1) 51px),
        repeating-linear-gradient(0deg, transparent, transparent 50px, rgba(59, 130, 246, 0.1) 50px, rgba(59, 130, 246, 0.1) 51px)
      `,
      backgroundSize: '100px 100px'
    }}
  />
);

export default AnimatedGrid;
