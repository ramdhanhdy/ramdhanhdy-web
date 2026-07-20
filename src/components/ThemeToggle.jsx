import { Moon, Sun } from 'lucide-react';
import { setThemeWithTransition, useTheme } from '../lib/theme';

export default function ThemeToggle() {
  const theme = useTheme();
  const isLight = theme === 'light';

  const handleClick = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setThemeWithTransition(isLight ? 'dark' : 'light', {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
      className="pointer-events-auto relative grid h-8 w-8 sm:h-10 sm:w-10 place-items-center rounded-full border border-zinc-800 text-white transition-colors duration-300 hover:border-neon hover:bg-neon hover:text-black motion-safe:active:scale-90 light:glass light:border-[rgba(28,27,23,0.08)] light:text-zinc-400"
    >
      <Sun
        aria-hidden="true"
        className={`theme-toggle-icon col-start-1 row-start-1 h-4 w-4 sm:h-[18px] sm:w-[18px] transition-all duration-500 ease-out ${
          isLight ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0'
        }`}
      />
      <Moon
        aria-hidden="true"
        className={`theme-toggle-icon col-start-1 row-start-1 h-4 w-4 sm:h-[18px] sm:w-[18px] transition-all duration-500 ease-out ${
          isLight ? '-rotate-90 scale-50 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
    </button>
  );
}
