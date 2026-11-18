// Project demos are short muted MP4s (much lighter than the GIFs they replaced).
// They don't download until they are about to scroll into view, and they pause off screen.

const videos = [...document.querySelectorAll('video.project-media')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (videos.length && !reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting } of entries) {
      if (isIntersecting) target.play().catch(() => {});
      else target.pause();
    }
  }, { rootMargin: '200px 0px' });
  videos.forEach(video => observer.observe(video));
}
