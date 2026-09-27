# Doramino landing page — design spec

Date: 2026-09-27

## Purpose

Build a single landing page (in `website/`) that tests the Doramino product hypothesis — a DORA resilience-testing and evidence platform for smaller payment/e-money institutions — by getting qualified visitors to apply for a "founding customer programme" pilot, not just collect passive email signups.

Success criteria: a visitor who recognizes their own problem in the page content submits the lead form with a real work email, company, firm type, role, and a description of their testing/evidence problem.

## Content

Content is taken from the approved brief (provided by the user 2026-09-27), used close to verbatim rather than rewritten. Mockups and sample output must be clearly labeled as illustrative, not real product screenshots.

Page structure, single scrolling page, in order:

1. **Hero** — headline "Make DORA resilience testing manageable for your small team," subheading, primary CTA "Apply for the founding customer programme" anchor-linking to the form section.
2. **Problem** — three short statements: test plans sit in spreadsheets; evidence is scattered across emails and IT tickets; findings stay unresolved because ownership is unclear.
3. **Concrete example** — "Your critical supplier becomes unavailable. What happens next?" walkthrough (simulated alert → contact provider → decisions recorded → improvements assigned) with the sample output block:
   - Provider acknowledgement exceeded your target.
   - Recovery evidence is missing.
   - Two corrective actions need an owner.
4. **Three workflows** — table: Incident-response drills / Recovery checks / Remediation and retesting, each with "what the customer does" and "what Doramino provides" columns.
5. **Who it's for** — "Built for smaller payment and e-money firms working with lean internal teams and external IT providers."
6. **Pilot offer** — founding customer / design partner framing: "Configured around your services, suppliers and existing workflows" and "Become a design partner and help shape the workflows and integrations we build next." No bespoke-agency language.
7. **Lead form** — see Form below.

## Visual direction

No existing brand assets — design created from scratch via the `frontend-design` skill after this spec is approved. Direction: fintech/compliance register — precise, trustworthy, slightly serious — avoiding generic-SaaS defaults (no Inter/Roboto/Arial, no purple gradient on white). Specific palette and typography pairing to be proposed during the frontend-design pass, following the user's documented preference for a cohesive palette via CSS variables and layered gradients over flat backgrounds.

## Form and backend

Two-stage flow, no database, no CRM:

- **Primary form** fields: work email, company, firm type (select: Payment institution / E-money institution / Other financial services firm / Other), role (select: COO / Head of Risk / Compliance / Internal IT / Other), biggest testing/evidence problem (textarea). Honeypot field for basic spam resistance (no CAPTCHA, to keep friction low). Client-side required-field validation before submit.
- Submit → POST to `submit-lead.js` Netlify Function → function re-validates/sanitizes server-side → calls Resend API → emails patrickmcart@gmail.com with the submission, sent from `onboarding@resend.dev` (no domain verification needed since recipient is the site owner, not the lead).
- On success, the page swaps in a confirmation state (no reload): brief thank-you plus a **secondary optional form** — current tools, external IT provider, next planned exercise — which, if filled in and submitted, POSTs to the same function pattern and sends a second email tagged with the same work email address so submissions can be matched manually. No persistent storage — email is the only record.

## Folder structure

```
website/
  index.html
  css/styles.css
  js/main.js
  netlify/functions/submit-lead.js
  netlify.toml
  package.json        # function dependency: resend
```

`RESEND_API_KEY` is set as a Netlify environment variable, never committed or present in client-side code.

## Testing / validation plan

Manual verification, no automated test suite (static marketing page, no business logic beyond the one function):

- Run locally via `netlify dev` (Netlify CLI).
- Submit both the primary and secondary forms with realistic data; confirm both emails arrive via Resend.
- Confirm the honeypot field doesn't block legitimate submissions.
- Check layout on mobile and desktop widths.
- Confirm server-side validation rejects a submission missing required fields even if client-side JS is bypassed.

## Out of scope (this pass)

- Any database, CRM, or lead log beyond email notifications.
- Confirmation/autoresponder email sent to the lead themselves.
- Additional pages (privacy policy, terms) beyond the single landing page.
- Any framework (Next.js/React) — plain HTML/CSS/JS only.
- Actual deployment to a live Netlify site/domain (this pass builds and locally verifies; deploying is a separate, explicit step the user triggers).
