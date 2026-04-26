# Deploying RouteForge to Vercel

This is a plain static site: HTML + CSS + client-side JavaScript.

Use these Vercel settings:

- Framework Preset: Other
- Build Command: leave blank
- Output Directory: .
- Install Command: leave blank or default

The project root must directly contain:
- index.html
- styles.css
- js/

Do not deploy a folder that contains another nested routeforge folder unless you set that nested folder as the Root Directory.
