const app = document.getElementById('app');
const name3d = document.getElementById('name3d');
const heading = name3d.querySelector('h1');
const constrain = 50;
const mainNameText = heading.textContent;
const routeLinks = document.querySelectorAll('a[href="#app"], a[href="#projects"], a[href="#about"]');
const headerName = document.getElementById('header-name');
const scrollbar = document.querySelector('.custom-scrollbar');
const scrollbarThumb = document.querySelector('.custom-scrollbar-thumb');
heading.textContent = mainNameText;

routeLinks.forEach((link) => {
	link.addEventListener('click', (event) => {
		event.preventDefault();
		const target = document.querySelector(link.getAttribute('href'));

		if (!target) return;

		target.scrollIntoView({ behavior: 'smooth', block: 'start' });
	});
});

const updateScrollbar = () => {
	if (!scrollbar || !scrollbarThumb) return;

	const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
	const trackHeight = scrollbar.clientHeight;
	const thumbHeight = Math.max((window.innerHeight / document.documentElement.scrollHeight) * trackHeight, 42);
	const thumbTravel = trackHeight - thumbHeight;

	scrollbarThumb.style.height = `${thumbHeight}px`;
	scrollbarThumb.style.transform = `translateY(${scrollRange ? (window.scrollY / scrollRange) * thumbTravel : 0}px)`;
	scrollbar.hidden = scrollRange <= 0;
};

const scrollFromPointer = (clientY) => {
	const bounds = scrollbar.getBoundingClientRect();
	const thumbHeight = scrollbarThumb.offsetHeight;
	const thumbTravel = bounds.height - thumbHeight;
	const progress = Math.min(Math.max((clientY - bounds.top - thumbHeight / 2) / thumbTravel, 0), 1);
	const scrollRange = document.documentElement.scrollHeight - window.innerHeight;

	window.scrollTo({ top: progress * scrollRange, behavior: 'auto' });
};

scrollbar?.addEventListener('pointerdown', (event) => {
	event.preventDefault();
	scrollbar.setPointerCapture(event.pointerId);
	scrollFromPointer(event.clientY);
});

scrollbar?.addEventListener('pointermove', (event) => {
	if (scrollbar.hasPointerCapture(event.pointerId)) scrollFromPointer(event.clientY);
});

window.addEventListener('scroll', updateScrollbar, { passive: true });
window.addEventListener('resize', updateScrollbar);
updateScrollbar();

const moveHeroText = (event) => {
	const { clientX, clientY } = event;
	const { x, y, width, height } = name3d.getBoundingClientRect();

	const rotateX = -(clientY - y - height / 2) / constrain;
	const rotateY = (clientX - x - width / 2) / (constrain * width / height);
	const translateX = (2 * x + width - clientX) / (constrain * width / height);
	const translateY = (2 * y + height - clientY) / constrain;
	const rotateZ = (clientX - window.innerWidth / 2) / (constrain * width / height);

	name3d.style.transform = `perspective(400px) translate3d(${translateX}px, ${translateY}px, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
	heading.style.transform = `rotateZ(${rotateZ}deg)`;
};

