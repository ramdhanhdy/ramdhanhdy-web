import gsap from 'gsap';

// Shared curtain-wipe transition. The route swap happens while the viewport
// is fully covered, which also masks lazy route-chunk loading.
export function curtainTransition(onCovered) {
  const curtain = document.getElementById('global-curtain');
  if (!curtain) {
    onCovered();
    return;
  }

  gsap.killTweensOf(curtain);

  gsap.fromTo(
    curtain,
    { yPercent: 100 },
    {
      yPercent: 0,
      duration: 0.6,
      ease: 'power3.inOut',
      onComplete: () => {
        onCovered();

        gsap.to(curtain, {
          yPercent: -100,
          duration: 0.6,
          ease: 'power3.inOut',
          delay: 0.1, // Brief pause to allow React to render the new page
        });
      },
    }
  );
}
