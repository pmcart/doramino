const SUBMIT_URL = '/.netlify/functions/submit-lead';

const primaryForm = document.getElementById('primary-form');
const secondaryForm = document.getElementById('secondary-form');
const confirmation = document.getElementById('confirmation');
const formError = document.getElementById('form-error');
const secondaryFormError = document.getElementById('secondary-form-error');
const secondaryWorkEmail = document.getElementById('secondary-work-email');

const REQUIRED_PRIMARY_FIELDS = ['workEmail', 'company', 'firmType', 'role', 'problem'];
const GENERIC_ERROR = 'Something went wrong sending your application. Please try again.';

function formValues(form) {
  const values = {};
  new FormData(form).forEach((value, key) => { values[key] = value; });
  return values;
}

function showError(target, message) {
  target.textContent = message;
}

function clearError(target) {
  target.textContent = '';
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
  clearError(formError);

  const fields = formValues(primaryForm);
  const missing = REQUIRED_PRIMARY_FIELDS.filter((name) => !fields[name] || !fields[name].trim());
  if (missing.length > 0) {
    showError(formError, 'Please fill in all fields before submitting.');
    return;
  }

  let result;
  try {
    result = await submitLead('primary', fields);
  } catch {
    showError(formError, GENERIC_ERROR);
    return;
  }

  if (!result.ok) {
    showError(formError, (result.errors && result.errors.join(' ')) || GENERIC_ERROR);
    return;
  }

  primaryForm.classList.add('is-hidden');
  confirmation.classList.remove('is-hidden');
  secondaryWorkEmail.value = fields.workEmail;
});

secondaryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearError(secondaryFormError);

  const fields = formValues(secondaryForm);

  let result;
  try {
    result = await submitLead('secondary', fields);
  } catch {
    showError(secondaryFormError, GENERIC_ERROR);
    return;
  }

  if (!result.ok) {
    showError(secondaryFormError, (result.errors && result.errors.join(' ')) || GENERIC_ERROR);
    return;
  }

  const thanks = document.createElement('p');
  thanks.className = 'confirmation-message';
  thanks.textContent = 'Thanks — that\'s everything we need for now.';
  secondaryForm.replaceWith(thanks);
});
