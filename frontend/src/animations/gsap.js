import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function revealWords(target) {
  if (!target) {
    return;
  }
  const words = target.querySelectorAll('[data-word]');
  gsap.fromTo(
    words,
    { y: 56, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.85, ease: 'power4.out', stagger: 0.05 }
  );
}

export function staggerCards(target) {
  if (!target) {
    return;
  }
  gsap.fromTo(
    target.querySelectorAll('[data-animate-card]'),
    { y: 40, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.7, ease: 'power4.out', stagger: 0.08 }
  );
}

export function pageCurtain(overlay) {
  if (!overlay) {
    return;
  }
  const timeline = gsap.timeline();
  timeline
    .fromTo(overlay, { xPercent: -100 }, { xPercent: 0, duration: 0.35, ease: 'power4.inOut' })
    .to(overlay, { xPercent: 100, duration: 0.35, ease: 'power4.inOut', delay: 0.05 });
}
