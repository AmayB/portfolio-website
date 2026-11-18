import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import SplitText from './components/SplitText/SplitText';

// Replace the static hero name with a React Bits SplitText <h1> that animates in on load.
const heading = document.querySelector('#name3d h1');

if (heading) {
  const host = document.createElement('div');
  host.className = 'split-name-host';
  const root = createRoot(host);
  // Render synchronously into a detached host, then swap it in, so the hero never
  // has a frame without its <h1> (which made the description below jump).
  flushSync(() => {
    root.render(
      <SplitText
        text={heading.textContent.trim()}
        tag="h1"
        trigger="load"
        delay={45}
        duration={1.1}
        hoverEffect="lift"
      />
    );
  });
  heading.replaceWith(host);
}
