import { createRoot } from 'react-dom/client';
import ScrollFloat from './components/ScrollFloat/ScrollFloat';

// Swap each static heading for a React Bits ScrollFloat heading with the same id and text.
const headings = [
  { selector: '#projects-title', props: {} },
  { selector: '#about-title', props: { splitBy: 'words', stagger: 0.015 } }
];

headings.forEach(({ selector, props }) => {
  const heading = document.querySelector(selector);
  if (!heading) return;
  const host = document.createElement('div');
  host.className = 'scroll-float-host';
  heading.replaceWith(host);
  createRoot(host).render(
    <ScrollFloat id={heading.id} {...props}>
      {heading.textContent.trim()}
    </ScrollFloat>
  );
});
