# Doramino Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single static landing page (`website/`) that pitches Doramino and captures pilot-programme leads via Formspree, deployed to GitHub Pages with no build step.

**Architecture:** Plain HTML/CSS/JS served as a static site from `website/`. A two-stage form (primary lead capture, then an optional secondary follow-up) posts via `fetch` to one Formspree endpoint, distinguished by a hidden `formType` field. A GitHub Actions workflow publishes `website/` to GitHub Pages on every push to `main`. No server-side code, no dependencies, no build tooling.

**Tech Stack:** HTML/CSS/vanilla JS, Formspree (hosted form backend), GitHub Actions (`actions/upload-pages-artifact`, `actions/deploy-pages`).

**Spec:** [docs/superpowers/specs/2026-09-27-doramino-landing-page-design.md](../specs/2026-09-27-doramino-landing-page-design.md)

## Global Constraints

- Plain HTML/CSS/JS only — no framework, no build step, no npm dependencies.
- Hosting: GitHub Pages, deployed via a GitHub Actions workflow that publishes `website/` on push to `main` touching `website/**`.
- Email capture: a single Formspree endpoint, submissions distinguished by a hidden `formType` field (`primary` / `secondary`).
- Honeypot field name must be exactly `_gotcha` (Formspree's spam-trap convention).
- No database, CRM, or lead log beyond Formspree's own submission log/email notifications.
- No confirmation/autoresponder email sent to the lead themselves.
- No additional pages (privacy policy, terms) beyond the single landing page.
- No custom domain this pass.
- Page copy is taken verbatim from the approved brief; mockups and sample output must be clearly labeled illustrative, not real product screenshots.

## Review Focus

1. A primary-form submission with a required field left blank must be blocked client-side (no `fetch` fires) — even a visitor tabbing past a field quickly shouldn't produce a partial network request.
2. A filled honeypot (`_gotcha`) submission must still resolve to the normal success/confirmation UI, since Formspree accepts and silently discards it server-side — the JS must not treat Formspree's response differently based on the honeypot.
3. The secondary form's hidden `workEmail` must be populated from the primary submission's entered value before the confirmation state is shown, so the two submissions can be matched by hand later — an empty value here silently breaks the one manual cross-reference this design relies on.
4. A failed/non-ok `fetch` response (Formspree down, network error, misconfigured endpoint) must show a visible error message and leave the visitor's entered data in place — it must not look like success or silently clear the form.
5. The three-workflow table must not overflow or force horizontal scroll at mobile width (~375px), since it's the densest layout element on the page and the spec calls this out explicitly.

---

## Task 1: Landing page markup

**Files:**
- Create: `website/index.html`

**Interfaces:**
- Consumes: nothing.
- Produces the DOM contract later tasks rely on:
  - `#primary-form` with named inputs `workEmail`, `company`, `firmType` (select), `role` (select), `problem` (textarea), a hidden input `name="formType"` value `primary`, and a honeypot input `name="_gotcha"` wrapped in an element with class `hp-field`.
  - `#form-error` — empty container inside the primary form for validation/error messages.
  - `#confirmation` (class `is-hidden` by default) containing `#secondary-form` with named inputs `currentTools`, `itProvider`, `nextExercise`, a hidden input `name="formType"` value `secondary`, and a hidden input `name="workEmail"` (starts empty, populated by JS).
  - `#secondary-form-error` — empty container inside the secondary form for its own error messages.
  - An anchor target `id="apply"` on the form section; the hero primary CTA is `<a href="#apply">`.

- [ ] **Step 1: Write `website/index.html`**

Seven sections in source order, using this copy verbatim:

1. **Hero** — headline `Make DORA resilience testing manageable for your small team.`; subheading `Plan incident drills, coordinate recovery checks with your IT providers, and track the evidence and follow-up actions in one place.`; CTA `Apply for the founding customer programme` linking to `#apply`.
2. **Problem** — three statements: `Test plans sit in spreadsheets.` / `Evidence is scattered across emails and IT tickets.` / `Findings stay unresolved because ownership is unclear.`
3. **Concrete example** — heading `Your critical supplier becomes unavailable. What happens next?`, a short walkthrough (simulated alert → contact provider → decisions recorded → improvements assigned), and a sample-output block explicitly labeled illustrative (e.g. "Illustrative example output") containing: `Provider acknowledgement exceeded your target.` / `Recovery evidence is missing.` / `Two corrective actions need an owner.`
4. **Three workflows** — a table with columns "Workflow" / "What the customer does" / "What Doramino provides" and rows for Incident-response drills, Recovery checks, and Remediation and retesting (content from the spec's brief).
5. **Who it's for** — `Built for smaller payment and e-money firms working with lean internal teams and external IT providers.`
6. **Pilot offer** — `Configured around your services, suppliers and existing workflows.` and `Become a design partner and help shape the workflows and integrations we build next.`
7. **Lead form** (`id="apply"`) — satisfies the DOM contract above. `firmType` options: Payment institution / E-money institution / Other financial services firm / Other. `role` options: COO / Head of Risk / Compliance / Internal IT / Other.

Link `css/styles.css` in `<head>` and `js/main.js` with `defer` before `</body>`.

- [ ] **Step 2: Verify structure**

Run: `grep -E 'id="(primary-form|secondary-form|confirmation|form-error|secondary-form-error|apply)"|name="(workEmail|company|firmType|role|problem|formType|_gotcha|currentTools|itProvider|nextExercise)"|class="hp-field"' website/index.html`
Expected: a match for every id/name/class listed in Interfaces above.

Then open `website/index.html` directly in a browser and confirm all 7 sections render in source order.

- [ ] **Step 3: Commit**

```bash
git add website/index.html
git commit -m "feat: add Doramino landing page markup"
```

---

## Task 2: Visual design

**Files:**
- Create: `website/css/styles.css`

**Interfaces:**
- Consumes: the class/id hooks from Task 1's `index.html`.
- Produces: the `.is-hidden { display: none; }` utility class Task 3's JS toggles on `#confirmation`, and an off-screen (not `display:none`) style for `.hp-field` so the honeypot stays part of the layout and reachable by simple bots while invisible to real visitors.

This task's palette, typography, and motion choices are an open creative decision — apply the `frontend-design` skill while implementing it, following a fintech/compliance direction (precise, trustworthy, slightly serious) and avoiding generic-SaaS defaults (no Inter/Roboto/Arial, no purple gradient on white).

- [ ] **Step 1: Implement `website/css/styles.css`**

Define the palette and typography as CSS custom properties on `:root`; style all 7 sections including the workflows table (must not overflow on narrow widths — e.g. horizontal scroll wrapper or stacked layout below a breakpoint) and the sample-output block (visually distinct from real UI, e.g. a bordered "illustrative" panel); style form states (default, error via `#form-error` / `#secondary-form-error`, the `.is-hidden` confirmation swap) with restrained motion on the primary CTA and the confirmation transition.

- [ ] **Step 2: Verify visually**

Open `website/index.html` in a browser at a mobile width (~375px) and a desktop width (~1440px). Confirm: no horizontal scroll on the page itself, the workflows table stays usable on mobile (per Review Focus #5), all text is legible against its background, and the honeypot field is invisible but present in the DOM.

- [ ] **Step 3: Commit**

```bash
git add website/css/styles.css
git commit -m "feat: add Doramino landing page visual design"
```

---

## Task 3: Client-side form behavior

**Files:**
- Create: `website/js/main.js`

**Interfaces:**
- Consumes: DOM contract from Task 1, `.is-hidden` from Task 2.
- Produces: a `FORMSPREE_ENDPOINT` constant at the top of the file (placeholder value `"https://formspree.io/f/REPLACE_ME"`) that Task 4's README instructs the user to replace with their real endpoint.

- [ ] **Step 1: Implement `website/js/main.js`**

Define `const FORMSPREE_ENDPOINT = "https://formspree.io/f/REPLACE_ME";` at the top.

On `#primary-form` submit: `preventDefault`; check `workEmail`, `company`, `firmType`, `role`, `problem` are non-empty — if any is blank, show a message in `#form-error` and return without calling `fetch` (Review Focus #1). Otherwise `fetch(FORMSPREE_ENDPOINT, {method: 'POST', headers: {Accept: 'application/json'}, body: new FormData(primaryForm)})`.
- On a response with `res.ok`: hide `#primary-form`, remove `is-hidden` from `#confirmation`, and set `secondary-form`'s hidden `workEmail` input's value to the primary form's submitted `workEmail` value (Review Focus #3) — do this regardless of the honeypot, since Formspree returns a normal ok response either way (Review Focus #2).
- On a response where `!res.ok`, or on a thrown network error: show a generic error message in `#form-error` and leave the primary form's fields populated (Review Focus #4).

Wire `#secondary-form` the same way, POSTing to the same `FORMSPREE_ENDPOINT` with its own `FormData` (already carries `formType=secondary` and the populated hidden `workEmail`); on `res.ok`, replace `#secondary-form` with a short inline thank-you message so it can't be resubmitted; on failure, show the error in `#secondary-form-error` and leave its fields populated.

- [ ] **Step 2: Manual verification (client-side logic, no real Formspree account required yet)**

Open `website/index.html` in a browser with devtools open on the Network tab.
1. Submit the primary form with a required field blank — confirm `#form-error` shows a message and no request appears in the Network tab.
2. Fill all required fields and submit — confirm a POST to `FORMSPREE_ENDPOINT` fires with the expected form fields, including `formType=primary`.
3. In devtools, temporarily force the fetch to fail (e.g. via the Network tab's "offline" toggle) and submit again — confirm `#form-error` shows an error and the fields remain filled.
4. Manually remove `is-hidden` from `#confirmation` via devtools to confirm the secondary form and its hidden `workEmail` field render correctly, then fill and submit it — confirm a POST fires with `formType=secondary` and the same `workEmail` value.

Full email deliverability (a real Formspree endpoint actually emailing the site owner) is verified in Task 4 after deployment, once a real account exists.

- [ ] **Step 3: Commit**

```bash
git add website/js/main.js
git commit -m "feat: add landing page form submission behavior"
```

---

## Task 4: Deployment workflow and setup docs

**Files:**
- Create: `.github/workflows/deploy.yml`
- Create: `website/README.md`

**Interfaces:**
- Consumes: `website/` as a complete static site from Tasks 1–3.
- Produces: nothing consumed by later tasks — this is the final task.

- [ ] **Step 1: Implement `.github/workflows/deploy.yml`**

A workflow triggered on `push` to `main` with `paths: ['website/**']`, plus `workflow_dispatch` for manual runs. Permissions: `pages: write`, `id-token: write`. One job that checks out the repo, runs `actions/upload-pages-artifact@v3` with `path: website`, then `actions/deploy-pages@v4`. No build/install step — the artifact is `website/` as-is.

- [ ] **Step 2: Write `website/README.md`**

Cover, in order:
1. **Formspree setup** — create a free account at formspree.io, create a form, copy its endpoint URL, and replace `FORMSPREE_ENDPOINT` in `website/js/main.js` with that URL.
2. **Local preview** — serve the folder locally (e.g. `npx serve website`, or open `website/index.html` directly) to check changes before pushing.
3. **Deploy** — in the repo's GitHub Settings → Pages, set Source to "GitHub Actions" (one-time). After that, every push to `main` touching `website/**` deploys automatically via `.github/workflows/deploy.yml`; the live URL appears in the repo's Pages settings and in the workflow run summary.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml website/README.md
git commit -m "feat: add GitHub Pages deployment workflow and setup docs"
```

- [ ] **Step 4: Live end-to-end verification (after pushing to `main` and completing the Formspree/Pages setup in the README)**

1. Confirm the GitHub Actions workflow run succeeds and the Pages URL serves the live site.
2. On the live site, submit the primary form with realistic data; confirm the confirmation state and secondary form appear, and the submission arrives in the Formspree dashboard/email.
3. Submit the secondary form; confirm a second submission arrives with the same `workEmail` as the primary one (Review Focus #3).
4. Fill the `_gotcha` field via devtools and submit the primary form; confirm the UI still shows success (Review Focus #2).
