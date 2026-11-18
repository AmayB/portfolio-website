import { createRoot } from 'react-dom/client';
import SplitText from './components/SplitText/SplitText';

// Replace the static hero name with a React Bits SplitText <h1> that animates in on load.
const heading = document.querySelector('#name3d h1');

if (heading) {
  const host = document.createElement('div');
  host.className = 'split-name-host';
  heading.replaceWith(host);
  createRoot(host).render(
    <SplitText
      text={heading.textContent.trim()}
      tag="h1"
      trigger="load"
      delay={45}
      duration={1.1}
      hoverEffect="lift"
    />
  );
}
