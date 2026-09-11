"use client"

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseTypewriterOptions {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  delayBetweenWords?: number;
}

/**
 * SSR-safe typewriter: renders the first full word during SSR (LCP-friendly),
 * starts the type/delete loop only after hydration.
 */
export function useTypewriter({
  words,
  typeSpeed = 80,
  deleteSpeed = 50,
  delayBetweenWords = 2000,
}: UseTypewriterOptions) {
  const [displayText, setDisplayText] = useState(words[0] || '');
  const [hydrated, setHydrated] = useState(false);
  const stateRef = useRef({ wordIndex: 0, isDeleting: false });

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    let timeout: ReturnType<typeof setTimeout>;

    const step = () => {
      const s = stateRef.current;
      const currentWord = words[s.wordIndex] || '';

      if (!s.isDeleting) {
        if (displayText.length < currentWord.length) {
          setDisplayText(currentWord.substring(0, displayText.length + 1));
          timeout = setTimeout(step, typeSpeed);
        } else {
          timeout = setTimeout(() => { s.isDeleting = true; step(); }, delayBetweenWords);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentWord.substring(0, displayText.length - 1));
          timeout = setTimeout(step, deleteSpeed);
        } else {
          s.isDeleting = false;
          s.wordIndex = (s.wordIndex + 1) % words.length;
          timeout = setTimeout(step, typeSpeed);
        }
      }
    };

    timeout = setTimeout(step, 500); // small delay after hydration
    return () => clearTimeout(timeout);
  }, [hydrated, displayText, words, typeSpeed, deleteSpeed, delayBetweenWords]);

  return { displayText };
}
