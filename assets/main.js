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

  // Submit via hidden form + iframe (reliable with Google Apps Script)
  var iframe = document.createElement('iframe');
  iframe.name = 'form-submit-iframe';
  iframe.style.display = 'none';
  document.body.appendChild(iframe);

  var hiddenForm = document.createElement('form');
  hiddenForm.method = 'POST';
  hiddenForm.action = GOOGLE_SCRIPT_URL;
  hiddenForm.target = 'form-submit-iframe';
  hiddenForm.style.display = 'none';

  Object.entries(payload).forEach(function (entry) {
    var input = document.createElement('input');
    input.type = 'hidden';
    input.name = entry[0];
    input.value = entry[1];
    hiddenForm.appendChild(input);
  });

  document.body.appendChild(hiddenForm);
  hiddenForm.submit();

  // Show success after a short delay (we can't read iframe response cross-origin)
  setTimeout(function () {
    document.body.removeChild(hiddenForm);
    document.body.removeChild(iframe);
    showMessage(
      'success',
      'Registration submitted successfully! We will contact you soon.',
      'Registrazione inviata con successo! Ti contatteremo presto.'
    );
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = currentLang === 'it' ? 'Invia Registrazione' : 'Submit Registration';
  }, 2000);
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
