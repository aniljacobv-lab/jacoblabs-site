JACOB LABS — site deploy
========================

FOLDER
  public/index.html        home page (hero, products, about, changelog, contact)
  public/centauri.html     product detail pages
  public/sparktakeoff.html
  public/signal-forge.html
  public/deck-forge.html
  public/404.html          custom not-found page
  public/assets/styles.css shared styling (dark + light themes)
  public/assets/main.js    theme toggle, scroll effects, contact form
  public/og-image.png      social share card (1200x630)
  public/favicon.svg       site icon
  public/icon-192.png      PWA icons
  public/icon-512.png
  public/site.webmanifest  PWA manifest
  public/robots.txt        SEO
  public/sitemap.xml       SEO
  firebase.json            hosting config (clean URLs, caching, security headers)
  .firebaserc              project alias  -> EDIT THIS if your project id differs
  .gitignore               keeps backups / firebase cache out of git
  deploy.bat               one-command deploy (backup -> git commit/push -> Firebase)

ONE-TIME SETUP
  1. npm install -g firebase-tools
  2. firebase login
  3. Create the Firebase project, then set .firebaserc "default" to its ID
        (or run:  firebase use --add  and pick it)
  4. (optional) To push code to GitHub on every deploy, run once:
        git remote add origin https://github.com/aniljacobv-lab/jacoblabs-site.git
     deploy.bat auto-inits the git repo on first run; without a remote it
     simply commits locally and skips the push.

DEPLOY
  Double-click deploy.bat            -> commits with a timestamp message
  deploy.bat "what changed"          -> commits with your own message
  Goes live at  https://<project-id>.web.app

CONTACT FORM
  Out of the box the form opens the visitor's email app (mailto) — works
  with no backend. To collect submissions to an inbox instead, create a
  free form at formspree.io and paste the endpoint into
  public/assets/main.js  ->  FORMSPREE_ENDPOINT = "https://formspree.io/f/xxxx";

CUSTOM DOMAIN  (jacoblabs.ai)
  1. Register jacoblabs.ai at a registrar that supports .ai (Namecheap / Porkbun).
  2. Firebase Console -> Hosting -> Add custom domain -> jacoblabs.ai
  3. Paste the TXT + A records into the registrar DNS. SSL auto-provisions.
  4. After the domain is live, update the https://jacoblabs-site.web.app URLs
     in the <head> of each page (canonical/OG tags) and in sitemap.xml/robots.txt.

EDITS
  - Add/remove a product on the home page = copy one <article class="card"> block.
  - Add a product detail page = copy an existing one (e.g. centauri.html) and edit.
  - Add a changelog entry = copy a <div class="entry"> block in index.html.
