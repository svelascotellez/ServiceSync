# ServiceSync 🛠️

![Next JS](https://img.shields.io/badge/Next-black?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

ServiceSync is a modern, full-stack field service management application built with **Next.js 16**, **React 19**, and **Prisma**. It is designed to streamline task delegation, worker tracking, and community communication for residential and commercial complexes.

## 🚀 Key Features

*   **Role-Based Access Control:** Tailored experiences for Administrators, Workers, and Residents.
*   **Advanced Task Management:** Create one-off or recurring tasks. Track phases from Pending -> In-Progress -> Completed -> Approved.
*   **Multiple Views:** Visualize operations via Kanban Boards, Calendars, Timelines, or standard Data Tables.
*   **Field Operations:** Workers execute tasks, capture initial/final photographic evidence, and automatically register GPS coordinates (via EXIF metadata or browser Geolocation).
*   **Community Portal:** Residents can view completed tasks, leave star ratings, and interact via photo-enabled task comments.
*   **Workforce Tracking:** Attendance tracking (Check-in/out) and worker specialty grouping.
*   **Bulk Registration:** Excel/CSV upload support for bulk-creating resident accounts.

## 💻 Tech Stack

*   **Frontend & Backend:** Next.js 16 (App Router)
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Authentication:** NextAuth.js (JWT Strategy)
*   **Styling:** Custom CSS with Glassmorphism UI tokens
*   **Deployment:** Railway

## 🛠️ Getting Started (Local Development)

### Prerequisites

*   Node.js (v18+)
*   npm or yarn
*   A PostgreSQL database (Local or Cloud)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/svelascotellez/ServiceSync.git
    cd ServiceSync
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Variables:**
    Create a `.env` file in the root directory and add the following variables:
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/servicesync"
    NEXTAUTH_SECRET="your-super-secret-string-here"
    NEXTAUTH_URL="http://localhost:3001"
    ```

4.  **Database Migration & Seeding:**
    Push the Prisma schema to your database and generate the client. Then, seed the database with the initial Admin account.
    ```bash
    npx prisma db push
    node prisma/seed.js
    ```
    *The default admin credentials created by the seed script are `admin@test.com` / `admin123`.*

5.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3001](http://localhost:3001) in your browser.

## 🏗️ Architecture

The app leverages Next.js Server Components and Server Actions/Route Handlers to securely communicate with the database via Prisma. 

*   `src/app/dashboard/*`: Protected admin routes for workforce management.
*   `src/app/worker/*`: Mobile-first interface for technicians.
*   `src/app/resident/*`: Community feedback and visibility portal.
*   `src/app/api/*`: RESTful JSON endpoints handling complex mutations and EXIF image processing.

## 🔒 License

This project is proprietary and confidential.
