# AiCoach - Advanced AI Coaching Platform

**AiCoach** is a Next.js-based SaaS platform providing AI-powered assistance with integrated user management, billing, and system analytics.

## 🚀 Features

### 🤖 AI Engine
- **Multi-Provider Support**: Integrated with DeepSeek, OpenAI, and Together AI (Grok).
- **Smart Routing**: Configurable default providers for new users and system widgets.
- **Internal Widget**: Public-facing chat widget with separate billing logic.

### 👥 User Management
- **Role-Based Access**: Standard, Pro, and Exclusive account tiers.
- **Credit System**: Token/Credit-based usage usage tracking.
- **Admin Panel**: User list, profile editing, and manual credit adjustments.
- **Smart Sync**: Seamless onboarding for existing Firebase users (`isNewUser` detection).

### 📊 Analytics & Insights
- **Live Dashboard**: Real-time stats for AI Providers (Requests, Success Rate, Tokens).
- **Data Isolation**: All analytics sourced strictly from `aicoach_transactions`.
- **Visuals**: 3-Card layout for provider health monitoring.

### 📦 System Packages
- **Product Management**: Create and manage credit packages (e.g., "Starter Pack").
- **Purchase Flow**: User-facing "Upgrade" page with simulated purchase transactions.

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS + Lucide React
- **Backend Service**: Firebase Admin SDK (Firestore, Auth)
- **Deployment**: Vercel / Cloudflare (Compatible)

## ⚙️ Setup & Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/zamzuriyaakob/AiCoach.git
    cd AiCoach
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env.local` file in the root directory:
    ```env
    # AI Providers (Server-Side Only)
    DEEPSEEK_API_KEY=your_key_here
    OPENAI_API_KEY=your_key_here
    TOGETHER_API_KEY=your_key_here

    # Firebase Service Account (JSON stringified)
    FIREBASE_SERVICE_ACCOUNT_KEY={"type": "service_account", ...}

    # Public Config
    NEXT_PUBLIC_FIREBASE_API_KEY=...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```
    Access the app at `http://localhost:3000`.

## 📂 Project Structure

- `/src/app/api`: Backend API routes (Admin, User, AI).
- `/src/app/dashboard`: Protected user and admin dashboard pages.
- `/src/components`: Reusable UI components.
- `/src/lib`: Utility functions and Firebase configuration.
- `/src/context`: React Context providers (Auth, Toast).

## 🔒 Security

- **RBAC**: Admin-only API routes protected by custom claims or whitelist checks.
- **API Isolation**: AI Keys remain server-side; clients never see them.
- **Database Isolation**: All AiCoach data lives in `aicoach_*` prefixed collections to avoid conflicts with other apps sharing the Firebase project.

## 📄 License

(C) 2026 Web Kilat Ecosystem. All Rights Reserved.
