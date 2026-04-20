
"use client"

import { useEffect, useRef } from 'react';
import { motion, useInView, useAnimation } from 'framer-motion';

interface AnimateOnScrollProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const AnimateOnScroll = ({ 
  children, 
  delay = 0.2,
  duration = 0.5,
  className
}: AnimateOnScrollProps) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true }); // `once: true` ensures the animation only runs once
  const mainControls = useAnimation();

  useEffect(() => {
    if (isInView) {
      mainControls.start("visible");
    }
  }, [isInView, mainControls]);

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={{
        hidden: { opacity: 0, y: 50 }, // Start 50px below and transparent
        visible: { opacity: 1, y: 0 },    // End at original position and fully visible
      }}
      initial="hidden"
      animate={mainControls}
      transition={{ duration, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};
