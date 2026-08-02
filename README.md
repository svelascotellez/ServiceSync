# ServiceSync 🛠️ (Puerto Aventuras Field Service Management)

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Railway](https://img.shields.io/badge/Railway-0B0D0E?style=for-the-badge&logo=railway&logoColor=white)

ServiceSync is a modern, full-stack field service management application built with **Next.js 16**, **React 19**, **Prisma**, and a native **Web Crypto API Authentication Engine**. Designed specifically for luxury resort and residential communities such as **Puerto Aventuras**, it streamlines task delegation, workforce attendance, GPS-verified photo evidence, and multi-role operations.

---

## 🌐 Live Production
- **Production URL:** [https://servicesync-production.up.railway.app](https://servicesync-production.up.railway.app)
- **Deployment Platform:** Railway.app continuous deployment pipeline

---

## 🚀 Key Features

* **Native Web Crypto Authentication Engine:**
  * High-speed, lightweight JWT token signing and verification (`servicesync_token`) built with native `crypto.subtle` (HMAC SHA-256).
  * HTTP/2 RFC 7540 compliant single-header Set-Cookie formatting designed specifically for proxy environments like Railway Hikari.
* **4 Independent User Roles:**
  * 🛡️ **Administrators:** Full system control, workforce oversight, system settings, worker type configuration, and executive reports.
  * 👔 **Supervisors:** Independent management dashboard (`/supervisor`) to create, edit, assign, approve, or cancel tasks, and supervise daily attendance.
  * 👷 **Workers:** Mobile-first interface (`/worker`) with multi-view task management (Kanban, List, Calendar), daily attendance check-in/out with selfie & GPS metadata.
  * 🏡 **Residents:** Portal (`/resident`) for creating and tracking maintenance service requests.
* **Advanced Multi-View Task Management:**
  * Track task states: `Pending` ➔ `In-Progress` ➔ `Completed` (Review) ➔ `Approved`.
  * Visualizations: **Kanban Boards**, **Interactive Calendars** (centered on today in Cancún local time), **Detailed Lists**, and **Excel-like Filterable Data Tables**.
* **GPS & EXIF Evidence Verification:**
  * Workers capture start and finish photos.
  * Automatic EXIF metadata parsing (`exifr`) retrieves exact GPS coordinates (`latitude`, `longitude`) and original timestamp, falling back to HTML5 Geolocation API.
* **Cancún / Quintana Roo Timezone Support (UTC-5):**
  * All dates, timestamps, shift closures, and calendars run natively under `America/Cancun` time zone without UTC offset shifts.
* **Excel Data Processing & Reporting:**
  * Bulk import of workforce and resident accounts from `.xlsx` spreadsheets.
  * One-click downloadable Excel reports for task histories and attendance logs.

---

## 💻 Tech Stack

* **Frontend & Backend:** Next.js 16 (App Router + Turbopack), React 19
* **Database:** PostgreSQL (Railway)
* **ORM:** Prisma ORM
* **Authentication Engine:** Web Crypto API (`crypto.subtle` HMAC SHA-256)
* **Image EXIF Processing:** `exifr`
* **Data Import/Export:** XLSX (SheetJS)
* **Styling:** Custom CSS with Glassmorphism UI tokens, HSL color palette, and Luxury Nautical theme (`#081C2C` Navy, `#C5A059` Gold)
* **Deployment:** Railway.app

---

## 🛠️ Getting Started (Local Development)

### Prerequisites
* Node.js (v18+)
* npm
* A PostgreSQL database (Local or Cloud)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/svelascotellez/ServiceSync.git
   cd ServiceSync
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/servicesync"
   NEXTAUTH_SECRET="puerto-aventuras-servicesync-secret-key-2026"
   ```

4. **Database Setup & Seeding:**
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏗️ Project Structure

* `src/lib/auth.ts`: Native Web Crypto JWT signing, verification, and `getServerSession` helper.
* `src/app/api/auth/login/route.ts`: Dual-mode login API supporting JSON & Form POSTs with HTTP/2 proxy safe 200 OK auto-redirects.
* `src/app/dashboard/*`: Protected administrator routes.
* `src/app/supervisor/*`: Protected field supervisor routes.
* `src/app/worker/*`: Mobile-first technician interface.
* `src/app/resident/*`: Residential service request portal.
* `src/lib/dateUtils.ts`: Cancún timezone (`America/Cancun`) date and calendar utilities.
* `src/lib/exportExcel.ts`: Excel export helper functions.

---

## 🔒 License

This project is proprietary software for Puerto Aventuras Field Service Management.
