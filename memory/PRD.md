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

## Architecture
- **Backend**: FastAPI + MongoDB
- **Frontend**: React + Tailwind CSS + Framer Motion
- **Database**: MongoDB (local or Atlas)
- **Payments**: Stripe Checkout
- **Video**: Mux (placeholder ready)

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
- [x] Stripe payment integration
- [x] Contact form
- [x] Responsive design
- [x] Bosnian language throughout

## What's Been Implemented (January 2025)

### Pages
- Home (Hero, Why Us, Courses, FAQ, Results, Stats, Discord CTA, Support)
- /courses - Course grid with filters
- /courses/:id - Course detail with access control
- /pricing - 3 subscription plans (Monthly €29.99, Yearly €249.99, Lifetime €499.99)
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
- Contact messages viewer
- Site settings (hero, stats, Discord link, etc.)

### API Endpoints
- GET/POST /api/auth/login, /api/auth/register, /api/auth/me
- GET/POST/PUT/DELETE /api/courses, /api/faq, /api/results
- GET/PUT /api/settings
- POST /api/contact
- GET /api/admin/stats, /api/admin/users, /api/admin/messages
- PUT /api/admin/users/:id/subscription
- POST /api/payments/checkout
- GET /api/payments/status/:session_id
- POST /api/webhook/stripe

## Admin Credentials
- Email: admin@serbiana.com
- Password: admin123

## Prioritized Backlog

### P0 (Critical)
- ✅ Basic auth
- ✅ Course display
- ✅ Payment integration
- ✅ Admin panel

### P1 (High)
- [ ] Mux video player integration (need Mux API key)
- [ ] Email notifications (need email service)
- [ ] Image upload to cloud storage

### P2 (Medium)
- [ ] User progress tracking
- [ ] Certificate generation
- [ ] Analytics dashboard

## Next Tasks
1. Add Mux API key and enable video playback
2. Integrate email service for notifications
3. Add image upload functionality
4. Implement user progress tracking
