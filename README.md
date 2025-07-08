# Sheet Sync Hub

## 📝 Overview
Sheet Sync Hub is a SaaS feature that connects Google Sheets to HubSpot content (pages, blog posts, redirects, etc.), allowing users to edit, filter, and sync settings in both directions. This project was built as a paid test to evaluate full-stack skills and may become part of a live product.

## 🎯 Features
1. **Authentication**: Log in using Supabase Auth (email or magic link).
2. **Google OAuth**: Connect your Google account and select a Google Sheet to sync with.
3. **HubSpot Token**: Input your HubSpot private app token to connect to the CMS Pages API.
4. **Fetch Published Pages**: Retrieve up to 50 published pages from HubSpot (data is kept in memory, not stored).
5. **Filter Options**: Filter pages by language and domain, and preview the filtered list in a table.
6. **Push to Google Sheet**: Push filtered results into a new tab in the selected Google Sheet (tab is created if missing, with headers: Name, Language, Slug, URL, Last Updated; up to 50 rows).
7. **Store Sync Metadata**: Sync sessions are logged in Supabase with user, sheet, tab, content type, filters, and timestamp.

## 🔐 Auth Configuration
- Uses **Supabase Auth** for session handling, with:
  - Email/password login
  - Magic link login via email
- Supabase's built-in **SMTP sender** (e.g. `noreply@supabase.dev`) is used to send magic links.
- Magic link redirects are handled using:
  - `emailRedirectTo`: `https://sheet-sync-hub-app.vercel.app/auth/callback`
  - Supabase Auth Dashboard → **Site URL**: `https://sheet-sync-hub-app.vercel.app`
  - Supabase Auth Dashboard → **Redirect URLs**:
    ```
    https://sheet-sync-hub-app.vercel.app
    https://sheet-sync-hub-app.vercel.app/auth/callback
    https://sheet-sync-hub-app.vercel.app/auth/login
    ```

## 💾 Tech Stack
- **Frontend**: Next.js, React, TailwindCSS
- **Auth**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **APIs**: HubSpot CMS (Pages endpoint), Google Sheets API
- **Deployment**: Vercel

## ⚙️ Setup Instructions
1. **Clone the repository:**
   ```
   git clone https://github.com/umerhere/sheet-sync-hub.git
   cd sheet-sync-hub
   ```
2. **Install dependencies:**
   ```
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   - Copy `.env.example` to `.env.local` and fill in the required secrets (Supabase, Google, HubSpot, etc).
4. **Run the development server:**
   ```
   npm run dev
   # or
   yarn dev
   ```
5. **Deploy:**
   - Deployed to Vercel 

## 📦 Assumptions
- Users have valid Google and HubSpot accounts.
- Only published HubSpot pages are fetched (up to 50).
- No HubSpot content is stored in Supabase; only sync metadata is stored.
- Google Sheet tab is created if missing; headers are always added for new tabs.

## 🛠 Implementation Notes
- **Supabase Auth** is used for secure authentication and user management.
- **Google OAuth** is implemented for Sheets access, with tokens stored securely in Supabase.
- **HubSpot integration** uses the private app token to fetch CMS pages.
- **Filtering** is performed client-side before syncing to Sheets.
- **Sync sessions** are logged in a `sync_sessions` table for audit and tracking.
- **UI** is built with TailwindCSS for rapid styling and responsiveness.

## 📁 Project Structure
- `app/` — Next.js app routes and API endpoints
- `components/` — Reusable React components
- `lib/` — Utility functions and Supabase client
- `README.md` — Project documentation
- `.env.example` — Example environment variables

## 📄 License
This project is for evaluation purposes and is not licensed for production use unless selected for further development.
