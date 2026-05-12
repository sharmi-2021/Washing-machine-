// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 60);
});

// ===== MOBILE NAV =====
const hamburger = document.getElementById('hamburger');
const mobileNav = document.getElementById('mobileNav');
const overlayBg = document.getElementById('overlayBg');
const mobileNavClose = document.getElementById('mobileNavClose');

function openMobileNav() { mobileNav?.classList.add('open'); overlayBg?.classList.add('show'); document.body.style.overflow = 'hidden'; }
function closeMobileNav() { mobileNav?.classList.remove('open'); overlayBg?.classList.remove('show'); document.body.style.overflow = ''; }
hamburger?.addEventListener('click', openMobileNav);
mobileNavClose?.addEventListener('click', closeMobileNav);
overlayBg?.addEventListener('click', closeMobileNav);
document.querySelectorAll('.mobile-nav a').forEach(a => a.addEventListener('click', closeMobileNav));

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
function animateCounter(el, target, suffix = '') {
  let current = 0;
  const step = target / 60;
  const timer = setInterval(() => {
    current += step;
    if (current >= target) { current = target; clearInterval(timer); }
    el.textContent = Math.floor(current).toLocaleString() + suffix;
  }, 25);
}
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const el = e.target;
      animateCounter(el, parseInt(el.dataset.target, 10), el.dataset.suffix || '');
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });
document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// ===== TESTIMONIALS CAROUSEL =====
let tIndex = 0;
const track = document.getElementById('testimonialsTrack');
const cards = document.querySelectorAll('.testimonial-card');
const visibleCards = () => window.innerWidth < 768 ? 1 : window.innerWidth < 1024 ? 2 : 3;

function slideTo(i) {
  if (!track || !cards.length) return;
  const cardW = cards[0].offsetWidth + 24;
  const max = Math.max(0, cards.length - visibleCards());
  tIndex = Math.max(0, Math.min(i, max));
  track.style.transform = `translateX(-${tIndex * cardW}px)`;
}
document.getElementById('tPrev')?.addEventListener('click', () => slideTo(tIndex - 1));
document.getElementById('tNext')?.addEventListener('click', () => slideTo(tIndex + 1));
setInterval(() => { const max = Math.max(0, cards.length - visibleCards()); slideTo(tIndex >= max ? 0 : tIndex + 1); }, 4500);
window.addEventListener('resize', () => slideTo(0));

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ===== FLOATING PARTICLES =====
function createParticles() {
  const hero = document.querySelector('.hero-bg-circles');
  if (!hero) return;
  for (let i = 0; i < 10; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 6 + 2;
    p.style.cssText = `width:${size}px;height:${size}px;left:${Math.random()*100}%;background:rgba(0,201,167,${Math.random()*0.4+0.1});animation-duration:${Math.random()*10+8}s;animation-delay:${Math.random()*8}s;`;
    hero.appendChild(p);
  }
}
createParticles();
