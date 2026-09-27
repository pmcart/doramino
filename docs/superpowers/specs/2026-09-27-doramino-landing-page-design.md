# Doramino landing page — design spec

Date: 2026-09-27

## Purpose

Build a single landing page (in `website/`) that tests the Doramino product hypothesis — a DORA resilience-testing and evidence platform for smaller payment/e-money institutions — by getting qualified visitors to apply for a "founding customer programme" pilot, not just collect passive email signups.

Success criteria: a visitor who recognizes their own problem in the page content submits the lead form with a real work email, company, firm type, role, and a description of their testing/evidence problem.

## Background

A first version of this page was already built against Netlify (static site + a Netlify Function calling Resend). That approach is no longer usable (Netlify account is at capacity), so this spec replaces the hosting and email-capture mechanism while keeping the page content and visual direction unchanged. There is no live deployment yet — this is a fresh build.

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

No existing brand assets — design created from scratch via the `frontend-design` skill during implementation. Direction: fintech/compliance register — precise, trustworthy, slightly serious — avoiding generic-SaaS defaults (no Inter/Roboto/Arial, no purple gradient on white). Specific palette and typography pairing to be proposed during the frontend-design pass, using a cohesive palette via CSS variables and layered gradients over flat backgrounds.

## Form and backend

Two-stage flow, no database, no CRM, no server-side code:

- **Primary form** fields: work email, company, firm type (select: Payment institution / E-money institution / Other financial services firm / Other), role (select: COO / Head of Risk / Compliance / Internal IT / Other), biggest testing/evidence problem (textarea). Hidden honeypot field named `_gotcha` (Formspree's spam-trap convention), visually hidden via CSS but present in the DOM. Client-side required-field validation before submit.
- Submit → `fetch` POST (JSON `Accept` header, no page reload) to a Formspree form endpoint, with a hidden `formType: "primary"` field. Formspree emails the submission to the site owner; no API keys or secrets are involved since Formspree's endpoint ID is not a credential.
- On success, the page swaps in a confirmation state: brief thank-you plus a **secondary optional form** — current tools, external IT provider, next planned exercise — which, if filled in and submitted, POSTs to the *same* Formspree endpoint with `formType: "secondary"` and the same `workEmail` (carried over from the primary submission), so the two emails can be matched manually by work email address. No persistent storage — email is the only record.
- On a Formspree error response, show a generic error message in `#form-error` and leave the form's contents intact.

**Manual prerequisite:** a free Formspree account and form endpoint must be created before the form works end-to-end; this is a one-time manual step outside this codebase (documented in `website/README.md`).

## Folder structure

```
website/
  index.html
  css/styles.css
  js/main.js
  README.md            # Formspree setup + local preview + deploy notes
.github/workflows/deploy.yml   # publishes website/ to GitHub Pages on push to main
```

No `package.json`, no `.env`, no `netlify.toml`, no `public/` subfolder split (that split existed only to keep Netlify Function source out of the public deploy; not needed for a pure static site).

## Deployment

GitHub Pages, deployed via a GitHub Actions workflow (`actions/upload-pages-artifact` + `actions/deploy-pages`) that uploads `website/` as the Pages artifact on every push to `main` that touches `website/**`. No build step. This is chosen over GitHub Pages' branch/folder setting because that setting only supports serving from the repo root or `/docs`, and this repo's `/docs` is already used for planning documents.

## Testing / validation plan

Manual verification only — there is no custom business logic left to unit test (no server-side validation/handler/email-building code):

- Serve `website/` locally (e.g. `npx serve website` or open `index.html` directly) and submit both the primary and secondary forms with realistic data; confirm both submissions arrive via Formspree (dashboard and/or email).
- Confirm the honeypot field (`_gotcha`) is present in the DOM but visually hidden, and that a filled honeypot still produces a normal-looking success response.
- Confirm blank required fields block submission client-side (no network request fires).
- Check layout at mobile (~375px) and desktop (~1440px) widths — no horizontal scroll, workflow table stays usable on mobile.
- After the first deploy, load the live GitHub Pages URL and submit a real test lead end-to-end.

## Out of scope (this pass)

- Any database, CRM, or lead log beyond Formspree's own submission log/email notifications.
- Confirmation/autoresponder email sent to the lead themselves.
- Additional pages (privacy policy, terms) beyond the single landing page.
- Any framework (Next.js/React) — plain HTML/CSS/JS only.
- Custom domain (can be added later via GitHub Pages settings if wanted).
