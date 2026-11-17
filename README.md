# Ansh Raj Developer Portfolio

A modern personal portfolio website built with React, TypeScript, Vite, and Tailwind CSS. The site showcases my profile, skills, projects, certifications, engineering notes, proof snippets, and a simple admin section for managing content.

This project was designed to present my work as a developer in a clean, professional, and portfolio-friendly layout while also giving me a content editor for updating information without editing code.

## Project Overview

This portfolio includes:

- A strong landing page and hero section
- About section with personal summary and profile information
- Skills section with proficiency levels
- Projects section with detailed cards and pages
- Certifications and validation section
- Proofs and technical snippets showcase
- Engineering notes / technical learning content
- Contact section for communication
- Admin login and dashboard to edit portfolio data

## Main Features I Built

### 1. Personal Portfolio Landing Experience
The landing page includes a clean hero section, profile information, and a polished layout that presents my brand and developer identity.

### 2. About and Profile Section
A dedicated profile section communicates my background, current focus, technical interests, and contact information.

### 3. Skills Showcase
The app displays technical skills with categories and percentage-based proficiency, making it easier to visually present capabilities.

### 4. Project Portfolio
Each project is presented with:
- title
- overview
- problem and solution
- technologies used
- features
- screenshots
- key learnings

### 5. Certification and Proof Display
The platform includes sections for certifications, evidence of work, and technical proof items such as code snippets and achievements.

### 6. Engineering Notes and Technical Writing
The portfolio includes notes and articles to share technical knowledge and thought process, helping display both practical and conceptual understanding.

### 7. Admin Dashboard
The admin panel uses server-verified password authentication, a signed HTTP-only session cookie, and server-side authorization for portfolio updates.

### 8. Data Persistence
Published portfolio content is read from Supabase. The browser keeps a local cache for faster initial rendering; admin changes are saved to Supabase before the UI reports success.

### 9. Responsive Design
The app is built to be visually appealing on desktop and mobile screens, using modern UI components and responsive styling.

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Wouter for routing
- React Query
- Lucide icons
- Radix UI primitives
- Supabase PostgreSQL for shared portfolio persistence
- Browser localStorage as a public content cache

## Project Structure

```text
portfolio/
├── src/
│   ├── components/
│   ├── contexts/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── vercel.json
├── .gitignore
├── README.md
└── package-lock.json
```

## Admin Access

The admin route is `/admin/login`. Password verification, session signing, and portfolio writes run in server-side API handlers. The password and session secret must never use a `VITE_` prefix.

### Supabase setup

1. In Supabase SQL Editor, review and run [`supabase/migrations/20261117000000_portfolio_admin.sql`](./supabase/migrations/20261117000000_portfolio_admin.sql). It creates the portfolio content and login rate-limit tables/functions. It is additive and does not modify sprint data.
2. Set these server environment variables locally in `.env.local` and in Vercel **Settings → Environment Variables**:

   ```text
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_SECRET_KEY=your-server-only-secret-key
   ADMIN_PASSWORD=your-unique-password-of-at-least-16-characters
   ADMIN_SESSION_SECRET=at-least-32-random-bytes
   ```

   `SUPABASE_SECRET_KEY`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET` must not have a `VITE_` prefix. Do not use the Supabase publishable key for server database operations. `.env.local` is ignored by Git; restart Vite after changing it. The Vercel values must be added to the environments that will serve the site, then redeployed.
3. Keep the existing sprint tracker variables configured as documented below. The portfolio and tracker share server-side Supabase access but use separate API routes and session cookies.
4. Visit `/admin/login`. The first successful admin session initializes the shared portfolio row from the current browser's cached portfolio data if no row exists. Further changes are persisted remotely and become visible to visitors/devices after refresh.

### 1. Install dependencies

```bash
npm install
```

### 2. Run the app locally

```bash
npm run dev
```

### 3. Build the app for production

```bash
npm run build
```

### 4. Preview production build locally

```bash
npm run serve
```

## Private Engineering Sprint Tracker

The private tracker is available at `/sprint-15`. Its API and database access run server-side; do not add `VITE_` to any Supabase secret or session variable.

### Supabase setup

1. In the Supabase dashboard, open **SQL Editor**, create a new query, paste the contents of [`supabase/migrations/20261116000000_sprint_tracker.sql`](./supabase/migrations/20261116000000_sprint_tracker.sql), and run it. This creates the tracker tables, indexes, rate-limit functions, and RLS policies. The migration must succeed before the tracker can persist data.
2. In **Project Settings → API Keys**, create/rotate a server-only secret key. Do not use the publishable key as the server database credential and do not paste secret keys into source files, commits, or chat.
3. Keep the `.env.local` file in the project root and set:

   ```text
   SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
   SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   SUPABASE_SECRET_KEY=your-rotated-server-secret-key
   SPRINT_ACCESS_PIN=your-private-pin
   SPRINT_SESSION_SECRET=at-least-32-random-bytes
   ```

   `.env.local` is ignored by Git. The Vite development server reads these values for its local server endpoints. Restart it after editing this file. `.env.example` contains placeholders only.

### Vercel setup

In the Vercel project, open **Settings → Environment Variables** and add the same five variables for the environments where the tracker should run. `SUPABASE_SECRET_KEY`, `SPRINT_ACCESS_PIN`, and `SPRINT_SESSION_SECRET` must remain server-only values (never use the `VITE_` prefix). Redeploy after adding or rotating values.

Open `/sprint-15`, unlock with the configured PIN, and verify a saved entry remains after refresh. Test from another device to confirm shared Supabase persistence. Do not treat the tracker as connected until this round trip succeeds.

Rotate the PIN or session secret by changing the corresponding environment variable and restarting/redeploying. Rotating `SPRINT_SESSION_SECRET` invalidates existing sessions. Rotate the Supabase secret in the dashboard and update the environment variable before revoking the old key.

## Deployment Guide for Beginners

### Option 1: Deploy on GitHub

1. Create a new GitHub repository.
2. Open your project folder in terminal.
3. Run:

```bash
git init
git add .
git commit -m "Initial portfolio deployment setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

Replace the URL with your actual GitHub repo link.

### Option 2: Deploy on Vercel

1. Go to https://vercel.com
2. Sign in with your GitHub account.
3. Click "Add New Project".
4. Import the GitHub repository you just pushed.
5. Select the project.
6. Use these settings:

- Framework Preset: Vite
- Build Command: `npm run build`
- Output Directory: `dist/public`
- Root Directory: `./`

7. Click "Deploy".
8. Wait for Vercel to finish the build.
9. Your live site URL will be generated.

## Vercel Configuration Note

This project includes a `vercel.json` file for SPA routing support. This helps route pages correctly on deployment.

## Important Notes

- Public portfolio data is served by a read-only API backed by Supabase. Database writes are restricted to authenticated server-side admin handlers.
- Do not place Supabase secret keys, admin passwords, or session secrets in client-side environment variables or source files.
- The private sprint tracker remains a separate feature with its own migration, API routes, and session configuration.

## What I Learned While Building This Portfolio

This project helped me practice:

- React component architecture
- State and context management
- UI/UX design for a personal brand
- Routing with nested detail pages
- Data modeling for portfolio content
- Responsive frontend design
- Content management patterns
- Deployment preparation for production hosting
- Git and GitHub publishing workflow

## Future Improvements

Possible upgrades for the future:

- Add contact form backend integration
- Add CMS support
- Add dark/light mode customization
- Add analytics and visitor tracking

## Final Note

This portfolio is a strong showcase of my developer identity, technical skills, and project experience. It is designed to be simple, professional, and easy to maintain while also being ready to deploy online.

---

If you want to deploy this project successfully,

1. push it to GitHub
2. import it into Vercel
3. choose Vite as the framework
4. set build to `npm run build`
5. set output to `dist/public`

Then your portfolio will go live.
