import React from 'react';

export const TikTokIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    {/* Cyan chromatic layer */}
    <path
      d="M19.32 5.56a5.12 5.12 0 0 1-3.58-3.58h-2.91v12.27a2.91 2.91 0 1 1-2.91-2.91c.33 0 .64.06.94.16V8.48a5.82 5.82 0 1 0 4.88 5.74V8.13a8.03 8.03 0 0 0 3.58 1.01V5.56z"
      fill="#25F4EE"
      transform="translate(-0.8, -0.6)"
    />
    {/* Magenta / Pink chromatic layer */}
    <path
      d="M19.32 5.56a5.12 5.12 0 0 1-3.58-3.58h-2.91v12.27a2.91 2.91 0 1 1-2.91-2.91c.33 0 .64.06.94.16V8.48a5.82 5.82 0 1 0 4.88 5.74V8.13a8.03 8.03 0 0 0 3.58 1.01V5.56z"
      fill="#FE2C55"
      transform="translate(0.8, 0.6)"
    />
    {/* White foreground musical note */}
    <path
      d="M19.32 5.56a5.12 5.12 0 0 1-3.58-3.58h-2.91v12.27a2.91 2.91 0 1 1-2.91-2.91c.33 0 .64.06.94.16V8.48a5.82 5.82 0 1 0 4.88 5.74V8.13a8.03 8.03 0 0 0 3.58 1.01V5.56z"
      fill="#FFFFFF"
    />
  </svg>
);
