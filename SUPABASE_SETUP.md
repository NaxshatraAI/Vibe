# Supabase Integration Setup Guide

This guide will help you set up the Supabase OAuth integration for your application.

## Prerequisites

- A Supabase account (sign up at https://supabase.com)
- Access to your application's environment variables

## Step 1: Create a Supabase OAuth App

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Log in to your account

2. **Access Organization Settings**
   - Click on your organization name in the top left
   - Select "Settings" from the dropdown

3. **Navigate to OAuth Apps**
   - In the left sidebar, find and click "OAuth Apps"
   - Click the "Create OAuth App" button

4. **Configure Your OAuth App**
   - **App Name**: Enter a name for your app (e.g., "My App - Dev" or "My App - Production")
   - **App Description**: (Optional) Add a description
   - **Redirect URI**: Enter the callback URL for your application:
     - **For Local Development**: `http://localhost:3000/api/integrations/supabase/callback`
     - **For Production**: `https://your-domain.com/api/integrations/supabase/callback`
   
   > **Note**: You can create separate OAuth apps for development and production environments

5. **Save and Get Credentials**
   - Click "Create" or "Save"
   - You'll be shown the **Client ID** and **Client Secret**
   - **IMPORTANT**: Copy the Client Secret immediately - it won't be shown again!

## Step 2: Configure Environment Variables

1. **Copy the example file** (if you haven't already):
   ```bash
   cp env.example .env.local
   ```

2. **Add your Supabase OAuth credentials** to `.env.local`:
   ```env
   # Supabase OAuth Configuration
   SUPABASE_OAUTH_CLIENT_ID="your-client-id-here"
   SUPABASE_OAUTH_CLIENT_SECRET="your-client-secret-here"
   SUPABASE_OAUTH_REDIRECT_URI="http://localhost:3000/api/integrations/supabase/callback"
   ```

3. **For Production**: Add the same environment variables to your hosting platform (Vercel, Netlify, etc.):
   - `SUPABASE_OAUTH_CLIENT_ID`
   - `SUPABASE_OAUTH_CLIENT_SECRET`
   - `SUPABASE_OAUTH_REDIRECT_URI` (use your production URL)

## Step 3: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to your project page** where the Supabase integration is available

3. **Click "Connect Supabase Account"**
   - You should be redirected to Supabase's authorization page
   - Authorize the application
   - You'll be redirected back to your app

4. **Verify the connection**:
   - You should see your Supabase projects listed
   - The integration status should show as "Connected"

## Troubleshooting

### Error: "Supabase OAuth is not configured"
- Ensure all environment variables are set correctly
- Restart your development server after adding environment variables
- Check for typos in variable names

### Error: "Failed to exchange code for tokens"
- Verify your Client Secret is correct
- Ensure the Redirect URI in your environment variables exactly matches the one configured in Supabase
- Check that your OAuth app is active in Supabase dashboard

### Error: "Unauthorized" or "Invalid redirect URI"
- The redirect URI must match exactly (including protocol, domain, and path)
- For local development, use `http://localhost:3000` (not `127.0.0.1`)
- Ensure there are no trailing slashes in the URI

### Connection Expired
If you see "Your Supabase connection has expired":
- Click "Connect Supabase Account" again to re-authenticate
- This refreshes your access token

## Security Best Practices

1. **Never commit** your `.env.local` file to version control
2. **Keep your Client Secret secure** - treat it like a password
3. **Use different OAuth apps** for development and production
4. **Rotate your Client Secret** regularly (you can regenerate it in Supabase dashboard)
5. **Use environment-specific redirect URIs** for each environment

## API Endpoints

The integration uses these endpoints:

- `GET /api/integrations/supabase` - Check connection status
- `POST /api/integrations/supabase` - Initiate OAuth flow
- `GET /api/integrations/supabase/callback` - OAuth callback handler
- `GET /api/integrations/supabase/projects` - List user's projects
- `POST /api/integrations/supabase/select` - Select a project

## Additional Resources

- [Supabase OAuth Documentation](https://supabase.com/docs/guides/platform/oauth-apps)
- [Supabase Management API](https://supabase.com/docs/reference/api)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

## Need Help?

If you encounter issues:
1. Check the browser console for error messages
2. Check your server logs for detailed error information
3. Verify all environment variables are set correctly
4. Ensure your Supabase OAuth app is properly configured
