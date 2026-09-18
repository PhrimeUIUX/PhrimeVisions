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
  }, 3600);
}

startButton.addEventListener('click', startExperience);
exploreButton.addEventListener('click', () => experience.scrollTo({ top: 0, behavior: 'smooth' }));

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

window.addEventListener('wheel', (event) => {
  if (!started || preloader.isConnected || wheelLocked) return;
  event.preventDefault();
  wheelLocked = true;
  experience.scrollTo({ top: 0, behavior: 'smooth' });
  window.setTimeout(() => { wheelLocked = false; }, 620);
}, { passive: false });

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && inquiryDrawer.classList.contains('is-open')) {
    closeInquiryDrawer();
    return;
  }

  if (event.target.closest('input, textarea, select, button')) return;

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
