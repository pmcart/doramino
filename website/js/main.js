const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdekpbyk";

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

function setSubmitting(form, isSubmitting) {
  const button = form.querySelector('button[type="submit"]');
  if (isSubmitting) {
    button.dataset.originalLabel = button.textContent;
    button.disabled = true;
    button.textContent = 'Sending…';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalLabel;
  }
}

primaryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formError.textContent = '';

  PRIMARY_REQUIRED_FIELDS.forEach((name) => {
    primaryForm.elements[name].removeAttribute('aria-invalid');
    primaryForm.elements[name].removeAttribute('aria-describedby');
  });
  const blankField = PRIMARY_REQUIRED_FIELDS.find((name) => !fieldValue(primaryForm, name));
  if (blankField) {
    formError.textContent = 'Please fill in all fields before submitting.';
    primaryForm.elements[blankField].setAttribute('aria-invalid', 'true');
    primaryForm.elements[blankField].setAttribute('aria-describedby', 'form-error');
    primaryForm.elements[blankField].focus();
    return;
  }

  if (primaryForm.elements['workEmail'].validity.typeMismatch) {
    formError.textContent = 'Please enter a valid work email.';
    primaryForm.elements['workEmail'].setAttribute('aria-invalid', 'true');
    primaryForm.elements['workEmail'].setAttribute('aria-describedby', 'form-error');
    primaryForm.elements['workEmail'].focus();
    return;
  }

  const workEmail = fieldValue(primaryForm, 'workEmail');
  primaryForm.elements['_replyto'].value = workEmail;

  setSubmitting(primaryForm, true);
  try {
    const res = await submitToFormspree(new FormData(primaryForm));
    if (!res.ok) {
      formError.textContent = GENERIC_ERROR_MESSAGE;
      setSubmitting(primaryForm, false);
      return;
    }

    primaryForm.classList.add('is-hidden');
    confirmation.classList.remove('is-hidden');
    document.querySelector('.form-intro').classList.add('is-hidden');
    confirmation.focus();
    secondaryForm.elements['workEmail'].value = workEmail;
    secondaryForm.elements['_replyto'].value = workEmail;
  } catch (err) {
    formError.textContent = GENERIC_ERROR_MESSAGE;
    setSubmitting(primaryForm, false);
  }
});

secondaryForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  secondaryFormError.textContent = '';

  setSubmitting(secondaryForm, true);
  try {
    const res = await submitToFormspree(new FormData(secondaryForm));
    if (!res.ok) {
      secondaryFormError.textContent = GENERIC_ERROR_MESSAGE;
      setSubmitting(secondaryForm, false);
      return;
    }

    const thanks = document.createElement('p');
    thanks.className = 'confirmation-thanks';
    thanks.textContent = "Thanks — that's helpful context.";
    thanks.tabIndex = -1;
    secondaryForm.replaceWith(thanks);
    thanks.focus();
  } catch (err) {
    secondaryFormError.textContent = GENERIC_ERROR_MESSAGE;
    setSubmitting(secondaryForm, false);
  }
});
