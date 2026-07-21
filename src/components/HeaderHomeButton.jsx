import React from 'react';
import TransitionLink from './TransitionLink';

export default function HeaderHomeButton() {
  return (
    <div className="pointer-events-auto shrink-0">
      <TransitionLink
        to="/?view=index"
        className="group relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 outline-none cursor-pointer rounded-full light:glass light:border light:border-[rgba(28,27,23,0.08)]"
        aria-label="Home"
      >
        <svg
          viewBox="0 0 200 200"
          className="w-6 h-6 sm:w-7 sm:h-7 stroke-white group-hover:stroke-neon transition-colors duration-300"
        >
          {/* Hexagon frame + geometric r — personal mark */}
          <path
            d="M100,12 L176,56 L176,144 L100,188 L24,144 L24,56 Z"
            fill="none"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <path
            d="M74,141 L74,80 Q74,56 97,56 Q121,56 121,81 Q121,105 97,105 L74,105 L121,141"
            fill="none"
            strokeWidth="14"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </TransitionLink>
    </div>
  );
}
