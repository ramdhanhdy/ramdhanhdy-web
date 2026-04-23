import React from 'react';
import TransitionLink from './TransitionLink';

export default function HeaderHomeButton() {
  return (
    <div className="pointer-events-auto mix-blend-difference mr-2">
      <TransitionLink
        to="/?view=index"
        className="group relative flex items-center justify-center w-10 h-10 outline-none cursor-pointer"
        aria-label="Home"
      >
        <svg
          viewBox="0 0 100 100"
          className="w-7 h-7 fill-white group-hover:fill-neon transition-colors duration-300"
        >
          {/* Elegant 4-pointed star characteristic of premium Awwwards sites */}
          <path d="M50,0 C50,25 25,50 0,50 C25,50 50,75 50,100 C50,75 75,50 100,50 C75,50 50,25 50,0 Z" />
        </svg>
      </TransitionLink>
    </div>
  );
}
