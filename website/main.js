// Navbar scroll shadow
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu toggle
function toggleMenu() {
  document.getElementById('navLinks').classList.toggle('open');
}

// Close mobile menu on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    document.getElementById('navLinks').classList.remove('open');
  });
});

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(link => {
        link.classList.toggle(
          'active',
          link.getAttribute('href') === '#' + entry.target.id
        );
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => observer.observe(s));

// Team carousel
const track = document.getElementById('teamTrack');
const dotsContainer = document.getElementById('teamDots');
const cards = track.querySelectorAll('.team-card');
const total = cards.length;
let current = 0;

function getVisible() {
  return window.innerWidth >= 900 ? 3 : 1;
}

function buildDots() {
  dotsContainer.innerHTML = '';
  const pages = Math.ceil(total / getVisible());
  for (let i = 0; i < pages; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => goTo(i));
    dotsContainer.appendChild(dot);
  }
}

function goTo(index) {
  const pages = Math.ceil(total / getVisible());
  current = Math.max(0, Math.min(index, pages - 1));
  const cardWidth = cards[0].offsetWidth + 20;
  track.style.transform = `translateX(-${current * getVisible() * cardWidth}px)`;
  document.querySelectorAll('.carousel-dot').forEach((d, i) => {
    d.classList.toggle('active', i === current);
  });
}

buildDots();
window.addEventListener('resize', () => { buildDots(); goTo(0); });
