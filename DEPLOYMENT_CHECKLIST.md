# Progress Now - Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Quality
- [x] Application builds successfully (`npm run build`)
- [x] No TypeScript errors
- [x] ESLint passes
- [x] Unit tests pass (26/26 tests)
- [ ] Integration tests pass
- [ ] E2E tests pass

### ✅ Database
- [x] Database schema defined
- [x] Migration files created
- [x] Row Level Security enabled
- [x] RLS policies tested
- [x] Indexes created for performance
- [x] Triggers implemented (updated_at, user initialization)

### ✅ Authentication
- [x] Email/password login works
- [x] Magic link authentication works
- [x] Signup flow complete
- [x] Session persistence works
- [x] Logout functionality works
- [x] Protected routes middleware active
- [ ] Email templates customized (optional)

### ✅ Security
- [x] Environment variables not committed
- [x] `.env.example` template created
- [x] API keys secured
- [x] RLS enabled on all tables
- [x] Auth middleware protecting routes
- [ ] Rate limiting configured (optional)
- [ ] CORS configured if needed

### ✅ Documentation
- [x] README.md comprehensive
- [x] Setup instructions clear
- [x] Environment variables documented
- [x] Database migration instructions
- [x] Deployment guide included

---

## Supabase Configuration

### 1. Project Setup
- [ ] Supabase project created
- [ ] Project name set
- [ ] Region selected (choose closest to users)

### 2. Database Migrations
- [ ] Run `001_initial_schema.sql` in SQL Editor
- [ ] Run `002_row_level_security.sql` in SQL Editor
- [ ] Verify all tables created
- [ ] Verify RLS policies active

### 3. Authentication Settings
- [ ] Enable Email provider
- [ ] Configure email templates (optional):
  - [ ] Confirmation email
  - [ ] Magic link email
  - [ ] Password reset email
- [ ] Set Site URL (production domain)
- [ ] Add Redirect URLs (production domain + `/auth/callback`)
- [ ] Disable email confirmations for faster testing (optional)

### 4. API Keys
- [ ] Copy Project URL
- [ ] Copy anon/public key
- [ ] Copy service_role key (keep secure!)
- [ ] Store in `.env.local` for local testing
- [ ] Add to Vercel environment variables

---

## Vercel Deployment

### 1. GitHub Repository
- [ ] Create GitHub repository
- [ ] Push code to main branch
```bash
git remote add origin YOUR_REPO_URL
git push -u origin main
```

### 2. Vercel Project Setup
- [ ] Go to [https://vercel.com](https://vercel.com)
- [ ] Click "Import Project"
- [ ] Select GitHub repository
- [ ] Framework preset: Next.js (auto-detected)
- [ ] Root directory: `./` (or adjust if needed)

### 3. Environment Variables
Add these in Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> [!IMPORTANT]
> Make sure to add these to both **Production** and **Preview** environments.

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete (2-3 minutes)
- [ ] Verify deployment success

### 5. Update Supabase URLs
- [ ] Go to Supabase → Authentication → URL Configuration
- [ ] Set **Site URL** to: `https://your-app.vercel.app`
- [ ] Add **Redirect URLs**: `https://your-app.vercel.app/auth/callback`
- [ ] Save changes

---

## Post-Deployment Verification

### Functional Testing
- [ ] Visit production URL
- [ ] Test signup flow
  - [ ] Create new account
  - [ ] Verify email sent (if enabled)
  - [ ] Confirm account
- [ ] Test login flow
  - [ ] Email/password login
  - [ ] Magic link login
- [ ] Test logout
- [ ] Test protected routes redirect when logged out

### Module Testing
- [ ] Create a TODO
  - [ ] Verify XP awarded
  - [ ] Complete TODO
  - [ ] Verify streak updated
- [ ] Create a Project
  - [ ] Update to ongoing
  - [ ] Complete project
  - [ ] Verify bonus XP
- [ ] Create a Research Idea
  - [ ] Move between maturity stages
  - [ ] Verify Kanban board works

### Dashboard Testing
- [ ] View dashboard
  - [ ] Level displays correctly
  - [ ] XP progress bar accurate
  - [ ] Streak counter shows
  - [ ] Weekly score calculates
- [ ] Check today's tasks
- [ ] Verify project overview

### UI/UX Testing
- [ ] Dark mode toggle works
- [ ] Navigation links work
- [ ] Responsive design on mobile
- [ ] Responsive design on tablet
- [ ] All modals/dialogs open correctly
- [ ] Toast notifications appear

### Performance Testing
- [ ] Page load time acceptable (<3s)
- [ ] Lighthouse score >90 (run in DevTools)
- [ ] No console errors
- [ ] No 404 errors
- [ ] No failed API calls

---

## Production Readiness

### Performance Optimization
- [ ] Images optimized (if any)
- [ ] Remove console.logs from production
- [ ] Enable production mode caching
- [ ] Configure CDN for static assets
- [ ] Enable compression

### Monitoring & Analytics
- [ ] Add Vercel Analytics (optional)
- [ ] Add error tracking (Sentry, optional)
- [ ] Monitor Supabase dashboard for:
  - [ ] Database size
  - [ ] API requests
  - [ ] Active users
  - [ ] Error logs

### Backup Strategy
- [ ] Enable Supabase database backups
- [ ] Document recovery procedure
- [ ] Test restore process (optional)

---

## User Acceptance Testing

### User Scenarios
1. **New User Onboarding**
   - [ ] Sign up
   - [ ] Create first TODO
   - [ ] Complete first TODO
   - [ ] See XP reward
   - [ ] Level up to Level 2

2. **Daily Usage**
   - [ ] Log in
   - [ ] View dashboard
   - [ ] Create multiple TODOs
   - [ ] Complete tasks throughout day
   - [ ] Maintain streak

3. **Week-Long Usage**
   - [ ] Log in daily for 7 days
   - [ ] Earn weekly streak bonus
   - [ ] Unlock "Week Warrior" badge
   - [ ] See productivity score

---

## Rollback Plan

If deployment fails or critical bug found:

1. **Immediate:**
   - [ ] Disable new user signups in Supabase
   - [ ] Roll back to previous Vercel deployment
   - [ ] Notify users (if applicable)

2. **Investigation:**
   - [ ] Check Vercel logs
   - [ ] Check Supabase logs
   - [ ] Identify root cause

3. **Fix & Redeploy:**
   - [ ] Apply fix locally
   - [ ] Test thoroughly
   - [ ] Redeploy to production

---

## Success Criteria

> [!NOTE]
> Deployment is successful when:

✅ All authentication flows work  
✅ All CRUD operations functional  
✅ Gamification XP/levels/streaks working  
✅ Dashboard displays real data  
✅ No console errors  
✅ Lighthouse score >90  
✅ Build completes in <3 minutes  
✅ All tests pass  

---

## Next Steps After Deployment

### Phase 1: Monitor
- Watch for errors in first 24 hours
- Monitor user signups
- Check database performance

### Phase 2: Iterate
- Gather user feedback
- Fix any reported bugs
- Implement missing features:
  - Export functionality
  - Analytics charts
  - Enhanced visualizations

### Phase 3: Scale
- Optimize database queries
- Add caching where needed
- Consider Supabase plan upgrade if needed

---

## Contact & Support

**Supabase Dashboard**: [https://app.supabase.com](https://app.supabase.com)  
**Vercel Dashboard**: [https://vercel.com/dashboard](https://vercel.com/dashboard)  
**GitHub Repository**: [Your repo URL]  

**Emergency Contacts:**
- Database issues: Check Supabase status page
- Deployment issues: Check Vercel status page
- Authentication issues: Review Supabase auth logs

---

**Deployment Date**: _____________  
**Deployed By**: _____________  
**Production URL**: _____________  

---

*Last Updated: 2026-01-20*
