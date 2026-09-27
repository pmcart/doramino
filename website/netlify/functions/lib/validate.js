export const MAX_TEXT_LENGTH = 2000;
export const MAX_FIELD_LENGTH = 200;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isSpam(fields) {
  return typeof fields.honeypot === 'string' && fields.honeypot.length > 0;
}

function checkField(value, name, maxLength, errors) {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    errors.push(`${name} is required`);
    return;
  }
  if (value.length > maxLength) {
    errors.push(`${name} exceeds maximum length of ${maxLength}`);
  }
}

function checkEmail(value, name, errors) {
  checkField(value, name, MAX_FIELD_LENGTH, errors);
  if (value && typeof value === 'string' && !EMAIL_PATTERN.test(value)) {
    errors.push(`${name} is not a valid email address`);
  }
}

export function validatePrimary(fields) {
  const errors = [];
  checkEmail(fields.workEmail, 'workEmail', errors);
  checkField(fields.company, 'company', MAX_FIELD_LENGTH, errors);
  checkField(fields.firmType, 'firmType', MAX_FIELD_LENGTH, errors);
  checkField(fields.role, 'role', MAX_FIELD_LENGTH, errors);
  checkField(fields.problem, 'problem', MAX_TEXT_LENGTH, errors);
  return { valid: errors.length === 0, errors };
}

function checkOptionalText(value, name, maxLength, errors) {
  if (value && typeof value === 'string' && value.length > maxLength) {
    errors.push(`${name} exceeds maximum length of ${maxLength}`);
  }
}

export function validateSecondary(fields) {
  const errors = [];
  checkEmail(fields.workEmail, 'workEmail', errors);
  checkOptionalText(fields.currentTools, 'currentTools', MAX_TEXT_LENGTH, errors);
  checkOptionalText(fields.itProvider, 'itProvider', MAX_TEXT_LENGTH, errors);
  checkOptionalText(fields.nextExercise, 'nextExercise', MAX_TEXT_LENGTH, errors);
  return { valid: errors.length === 0, errors };
}
