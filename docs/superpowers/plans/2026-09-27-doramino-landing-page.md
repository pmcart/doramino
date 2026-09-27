# Doramino Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and locally verify a single static landing page (`website/`) that pitches Doramino and captures pilot-programme leads via a Netlify Function that emails submissions through Resend.

**Architecture:** Plain HTML/CSS/JS served as a static site, with one Netlify Function (`submit-lead`) handling both the primary lead-capture form and a secondary optional follow-up form. The function's validation and email-building logic is split into small pure, unit-tested modules; the Netlify entry point and the network call to Resend are a thin wrapper around them.

**Tech Stack:** HTML/CSS/vanilla JS, Netlify Functions (v2, Fetch API style), Resend (`resend` npm package), Node's built-in `node:test` runner (no external test framework), Netlify CLI for local dev.

**Spec:** [docs/superpowers/specs/2026-09-27-doramino-landing-page-design.md](../specs/2026-09-27-doramino-landing-page-design.md)

## Global Constraints

- Plain HTML/CSS/JS only — no framework (React/Next.js/Astro).
- Hosting/runtime: Netlify + Netlify Functions.
- Email via Resend API; `RESEND_API_KEY` set as a Netlify environment variable, never committed or present in client-side code.
- Send from `onboarding@resend.dev`; notify `patrickmcart@gmail.com`.
- No database, CRM, or lead log of any kind — email is the only record.
- No confirmation/autoresponder email sent to the lead themselves.
- No additional pages (privacy policy, terms) beyond the single landing page.
- No CAPTCHA — spam resistance via a honeypot field only.
- No live deployment this pass — build and verify locally via `netlify dev` only.

## Review Focus

1. Malformed/missing work email on the primary form must be rejected with a 400 server-side, even if client-side JS is bypassed (e.g. a direct POST via curl).
2. A filled honeypot field must not trigger an email send, but must still return a normal-looking success response so scripted bots don't learn to avoid the check.
3. A Resend API failure (network error, or an `error` field in a successful-looking response) must surface as a visible error to the visitor rather than a silent "success" that loses the lead.
4. The secondary follow-up form must still require a valid work email even though nothing server-side forces a primary submission to precede it, so a submission can always be matched to a lead.
5. The "biggest testing/evidence problem" textarea has no length limit in the brief; without a server-side cap, an extreme-length submission could produce a malformed or abusive email — capped at 2000 characters (200 for shorter fields).

---

## Task 1: Project scaffolding

**Files:**
- Create: `website/package.json`
- Create: `website/netlify.toml`
- Create: `website/.gitignore`
- Create: `website/.env.example`

**Interfaces:**
- Consumes: nothing.
- Produces: an installable Node project at `website/` with `resend` as a dependency and `netlify-cli` as a dev dependency, and a `test` script implementers use in later tasks.

- [ ] **Step 1: Create `website/package.json`**

`private: true`, `type: "module"`, `scripts.test` = `"node --test"`, `dependencies.resend` = latest, `devDependencies.netlify-cli` = latest.

- [ ] **Step 2: Create `website/netlify.toml`**

```toml
[build]
  functions = "netlify/functions"
  publish = "."
```

- [ ] **Step 3: Create `website/.gitignore`**

Ignore `node_modules/`, `.env`, `.netlify/`.

- [ ] **Step 4: Create `website/.env.example`**

Single line: `RESEND_API_KEY=`

- [ ] **Step 5: Install dependencies**

Run: `cd website && npm install`
Expected: completes without error; `package-lock.json` and `node_modules/` are created.

- [ ] **Step 6: Commit**

```bash
git add website/package.json website/package-lock.json website/netlify.toml website/.gitignore website/.env.example
git commit -m "chore: scaffold Doramino landing page project"
```

---

## Task 2: Lead validation and email content

**Files:**
- Create: `website/netlify/functions/lib/validate.js`
- Create: `website/netlify/functions/lib/validate.test.js`
- Create: `website/netlify/functions/lib/email.js`
- Create: `website/netlify/functions/lib/email.test.js`

**Interfaces:**
- Consumes: nothing (pure functions, no I/O).
- Produces:
  - `isSpam(fields: object): boolean`
  - `validatePrimary(fields: {workEmail, company, firmType, role, problem}): {valid: boolean, errors: string[]}`
  - `validateSecondary(fields: {workEmail, currentTools, itProvider, nextExercise}): {valid: boolean, errors: string[]}`
  - `MAX_TEXT_LENGTH = 2000`, `MAX_FIELD_LENGTH = 200` (exported constants)
  - `buildPrimaryEmail(fields): {subject: string, text: string}`
  - `buildSecondaryEmail(fields): {subject: string, text: string}`

- [ ] **Step 1: Write failing tests for `validate.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isSpam, validatePrimary, validateSecondary, MAX_TEXT_LENGTH, MAX_FIELD_LENGTH } from './validate.js';

const validPrimary = { workEmail: 'a@example.com', company: 'Acme', firmType: 'Payment institution', role: 'COO', problem: 'Evidence is scattered.' };

test('isSpam true when honeypot filled', () => assert.equal(isSpam({ honeypot: 'x' }), true));
test('isSpam false when honeypot empty or missing', () => {
  assert.equal(isSpam({ honeypot: '' }), false);
  assert.equal(isSpam({}), false);
});

test('validatePrimary valid for complete fields', () => assert.equal(validatePrimary(validPrimary).valid, true));
test('validatePrimary rejects missing workEmail', () => {
  const r = validatePrimary({ ...validPrimary, workEmail: '' });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some(e => e.includes('workEmail')));
});
test('validatePrimary rejects malformed workEmail', () => assert.equal(validatePrimary({ ...validPrimary, workEmail: 'not-an-email' }).valid, false));
test('validatePrimary rejects missing company/firmType/role/problem', () => {
  for (const field of ['company', 'firmType', 'role', 'problem']) {
    assert.equal(validatePrimary({ ...validPrimary, [field]: '' }).valid, false, field);
  }
});
test('validatePrimary rejects problem over MAX_TEXT_LENGTH', () => assert.equal(validatePrimary({ ...validPrimary, problem: 'x'.repeat(MAX_TEXT_LENGTH + 1) }).valid, false));
test('validatePrimary rejects company over MAX_FIELD_LENGTH', () => assert.equal(validatePrimary({ ...validPrimary, company: 'x'.repeat(MAX_FIELD_LENGTH + 1) }).valid, false));

test('validateSecondary valid with only workEmail', () => assert.equal(validateSecondary({ workEmail: 'a@example.com' }).valid, true));
test('validateSecondary rejects missing/malformed workEmail', () => {
  assert.equal(validateSecondary({ workEmail: '' }).valid, false);
  assert.equal(validateSecondary({ workEmail: 'nope' }).valid, false);
});
test('validateSecondary rejects optional field over MAX_TEXT_LENGTH', () => assert.equal(validateSecondary({ workEmail: 'a@example.com', currentTools: 'x'.repeat(MAX_TEXT_LENGTH + 1) }).valid, false));
```

- [ ] **Step 2: Run tests, confirm failure**

Run: `cd website && npm test`
Expected: FAIL — `validate.js` does not exist yet.

- [ ] **Step 3: Implement `validate.js`**

Export `MAX_TEXT_LENGTH = 2000`, `MAX_FIELD_LENGTH = 200`, and the three functions above. Use a simple `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` pattern for email format. `problem`/`currentTools`/`itProvider`/`nextExercise` are checked against `MAX_TEXT_LENGTH`; `workEmail`/`company`/`firmType`/`role` against `MAX_FIELD_LENGTH`.

- [ ] **Step 4: Run tests, confirm pass**

Run: `cd website && npm test`
Expected: PASS

- [ ] **Step 5: Write failing tests for `email.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildPrimaryEmail, buildSecondaryEmail } from './email.js';

test('buildPrimaryEmail includes all submitted fields', () => {
  const { subject, text } = buildPrimaryEmail({ workEmail: 'a@example.com', company: 'Acme', firmType: 'Payment institution', role: 'COO', problem: 'Evidence is scattered.' });
  assert.match(subject, /Acme/);
  for (const value of ['a@example.com', 'Acme', 'Payment institution', 'COO', 'Evidence is scattered.']) {
    assert.ok(text.includes(value), value);
  }
});

test('buildSecondaryEmail includes submitted fields and tags the email', () => {
  const { subject, text } = buildSecondaryEmail({ workEmail: 'a@example.com', currentTools: 'Spreadsheets', itProvider: 'Acme Cloud', nextExercise: 'Q4 recovery test' });
  assert.match(subject, /a@example\.com/);
  for (const value of ['a@example.com', 'Spreadsheets', 'Acme Cloud', 'Q4 recovery test']) {
    assert.ok(text.includes(value), value);
  }
});
```

- [ ] **Step 6: Run tests, confirm failure**

Run: `cd website && npm test`
Expected: FAIL — `email.js` does not exist yet.

- [ ] **Step 7: Implement `email.js`**

Plain string templates; no HTML email needed. `buildSecondaryEmail`'s subject must include the `workEmail` value so the two emails can be matched manually in an inbox.

- [ ] **Step 8: Run tests, confirm pass**

Run: `cd website && npm test`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add website/netlify/functions/lib/validate.js website/netlify/functions/lib/validate.test.js website/netlify/functions/lib/email.js website/netlify/functions/lib/email.test.js
git commit -m "feat: add lead validation and email content builders"
```

---

## Task 3: Submission handler and Netlify entry point

**Files:**
- Create: `website/netlify/functions/lib/handler.js`
- Create: `website/netlify/functions/lib/handler.test.js`
- Create: `website/netlify/functions/submit-lead.js`

**Interfaces:**
- Consumes: `isSpam`, `validatePrimary`, `validateSecondary` from `validate.js`; `buildPrimaryEmail`, `buildSecondaryEmail` from `email.js` (Task 2).
- Produces: `createHandler(resendClient: {emails: {send(params: object): Promise<{data: object|null, error: object|null}>}}): (req: Request) => Promise<Response>`. `submit-lead.js` is the Netlify Functions v2 default export built from this factory — later tasks treat it only as `POST /.netlify/functions/submit-lead` accepting JSON `{formType: 'primary'|'secondary', ...fields}` and returning JSON `{ok: boolean, errors?: string[], error?: string}`.

- [ ] **Step 1: Write failing tests for `createHandler` in `handler.test.js`**

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHandler } from './handler.js';

const validPrimary = { formType: 'primary', workEmail: 'a@example.com', company: 'Acme', firmType: 'Payment institution', role: 'COO', problem: 'Evidence is scattered.' };

function fakeClient({ error = null } = {}) {
  const calls = [];
  return { calls, emails: { send: async (params) => { calls.push(params); return { data: error ? null : { id: '1' }, error }; } } };
}

function postRequest(body) {
  return new Request('http://localhost/.netlify/functions/submit-lead', { method: 'POST', body: JSON.stringify(body) });
}

test('valid primary submission emails patrickmcart@gmail.com from onboarding@resend.dev', async () => {
  const client = fakeClient();
  const res = await createHandler(client)(postRequest(validPrimary));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(client.calls.length, 1);
  assert.equal(client.calls[0].to, 'patrickmcart@gmail.com');
  assert.equal(client.calls[0].from, 'onboarding@resend.dev');
});

test('honeypot filled skips send but still returns ok', async () => {
  const client = fakeClient();
  const res = await createHandler(client)(postRequest({ ...validPrimary, honeypot: 'x' }));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(client.calls.length, 0);
});

test('missing required field returns 400 and does not send', async () => {
  const client = fakeClient();
  const res = await createHandler(client)(postRequest({ ...validPrimary, workEmail: '' }));
  assert.equal(res.status, 400);
  assert.equal((await res.json()).ok, false);
  assert.equal(client.calls.length, 0);
});

test('valid secondary submission sends with secondary content', async () => {
  const client = fakeClient();
  const res = await createHandler(client)(postRequest({ formType: 'secondary', workEmail: 'a@example.com', currentTools: 'Spreadsheets' }));
  assert.equal(res.status, 200);
  assert.equal(client.calls.length, 1);
});

test('unknown formType returns 400', async () => {
  const res = await createHandler(fakeClient())(postRequest({ formType: 'bogus' }));
  assert.equal(res.status, 400);
});

test('malformed JSON body returns 400', async () => {
  const req = new Request('http://localhost/.netlify/functions/submit-lead', { method: 'POST', body: '{not json' });
  const res = await createHandler(fakeClient())(req);
  assert.equal(res.status, 400);
});

test('resend error response returns 500', async () => {
  const client = fakeClient({ error: { message: 'invalid key' } });
  const res = await createHandler(client)(postRequest(validPrimary));
  assert.equal(res.status, 500);
  assert.equal((await res.json()).ok, false);
});
```

- [ ] **Step 2: Run tests, confirm failure**

Run: `cd website && npm test`
Expected: FAIL — `handler.js` does not exist yet.

- [ ] **Step 3: Implement `createHandler` in `handler.js`**

Parse the body with `await req.json()` inside a try/catch (malformed JSON → 400). Dispatch on `body.formType`: `'primary'` uses `validatePrimary`/`buildPrimaryEmail`, `'secondary'` uses `validateSecondary`/`buildSecondaryEmail`, anything else → 400. Run `isSpam(body)` first — if true, skip validation and the send call, respond 200 `{ok:true}`. Otherwise validate; on failure respond 400 `{ok:false, errors}`. On success call `resendClient.emails.send({from:'onboarding@resend.dev', to:'patrickmcart@gmail.com', ...buildXEmail(body)})` inside a try/catch; if it throws or resolves with a non-null `error`, respond 500 `{ok:false, error: <message>}`; otherwise 200 `{ok:true}`. Build every response with `new Response(JSON.stringify(body), {status, headers: {'content-type': 'application/json'}})`.

- [ ] **Step 4: Run tests, confirm pass**

Run: `cd website && npm test`
Expected: PASS

- [ ] **Step 5: Implement `submit-lead.js`**

```js
import { Resend } from 'resend';
import { createHandler } from './lib/handler.js';

export default createHandler(new Resend(process.env.RESEND_API_KEY));
```

No test — thin wrapper with no branching logic; exercised end-to-end in Task 6.

- [ ] **Step 6: Commit**

```bash
git add website/netlify/functions/lib/handler.js website/netlify/functions/lib/handler.test.js website/netlify/functions/submit-lead.js
git commit -m "feat: add lead submission handler and Netlify function entry point"
```

---

## Task 4: Landing page markup

**Files:**
- Create: `website/index.html`

**Interfaces:**
- Consumes: nothing.
- Produces the DOM contract later tasks rely on:
  - `#primary-form` with named inputs `workEmail`, `company`, `firmType` (select), `role` (select), `problem` (textarea), and a honeypot input `name="honeypot"` wrapped in an element with class `hp-field`.
  - `#confirmation` (class `is-hidden` by default) containing `#secondary-form` with named inputs `currentTools`, `itProvider`, `nextExercise`, and a hidden input `name="workEmail"`.
  - `#form-error` — empty container for validation/error messages.
  - An anchor target `#apply` on the form section; the hero primary CTA is `<a href="#apply">`.

- [ ] **Step 1: Write `website/index.html`**

All 7 sections from the spec's Content section, in order, using its copy verbatim: hero (headline, subheading, CTA), problem (3 statements), concrete example (with the sample output block, explicitly labeled e.g. "Illustrative example"), three-workflows table, who it's for, pilot offer, and the form section satisfying the DOM contract above. `firmType` options: Payment institution / E-money institution / Other financial services firm / Other. `role` options: COO / Head of Risk / Compliance / Internal IT / Other. Link `css/styles.css` in `<head>` and `js/main.js` with `defer` before `</body>`.

- [ ] **Step 2: Verify structure**

Run: `grep -E 'id="(primary-form|secondary-form|confirmation|form-error)"|name="(workEmail|company|firmType|role|problem|honeypot|currentTools|itProvider|nextExercise)"|class="hp-field"' website/index.html`
Expected: a match for every id/name/class listed in Interfaces above. Then open `website/index.html` directly in a browser and confirm all 7 sections render in source order.

- [ ] **Step 3: Commit**

```bash
git add website/index.html
git commit -m "feat: add Doramino landing page markup"
```

---

## Task 5: Visual design

**Files:**
- Create: `website/css/styles.css`

**Interfaces:**
- Consumes: the class/id hooks from Task 4's `index.html`.
- Produces: the `.is-hidden { display: none; }` utility class Task 6's JS toggles on `#confirmation`, and an off-screen (not `display:none`) style for `.hp-field` so the honeypot stays part of the layout for simple bots while invisible to real visitors.

This task's palette, typography, and motion choices are an open creative decision — apply the `frontend-design` skill while implementing it, following the fintech/compliance direction and avoidance of generic-SaaS defaults noted in the spec's Visual direction section.

- [ ] **Step 1: Implement `website/css/styles.css`**

Define the palette and typography as CSS custom properties on `:root`; style all 7 sections including the workflows table (must not overflow on narrow widths) and the sample-output block (clearly distinct from real UI); style form states (default, error via `#form-error`, the `.is-hidden` confirmation swap) with restrained motion on the primary CTA and the confirmation transition.

- [ ] **Step 2: Verify visually**

Open `website/index.html` in a browser at a mobile width (~375px) and a desktop width (~1440px). Confirm: no horizontal scroll, the workflows table stays usable on mobile, all text is legible against its background, and the honeypot field is invisible but present in the DOM.

- [ ] **Step 3: Commit**

```bash
git add website/css/styles.css
git commit -m "feat: add Doramino landing page visual design"
```

---

## Task 6: Client-side form behavior and end-to-end verification

**Files:**
- Create: `website/js/main.js`

**Interfaces:**
- Consumes: DOM contract from Task 4, `.is-hidden` from Task 5, `POST /.netlify/functions/submit-lead` contract from Task 3.
- Produces: nothing consumed by later tasks — this is the final task.

- [ ] **Step 1: Implement `website/js/main.js`**

On `#primary-form` submit: `preventDefault`; check `workEmail`/`company`/`firmType`/`role`/`problem` are non-empty, else show a message in `#form-error` and stop. Otherwise `fetch('/.netlify/functions/submit-lead', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify({formType:'primary', ...fields})})`. On `{ok:true}`: hide `#primary-form`, remove `is-hidden` from `#confirmation`, copy the submitted `workEmail` into `#secondary-form`'s hidden `workEmail` input. On `{ok:false}`: show the returned errors (or a generic fallback message) in `#form-error`; leave the form visible. Wire `#secondary-form` the same way with `formType:'secondary'`; on success, replace it with a short inline thank-you so it can't be resubmitted.

- [ ] **Step 2: Run end-to-end verification**

Run: `cd website && npx netlify dev`, open the served URL.
1. Submit the primary form with realistic data — confirm the confirmation state and secondary form appear, and an email arrives via Resend.
2. Submit the secondary form — confirm a second email arrives, tagged with the same work email.
3. Reload, try submitting the primary form with a field blank — confirm `#form-error` shows a message and no network request fires (check the browser devtools Network tab).
4. Run `curl -s -o /dev/null -w '%{http_code}' -X POST -H 'content-type: application/json' -d '{"formType":"primary"}' http://localhost:8888/.netlify/functions/submit-lead` — expected: `400` (proves server-side validation isn't bypassable by skipping the client).
5. In devtools, set the honeypot input's value and submit the primary form — confirm the response still looks successful but no new email arrives.

Expected: all five checks pass as described.

- [ ] **Step 3: Commit**

```bash
git add website/js/main.js
git commit -m "feat: add landing page form submission behavior"
```
