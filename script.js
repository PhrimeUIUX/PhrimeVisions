const experience = document.querySelector('#experience');
const startGate = document.querySelector('#start-gate');
const preloader = document.querySelector('#preloader');
const startButton = document.querySelector('#start-btn');
const exploreButton = document.querySelector('#explore-btn');
const sceneShell = document.querySelector('#hero-scene-shell');
const heroVideo = document.querySelector('#hero-video');
const flash = document.querySelector('#flash');
const progress = document.querySelector('#progress');
const cursor = document.querySelector('#cursor');
const grain = document.querySelector('#grain');
const ambientAudio = document.querySelector('#ambient-audio');
const impactAudio = document.querySelector('#impact-audio');
let started = false;
let wheelLocked = false;

function pulse() {
  impactAudio.currentTime = 0;
  impactAudio.play().catch(() => {});
}

function reveal() {
  document.querySelectorAll('[data-reveal]').forEach((element, index) => {
    window.setTimeout(() => element.classList.add('show'), 90 + index * 90);
  });
}

function startExperience() {
  if (started) return;
  started = true;
  startGate.remove();
  preloader.hidden = false;
  ambientAudio.volume = 0.24;
  ambientAudio.play().catch(() => {});
  heroVideo.play().catch(() => {});
  window.setTimeout(() => {
    preloader.remove();
    sceneShell.classList.remove('is-inactive');
    sceneShell.classList.add('is-active');
    flash.classList.add('show');
    pulse();
    window.setTimeout(() => flash.classList.remove('show'), 160);
    reveal();
  }, 3600);
}

startButton.addEventListener('click', startExperience);
exploreButton.addEventListener('click', () => experience.scrollTo({ top: 0, behavior: 'smooth' }));

window.addEventListener('wheel', (event) => {
  if (!started || preloader.isConnected || wheelLocked) return;
  event.preventDefault();
  wheelLocked = true;
  experience.scrollTo({ top: 0, behavior: 'smooth' });
  window.setTimeout(() => { wheelLocked = false; }, 620);
}, { passive: false });

window.addEventListener('keydown', (event) => {
  if (!started || preloader.isConnected) return;
  if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(event.key)) {
    event.preventDefault();
    experience.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

experience.addEventListener('scroll', () => {
  const max = experience.scrollHeight - experience.clientHeight;
  progress.style.width = `${max > 0 ? (experience.scrollTop / max) * 100 : 0}%`;
});

window.addEventListener('mousemove', (event) => {
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
});

document.addEventListener('pointerover', (event) => {
  if (event.target.closest('button, a, [role="button"]')) cursor.classList.add('active');
});
document.addEventListener('pointerout', (event) => {
  if (!event.relatedTarget || !event.relatedTarget.closest('button, a, [role="button"]')) {
    cursor.classList.remove('active');
  }
});

const grainContext = grain.getContext('2d');
function renderGrain() {
  grain.width = window.innerWidth;
  grain.height = window.innerHeight;
  const image = grainContext.createImageData(grain.width, grain.height);
  for (let index = 0; index < image.data.length; index += 4) {
    const value = Math.random() * 22;
    image.data[index] = value;
    image.data[index + 1] = value;
    image.data[index + 2] = value;
    image.data[index + 3] = 16;
  }
  grainContext.putImageData(image, 0, 0);
}
renderGrain();
window.setInterval(renderGrain, 180);
