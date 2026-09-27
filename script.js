const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  nav.classList.toggle('open', !open);
  document.body.classList.toggle('menu-open', !open);
});

document.querySelectorAll('.nav a').forEach((link) => link.addEventListener('click', () => {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
}));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

const sections = document.querySelectorAll('main section[id], header[id]');
const navLinks = document.querySelectorAll('.nav a');
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55% 0px' });
sections.forEach((section) => sectionObserver.observe(section));

document.getElementById('contact-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button[type="submit"]');
  const buttonText = button.querySelector('span');
  const status = form.querySelector('.form-status');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  button.disabled = true;
  buttonText.textContent = 'Sending…';
  status.className = 'form-status';
  status.textContent = 'Sending your enquiry securely…';

  try {
    const response = await fetch('https://formsubmit.co/ajax/wellnessesolution@gmail.com', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
      signal: controller.signal
    });
    const result = await response.json();
    if (!response.ok || result.success === false) throw new Error(result.message || 'Submission failed');

    const activationPending = /activat|confirm/i.test(result.message || '');
    form.reset();
    status.className = 'form-status success';
    status.textContent = activationPending
      ? 'Submission received. Please activate the form from the email sent to our inbox.'
      : 'Thank you! Your enquiry has been sent successfully.';
  } catch (error) {
    status.className = 'form-status error';
    status.textContent = error.name === 'AbortError'
      ? 'The request timed out. Please check your connection and try again.'
      : 'We could not send your enquiry. Please try again or contact us by phone.';
  } finally {
    clearTimeout(timeout);
    button.disabled = false;
    buttonText.textContent = 'Send enquiry';
  }
});

document.getElementById('year').textContent = new Date().getFullYear();
