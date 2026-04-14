import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';

export default function TransitionLink({ to, children, className, onClick }) {
  const navigate = useNavigate();

  const handleTransition = (e) => {
    e.preventDefault();
    if (onClick) onClick(e);

    // Get the curtain element
    const curtain = document.getElementById('global-curtain');
    if (!curtain) {
      navigate(to);
      return;
    }

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
    <a href={to} onClick={handleTransition} className={className}>
      {children}
    </a>
  );
}
