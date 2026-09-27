export function buildPrimaryEmail(fields) {
  const { workEmail, company, firmType, role, problem } = fields;
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
  const { workEmail, currentTools, itProvider, nextExercise } = fields;
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
