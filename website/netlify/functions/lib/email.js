// eslint-disable-next-line no-control-regex
const LINE_UNSAFE = /[\r\n\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;
// eslint-disable-next-line no-control-regex
const TEXT_UNSAFE = /\r\n?|[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

function sanitizeLine(value) {
  return String(value ?? '').replace(LINE_UNSAFE, '').trim();
}

function sanitizeText(value) {
  return String(value ?? '').replace(TEXT_UNSAFE, (match) => (match === '\r\n' || match === '\r' ? '\n' : '')).trim();
}

export function buildPrimaryEmail(fields) {
  const workEmail = sanitizeLine(fields.workEmail);
  const company = sanitizeLine(fields.company);
  const firmType = sanitizeLine(fields.firmType);
  const role = sanitizeLine(fields.role);
  const problem = sanitizeText(fields.problem);

  return {
    subject: `New Doramino pilot application: ${company}`,
    text: [
      'New founding customer programme application from the Doramino landing page.',
      '',
      `Work email: ${workEmail}`,
      `Company: ${company}`,
      `Firm type: ${firmType}`,
      `Role: ${role}`,
      `Biggest testing/evidence problem: ${problem}`,
    ].join('\n'),
  };
}

export function buildSecondaryEmail(fields) {
  const workEmail = sanitizeLine(fields.workEmail);
  const currentTools = sanitizeText(fields.currentTools);
  const itProvider = sanitizeText(fields.itProvider);
  const nextExercise = sanitizeText(fields.nextExercise);

  return {
    subject: `Doramino pilot follow-up answers: ${workEmail}`,
    text: [
      `Follow-up answers for ${workEmail}.`,
      '',
      `Current tools: ${currentTools || '(not provided)'}`,
      `External IT provider: ${itProvider || '(not provided)'}`,
      `Next planned exercise: ${nextExercise || '(not provided)'}`,
    ].join('\n'),
  };
}
