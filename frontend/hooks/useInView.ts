import { useState, useEffect, RefObject } from 'react';

export const useInView = (ref: RefObject<HTMLElement>, options?: IntersectionObserverInit) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, options);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]); // Re-run if ref or options change

  return isIntersecting;
};