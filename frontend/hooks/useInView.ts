// hooks/useInView.ts
import { useState, useEffect, RefObject } from 'react';

/**
 * Custom hook to detect when an element is in the viewport
 * Uses IntersectionObserver API
 * 
 * @param ref - React ref object pointing to the element to observe
 * @param options - IntersectionObserver options (optional)
 * @returns boolean indicating if the element is in view
 */

interface UseInViewOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
}

export const useInView = (
  ref: RefObject<HTMLElement>, 
  options?: UseInViewOptions
): boolean => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    // Check if we're in the browser (not SSR)
    if (typeof window === 'undefined' || !ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersecting(entry.isIntersecting);
      },
      options
    );

    const currentRef = ref.current;
    observer.observe(currentRef);

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]); // Only re-run if ref changes

  return isIntersecting;
};