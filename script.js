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
const inquiryBackdrop = document.querySelector('#inquiry-backdrop');
const inquiryDrawer = document.querySelector('#inquiry-drawer');
const inquiryClose = document.querySelector('#inquiry-close');
const inquiryForm = document.querySelector('#inquiry-form');
const inquirySubmit = document.querySelector('#inquiry-submit');
const inquiryStatus = document.querySelector('#inquiry-status');
const referenceImage = document.querySelector('#referenceImage');
const uploadName = document.querySelector('#upload-name');
const visionCta = document.querySelector('#vision-cta');
const slideNav = document.querySelector('#slide-nav');
const prevButton = document.querySelector('#prev-btn');
const nextButton = document.querySelector('#next-btn');
const slideCounter = document.querySelector('#slide-counter');
const toHeroButton = document.querySelector('#to-hero-btn');
const showcaseCta = document.querySelector('#showcase-cta');
let started = false;
let wheelLocked = false;
let lastFocusedElement = null;

const maxImageSize = 10 * 1024 * 1024;
const allowedImageTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const contactPattern = /^\+63\d{10}$/;
const phonePrefix = '+63';
const fieldRules = [
  ['name', 'Name is required.'],
  ['project', 'Project is required.'],
  ['contactNumber', 'Contact number is required.'],
  ['email', 'Email is required.'],
  ['date', 'Date is required.'],
  ['budget', 'Budget is required.'],
];
const fieldLabels = {
  name: 'Name',
  project: 'Project',
  contactNumber: 'Contact number',
  email: 'Email',
  date: 'Date',
  budget: 'Budget',
};

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
    if (slideNav) {
      slideNav.hidden = false;
      updateSlideNav(0);
    }
  }, 3600);
}

function getSections() {
  return Array.from(document.querySelectorAll('#experience > .section'));
}

function getCurrentSectionIndex() {
  const sections = getSections();
  if (!sections.length) return 0;
  const scrollTop = experience.scrollTop;
  const height = experience.clientHeight || window.innerHeight;
  return Math.max(0, Math.min(sections.length - 1, Math.round(scrollTop / height)));
}

function updateSlideNav(index) {
  const sections = getSections();
  const total = sections.length || 2;
  const current = Math.max(0, Math.min(total - 1, index));

  if (slideCounter) {
    slideCounter.textContent = `0${current + 1} / 0${total}`;
  }
  if (prevButton) {
    prevButton.disabled = current <= 0;
  }
  if (nextButton) {
    nextButton.disabled = current >= total - 1;
  }
}

function goToSection(index) {
  const sections = getSections();
  if (index < 0 || index >= sections.length) return;
  sections[index].scrollIntoView({ behavior: 'smooth' });
  updateSlideNav(index);
}

startButton.addEventListener('click', startExperience);
exploreButton.addEventListener('click', () => goToSection(1));
toHeroButton?.addEventListener('click', () => goToSection(0));
prevButton?.addEventListener('click', () => {
  const current = getCurrentSectionIndex();
  if (current > 0) goToSection(current - 1);
});
nextButton?.addEventListener('click', () => {
  const current = getCurrentSectionIndex();
  const sections = getSections();
  if (current < sections.length - 1) goToSection(current + 1);
});
showcaseCta?.addEventListener('click', openInquiryDrawer);

function setInquiryStatus(message, type = '') {
  inquiryStatus.textContent = message;
  inquiryStatus.classList.toggle('is-error', type === 'error');
  inquiryStatus.classList.toggle('is-success', type === 'success');
}

function capitalizeWords(value) {
  return value
    .toLowerCase()
    .replace(/\b([a-z])/g, (letter) => letter.toUpperCase());
}

function formatBudget(value) {
  const digits = value.replace(/\D/g, '');

  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatContactNumber(value) {
  const digits = value.replace(/\D/g, '');
  const localDigits = digits.startsWith('63') ? digits.slice(2) : digits;

  return `${phonePrefix}${localDigits.slice(0, 10)}`;
}

function getFormInput(name) {
  return inquiryForm.elements[name];
}

function setFieldInvalid(input, invalid) {
  input.setAttribute('aria-invalid', String(invalid));
  input.closest('.field-control, .upload-field')?.classList.toggle('is-invalid', invalid);
}

function focusInvalidField(input) {
  input.focus({ preventScroll: true });
  input.closest('.field, .upload-field')?.scrollIntoView({
    block: 'center',
    behavior: 'smooth',
  });
}

function openInquiryDrawer() {
  lastFocusedElement = document.activeElement;
  inquiryBackdrop.hidden = false;
  inquiryDrawer.setAttribute('aria-hidden', 'false');
  requestAnimationFrame(() => {
    inquiryBackdrop.classList.add('is-open');
    inquiryDrawer.classList.add('is-open');
  });
  window.setTimeout(() => {
    inquiryDrawer.querySelector('input')?.focus();
  }, 180);
}

function closeInquiryDrawer() {
  inquiryBackdrop.classList.remove('is-open');
  inquiryDrawer.classList.remove('is-open');
  inquiryDrawer.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => {
    inquiryBackdrop.hidden = true;
  }, 360);

  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

function validateReferenceImage(file) {
  if (!file) {
    return 'Reference image is required.';
  }

  if (!allowedImageTypes.has(file.type)) {
    return 'Upload a JPG, PNG, or WEBP reference image.';
  }

  if (file.size > maxImageSize) {
    return 'Reference image must be 10 MB or smaller.';
  }

  return '';
}

function validateInquiryForm() {
  for (const [fieldName, message] of fieldRules) {
    const input = getFormInput(fieldName);
    const value = input.value.trim();

    setFieldInvalid(input, false);

    if (!value) {
      setFieldInvalid(input, true);
      return {
        input,
        message,
      };
    }

    if (input.maxLength > 0 && value.length > input.maxLength) {
      setFieldInvalid(input, true);
      return {
        input,
        message: `${fieldLabels[fieldName]} is too long.`,
      };
    }
  }

  const emailInput = getFormInput('email');
  if (!emailPattern.test(emailInput.value.trim())) {
    setFieldInvalid(emailInput, true);
    return {
      input: emailInput,
      message: 'Enter a valid email address.',
    };
  }

  const contactInput = getFormInput('contactNumber');
  contactInput.value = formatContactNumber(contactInput.value);

  if (!contactPattern.test(contactInput.value)) {
    setFieldInvalid(contactInput, true);
    return {
      input: contactInput,
      message: 'Enter a valid +63 contact number.',
    };
  }

  const imageError = validateReferenceImage(referenceImage.files[0]);
  setFieldInvalid(referenceImage, Boolean(imageError));
  if (imageError) {
    return {
      input: referenceImage,
      message: imageError,
    };
  }

  return null;
}

async function readApiResponse(response) {
  const contentType = response.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return response.json();
  }

  return {
    success: false,
    error: response.ok ? 'Unexpected server response' : `Request failed with status ${response.status}`,
  };
}

visionCta.addEventListener('click', openInquiryDrawer);
inquiryClose.addEventListener('click', closeInquiryDrawer);
inquiryBackdrop.addEventListener('click', closeInquiryDrawer);

referenceImage.addEventListener('change', () => {
  const file = referenceImage.files[0];
  const error = validateReferenceImage(file);

  uploadName.textContent = file ? file.name : 'JPG, PNG, or WEBP up to 10 MB';
  setInquiryStatus(error, error ? 'error' : '');
  setFieldInvalid(referenceImage, Boolean(error));

  if (error) {
    referenceImage.value = '';
    uploadName.textContent = 'JPG, PNG, or WEBP up to 10 MB';
  }
});

inquiryForm.addEventListener('input', (event) => {
  if (event.target.matches('input')) {
    if (event.target.name === 'name' || event.target.name === 'project') {
      event.target.value = capitalizeWords(event.target.value);
    }

    if (event.target.name === 'budget') {
      event.target.value = formatBudget(event.target.value);
    }

    if (event.target.name === 'contactNumber') {
      event.target.value = formatContactNumber(event.target.value);
    }

    setFieldInvalid(event.target, false);
    if (!inquiryStatus.classList.contains('is-success')) {
      setInquiryStatus('');
    }
  }
});

inquiryForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const validationError = validateInquiryForm();
  if (validationError) {
    setInquiryStatus(validationError.message, 'error');
    focusInvalidField(validationError.input);
    return;
  }

  inquirySubmit.disabled = true;
  inquirySubmit.classList.add('is-loading');
  inquirySubmit.querySelector('span').textContent = 'Sending';
  inquirySubmit.querySelector('iconify-icon').setAttribute('icon', 'hugeicons:loading-03');
  setInquiryStatus('Sending your inquiry...');

  try {
    const response = await fetch('/api/telegram', {
      method: 'POST',
      body: new FormData(inquiryForm),
    });
    const result = await readApiResponse(response);

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Unable to send inquiry');
    }

    inquiryForm.reset();
    getFormInput('contactNumber').value = phonePrefix;
    uploadName.textContent = 'JPG, PNG, or WEBP up to 10 MB';
    setInquiryStatus('Inquiry sent. We will review it shortly.', 'success');
    inquirySubmit.querySelector('iconify-icon').setAttribute('icon', 'hugeicons:checkmark-circle-02');
  } catch (error) {
    setInquiryStatus(error.message || 'Unable to send inquiry', 'error');
    inquirySubmit.querySelector('iconify-icon').setAttribute('icon', 'hugeicons:arrow-up-right-01');
  } finally {
    inquirySubmit.disabled = false;
    inquirySubmit.classList.remove('is-loading');
    inquirySubmit.querySelector('span').textContent = 'Send Inquiry';
  }
});

function initWipers() {
  const cards = document.querySelectorAll('.wiper-card');

  cards.forEach((card) => {
    const viewport = card.querySelector('.wiper-viewport');
    const slider = card.querySelector('.wiper-slider');
    const quickButtons = card.querySelectorAll('.quick-btn');
    if (!viewport || !slider) return;

    function setWiper(percent, animate = false) {
      const clamped = Math.max(0, Math.min(100, Math.round(percent)));
      if (animate) {
        viewport.classList.add('is-animating');
        window.setTimeout(() => viewport.classList.remove('is-animating'), 320);
      }
      viewport.style.setProperty('--wiper-pos', `${clamped}%`);
      slider.value = clamped;

      quickButtons.forEach((btn) => {
        const action = btn.dataset.action;
        const isMatch =
          (action === 'view-raw' && clamped === 100) ||
          (action === 'view-grade' && clamped === 0) ||
          (action === 'reset-wiper' && clamped >= 45 && clamped <= 55);
        btn.classList.toggle('is-active', isMatch);
      });
    }

    slider.addEventListener('input', (event) => {
      setWiper(event.target.value);
    });

    let isDragging = false;

    function handlePointer(event) {
      const rect = viewport.getBoundingClientRect();
      const clientX = event.touches ? event.touches[0].clientX : event.clientX;
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const percent = (x / rect.width) * 100;
      setWiper(percent);
    }

    viewport.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      event.preventDefault();
      isDragging = true;
      try {
        viewport.setPointerCapture(event.pointerId);
      } catch (_) {}
      cursor?.classList.add('slider-active');
      handlePointer(event);
    });

    viewport.addEventListener('pointermove', (event) => {
      if (!isDragging) return;
      event.preventDefault();
      handlePointer(event);
    });

    function stopDrag(event) {
      if (isDragging) {
        isDragging = false;
        try {
          viewport.releasePointerCapture(event.pointerId);
        } catch (_) {}
        cursor?.classList.remove('slider-active');
      }
    }

    viewport.addEventListener('pointerup', stopDrag);
    viewport.addEventListener('pointercancel', stopDrag);

    // Keyboard accessibility on viewport
    viewport.setAttribute('tabindex', '0');
    viewport.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 10 : 2;
      const current = parseInt(slider.value, 10);
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        event.stopPropagation();
        setWiper(current - step);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopPropagation();
        setWiper(current + step);
      }
    });

    card.querySelectorAll('[data-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.action;
        if (action === 'view-raw') {
          setWiper(100, true);
        } else if (action === 'view-grade') {
          setWiper(0, true);
        } else if (action === 'reset-wiper') {
          setWiper(50, true);
        }
      });
    });
  });
}

initWipers();

window.addEventListener('wheel', (event) => {
  if (!started || (preloader && preloader.isConnected) || wheelLocked) return;
  if (inquiryDrawer.classList.contains('is-open')) return;

  if (event.target.closest('.showcase-grid') && Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
  if (Math.abs(event.deltaY) < 25) return;

  const currentIndex = getCurrentSectionIndex();
  const sections = getSections();

  if (event.deltaY > 0 && currentIndex < sections.length - 1) {
    event.preventDefault();
    wheelLocked = true;
    goToSection(currentIndex + 1);
    window.setTimeout(() => { wheelLocked = false; }, 680);
  } else if (event.deltaY < 0 && currentIndex > 0) {
    event.preventDefault();
    wheelLocked = true;
    goToSection(currentIndex - 1);
    window.setTimeout(() => { wheelLocked = false; }, 680);
  }
}, { passive: false });

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && inquiryDrawer.classList.contains('is-open')) {
    closeInquiryDrawer();
    return;
  }

  if (event.target.closest('input, textarea, select, button')) return;

  if (!started || (preloader && preloader.isConnected)) return;
  const currentIndex = getCurrentSectionIndex();
  const sections = getSections();

  if (['ArrowDown', 'PageDown'].includes(event.key)) {
    if (currentIndex < sections.length - 1) {
      event.preventDefault();
      goToSection(currentIndex + 1);
    }
  } else if (['ArrowUp', 'PageUp'].includes(event.key)) {
    if (currentIndex > 0) {
      event.preventDefault();
      goToSection(currentIndex - 1);
    }
  } else if (event.key === ' ') {
    event.preventDefault();
    goToSection(currentIndex < sections.length - 1 ? currentIndex + 1 : 0);
  }
});

experience.addEventListener('scroll', () => {
  const max = experience.scrollHeight - experience.clientHeight;
  progress.style.width = `${max > 0 ? (experience.scrollTop / max) * 100 : 0}%`;
  const currentIndex = getCurrentSectionIndex();
  updateSlideNav(currentIndex);
});

window.addEventListener('mousemove', (event) => {
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
});

document.addEventListener('pointerover', (event) => {
  if (event.target.closest('button, a, [role="button"], .wiper-slider, .quick-btn')) cursor.classList.add('active');
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
