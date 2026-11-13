# Samarpita Social Foundation Trust — Seva hi Samarpan

Website for **Team Samarpita**, a team of social workers from Odisha who help anyone in need.
People can share their problem through the Contact Us page, and blood donors can register on the Blood Donation page. Registrations and feedback are saved through the site's own API and also reach the team by email.

Hosted on **Vercel** (website + API).

## Pages
- Home
- About Us
- Blood Donation (donor registration, eligibility check, blood group guide)
- Support Us (donate, volunteer, partner)
- Contact Us (problem form that sends an email)
- Privacy Policy and Terms & Conditions (linked from the footer)

## Tech
React + Vite, Tailwind CSS v4, GSAP (ScrollTrigger), Framer Motion, Lenis smooth scroll, Phosphor Icons.
API: Express on Vercel serverless functions, MongoDB Atlas, bcrypt + JWT for the admin login.
Black and green theme with a light/dark mode toggle. Photos are served from ImageKit.

## Run locally
```bash
npm install
npm run dev
```

## Customise
- Contact details, stats, stories and Instagram reels: `src/data/site.js`
- Logo: `public/brand/` (and `public/favicon.png`)
- Photos: upload to the ImageKit folder `samarpita/` and add the file name to `images` in `src/data/site.js`.
- Colours and dark mode: CSS variables at the top of `src/index.css`.
- All forms (contact, blood donor, volunteer, feedback) go to the site's own API. Everything is saved in the database and shown in the admin panel (**Messages**, **Blood donors**, **Feedback** tabs), and the team is emailed when `SMTP_*` is configured (see **Email notifications** below).
- SEO: per-page titles, descriptions and share cards live in each page's `<Seo … />` (see `src/components/Seo.jsx`); defaults, Open Graph tags and the organisation's structured data are in `index.html`; `public/robots.txt` and `public/sitemap.xml` list the pages. Update `siteUrl` in `src/data/site.js`, the sitemap and `index.html` when the custom domain is connected.

## Admin panel (blood donors & feedback)
The admin panel is a separate page: **`/admin`** (`https://samarpita.org/admin`).
It is not linked from the website and is marked `noindex`.

- Sign in with **email + password**
- See every registered blood donor, filter by blood group / district / status, call or WhatsApp them, export CSV
- Mark a donor as **Donated** to create a thank-you card (download as PNG or send on WhatsApp)
- Donors who agreed are shown on the public **Blood Heroes** wall (name, group, district only)
- Read feedback sent from the Contact page and choose which to show on the website
- **Security** tab: change your password

### How it is secured
- The site has its own API (`api/index.js`, an Express app that Vercel runs as a serverless function).
- Passwords are stored only as **bcrypt** hashes (12 rounds). Nobody, including the developer, can read them back.
- A sign-in returns a signed **JWT** in an `httpOnly`, `SameSite=Strict`, `Secure` cookie. Page scripts cannot read it and other websites cannot send it. It expires after 8 hours (`SESSION_HOURS`), and the panel signs itself out after 30 minutes without activity.
- 5 wrong passwords lock the account for 15 minutes; sign-in and public forms are rate limited per IP.
- Mutating requests must come from the site's own origin (CSRF protection), request bodies are validated and size-limited, and admin routes return donor data only to a valid session.
- The admin page is served with a strict Content-Security-Policy, `X-Frame-Options: DENY` and `noindex` (see `vercel.json`).

## Deploy on Vercel
1. Create a free **MongoDB Atlas** cluster (M0), add a database user, allow access from anywhere (Vercel IPs change), and copy the connection string.
2. Import the GitHub repo in Vercel (framework: Vite). Build command `npm run build` and output `dist` are detected automatically.
3. In **Project → Settings → Environment Variables** add (see `.env.example`):
   - `MONGODB_URI` – the Atlas connection string
   - `JWT_SECRET` – a long random string, e.g. `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` – the first admin account. It is created automatically the first time someone signs in. After signing in, change the password from the **Security** tab and remove `ADMIN_PASSWORD` from Vercel.
4. Deploy. Open `/admin` and sign in.

### Email notifications (free, via Gmail)
Messages are always saved for the admin panel. To also get them by email:
1. On the team Gmail account turn on **2-Step Verification**, then open **Google Account → Security → 2-Step Verification → App passwords** and create one for "Samarpita website". Google shows a 16-character password once.
2. Add to Vercel (and `.env` locally): `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER=<the gmail address>`, `SMTP_PASS=<the app password>`, and optionally `MAIL_TO` if notifications should go somewhere else.
3. Redeploy. `GET /api/health` shows `"mail": true` once it is configured. Each problem, volunteer sign-up, donor registration and feedback then arrives as an email with Reply-To set to the sender.

### Managing admins from the terminal
With `MONGODB_URI` in a local `.env`:
```bash
npm run admin -- list
npm run admin -- add someone@example.com "a-strong-password-123"
npm run admin -- password someone@example.com "new-password-456"
npm run admin -- remove someone@example.com
```

### Local development
`npm run dev` serves the website at `http://localhost:5173/` (clean URLs such as `/about`), the admin at `/admin`, and the API at `/api/*`.
Without a `.env`, data is kept **in memory** (lost on restart) and a dev login is printed in the terminal:
`admin@samarpita.local` / `samarpita-dev-1234`. Copy `.env.example` to `.env` to use a real database locally.

## Instagram reels
Add reel links to `reels` in `src/data/site.js`; they appear in the "Seva in action" section on the home page.
