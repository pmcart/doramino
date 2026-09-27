import { isSpam, validatePrimary, validateSecondary } from './validate.js';
import { buildPrimaryEmail, buildSecondaryEmail } from './email.js';

const NOTIFY_TO = 'patrickmcart@gmail.com';
const NOTIFY_FROM = 'onboarding@resend.dev';

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

const FORM_TYPES = {
  primary: { validate: validatePrimary, buildEmail: buildPrimaryEmail },
  secondary: { validate: validateSecondary, buildEmail: buildSecondaryEmail },
};

export function createHandler(resendClient) {
  return async function handler(req) {
    let body;
    try {
      body = await req.json();
    } catch {
      return jsonResponse(400, { ok: false, errors: ['Request body must be valid JSON'] });
    }

    const formType = FORM_TYPES[body.formType];
    if (!formType) {
      return jsonResponse(400, { ok: false, errors: ['formType must be "primary" or "secondary"'] });
    }

    if (isSpam(body)) {
      return jsonResponse(200, { ok: true });
    }

    const { valid, errors } = formType.validate(body);
    if (!valid) {
      return jsonResponse(400, { ok: false, errors });
    }

    try {
      const { error } = await resendClient.emails.send({
        from: NOTIFY_FROM,
        to: NOTIFY_TO,
        ...formType.buildEmail(body),
      });
      if (error) {
        return jsonResponse(500, { ok: false, error: error.message || 'Failed to send email' });
      }
    } catch (err) {
      return jsonResponse(500, { ok: false, error: err.message || 'Failed to send email' });
    }

    return jsonResponse(200, { ok: true });
  };
}
