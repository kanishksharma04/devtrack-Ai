<div align="center">
  <img src="public/logo.png" alt="DevTrack AI Logo" width="120" />

  <h1 align="center">DevTrack AI</h1>

  <p align="center">
    <strong>An AI-powered Career Coach & Portfolio Analyzer for Modern Developers.</strong>
  </p>

  <p align="center">
    <a href="https://devtrack-ai-seven.vercel.app">View Live Demo</a>
    ·
    <a href="https://github.com/kanishksharma04/devtrack-Ai/issues">Report Bug</a>
    ·
    <a href="https://github.com/kanishksharma04/devtrack-Ai/issues">Request Feature</a>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Prisma-3982CE?style=flat-square&logo=Prisma&logoColor=white" alt="Prisma" />
    <img src="https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel" alt="Vercel" />
  </p>
</div>

<br />

## 🌟 Overview

**DevTrack AI** is a premium, ultra-modern SaaS platform that syncs directly with your GitHub profile to provide intelligent analytics, automated code audits, and a personalized career progression roadmap. Designed with an aesthetic inspired by Linear and Vercel, it offers an enterprise-grade experience for developers looking to track their growth.

## ✨ Features

- **🧠 AI Code Audits:** Google Gemini analyzes your repositories for code quality, performance structure, documentation, and readability—giving you actionable feedback to improve.
- **📊 Interactive Analytics:** Explore deep-dive coding statistics, commit velocities, and language focus breakdowns, all synced automatically from your GitHub history.
- **🗺️ Career Roadmap:** Map out your strengths, weaknesses, and skill gaps to senior engineering levels and receive customized steps to boost your career.
- **🔐 Seamless Onboarding:** Securely authenticate with your GitHub account using NextAuth.
- **💎 Premium Flat UI:** A stunning, meticulously crafted dark mode interface featuring Inter typography, flat styling, and a clean, distraction-free environment.

## 🚀 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database ORM:** [Prisma](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/) (GitHub Provider)
- **AI Integration:** Google Gemini API
- **Icons:** Lucide React & React Icons
- **Deployment:** Vercel

## ⚙️ Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

- Node.js (v18+)
- PostgreSQL Database (e.g., Supabase, Neon, or local)
- GitHub OAuth Application Credentials
- Google Gemini API Key

### Installation

1. **Clone the repository**
   ```sh
   git clone https://github.com/kanishksharma04/devtrack-Ai.git
   cd devtrack-ai
   ```

2. **Install dependencies**
   ```sh
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your keys:
   ```env
   # Database (Prisma)
   DATABASE_URL="your_postgresql_database_url"

   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your_nextauth_secret"

   # GitHub OAuth
   GITHUB_CLIENT_ID="your_github_client_id"
   GITHUB_CLIENT_SECRET="your_github_client_secret"

   # Gemini API
   GEMINI_API_KEY="your_gemini_api_key"
   ```

4. **Initialize the Database**
   ```sh
   npx prisma generate
   npx prisma db push
   ```

5. **Run the Development Server**
   ```sh
   npm run dev
   ```

6. **Open in Browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Design Philosophy

DevTrack AI was built with a strict "Premium Minimalism" design ethos:
- Complete removal of unnecessary gradients, glows, and glassmorphism.
- A controlled color palette (`#090909`, `#111111`, `#151515`).
- Precise typography using Inter.
- Subtle `#10B981` (Emerald) highlights to guide user attention.

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Designed and built for elite developers.</p>
</div>
