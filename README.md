# Field Notes — a travel journal

First-person travel essays and photographs by Ulana Rey, PharmD.

A static website: plain HTML, CSS, and vanilla JavaScript — no build step and no dependencies. The site is served from the repository root.

## Local preview

```bash
python3 -m http.server 8000
```

Then open <http://127.0.0.1:8000/>.

## Structure

```
index.html        essays + About, with embedded structured data
css/main.css      styles
js/main.js        scroll and route-line animation
images/full/      essay and portrait photography
llms.txt          site and author summary for AI crawlers
robots.txt        crawl directives
sitemap.xml       sitemap with image entries
CNAME             custom domain for GitHub Pages
```

## License

All essays and photographs © Ulana Rey. All rights reserved.
