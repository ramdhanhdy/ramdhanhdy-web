import { useSyncExternalStore } from 'react';

// Theme is a DOM concern, not React state: the source of truth is
// data-theme on <html>, set pre-paint by the inline script in index.html.
// React components subscribe via useTheme() only to re-derive values that
// CSS variables can't reach (e.g. GSAP tween targets).
const STORAGE_KEY = 'theme';
const META_THEME_COLOR = { dark: '#000000', light: '#F5F4F0' };

const listeners = new Set();
const notify = () => listeners.forEach((listener) => listener());

export function getTheme() {
  return document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
}

export function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Private browsing etc. — theme still applies for the session.
  }
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', META_THEME_COLOR[theme]);
  notify();
}

export function useTheme() {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    getTheme
  );
}

// Circular reveal from the toggle, falling back to a soft crossfade where
// View Transitions are unsupported, and to an instant swap under reduced
// motion. The reveal rides the ::view-transition-new(root) snapshot, so the
// old theme stays put underneath while the new one grows over it.
export function setThemeWithTransition(nextTheme, origin) {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduceMotion) {
    applyTheme(nextTheme);
    return;
  }

  if (!document.startViewTransition || !origin) {
    const root = document.documentElement;
    root.classList.add('theme-fade');
    applyTheme(nextTheme);
    window.setTimeout(() => root.classList.remove('theme-fade'), 500);
    return;
  }

  const transition = document.startViewTransition(() => applyTheme(nextTheme));
  transition.ready
    .then(() => {
      const { x, y } = origin;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${radius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration: 650,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    })
    .catch(() => {
      // The DOM update already landed; a skipped reveal is cosmetic only.
    });
}
