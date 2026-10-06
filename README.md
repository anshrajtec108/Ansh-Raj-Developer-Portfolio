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
I built an admin panel with a basic password-based login. Once authenticated, I can update portfolio information and content in the browser.

### 8. Data Persistence
The portfolio stores content in browser localStorage so updates remain available in the front-end without backend setup.

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
- LocalStorage for data persistence

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

This project includes a simple admin login for managing content.

Demo admin password:

```text
ansh@admin
```

You can access the admin panel through the login route in the app.

## Local Setup

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

- This portfolio works as a front-end project and is perfect for showcasing work online.
- The admin dashboard is simple and intended for project/demo use.
- The site is not connected to a real backend database yet.
- The portfolio data is stored in the browser, so if a user clears browser storage, content may reset to the default seed data.

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

- Add real backend API with database
- Connect admin panel to a secure server
- Add authentication with encrypted passwords
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
