# Mobile Auto Detailing — Premium Website

A static, no-build website for a mobile auto detailing business in Miami, FL.
It's plain **HTML + CSS + JavaScript**, with **GSAP/ScrollTrigger** for animations and **Netlify Forms** for appointment requests. There's nothing to install or compile.

---

## 📁 Project structure

```
mobile-auto-detailing/
├── index.html          ← all page content (text, sections, form)
├── style.css           ← all styling, colors, fonts, animations
├── script.js           ← interactions, service popups, form submit
├── success.html        ← fallback "thank you" page (used if JavaScript is off)
├── 404.html            ← "page not found" page
├── netlify.toml        ← Netlify deploy settings + headers
├── robots.txt          ← search engine rules
├── sitemap.xml         ← sitemap (update the domain)
├── .gitignore
├── README.md
└── assets/
    └── img/
        ├── favicon.svg
        ├── service-exterior.jpg    ← service card photos (×6)
        ├── service-interior.jpg
        ├── service-full.jpg
        ├── service-paint.jpg
        ├── service-ceramic.jpg
        ├── service-engine.jpg
        ├── before.jpg              ← before/after slider (demonstration)
        ├── after.jpg
        └── cta-car.jpg             ← final call-to-action photo
```

---

## ▶️ Run it locally

Any static server works. From inside the `mobile-auto-detailing` folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

> **Note:** the booking form only *submits* when the site is deployed on Netlify. Locally, clicking "Request My Appointment" shows the built-in error message ("we couldn't send your request…"). That's expected, and it proves the error handling works.

---

## 🚀 Upload to GitHub

### Option A: no command line (easiest)
1. Go to <https://github.com/new>, name the repo (e.g. `mobile-auto-detailing`), keep it **Public** or **Private**, and click **Create repository**.
2. On the new repo page, click **"uploading an existing file"**.
3. Drag in **everything inside** the `mobile-auto-detailing` folder (including the `assets` folder), not the folder itself.
4. Click **Commit changes**.

### Option B: command line
```bash
cd mobile-auto-detailing
git init
git add .
git commit -m "Initial website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/mobile-auto-detailing.git
git push -u origin main
```

---

## 🌐 Deploy on Netlify (connected to GitHub)

1. Log in at <https://app.netlify.com>.
2. Click **Add new site → Import an existing project → GitHub**, and authorize Netlify.
3. Pick your `mobile-auto-detailing` repo.
4. Build settings: leave **Build command** empty and set **Publish directory** to `.` (the `netlify.toml` already sets this).
5. Click **Deploy**. You'll get a URL like `https://something.netlify.app`.
6. Every time you push changes to GitHub, Netlify redeploys automatically.

### ✅ Turn on Netlify Forms (required, one time)
New Netlify sites have form detection **off** by default:

1. In your site dashboard go to **Forms**.
2. Click **Enable form detection**.
3. **Redeploy** the site (Deploys → Trigger deploy → Deploy site), so Netlify can find the `booking` form.
4. Submit a test request on the live site. It appears under **Forms → booking**.

### 📧 Get emailed when someone requests an appointment
**Site configuration → Notifications → Emails and webhooks → Form submission notifications → Add notification → Email notification**, choose the `booking` form and enter your email.

### Custom domain
**Domain management → Add a domain** and follow Netlify's DNS steps. HTTPS is automatic.

---

## ✏️ What to edit (and where)

### Business info: search & replace across files
| Placeholder | Replace with | Files |
|---|---|---|
| `000-000-0000` | your display phone number | `index.html`, `success.html`, `script.js` |
| `tel:+10000000000` | `tel:+1XXXXXXXXXX` (digits only) | `index.html`, `success.html`, `script.js` |
| `book@yourbusiness.com` | your email | `index.html` (footer + structured data) |
| `Mobile Auto Detailing` | your business name | `index.html`, `success.html`, `404.html` |
| `Miami, FL` / service area text | your area | `index.html` |
| `Mon–Sat · 8:00am – 6:00pm` | your real hours | `index.html` (footer, hero) + `openingHours` in the structured data |
| Social links (`instagram.com/` etc.) | your profile URLs | `index.html` footer |
| `your-site.netlify.app` | your live domain | `robots.txt`, `sitemap.xml` |

> Tip: in VS Code, use **Edit → Replace in Files** (⇧⌘H) to swap a placeholder everywhere at once.

### Services
- **Card text** (title + short description): `index.html`, in the `<!-- ============ SERVICES ============ -->` section.
- **"Learn More" popup details** (included items, "ideal for"): `script.js`, in the `SERVICE_DETAILS` object at the top.
- **Form dropdown options**: `index.html`, the `<select id="f-service">`. Keep each option's `value` matching `formValue` in `SERVICE_DETAILS` so "Request This Service" pre-selects correctly.

### Colors & fonts
At the top of `style.css`, in `:root`:
```css
--bg: #101114;     --bg-2: #191b20;
--blue: #356dff;   --blue-2: #5189ff;
--text: #ffffff;   --muted: #a9afbd;
```
Fonts are Archivo (headlines) and Inter (body) from Google Fonts, linked in `<head>`.

### Images: ⚠️ replace before launch
The photos in `assets/img/` are royalty-free stock photography from [Unsplash](https://unsplash.com/license) (free for commercial use). They look real, but they aren't photos of your own work — swap them for your own when you can.

| File | Use | Recommended replacement |
|---|---|---|
| `service-*.jpg` | Service cards | **JPG/WebP**, 1200×900 px (4:3), under ~200 KB each |
| `before.jpg` / `after.jpg` | Comparison slider | Currently a stock photo (after) and an AI-edited dirty version of it (before). Replace with your own photos of the same vehicle, same angle, same size (1600×900 px). |
| `cta-car.jpg` | Final call-to-action | Wide **JPG/WebP**, ~1800×770 px |

To swap an image, either keep the same file name, or update the `src=""` in `index.html` (service images are also listed in `script.js` for the details pop-up).

**Honesty note:** the before/after section is labeled "Demonstration imagery." Once you upload real photos of your own work, you can remove that caption in `index.html` (the `<figcaption class="ba-caption">`) and the label text baked into the demo images.

Stock photo sources with free commercial licenses: Unsplash, Pexels. Always check each photo's license and avoid images showing identifiable logos or plates.

### Social sharing image (optional but recommended)
Add a 1200×630 `assets/img/og-image.jpg`, then add to `<head>` in `index.html`:
```html
<meta property="og:image" content="https://YOUR-DOMAIN/assets/img/og-image.jpg">
```

---

## ⚙️ How the form works
- `index.html` contains `<form name="booking" data-netlify="true" netlify-honeypot="bot-field">` with a hidden `form-name` field. Netlify reads this at deploy time.
- `bot-field` is a hidden honeypot. Bots that fill it are silently discarded.
- `script.js` validates every required field, then POSTs the data to Netlify in the background and shows an on-page confirmation that says the request **isn't a confirmed booking yet**.
- If the network fails, a clear error appears with a click-to-call fallback.
- With JavaScript disabled, the form still submits normally and lands on `success.html`.

## ♿ Performance & accessibility
- Animations use CSS transforms/opacity (GPU-friendly). GSAP drives scroll parallax only.
- If a visitor has **Reduce Motion** turned on, animations, the loader and parallax are disabled and all content shows instantly.
- If the GSAP CDN is unavailable, reveals fall back to IntersectionObserver. If all JavaScript fails, content auto-reveals after 4 seconds.
- Semantic landmarks, one `<h1>`, ordered headings, skip link, labeled form fields, keyboard-operable slider (arrow keys), focus-visible styles, and an accessible popup dialog.
- Images are lazy-loaded below the fold with explicit sizes to avoid layout shift.
