const FORMSPREE_ENDPOINT = "https://formspree.io/f/REPLACE_ME";

const PRIMARY_REQUIRED_FIELDS = ['workEmail', 'company', 'firmType', 'role', 'problem'];
const GENERIC_ERROR_MESSAGE = 'Something went wrong submitting this. Please try again.';

const primaryForm = document.getElementById('primary-form');
const secondaryForm = document.getElementById('secondary-form');
const confirmation = document.getElementById('confirmation');
const formError = document.getElementById('form-error');
const secondaryFormError = document.getElementById('secondary-form-error');

function fieldValue(form, name) {
  return form.elements[name].value.trim();
}

function submitToFormspree(formData) {
  return fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { Accept: 'application/json' },
    body: formData,
  });
}

primaryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.textContent = '';

  const hasBlankField = PRIMARY_REQUIRED_FIELDS.some((name) => !fieldValue(primaryForm, name));
  if (hasBlankField) {
    formError.textContent = 'Please fill in all fields before submitting.';
    return;
  }

  try {
    const res = await submitToFormspree(new FormData(primaryForm));
    if (!res.ok) {
      formError.textContent = GENERIC_ERROR_MESSAGE;
      return;
    }

    const workEmail = fieldValue(primaryForm, 'workEmail');
    primaryForm.classList.add('is-hidden');
    confirmation.classList.remove('is-hidden');
    secondaryForm.elements['workEmail'].value = workEmail;
  } catch (err) {
    formError.textContent = GENERIC_ERROR_MESSAGE;
  }
});

secondaryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  secondaryFormError.textContent = '';

  try {
    const res = await submitToFormspree(new FormData(secondaryForm));
    if (!res.ok) {
      secondaryFormError.textContent = GENERIC_ERROR_MESSAGE;
      return;
    }

    const thanks = document.createElement('p');
    thanks.className = 'confirmation-thanks';
    thanks.textContent = "Thanks — that's helpful context.";
    secondaryForm.replaceWith(thanks);
  } catch (err) {
    secondaryFormError.textContent = GENERIC_ERROR_MESSAGE;
  }
});
