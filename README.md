# Johnathan Sattler — personal site

Live at **https://jsattlerorg.github.io/johnathan-sattler/**

My personal website: a tiny, phone-style operating system ("SattlerOS") for the web.
It has a lock screen, a home screen with widgets and swipeable pages, a dock, and apps
that zoom out of their icons. On tablets and desktops it switches to an iPad-style layout
with windowed apps.

Plain HTML, CSS and JavaScript. No frameworks, no build step. Hosted on GitHub Pages.

## Editing content

Everything personal lives in **`assets/js/content.js`**: name, bio, projects, résumé,
notes, photos, links and the Messages conversation. Entries marked `TODO` are placeholders.

- **Email:** set `email` to turn on the Mail app and the Messages send button.
- **Photos:** give an entry a `src` (for example `assets/img/photos/hike.jpg`) to show a real image.
- **Résumé PDF:** drop a PDF in the repo and set `resumeUrl`.

## Features

- Lock screen: swipe up, scroll, tap, or press Enter to unlock
- Apps: About, Projects, Résumé, Notes, Photos, Messages, Mail, Safari (links), Settings, Calculator, Terminal
- Spotlight search: `/` or `⌘K` / `Ctrl+K`, or pull down on the home screen
- Deep links: `#/projects`, `#/notes/0`, `#/terminal`, and so on
- Settings: light/dark/auto appearance, five wallpapers, Reduce Motion (saved per browser)
- Keyboard: `Esc` goes back or closes an app, `←`/`→` flip home pages, the Calculator takes typed input
- Respects `prefers-reduced-motion` and `prefers-color-scheme`

## Run locally

```sh
python3 -m http.server 8000
# open http://localhost:8000
```

## Deploy

GitHub Pages serves the repository root of `master` at the default address above.
`.nojekyll` makes Pages serve the files as they are. All asset paths are relative, so the
site works under the `/johnathan-sattler/` subpath. (`404.html` is the one exception: it uses
absolute `/johnathan-sattler/...` links because it's served for any missing path.)
To use a custom domain later, add a `CNAME` file and update those two links in `404.html`.
