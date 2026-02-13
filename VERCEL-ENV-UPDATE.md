# Update Vercel Environment Variable

## Important: Update VITE_API_URL

The axios configuration has been fixed. Now you need to update the environment variable on Vercel:

**Old Value:** `https://web-production-43d51.up.railway.app`
**New Value:** `https://web-production-43d51.up.railway.app/api`

### Steps:
1. Go to https://vercel.com/dashboard
2. Click on project: **expense-tracker-rho-brown**
3. Click **Settings** → **Environment Variables**
4. Find `VITE_API_URL` and update it to: `https://web-production-43d51.up.railway.app/api`
5. Click **Save**
6. Go to **Deployments** tab
7. Click the **...** menu on the latest deployment
8. Click **Redeploy**

After redeploy, the login should work correctly!
