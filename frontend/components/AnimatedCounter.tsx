import React, { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  target: number;
  duration?: number; // Duration in milliseconds
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ target, duration = 2000 }) => {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let startTime: number;
    let frameId: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(1, elapsed / duration);
      const value = Math.floor(progress * target);

      setCurrentValue(value);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        // Ensure the final value is exactly the target
        setCurrentValue(target);
      }
    };

    // Start the animation
    frameId = requestAnimationFrame(animate);

    // Cleanup function
    return () => cancelAnimationFrame(frameId);
  }, [target, duration]);

  // Format the number with commas (e.g., 12,847)
  return <span>{currentValue.toLocaleString()}</span>;
};

export default AnimatedCounter;