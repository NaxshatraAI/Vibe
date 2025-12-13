# Supabase Integration - Internal Server Error Troubleshooting

## Error: "Internal server error" when trying to select Supabase project

If you're seeing "internal server error" in the Supabase Projects connector, follow these steps to diagnose and fix the issue.

### Step 1: Check Your OAuth Configuration

The most common cause is that the Supabase OAuth app isn't properly configured.

1. Go to https://supabase.com/dashboard
2. Click **Settings** (gear icon in bottom left)
3. Click **OAuth Apps**
4. Check if your OAuth app is listed:
   - **Application Name**: Should match your app
   - **Authorized redirect URI**: Should be exactly: `https://trikon-hazel.vercel.app/api/integrations/supabase/callback` (for production)
     - For local development: `http://localhost:3000/api/integrations/supabase/callback`

5. If the redirect URI is wrong, delete the OAuth app and recreate it with the correct URI

### Step 2: Verify Your Environment Variables

The OAuth credentials must be set in your `.env` file:

```bash
SUPABASE_OAUTH_CLIENT_ID=your_client_id
SUPABASE_OAUTH_CLIENT_SECRET=your_client_secret  
SUPABASE_OAUTH_REDIRECT_URI=https://trikon-hazel.vercel.app/api/integrations/supabase/callback
```

To get these:
1. Go to https://supabase.com/dashboard
2. Click **Settings** → **OAuth Apps**
3. Click your OAuth app
4. Copy **Client ID** and **Client Secret**
5. Add them to your `.env` file
6. **Restart your app** for changes to take effect

### Step 3: Check Token Validity

Use the diagnostic endpoint to check if your OAuth token is valid:

```bash
# Replace with your actual auth token
curl -X GET 'http://localhost:3000/api/integrations/supabase/diagnose' \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"
```

Look for:
- `tokenValid: true` - Your token can access Supabase API
- `tokenExpired: false` - Your token hasn't expired
- `selectedProject` - The project you selected

### Step 4: Check Browser Console and Network Tab

1. Open your browser's Developer Tools (F12)
2. Go to **Console** tab
3. Look for error messages starting with `[Supabase...]`
4. Go to **Network** tab
5. Trigger the error again (try selecting the project)
6. Look for the failed request - likely one of these:
   - `/api/integrations/supabase/select` - Project selection failed
   - `/api/integrations/supabase/credentials` - Credentials fetch failed
   - `/api/integrations/supabase/projects` - Projects list failed

7. Click the failed request and check the **Response** tab
8. The error message there will help identify the issue

### Step 5: Common Causes & Solutions

#### "OAuth Token Expired"
**Cause**: Your Supabase OAuth token has expired
**Solution**: 
1. Click "Deselect" in the Supabase connector
2. Click "Reconnect Supabase"
3. Complete OAuth flow again

#### "Failed to fetch API keys (401)"
**Cause**: Your OAuth app isn't configured for management API access
**Solution**:
1. Go to https://supabase.com/dashboard/account/tokens
2. Create a new Personal Access Token (PAT)
3. Use this instead of OAuth (manual setup)

#### "Failed to fetch API keys (403)"
**Cause**: You don't have permission to access this project
**Solution**:
1. Verify you're logged in with the correct Supabase account
2. Make sure your account has access to the project
3. Try with a different Supabase account if you have multiple

#### "Management API not available"
**Cause**: Supabase Management API is down or not accessible
**Solution**:
1. Check Supabase status page: https://status.supabase.com
2. Try again in a few minutes
3. Restart your app

### Step 6: Manual Testing

Test the problematic endpoint directly:

```bash
# Test projects endpoint
curl -X GET 'http://localhost:3000/api/integrations/supabase/projects' \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

# Test credentials endpoint  
curl -X GET 'http://localhost:3000/api/integrations/supabase/credentials' \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN"

# Test select endpoint
curl -X POST 'http://localhost:3000/api/integrations/supabase/select' \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLERK_TOKEN" \
  -d '{"projectId": "your_project_ref", "projectName": "your_project_name"}'
```

### Step 7: Check Server Logs

If running locally with `npm run dev`, check the terminal output for error messages starting with `[Supabase...]`. These logs will show:
- The exact API error
- Which endpoint failed
- Response status codes

### Still Having Issues?

If you've tried all the above:

1. **Reset the connection**:
   - Delete the Integration record from the database
   - Click "Reconnect Supabase" in the UI
   - Complete OAuth flow from scratch

2. **Check Supabase project settings**:
   - Verify project still exists
   - Verify you still have access
   - Check if project is in an active state (not suspended)

3. **Verify your Supabase account**:
   - Try accessing https://supabase.com/dashboard directly
   - Verify you can see your projects
   - Try creating a test project

4. **Check for typos**:
   - Verify environment variable names are exactly correct
   - Verify no extra spaces in credentials
   - Verify redirect URI matches exactly (case-sensitive)

---

## Diagnostic Checklist

- [ ] OAuth app created in Supabase
- [ ] Redirect URI is correct
- [ ] Client ID and Secret are in `.env`
- [ ] App restarted after updating `.env`
- [ ] User is signed in with Clerk
- [ ] Browser DevTools shows no 401/403/500 errors
- [ ] Diagnostic endpoint shows `tokenValid: true`
- [ ] Database integration record exists
- [ ] Supabase project still exists and is active

If all checks pass but you still see the error, the issue is likely with Supabase's OAuth configuration. Contact Supabase support with the error details from your browser's Network tab.
