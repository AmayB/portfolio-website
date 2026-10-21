// Scroll-driven tilt for the project cards, in the spirit of React Bits' Flying Posters:
// a card is flat while it sits in the middle of the screen, and tips back in 3D as it
// scrolls toward the top or bottom edge.

const FLAT_ZONE = 0.3; // share of the distance to the screen edge where the card stays flat
const MAX_TILT = 45; // degrees the card tips back at the screen edge
const MAX_TURN = 8; // slight poster-like turn as it flies past, in degrees

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const smoothstep = (from, to, value) => {
  const t = clamp((value - from) / (to - from), 0, 1);
  return t * t * (3 - 2 * t);
};

const init = () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cards = [...document.querySelectorAll('.project-card')];
  if (!cards.length) return;

  // Tilt a wrapper so the card's own hover lift keeps working.
  const wrappers = cards.map(card => {
    const wrapper = document.createElement('div');
    wrapper.className = 'tilt-card';
    card.replaceWith(wrapper);
    wrapper.append(card);
    return wrapper;
  });

  const update = () => {
    const viewHeight = window.innerHeight;
    for (const wrapper of wrappers) {
      const rect = wrapper.getBoundingClientRect();
      const reach = viewHeight / 2 + rect.height / 2;
      const offset = clamp((rect.top + rect.height / 2 - viewHeight / 2) / reach, -1, 1); // -1 above .. 1 below
      const amount = smoothstep(FLAT_ZONE, 1, Math.abs(offset));
      if (amount < 0.001) {
        wrapper.style.transform = '';
        continue;
      }
      const sign = Math.sign(offset);
      // Below centre the top edge leans away; above centre the bottom edge does.
      wrapper.style.transform =
        `perspective(1600px) rotateX(${sign * amount * MAX_TILT}deg) ` +
        `rotateY(${sign * amount * MAX_TURN}deg) scale(${1 - amount * 0.08})`;
    }
  };

  let frame = 0;
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0;
      update();
    });
  };
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();
};

init();
