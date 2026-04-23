import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

export default function TransitionLink({ to, children, className, onClick, target, rel, ...props }) {
  const navigate = useNavigate();

  const handleTransition = (e) => {
    if (onClick) onClick(e);

    // Preserve default browser behavior for modified and non-primary clicks.
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.altKey ||
      e.ctrlKey ||
      e.shiftKey ||
      target === '_blank'
    ) {
      return;
    }

    e.preventDefault();

    // Get the curtain element
    const curtain = document.getElementById('global-curtain');
    if (!curtain) {
      navigate(to);
      return;
    }

    gsap.killTweensOf(curtain);

    // Animate curtain up from bottom
    gsap.fromTo(
      curtain,
      { yPercent: 100 },
      {
        yPercent: 0,
        duration: 0.6,
        ease: 'power3.inOut',
        onComplete: () => {
          // Change route
          navigate(to);
          
          // Animate curtain up and away
          gsap.to(curtain, {
            yPercent: -100,
            duration: 0.6,
            ease: 'power3.inOut',
            delay: 0.1 // Brief pause to allow React to render the new page
          });
        }
      }
    );
  };

  return (
    <a href={to} onClick={handleTransition} className={className} target={target} rel={rel} {...props}>
      {children}
    </a>
  );
}
