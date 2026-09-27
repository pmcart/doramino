# Doramino landing page

A static landing page (plain HTML/CSS/JS, no build step, no dependencies) with lead capture via [Formspree](https://formspree.io) and deployment to GitHub Pages.

## Brand assets

`assets/doramino-mark.png` is the generated Doramino symbol used in the header, footer and browser icon. The wordmark is live text styled in `css/styles.css`, so the name stays sharp and accessible. Keep the image's transparent background when reusing it.

See [the website review](../docs/website-review.md) for suggested follow-up improvements and verification limits.

## 1. Formspree setup

The lead form needs a real Formspree endpoint before it can send you email:

1. Create a free account at [formspree.io](https://formspree.io).
2. Create a new form and copy its endpoint URL (looks like `https://formspree.io/f/xxxxxxx`).
3. Open [js/main.js](js/main.js) and replace the placeholder value of `FORMSPREE_ENDPOINT` at the top of the file with that URL.

Both the primary application form and the optional secondary follow-up form post to this same endpoint — submissions are distinguished by a hidden `formType` field, so everything lands in the same Formspree inbox.

## 2. Local preview

Serve the folder locally to check changes before pushing, for example:

```bash
npx serve website
```

Or just open `website/index.html` directly in a browser. Either way, submissions will hit your real Formspree endpoint once step 1 is done, so use test data while previewing.

## 3. Deploy

One-time setup: in the repository's GitHub Settings → Pages, set **Source** to **GitHub Actions**.

After that, every push to `main` that touches `website/**` deploys automatically via [.github/workflows/deploy.yml](../.github/workflows/deploy.yml) — no build step, the folder is published as-is. The live URL appears in the repository's Pages settings and in the workflow run's summary.
