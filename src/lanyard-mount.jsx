import { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Lanyard from './components/Lanyard/Lanyard';
import cardImage from '../assets/ab-card.png';

// Card height on desktop, in pixels, capped to a share of the hero height.
const CARD_HEIGHT = 460;
const MAX_CARD_SHARE = 0.6;
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const app = document.getElementById('app');
const slot = document.getElementById('lanyard');
const copy = document.querySelector('#text3d .home-copy');
const description = document.getElementById('description');
const desktop = window.matchMedia('(min-width: 901px)');

// Desktop: the canvas covers the whole hero so the card can be thrown across it
// without clipping. The strap hangs over the #lanyard slot and the card face is
// centred on the hero text. Mobile: the canvas just fills the slot.
const measure = () => {
  const appRect = app.getBoundingClientRect();
  const slotRect = slot.getBoundingClientRect();

  if (!desktop.matches) {
    return {
      box: {
        left: slotRect.left - appRect.left,
        top: slotRect.top - appRect.top,
        width: slotRect.width,
        height: slotRect.height
      },
      anchor: 0.5,
      size: 0.6,
      strapLength: 0.5
    };
  }

  const height = appRect.height;
  const size = clamp(Math.min(CARD_HEIGHT, height * MAX_CARD_SHARE) / height, 0.15, 0.9);
  // Looked up each time: the hero <h1> is swapped out by the SplitText mount.
  const heading = document.querySelector('#text3d h1');
  const textTop = (heading || copy).getBoundingClientRect().top;
  const textBottom = description.getBoundingClientRect().bottom;
  const targetCenter = ((textTop + textBottom) / 2 - appRect.top) / height;
  // Card top sits at mix(0.12, 0.42, strapLength) of the view height.
  const strapLength = clamp((targetCenter - size / 2 - 0.12) / 0.3, 0, 1);

  // Span the full window width so the card isn't clipped at the page margins.
  const width = document.documentElement.clientWidth;
  return {
    box: { left: -appRect.left, top: 0, width, height },
    anchor: (slotRect.left + slotRect.width / 2) / width,
    size,
    strapLength
  };
};

const sameFrame = (a, b) =>
  a && b &&
  ['left', 'top', 'width', 'height'].every(key => Math.abs(a.box[key] - b.box[key]) < 0.5) &&
  ['anchor', 'size', 'strapLength'].every(key => Math.abs(a[key] - b[key]) < 0.001);

const Stage = () => {
  const [frame, setFrame] = useState(measure);

  useEffect(() => {
    const update = () => setFrame(previous => {
      const next = measure();
      return sameFrame(previous, next) ? previous : next;
    });
    const observer = new ResizeObserver(update);
    [app, slot, copy].forEach(element => observer.observe(element));
    desktop.addEventListener('change', update);
    window.addEventListener('resize', update);
    document.fonts?.ready.then(update);
    return () => {
      observer.disconnect();
      desktop.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="lanyard-stage" style={frame.box}>
      <Lanyard
        frontImage={cardImage}
        backImage={cardImage}
        imageFit="contain"
        cardColor="#f6f6f6"
        strapColor="#111111"
        anchor={frame.anchor}
        size={frame.size}
        strapLength={frame.strapLength}
      />
    </div>
  );
};

if (app && slot && copy && description) {
  const stage = document.createElement('div');
  stage.className = 'lanyard-layer';
  app.append(stage);
  createRoot(stage).render(<Stage />);
}
