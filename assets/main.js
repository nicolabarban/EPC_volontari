// === Configuration ===
// IMPORTANT: After deploying the Google Apps Script, paste the web app URL here:
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwEUZ-FrWvV1EV7AjcAApIApzGPeLmdJsMKzO7x0JQ6lyf_1tJqAhJoTC4Fk0AMYcQG/exec';

// === Language Switcher ===
let currentLang = 'en';

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;

  // Update all elements with data-en / data-it attributes
  document.querySelectorAll('[data-' + lang + ']').forEach(el => {
    el.innerHTML = el.getAttribute('data-' + lang);
  });

  // Update placeholders on inputs/textareas
  document.querySelectorAll('[data-placeholder-' + lang + ']').forEach(el => {
    el.placeholder = el.getAttribute('data-placeholder-' + lang);
  });

  // Update language switcher buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
}

// Attach click handlers to language buttons
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    setLanguage(btn.dataset.lang);
  });
});

// Initialize with English
setLanguage('en');

// === Form Submission to Google Sheets ===
const form = document.getElementById('volunteer-form');
const formMessage = document.getElementById('form-message');

function showMessage(type, textEn, textIt) {
  formMessage.className = 'form-message ' + type;
  formMessage.textContent = currentLang === 'it' ? textIt : textEn;
  formMessage.style.display = 'block';
}

form.addEventListener('submit', function (e) {
  e.preventDefault();

  // Honeypot check
  if (form.querySelector('[name="_honey"]').value) return;

  const submitBtn = form.querySelector('.submit-button');
  submitBtn.disabled = true;
  submitBtn.textContent = currentLang === 'it' ? 'Invio in corso...' : 'Submitting...';
  formMessage.style.display = 'none';

  // Collect form data
  const availability = [];
  form.querySelectorAll('input[name="availability"]:checked').forEach(cb => {
    availability.push(cb.value);
  });

  const payload = {
    name: form.querySelector('#name').value,
    email: form.querySelector('#email').value,
    phone: form.querySelector('#phone').value,
    affiliation: form.querySelector('#affiliation').value,
    preferred_role: form.querySelector('#role').value,
    availability: availability.join(', '),
    notes: form.querySelector('#notes').value
  };

  // Submit via POST (form-urlencoded)
  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(payload).toString(),
    redirect: 'follow'
  })
  .then(function () {
    showMessage(
      'success',
      'Registration submitted successfully! You will receive a confirmation email shortly.',
      'Registrazione inviata con successo! Riceverai a breve un\'email di conferma.'
    );
    form.reset();
  })
  .catch(function () {
    showMessage(
      'error',
      'Something went wrong. Please try again or email us at epc2026@unibo.it.',
      'Qualcosa \u00e8 andato storto. Riprova o scrivici a epc2026@unibo.it.'
    );
  })
  .finally(function () {
    submitBtn.disabled = false;
    submitBtn.textContent = currentLang === 'it' ? 'Invia Registrazione' : 'Submit Registration';
  });
});

// === Smooth Scroll ===
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
