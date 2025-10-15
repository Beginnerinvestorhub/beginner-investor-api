import '../styles/globals.css'
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

const HomePage = () => {  const CounterAnimation = () => {
    const [current, setCurrent] = useState(0);
    const [target, setTarget] = useState(0);

    useEffect(() => {
      const counter = document.querySelector('.stat-number[data-target]');
      if (counter) {
        setTarget(parseInt(counter.getAttribute('data-target') || 0));
      }
    }, []);

    useEffect(() => {
      const duration = 2000;
      const step = target / (duration / 16);
      let animationId: number | null = null;

      const updateCounter = () => {
        setCurrent(current => current + step);
        if (current < target) {
          animationId = requestAnimationFrame(updateCounter);
        }
      };

      if (target > 0) {
        updateCounter();
      }

      return () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      };
    }, [current, target]);

    return (
      <span className="stat-number" data-target={target}>
        {current.toLocaleString()}
      </span>
    );
  };