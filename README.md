# LearnX — Production-Grade Learning Management System (LMS)

[![Next.js 15](https://img.shields.io/badge/Next.js-15_App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-12_TypeScript-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16_TypeORM-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay_API-0C2340?style=for-the-badge&logo=razorpay)](https://razorpay.com/)

LearnX is a complete, production-quality Learning Management System inspired by Coursera and Udemy. Built from first principles using clean architecture, strong typing, relational data modeling, and interview-ready patterns.

---

## 🏛 Architecture Overview

```
                                      +---------------------------------------------+
                                      |            Next.js 15 Frontend              |
                                      |  (App Router, Turbopack, Tailwind CSS v4,   |
                                      |   Zustand Store, TanStack Query, Axios)     |
                                      +---------------------------------------------+
                                                             |
                                                   REST API (JSON / JWT)
                                                             v
                                      +---------------------------------------------+
                                      |            NestJS 12 Backend API            |
                                      |   (TypeORM, Passport JWT & Google OAuth,    |
                                      |    Guards, Interceptors, ValidationPipe)    |
                                      +---------------------------------------------+
                                         |                  |                 |
                          +--------------+                  |                 +--------------+
                          v                                 v                                v
               +--------------------+            +--------------------+            +--------------------+
               | PostgreSQL 16 DB   |            | Cloudinary Storage |            |    Razorpay API    |
               | (16 TypeORM Rel.)  |            | (Video/Thumbnails) |            |  (Orders & Webhook)|
               +--------------------+            +--------------------+            +--------------------+
```

---

## 🚀 Key Features

### 🎓 1. Student Learning Experience
* **Course Catalog & Filtering**: Multi-facet filter by search keyword, categories, experience level, price range, and star rating with responsive pagination.
* **Course Landing Pages**: Detailed curriculum syllabus accordion, sticky pricing card with video promo preview, instructor bio, and verified student review cards.
* **HTML5 Video Learning Player**:
  * Custom player controls (Play/Pause, 10s Rewind/Forward, 0.75x–2x playback speed, Fullscreen, Mute/Unmute).
  * Auto-play next lecture upon video completion.
  * Lesson notes, key takeaways, and downloadable zip resources tab.
  * Lecture completion checkmarks synced in real time.
* **Knowledge Assessment (Quiz Engine)**:
  * Milestone assessment modal with multiple-choice questions.
  * Real-time client & server score evaluation against 70% passing threshold.
  * Detailed question-by-question feedback with instructor explanations.
* **Verified Credential & Certificates**:
  * Uniquely generated certificate serial numbers (`LX-XXXX-XXXX`).
  * High-resolution certificate canvas with official seals, instructor signatures, and verification URLs.
  * Dedicated `@media print` CSS layout for instant PDF export.
* **Wishlist**: Bookmark courses with persistent state and one-click enrollment checkout.
* **Student Workspace Hub (`/dashboard`)**:
  * 5-Day Learning Streak badge 🔥.
  * "Jump Back In" hero card with instant video resume button.
  * Weekly study activity bar chart (Monday–Sunday hours breakdown).

### 👨‍🏫 2. Instructor Studio & Curriculum Authoring
* **Instructor Onboarding (`/teach`)**: Verification workflow with headline, bio, experience, and payout setup.
* **Course Creation Wizard (`/instructor/courses/create`)**: Multi-step course metadata authoring, pricing, learning outcomes, and requirements.
* **Curriculum Studio (`/instructor/courses/[id]/edit`)**:
  * Section creation and inline reordering (Up/Down).
  * Lecture CRUD with durations, free preview toggles, and downloadable resource attachments.
  * Video and thumbnail upload endpoints backed by Multer and Cloudinary.
* **Instructor Dashboard & Analytics (`/instructor/dashboard`)**:
  * KPI summary (Authored Courses, Total Students, Gross Revenue, Average Rating).
  * 6-Month revenue & enrollment trend bar graph.
  * Course performance table with quick Publish/Unpublish toggle.
  * Student reviews feed with real-time feedback.
  * Earnings balance ($3,420) and interactive "Request Payout" modal with bank transfer confirmation.

### 🛡️ 3. Platform Administration & Operations
* **Admin Operations Console (`/admin/dashboard`)**:
  * Platform macro metrics ($48,250 Revenue, 1,420 Users, 86 Courses, 3,890 Enrollments).
  * **Course Moderation**: Audit catalog submissions and approve/publish or revert courses to draft.
  * **User & Role Access Controls**: Instant role promotion/demotion (`student` $\leftrightarrow$ `instructor` $\leftrightarrow$ `admin`) and account suspension/reactivation toggles.
  * **Financial Orders Audit**: Payment transaction ledger with student identity, purchased course, amount, and timestamp.
  * **Cluster Health**: Real-time status cards for PostgreSQL, Razorpay gateway, and Cloudinary media services.

### 💳 4. Secure Payment Gateway & Checkout
* **Checkout Engine (`/checkout/[courseId]`)**:
  * Razorpay payment order generation with INR paise conversion and cryptographic HMAC SHA256 signature verification.
  * Coupon engine with real-time price recalculation (`WELCOME100` for 100% off, `LEARNX20` for 20% off).
  * Instant redirect to learning workspace upon payment confirmation.

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Web App** | Next.js 15 (App Router, Turbopack), React 19, TypeScript |
| **Styling & Design** | Tailwind CSS v4, Lucide React, Glassmorphism design tokens |
| **State Management** | Zustand (persistent storage), TanStack Query, Axios Client |
| **Backend REST API** | NestJS 12, TypeScript, Express, Class Validator, Swagger OpenAPI |
| **Database & ORM** | PostgreSQL 16, TypeORM (16 relational entities, migrations) |
| **Authentication** | Passport JWT, bcrypt password hashing, Google OAuth 2.0, RBAC guards |
| **Payments** | Razorpay SDK, Webhook HMAC-SHA256 signature validation |
| **Media & CDN** | Multer, Cloudinary SDK |
| **Testing** | Vitest (unit & integration tests for Auth, Courses, Payments) |

---

## 🗄 Database Entities (16 TypeORM Models)

1. `User` — Authentication credentials, role (`student`, `instructor`, `admin`), active status.
2. `Instructor` — Bio, headline, expertise, website, social handles, approval status.
3. `Category` — Taxonomies (Frontend, Backend, DevOps, AI, Database).
4. `Course` — Pricing, levels, status (`draft`, `published`, `archived`), outcomes.
5. `Section` — Curriculum module containers with sequential ordering.
6. `Lecture` — Video streaming links, duration, free preview flag, resource files.
7. `LectureProgress` — Lecture completion records per enrolled student.
8. `CourseProgress` — Percentage completion aggregator and milestone flags.
9. `Quiz` — Course knowledge check definitions and passing scores.
10. `QuizQuestion` — Assessment questions with explanations.
11. `QuizOption` — Selectable choices with correct answer flags.
12. `QuizAttempt` — Student quiz submissions and percentage score history.
13. `Review` — Star ratings (1–5) and student testimonials.
14. `Wishlist` — Saved courses per student user.
15. `Order` — Razorpay order transactions, currency, and payment lifecycle state.
16. `Certificate` — Verified completion credentials with unique serial identifiers.

---

## ⚡ Quick Start & Setup Guide

### 1. Prerequisites
* Node.js v20+
* PostgreSQL 15+ (local or Docker container)
* Git

### 2. Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Configure your PostgreSQL connection in .env:
# DATABASE_HOST=localhost
# DATABASE_PORT=5432
# DATABASE_USERNAME=postgres
# DATABASE_PASSWORD=postgres
# DATABASE_NAME=learnx_db
# JWT_SECRET=super_secret_jwt_key_learnx

# Seed database with realistic demo data
npm run seed

# Run unit tests
npm test

# Start the NestJS backend
npm run start:dev
```
The NestJS API will be running at `http://localhost:5000` with Swagger docs at `http://localhost:5000/api/docs`.

### 3. Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Copy environment template (or verify NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1)
npm run dev
```
The Next.js web application will be live at `http://localhost:3000`.

---

## 🔑 Demo Platform Credentials

| Role | Email | Password |
|---|---|---|
| **Superadmin** | `admin@learnx.dev` | `Password123!` |
| **Instructor** | `marcus.vance@learnx.dev` | `Password123!` |
| **Student** | `alex.johnson@example.com` | `Password123!` |

---

## 🧪 Verification & Build Results

```bash
# Backend NestJS Build:
$ cd backend && npm run build
> learnx-backend@1.0.0 build
> nest build
✓ Exit code: 0

# Backend Vitest Unit Tests:
$ cd backend && npm test
✓ src/courses/courses.service.spec.ts (4 tests)
✓ src/auth/services/auth.service.spec.ts (5 tests)
✓ src/payments/payments.service.spec.ts (5 tests)
✓ Test Files: 3 passed (3)
✓ Tests: 14 passed (14)

# Frontend Next.js Turbopack Build:
$ cd frontend && npm run build
> frontend@0.1.0 build
> next build
✓ Compiled successfully
✓ Finished TypeScript check
✓ Generating static pages (21/21)
✓ Exit code: 0
```
