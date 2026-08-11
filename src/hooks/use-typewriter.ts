"use client"

import { useState, useEffect, useCallback } from 'react';

interface UseTypewriterOptions {
  words: string[];
  typeSpeed?: number;
  deleteSpeed?: number;
  delayBetweenWords?: number;
}

export function useTypewriter({
  words,
  typeSpeed = 80,
  deleteSpeed = 50,
  delayBetweenWords = 2000,
}: UseTypewriterOptions) {
  const [displayText, setDisplayText] = useState('');
  const [wordIndex, setWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const tick = useCallback(() => {
    const currentWord = words[wordIndex] || '';

    if (isDeleting) {
      setDisplayText(prev => currentWord.substring(0, prev.length - 1));
    } else {
      setDisplayText(prev => currentWord.substring(0, prev.length + 1));
    }
  }, [wordIndex, isDeleting, words]);

  useEffect(() => {
    const currentWord = words[wordIndex] || '';

    let timeout: NodeJS.Timeout;

    if (!isDeleting && displayText === currentWord) {
      // Finished typing — pause then start deleting
      timeout = setTimeout(() => setIsDeleting(true), delayBetweenWords);
    } else if (isDeleting && displayText === '') {
      // Finished deleting — move to next word
      setIsDeleting(false);
      setWordIndex(prev => (prev + 1) % words.length);
    } else {
      timeout = setTimeout(tick, isDeleting ? deleteSpeed : typeSpeed);
    }

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, wordIndex, words, tick, typeSpeed, deleteSpeed, delayBetweenWords]);

  return { displayText, isDeleting };
}
