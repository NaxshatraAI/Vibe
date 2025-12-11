# Supabase Integration - Quick Start Testing Guide

## 🚀 5-Minute Setup & Test

### Prerequisites
- ✅ Node.js 18+ installed
- ✅ Supabase account at https://supabase.com
- ✅ This Vibe app running locally

---

## Step 1: Supabase Project Setup (2 min)

### Create Supabase Project
1. Go to https://dashboard.supabase.com
2. Click "New Project"
3. Fill in:
   - **Name**: `vibe-test` (or any name)
   - **Database Password**: Save this somewhere safe
   - **Region**: Choose closest to you
4. Click "Create new project"
5. Wait for it to finish (~2 min)

### Enable OAuth
1. In Supabase dashboard, go to **Settings** → **OAuth Providers**
2. Select **GitHub** (or Google)
3. Go to GitHub Developer Settings and create a new OAuth app:
   - **Authorization callback URL**: `http://localhost:3000/api/integrations/supabase/callback`
4. Copy **Client ID** and **Client Secret**
5. Paste into Supabase OAuth provider fields
6. Click "Save"

### Get Project Reference
1. Go to **Settings** → **General**
2. Copy your **Project Ref** (looks like: `abcdefgh`)
3. Copy your **Project URL** (looks like: `https://abcdefgh.supabase.co`)

---

## Step 2: Configure Vibe App (1 min)

### Update Environment Variables
Edit `.env.local` in your Vibe project:

```bash
# Add these (replace with your values)
SUPABASE_OAUTH_CLIENT_ID=your_github_client_id
SUPABASE_OAUTH_CLIENT_SECRET=your_github_client_secret
```

### Restart Dev Server
```bash
npm run dev
```

---

## Step 3: Test the Integration (2 min)

### Sign In
1. Open http://localhost:3000
2. Sign in with Clerk
3. Go to Projects page

### Connect Supabase
1. Click "Connect Supabase"
2. Click "Sign in with GitHub"
3. Select your Supabase project
4. Click "Connect"

### Verify Credentials
1. Click "Show Env" on the project card
2. You should see:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
3. Try Copy buttons - they should copy to clipboard

### Test Database Query
If your Supabase project has a `users` table:

```bash
curl -X POST 'http://localhost:3000/api/integrations/supabase/query' \
  -H 'Content-Type: application/json' \
  -d '{
    "operation": "query",
    "table": "users",
    "select": "*"
  }'
```

Should return: `{"data": [...]}` or `{"data": []}`

---

## ✅ Success Indicators

- [ ] Supabase project created successfully
- [ ] OAuth configured in Supabase
- [ ] Vibe app running without errors
- [ ] Can sign in to Vibe
- [ ] Can connect Supabase project
- [ ] Credentials show correctly
- [ ] Copy buttons work
- [ ] Database query returns data/empty array
- [ ] No 404 or 500 errors

---

## 🐛 Troubleshooting

### "Connection refused" when clicking Connect
- Ensure dev server is running: `npm run dev`
- Check that Supabase OAuth redirect URL is correct
- Verify environment variables are set

### "Credentials endpoint returned empty"
- Check that Supabase OAuth token was saved
- Verify in database that Integration record has `accessToken`
- Check Supabase OAuth is enabled for your project

### "Query returned 404"
- Verify table exists in Supabase
- Check Supabase project is selected
- Ensure credentials are showing in UI

### "Query returned 500"
- Check server logs for error message
- Verify service role key is valid
- Ensure Supabase project still exists

---

## 📝 Next: Test AI Code Generation

Once basic integration works:

1. Create a new Vibe project
2. Ask AI to generate code that uses the database
3. Download the generated app
4. Look for these files:
   - ✅ `src/lib/supabase-utils.ts`
   - ✅ `.env.local` with `SUPABASE_URL` and `SUPABASE_ANON_KEY`
5. Install and run the generated app
6. Database queries should work immediately

---

## 📚 Files to Check

If something doesn't work, check these files:

| Issue | File | Lines |
|-------|------|-------|
| AI prompt wrong | `src/prompt.ts` | 53-127 |
| Query detector broken | `src/inngest/db-query-handler.ts` | 19, 30, 159 |
| Templates missing | `src/lib/download-utils.ts` | 76-136, 298-350 |
| Endpoints missing | `src/app/api/integrations/supabase/` | All files |

---

## 🎯 Expected Architecture

```
User Action:
  1. Click "Connect Supabase" button
  2. OAuth login
  3. Select project
     ↓
Backend:
  1. Fetch credentials via management API
  2. Store in database
     ↓
Frontend:
  1. Show credentials with copy buttons
     ↓
AI Generated App:
  1. Fetch credentials from /api/integrations/supabase/credentials
  2. Execute queries via /api/integrations/supabase/query
     ↓
Database:
  1. Supabase receives queries
  2. Returns data
```

---

## 💡 Tips

- **Test credentials are working**: Copy `SUPABASE_URL` and `SUPABASE_ANON_KEY` into `.env.local` of any Next.js app
- **Query format**: `{ operation, table, select, filters, data, returning }`
- **Security**: Anon key is safe in browser, service role key never exposed
- **Errors**: Check browser console AND server logs for detailed errors

---

## 📞 Quick Reference

### Important URLs
- Vibe app: http://localhost:3000
- Supabase dashboard: https://dashboard.supabase.com
- Supabase docs: https://supabase.com/docs

### Key Endpoints
- POST `/api/integrations/supabase/credentials` - Get credentials
- POST `/api/integrations/supabase/query` - Execute database query
- POST `/api/integrations/supabase/select` - Select a project

### Environment Variables
- `SUPABASE_OAUTH_CLIENT_ID` - From Supabase OAuth provider
- `SUPABASE_OAUTH_CLIENT_SECRET` - From Supabase OAuth provider

---

**Ready to test?** Start with Step 1 above! 🚀

If anything doesn't work, check [GAPS_FOUND_AND_FIXED.md](GAPS_FOUND_AND_FIXED.md) for detailed troubleshooting.
