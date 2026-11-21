# Accessibility

metrics produces images (SVG, PNG, JPEG), JSON and Markdown, and serves a few web pages from its web server. It makes no claim of conforming to WCAG.

- **The images** are made for a profile page. Nothing checks their colour contrast, and some templates animate (`config_animations: no` turns that off). Give every image you embed a meaningful alternative text.
- **The web pages** (the embed page, the insights page and the OAuth page) are small Vue pages. They have not been tested with assistive technology.

No automated accessibility checks run in CI. Problems are bugs: please report them in an [issue](https://github.com/HoneyBearTech/metrics/issues/new/choose); the `accessibility` label exists for them.
