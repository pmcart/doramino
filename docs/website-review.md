# Doramino website review

Reviewed 27 September 2026 from the local HTML, CSS and JavaScript. Browser visual inspection was unavailable in this session.

## Follow-up redesign and release verification

The user subsequently requested a complete visual rebuild. The page now uses a white background, sans-serif typography, a split hero with an illustrative exercise overview, three workflow cards, a scenario timeline and a two-column application section. Copy and calls to action were simplified. Form validation now focuses invalid inputs and successful submissions move focus to the confirmation.

Before release, both primary and optional secondary submissions were sent to the existing Formspree endpoint using clearly labelled test data. Both returned HTTP 200 with `ok: true`, with CORS allowing `https://doramino.io`. This verifies service acceptance; delivery to the owner's inbox was not independently checked. Earlier review notes below describe the original page.

## Overall assessment

The page explains a concrete problem, uses a credible restrained palette, and avoids unsupported customer claims. The supplier-outage example is the strongest section: it makes the offer understandable. The responsive workflow table, visible field labels, focus styles and reduced-motion support are useful foundations.

The biggest opportunity is to make the page easier to scan and the founding-customer offer more concrete.

## Suggested changes, in priority order

1. **Bring the audience into the hero.** The payment/e-money firm description currently appears after the workflow table. Move it near the headline so visitors can immediately tell whether the product is for them. A possible headline: “Resilience testing. Manageable for small teams.” Keep DORA explicit in the supporting sentence.
2. **Explain the founding-customer programme.** State the actual scope, expected time commitment, whether it is paid, and what an accepted firm receives. Explain the next step after applying and give a response timeframe only when one can be supported. These business details need owner input.
3. **Shorten the calls to action.** Try “Become a founding customer” in the hero and “Send application” on the form. Keep the full programme name in the section heading. This should improve scanning and reduce wrapping on phones.
4. **Make the example more visual.** Present the existing four steps as a timeline and the findings as a compact report preview with an owner, target and evidence status. Retain the “Illustrative example” label; do not imply a product screenshot or customer result exists.
5. **Add form context and privacy information.** Show which fields are required, explain how enquiries are handled, and link to an owner-approved privacy notice. Add email/company autocomplete. On validation errors, focus the first invalid field and associate its error text. Move focus to the confirmation after success.
6. **Tighten the page rhythm.** The problem, audience and pilot sections all use substantial vertical padding. Consider combining the audience and pilot information into a concise introduction to the form, while keeping the example prominent.

## Implemented in this pass

- Generated a forest-green D symbol with a domino-inspired cutout.
- Added the symbol and a live-text Doramino wordmark to the hero, with an “Operational resilience” descriptor.
- Added a compact branded footer, favicon, touch icon and browser theme colour.
- Preserved the existing offer copy and submission behaviour.

The asset is `website/assets/doramino-mark.png`. It is a generated raster original, not an SVG master. A future production asset pass can supply small optimised exports and a vector master.

## Verification limits

Local asset references, HTML structure, JavaScript syntax and whitespace were checked. Browser rendering and desktop/mobile layout still need a visual check because browser and native computer connections were unavailable. The existing Formspree endpoint is configured, but no live enquiry was sent and delivery to the owner's inbox was not tested.
