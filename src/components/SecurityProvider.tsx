"use client"

import React, { useEffect } from 'react';

/**
 * SecurityProvider is a client-side component that prevents common 
 * user interactions like Ctrl+A (Select All) and text selection 
 * via keyboard to protect content integrity.
 */
export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+A or Cmd+A (Select All)
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        // Only allow Ctrl+A in input fields and textareas
        const target = e.target as HTMLElement;
        const isInput = target.tagName === 'INPUT' || 
                        target.tagName === 'TEXTAREA' || 
                        target.isContentEditable;
        
        if (!isInput) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return <>{children}</>;
};