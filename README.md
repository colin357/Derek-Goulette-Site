# Derek Goulette · Website

Static marketing site for Derek Goulette, Branch Manager at Fairway Home Mortgage (Daniel Island, SC). Design direction: **Campaign** (navy, raspberry from Derek's windowpane jacket, condensed uppercase type, hairline windowpane grid).

## Structure

```
site/                 ← deploy this folder (plain HTML/CSS/JS, no build needed to host)
  index.html, loans.html, calculator.html,
  realtors.html, careers.html, about.html, contact.html, 404.html
  assets/css/site.css   design system
  assets/js/site.js     config + interactions (calculator, forms, nav, hero scroll)
  assets/img/           photos and social share image
  sitemap.xml, robots.txt
src/
  layout.html         shared head, header, footer
  pages/*.html        page content (one JSON header line each)
build.py              regenerates site/*.html from src/
concepts/             earlier design explorations (not deployed)
```

## Editing

- **Page content:** edit `src/pages/<page>.html`, then run `python3 build.py`.
- **Header, footer, meta tags:** edit `src/layout.html`, then run `python3 build.py`.
- **Styles and scripts:** edit `site/assets/` directly (not generated).
- **Links and settings:** the `SITE` object at the top of `site/assets/js/site.js`.

## Before launch

| Item | Where |
| --- | --- |
| Fairway document upload URL | `SITE.uploadUrl` in `site.js` |
| Form endpoint (CRM webhook) — forms show a "not connected" notice until set | `SITE.formEndpoint` in `site.js` |
| Final domain (canonical URLs, sitemap, social tags) | `DOMAIN` in `build.py`, then rebuild |
| Derek's bio details and any stats/reviews | `src/pages/about.html`, `src/pages/index.html` |
| States licensed in, and any disclosures Fairway requires | `src/layout.html` footer |
| Fairway marketing/compliance approval of copy and brand colors | — |

## Hosting

**Vercel:** `vercel.json` already sets the output directory to `site/`, so import the repo and deploy with no extra settings (Framework Preset: Other). `site/404.html` is used automatically for missing pages.

Other static hosts (Netlify, Cloudflare Pages, GitHub Pages): set the publish directory to `site/`.
