# Continental Academy - PRD

## Original Problem Statement
Build Continental Academy - a premium education platform with:
- ALL UI TEXT IN BOSNIAN
- Black background with orange-pink effects
- Modern "Future Design" style
- Multiple pages: Home, Courses, Shop, About, Contact, FAQ, Dashboard, Admin, Auth
- Admin panel to edit everything
- Video courses via Mux
- Stripe for payments
- MongoDB for data
- Docker deployment setup for Hostinger VPS

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Database**: MongoDB
- **Payments**: Stripe Checkout
- **Video**: Mux Player

## What's Been Implemented (January 2025)

### Core Features
- [x] JWT Authentication (login/register)
- [x] Admin panel with full CMS
- [x] Course management (CRUD)
- [x] **Lessons system** - each course has video lessons (Mux)
- [x] **Bundle courses** - combine multiple courses
- [x] **Admin assigns courses** to users manually
- [x] FAQ management
- [x] Results gallery with auto-scrolling carousel
- [x] Site settings management
- [x] User subscription management (admin-only)
- [x] Stripe payments (courses + shop)
- [x] Shop for monetized accounts
- [x] Mux video player on homepage
- [x] Docker deployment setup

### Pages
- Home (Hero, Video, Why Us, Courses, FAQ, Results Carousel, Stats, Support)
- /courses - Course grid
- /courses/:id - Course detail
- /pricing - Subscription plans
- /shop - Monetized accounts marketplace
- /about, /contact, /faq
- /dashboard - User dashboard with lessons
- /admin - Full CMS panel
- /auth/login & /auth/register
- /privacy & /terms

### Admin Panel Tabs
1. **Dashboard** - Stats overview
2. **Korisnici** - User management + Assign courses
3. **Kursevi** - Course CRUD + Bundle support
4. **Lekcije** - Lesson CRUD per course (Mux videos)
5. **FAQ** - FAQ CRUD
6. **Rezultati** - Results CRUD
7. **Shop** - Shop products CRUD
8. **Poruke** - Contact messages
9. **Podešavanja** - Site settings (Hero, Stats, Mux Video ID, Discord link)

### API Endpoints
**Auth:**
- POST /api/auth/register, /api/auth/login, GET /api/auth/me

**Courses & Lessons:**
- GET/POST/PUT/DELETE /api/courses
- GET/POST /api/courses/{id}/lessons
- PUT/DELETE /api/lessons/{id}
- GET /api/user/lessons

**Admin:**
- GET /api/admin/stats, /api/admin/users, /api/admin/messages
- PUT /api/admin/users/{id}/subscription
- POST /api/admin/assign-course
- DELETE /api/admin/remove-course/{user_id}/{course_id}
- GET /api/admin/user-courses/{user_id}

**Content:**
- GET/POST/PUT/DELETE /api/faq, /api/results, /api/shop
- GET/PUT /api/settings

**Payments:**
- POST /api/checkout/course, /api/checkout/shop-product
- GET /api/payments/status/{session_id}
- POST /api/webhook/stripe

### Deployment Files
- `Dockerfile.backend` - FastAPI container
- `Dockerfile.frontend` - React + Nginx container
- `docker-compose.yml` - Full stack orchestration
- `nginx.conf` - Nginx with API proxy
- `DEPLOYMENT.md` - Complete deployment guide for Hostinger VPS

## Admin Credentials
- Email: admin@serbiana.com
- Password: admin123

## Test Results
- Backend: 100% (43/43 tests)
- Frontend: 100%
- Report: /app/test_reports/iteration_3.json

## Prioritized Backlog

### P1 (Next)
- [ ] Replace hero image with custom branding
- [ ] Email notifications for purchases

### P2 (Future)
- [ ] User progress tracking
- [ ] Certificate generation
- [ ] Analytics dashboard
- [ ] Image upload to cloud storage

## Known Minor Issues
- Direct navigation to /dashboard sometimes redirects to login (use menu "Moj Panel" instead)
- Hero image shows placeholder - admin should upload custom image

## Tech Stack Note
Current: React + FastAPI (Python)
User originally requested no Python - may need migration to Node.js if required.
