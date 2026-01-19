# Progress Now - Personal Life Dashboard

A production-grade personal life dashboard web application with secure authentication, structured data storage, analytics, and gamification built with Next.js, Supabase, and TailwindCSS.

## Features

### 🔐 **Authentication System**
- Email + password login
- Magic link authentication
- Protected routes with middleware
- Session persistence
- Secure logout functionality

### 📋 **Core Modules**

#### TODOs Module
- Create, read, update, delete tasks
- Priority levels (low, medium, high)
- Due date tracking
- Recurring tasks support
- XP rewards on completion
- Filter by: All, Today, This Week, Completed

#### Projects Module
- Track long-term projects
- Status tracking (planned, ongoing, completed)
- Description and metadata
- Bonus XP on project completion
- Tags support

#### Research Ideas Module
- Quick idea capture
- Maturity levels (idea, exploring, validating, publishing)
- Kanban-style board view
- Notes and tags

### 🎮 **Gamification Engine**
- **XP System**: Earn experience points by completing tasks and projects
- **Level Progression**: Exponential level curve with visual progress bars
- **Daily Streaks**: Track consecutive days of activity
- **Weekly Productivity Score**: 0-100 score based on weekly performance
- **Achievement Badges**: 12+ unlockable badges for milestones

### 📊 **Dashboard Analytics**
- Real-time XP and level display
- Current and longest streak counters
- Today's task summary
- Weekly productivity score
- Projects overview
- Activity visualizations

### 🎨 **Modern UI/UX**
- Dark mode support with system preference detection
- Responsive design (mobile, tablet, desktop)
- Smooth transitions and animations
- Minimalist SaaS aesthetic
- Built with shadcn/ui components

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **TailwindCSS** - Utility-first CSS
- **shadcn/ui** - High-quality UI components
- **Recharts** - Data visualization (planned)
- **Lucide React** - Icon library

### Backend
- **Supabase** - PostgreSQL database, authentication, and real-time features
- **Row Level Security (RLS)** - Database-level security
- **Server Actions** - Type-safe API routes

### DevOps
- **Vercel** - Hosting and deployment
- **Git** - Version control
- **Environment Variables** - Secure configuration

## Prerequisites

- **Node.js** 18.17 or higher
- **npm** or **pnpm** package manager
- **Supabase account** (free tier available)
- **Git** for version control

## Local Development Setup

### 1. Clone the Repository

```bash
cd /home/lucifer/Documents/Code/progress.now/progress.now
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [https://app.supabase.com](https://app.supabase.com)

2. Get your project credentials:
   - Go to **Project Settings** → **API**
   - Copy your **Project URL**
   - Copy your **anon/public key**
   - Copy your **service_role key** (keep this secure!)

3. Run the database migrations:
   - Go to **SQL Editor** in your Supabase dashboard
   - Copy the contents of `supabase/migrations/001_initial_schema.sql`
   - Run the SQL
   - Copy the contents of `supabase/migrations/002_row_level_security.sql`
   - Run the SQL

4. Enable Email Auth:
   - Go to **Authentication** → **Providers**
   - Enable **Email** provider
   - Configure email templates if desired

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Create Your First Account

1. Navigate to the signup page
2. Create an account with your email
3. Check your email for verification (if enabled)
4. Log in and start using the dashboard!

## Project Structure

```
progress.now/
├── app/
│   ├── auth/              # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── callback/
│   ├── dashboard/         # Main application
│   │   ├── page.tsx       # Dashboard homepage
│   │   ├── todos/         # TODOs module
│   │   ├── projects/      # Projects module
│   │   ├── research/      # Research ideas module
│   │   └── settings/      # Settings page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Layout components
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── actions/           # Server actions
│   │   ├── todos.ts
│   │   ├── projects.ts
│   │   └── research.ts
│   ├── gamification/      # Gamification logic
│   │   ├── xp-calculator.ts
│   │   ├── streak-tracker.ts
│   │   └── badges.ts
│   ├── supabase/          # Supabase clients
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
├── supabase/
│   └── migrations/        # Database migrations
│       ├── 001_initial_schema.sql
│       └── 002_row_level_security.sql
├── middleware.ts          # Auth middleware
├── .env.example          # Environment template
└── package.json
```

## Database Schema

### Tables

1. **users_profile** - Extended user profile data
2. **projects** - Project tracking with status and XP rewards
3. **todos** - Task management with priorities and recurring support
4. **research_ideas** - Research idea tracking with maturity levels
5. **gamification_stats** - User XP, level, and streak data
6. **activity_log** - Activity history for analytics

All tables have Row Level Security enabled to ensure users can only access their own data.

## Scripts

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing (to be implemented)
npm run test:unit    # Run unit tests
npm run test:e2e     # Run E2E tests
npm run test:stress  # Run stress tests
```

## Deployment to Vercel

### 1. Push to GitHub

```bash
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Deploy!

### 3. Update Supabase Auth Settings

1. Go to your Supabase project → **Authentication** → **URL Configuration**
2. Add your Vercel domain to **Site URL** and **Redirect URLs**

## Gamification System

### XP Rewards
- **Low Priority TODO**: 10 XP
- **Medium Priority TODO**: 20 XP
- **High Priority TODO**: 30 XP
- **Project Completion**: 100 XP + 50 XP bonus
- **Daily Streak**: 5 XP
- **Weekly Streak (7 days)**: 25 XP bonus

### Level System
Level calculation uses an exponential curve:
```
level = floor(sqrt(totalXP / 100)) + 1
```

**Level Milestones:**
- Level 1: 0 XP
- Level 2: 400 XP
- Level 5: 2,500 XP
- Level 10: 10,000 XP
- Level 20: 40,000 XP

### Badges
- 🎯 First Steps - Complete your first task
- ✅ Task Master - Complete 10 tasks
- 👑 Productivity King - Complete 100 tasks
- 🔥 Week Warrior - 7-day streak
- ⚡ Unstoppable - 30-day streak
- 🌟 Streak Legend - 100-day streak
- 🚀 Project Starter - Complete first project
- 🏆 Project Master - Complete 10 projects
- 💡 Visionary - Create 25 research ideas
- ⭐ Rising Star - Reach level 5
- 💯 Century Club - Reach level 10
- 💎 Elite - Reach level 20

## Security

- **Row Level Security (RLS)** enabled on all tables
- **Server-side authentication** checks on all actions
- **Environment variables** for sensitive data
- **HTTPS** enforced in production
- **No public data access** - users can only see their own data

## Roadmap

### Phase 1-2: Foundation & Auth ✅
- [x] Next.js setup
- [x] Supabase integration
- [x] Authentication system
- [x] Database schema with RLS

### Phase 3-6: Core Modules ✅
- [x] TODOs module
- [x] Projects module
- [x] Research ideas module
- [x] Dashboard UI

### Phase 7-8: Gamification & Analytics (In Progress)
- [x] XP calculation logic
- [x] Level progression
- [x] Streak tracking
- [x] Badge system
- [ ] Analytics charts (Recharts)
- [ ] Productivity heatmap
- [ ] Activity graphs

### Phase 9: Export & Backup
- [ ] JSON export
- [ ] CSV export
- [ ] Manual backup trigger

### Phase 10: Testing
- [ ] Unit tests (Vitest)
- [ ] Integration tests
- [ ] E2E tests (Playwright)
- [ ] Stress testing

### Phase 11-12: DevOps & Polish
- [x] README documentation
- [x] Environment templates
- [ ] Production build optimization
- [ ] Performance tuning
- [ ] Final security audit

## Contributing

This is a personal project. If you'd like to use it as a template, feel free to fork and customize!

## License

MIT License - feel free to use this project as a template for your own personal dashboard.

## Support

For issues or questions:
1. Check the database migrations are run correctly
2. Verify environment variables are set
3. Check Supabase logs for errors
4. Review RLS policies in Supabase dashboard

## Acknowledgments

- **Next.js** team for the amazing framework
- **Supabase** for the backend infrastructure
- **shadcn** for the beautiful UI components
- **Vercel** for hosting and deployment

---

**Built with ❤️ using Next.js, Supabase, and TailwindCSS**
