/**
 * Slide animation utilities for menu animations
 */

export function slideUp(target: HTMLElement | null, duration = 300): void {
  if (!target) return;
  
  target.style.transitionProperty = 'height, margin, padding';
  target.style.transitionDuration = duration + 'ms';
  target.style.boxSizing = 'border-box';
  target.style.height = target.offsetHeight + 'px';
  target.offsetHeight; // Force reflow
  target.style.overflow = 'hidden';
  target.style.height = '0';
  target.style.paddingTop = '0';
  target.style.paddingBottom = '0';
  target.style.marginTop = '0';
  target.style.marginBottom = '0';
  
  window.setTimeout(() => {
    target.style.display = 'none';
    target.style.removeProperty('height');
    target.style.removeProperty('padding-top');
    target.style.removeProperty('padding-bottom');
    target.style.removeProperty('margin-top');
    target.style.removeProperty('margin-bottom');
    target.style.removeProperty('overflow');
    target.style.removeProperty('transition-duration');
    target.style.removeProperty('transition-property');
  }, duration);
}

export function slideDown(target: HTMLElement | null, duration = 300): void {
  if (!target) return;
  
  target.style.removeProperty('display');
  let display = window.getComputedStyle(target).display;
  if (display === 'none') display = 'block';
  target.style.display = display;
  const height = target.offsetHeight;
  target.style.overflow = 'hidden';
  target.style.height = '0';
  target.style.paddingTop = '0';
  target.style.paddingBottom = '0';
  target.style.marginTop = '0';
  target.style.marginBottom = '0';
  target.offsetHeight; // Force reflow
  target.style.boxSizing = 'border-box';
  target.style.transitionProperty = 'height, margin, padding';
  target.style.transitionDuration = duration + 'ms';
  target.style.height = height + 'px';
  target.style.removeProperty('padding-top');
  target.style.removeProperty('padding-bottom');
  target.style.removeProperty('margin-top');
  target.style.removeProperty('margin-bottom');
  
  window.setTimeout(() => {
    target.style.removeProperty('height');
    target.style.removeProperty('overflow');
    target.style.removeProperty('transition-duration');
    target.style.removeProperty('transition-property');
  }, duration);
}

export function slideToggle(target: HTMLElement | null, duration = 300): void {
  if (!target) return;
  
  if (window.getComputedStyle(target).display === 'none') {
    slideDown(target, duration);
  } else {
    slideUp(target, duration);
  }
}
