import { useNavigate } from 'react-router-dom';
import { curtainTransition } from '../lib/curtain';

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

    curtainTransition(() => navigate(to));
  };

  return (
    <a href={to} onClick={handleTransition} className={className} target={target} rel={rel} {...props}>
      {children}
    </a>
  );
}
