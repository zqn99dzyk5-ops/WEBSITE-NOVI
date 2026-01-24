# Continental Academy - PRD

## Original Problem Statement
Build Continental Academy - a premium education platform with:
- ALL UI TEXT IN BOSNIAN
- Black background with orange-pink effects
- Modern "Future Design" style
- Glassmorphism effects
- Responsive (PC + Mobile)
- Multiple pages: Home, Courses, Pricing, About, Contact, FAQ, Dashboard, Admin, Auth, Legal
- Users cannot cancel subscriptions - admin only
- Admin panel to edit everything from navbar to footer
- Video courses via Mux
- Stripe for payments
- MongoDB for data
- Docker deployment setup for Hostinger VPS

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Database**: MongoDB (local or Atlas)
- **Payments**: Stripe Checkout
- **Video**: Mux Player (admin-editable from Settings)

## User Personas
1. **Student**: Young people wanting to learn online earning skills
2. **Admin**: Platform manager who controls content, users, subscriptions

## Core Requirements
- [x] JWT Authentication (login/register)
- [x] Admin panel with full CMS
- [x] Course management (CRUD)
- [x] FAQ management
- [x] Results gallery
- [x] Site settings management
- [x] User subscription management (admin-only cancellation)
- [x] Stripe payment integration for courses
- [x] Stripe payment integration for shop products
- [x] Contact form
- [x] Responsive design
- [x] Bosnian language throughout
- [x] Mux video player on homepage
- [x] Docker deployment setup

## What's Been Implemented (January 2025)

### Pages
- Home (Hero, Why Us, Courses, FAQ, Results, Stats, Discord CTA, Support, Mux Video)
- /courses - Course grid with filters
- /courses/:id - Course detail with access control
- /pricing - 3 subscription plans (Monthly €29.99, Yearly €249.99, Lifetime €499.99)
- /shop - Monetized accounts marketplace with Stripe checkout
- /about - About page
- /contact - Contact form
- /faq - FAQ page
- /dashboard - User dashboard
- /admin - Full CMS panel
- /auth/login & /auth/register
- /privacy & /terms

### Admin Features
- Dashboard with stats (users, subscriptions, courses, payments)
- User management (view, activate/deactivate subscriptions)
- Course CRUD
- FAQ CRUD
- Results CRUD
- Shop Products CRUD
- Contact messages viewer
- Site settings (hero, stats, Discord link, Mux Video ID, etc.)

### API Endpoints
- GET/POST /api/auth/login, /api/auth/register, /api/auth/me
- GET/POST/PUT/DELETE /api/courses, /api/faq, /api/results, /api/shop
- GET/PUT /api/settings
- POST /api/contact
- GET /api/admin/stats, /api/admin/users, /api/admin/messages
- PUT /api/admin/users/:id/subscription
- POST /api/payments/checkout, /api/payments/course
- POST /api/checkout/shop-product (NEW)
- GET /api/payments/status/:session_id
- POST /api/webhook/stripe

### Deployment Files Created
- `Dockerfile.backend` - FastAPI backend container
- `Dockerfile.frontend` - React frontend with Nginx
- `docker-compose.yml` - Full stack orchestration
- `nginx.conf` - Nginx configuration with API proxy
- `.env.example` - Environment variables template
- `DEPLOYMENT.md` - Detailed deployment instructions

## Admin Credentials
- Email: admin@serbiana.com
- Password: admin123

## Prioritized Backlog

### P0 (Critical) - COMPLETED
- ✅ Basic auth
- ✅ Course display
- ✅ Payment integration (courses + shop)
- ✅ Admin panel
- ✅ Docker deployment setup

### P1 (High)
- ✅ Mux video player integration (ready - needs Mux ID from admin)
- [ ] Email notifications (need email service)
- [ ] Image upload to cloud storage

### P2 (Medium)
- [ ] User progress tracking
- [ ] Certificate generation
- [ ] Analytics dashboard

## Tech Stack Note
The user originally requested Next.js with no Python. Current implementation uses:
- React (not Next.js)
- FastAPI (Python)

If user insists on no Python, backend migration to Express.js would be required.

## Test Results
- Backend: 100% (24/24 tests passed)
- Frontend: 100%
- Test report: /app/test_reports/iteration_2.json
