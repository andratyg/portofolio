"use client";

import React, { ReactNode } from "react";
import { m as motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export const ScrollReveal = ({
  children,
  className,
  delay = 0,
  direction = "up",
  ...props
}: ScrollRevealProps) => {
  const directions = {
    up: { y: 40, x: 0 },
    down: { y: -40, x: 0 },
    left: { x: 40, y: 0 },
    right: { x: -40, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay, type: "spring", bounce: 0.2 }}
      className={cn(className)}
      {...props}
    >
      {children}
    </motion.div>
  );
};
