#!/usr/bin/env python3
"""Build the static site.

Pages live in src/pages/*.html. Each starts with a one-line JSON header comment:
  <!--{"title": "...", "desc": "...", "nav": "loans"}-->
The shared shell (head, header, footer) is src/layout.html.
Output goes to site/, which is the folder to deploy.

Usage:  python3 build.py
"""
import json, pathlib, re

ROOT = pathlib.Path(__file__).parent
SRC, OUT = ROOT / "src", ROOT / "site"
DOMAIN = "https://derekgoulette.com"  # update once the domain is confirmed

NAV = [
    ("loans.html", "Loans", "loans"),
    ("calculator.html", "Calculator", "calculator"),
    ("realtors.html", "Realtors", "realtors"),
    ("careers.html", "Careers", "careers"),
    ("about.html", "About", "about"),
    ("contact.html", "Contact", "contact"),
]


def nav_html(active, indent):
    links = []
    for href, label, key in NAV:
        cur = ' aria-current="page"' if key == active else ""
        links.append(f'<a href="{href}"{cur}>{label}</a>')
    return ("\n" + indent).join(links)


def main():
    layout = (SRC / "layout.html").read_text()
    urls = []
    for page in sorted((SRC / "pages").glob("*.html")):
        raw = page.read_text()
        m = re.match(r"\s*<!--(\{.*?\})-->\s*\n", raw)
        if not m:
            raise SystemExit(f"{page.name}: missing JSON header comment")
        meta, body = json.loads(m.group(1)), raw[m.end():]
        canon = "" if page.name == "index.html" else page.name
        html = (layout
                .replace("{{title}}", meta["title"])
                .replace("{{desc}}", meta["desc"])
                .replace("{{canon}}", canon)
                .replace("{{domain}}", DOMAIN)
                .replace("{{nav}}", nav_html(meta.get("nav"), "      "))
                .replace("{{mnav}}", nav_html(meta.get("nav"), "  "))
                .replace("{{body}}", body.rstrip() + "\n"))
        (OUT / page.name).write_text(html)
        if page.name != "404.html":
            urls.append(f"{DOMAIN}/{canon}")
        print("built", page.name)

    (OUT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "".join(f"  <url><loc>{u}</loc></url>\n" for u in urls)
        + "</urlset>\n")
    (OUT / "robots.txt").write_text(f"User-agent: *\nAllow: /\nSitemap: {DOMAIN}/sitemap.xml\n")


if __name__ == "__main__":
    main()
