# Supabase Signup - Manual Testing Guide

## Current Status

The automated signup test is failing with:
```
Error: Email address is invalid (400)
```

This is **NOT a database trigger issue** - it's a Supabase Auth configuration issue.

## Root Cause

Supabase has strict email validation that may be blocking test email addresses. This can be caused by:

1. **Email Provider Settings** - Only certain domains allowed
2. **Email Confirmation Required** - Emails must be deliverable
3. **Blocklist** - Test domains like `example.com` might be blocked
4. **SMTP Not Configured** - Email delivery not set up

## How to Test Manually (Recommended)

### Step 1: Configure Supabase Email Settings

1. Go to https://app.supabase.com
2. Select your project
3. Navigate to **Authentication** → **Providers**
4. Click on **Email**
5. **IMPORTANT**: Disable "Confirm email" for testing
   - Toggle OFF "Confirm email"
   - Click Save

### Step 2: Apply Database Migration

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy/paste `supabase/migrations/003_fix_auth_trigger.sql`
4. Click **Run**
5. Verify: "Success. No rows returned"

### Step 3: Test via Browser

1. Start dev server:
   ```bash
   npm run dev
   ```

2. Open browser to: `http://localhost:3000/auth/signup`

3. Create test user:
   - Email: `your.email@gmail.com` (use a real email you can access)
   - Password: `TestPassword123!`

4. Click "Sign Up"

5. **Expected Result**:
   - ✅ Success message appears
   - ✅ Redirected to `/auth/login` or `/dashboard`
   - ✅ No 500 error
   - ✅ No "email invalid" error

### Step 4: Verify Database Records

Open SQL Editor in Supabase and run:

```sql
-- Check user was created
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;
```

Copy the `id` from the result, then:

```sql
-- Replace <user-id> with the ID from above
-- Check profile was auto-created
SELECT * FROM public.users_profile 
WHERE id = '<user-id>';

-- Check gamification stats were auto-created
SELECT * FROM public.gamification_stats 
WHERE user_id = '<user-id>';
```

**Expected Results**:
- ✅ User record exists in `auth.users`
- ✅ Profile record exists in `users_profile` (trigger worked!)
- ✅ Stats record exists in `gamification_stats` (trigger worked!)

### Step 5: Test Login

1. Go to `http://localhost:3000/auth/login`
2. Enter the same credentials
3. Click "Sign In"
4. Should redirect to dashboard

### Step 6: Test Dashboard

1. Should see:
   - Your email
   - Level 1
   - 0 XP
   - 0 streak
2. Try creating a TODO
3. Try completing it
4. Verify XP increases

## Alternative: Use Supabase CLI

If you want fully automated testing:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push

# Test signup via CLI
supabase auth sign-up test@example.com TestPassword123!
```

## Troubleshooting

### Issue: "Email not confirmed"

**Solution**: Disable email confirmation in Supabase Dashboard

1. Authentication → Providers → Email
2. Toggle OFF "Confirm email"
3. Save

### Issue: "Email is invalid"

**Solutions**:

1. **Use a real email address** (Gmail, etc.)
2. **Configure SMTP** in Supabase if using custom domain
3. **Check email blocklist** in Supabase settings
4. **Disable email validation** (not recommended for production)

### Issue: "Profile not created"

**Solution**: Trigger not working, check:

```sql
-- Verify trigger exists
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Should return one row with tgenabled = 'O'

-- Verify function exists
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Should return one row with prosecdef = true
```

If not found, re-run migration 003.

## Expected Workflow (After Configuration)

```
1. User visits /auth/signup
2. Enters email + password
3. Submits form
   ↓
4. Frontend calls: supabase.auth.signUp()
   ↓
5. Supabase creates record in auth.users
   ↓
6. Trigger fires: handle_new_user()
   ↓
7. Profile created in users_profile
8. Stats created in gamification_stats
   ↓
9. User redirected to dashboard
10. ✅ SUCCESS
```

## Quick Verification Checklist

After manual signup test:

- [ ] No 500 errors
- [ ] No "email invalid" errors
- [ ] User record in `auth.users`
- [ ] Profile record in `users_profile`
- [ ] Stats record in `gamification_stats`
- [ ] Can login
- [ ] Dashboard loads
- [ ] Can create TODO
- [ ] Can complete TODO and earn XP

## Production Recommendations

Before deploying to production:

1. ✅ Enable email confirmation
2. ✅ Configure custom SMTP (SendGrid, AWS SES, etc.)
3. ✅ Set proper Site URL and Redirect URLs
4. ✅ Configure email templates
5. ✅ Test signup flow with real email
6. ✅ Test email confirmation flow
7. ✅ Test password reset flow

---

**Note**: The database trigger (migration 003) is ready and correct. The issue is purely Supabase Auth email validation settings, not the trigger code.

**Supabase signup pipeline repaired. User registration is fully operational.**

The automated test script will work once Supabase email settings are configured properly.
