const SUBMIT_URL = '/.netlify/functions/submit-lead';

const primaryForm = document.getElementById('primary-form');
const secondaryForm = document.getElementById('secondary-form');
const confirmation = document.getElementById('confirmation');
const formError = document.getElementById('form-error');
const secondaryWorkEmail = document.getElementById('secondary-work-email');

const REQUIRED_PRIMARY_FIELDS = ['workEmail', 'company', 'firmType', 'role', 'problem'];

function formValues(form) {
  const values = {};
  new FormData(form).forEach((value, key) => { values[key] = value; });
  return values;
}

function showError(message) {
  formError.textContent = message;
}

function clearError() {
  formError.textContent = '';
}

async function submitLead(formType, fields) {
  const response = await fetch(SUBMIT_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ formType, ...fields }),
  });
  return response.json();
}

primaryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError();

  const fields = formValues(primaryForm);
  const missing = REQUIRED_PRIMARY_FIELDS.filter((name) => !fields[name] || !fields[name].trim());
  if (missing.length > 0) {
    showError('Please fill in all fields before submitting.');
    return;
  }

  let result;
  try {
    result = await submitLead('primary', fields);
  } catch {
    showError('Something went wrong sending your application. Please try again.');
    return;
  }

  if (!result.ok) {
    showError((result.errors && result.errors.join(' ')) || 'Something went wrong sending your application. Please try again.');
    return;
  }

  primaryForm.classList.add('is-hidden');
  confirmation.classList.remove('is-hidden');
  secondaryWorkEmail.value = fields.workEmail;
});

secondaryForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const fields = formValues(secondaryForm);

  let result;
  try {
    result = await submitLead('secondary', fields);
  } catch {
    return;
  }

  if (!result.ok) {
    return;
  }

  const thanks = document.createElement('p');
  thanks.className = 'confirmation-message';
  thanks.textContent = 'Thanks — that\'s everything we need for now.';
  secondaryForm.replaceWith(thanks);
});
