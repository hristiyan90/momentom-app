# Fix: "supabaseKey is required" Error

## Problem
The diagnostic page shows: `Caught error: supabaseKey is required.`

This means Next.js isn't loading your `.env.local` file properly.

## Solution: Restart Dev Server Properly

### Step 1: Stop the Current Server
In your terminal where the dev server is running, press:
```
Ctrl + C
```

### Step 2: Verify Environment Variables Exist
```bash
cat .env.local | grep SUPABASE
```

You should see:
```
NEXT_PUBLIC_SUPABASE_URL=https://xgegukbclypvohdrwufa.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Step 3: Clear Next.js Cache
```bash
rm -rf .next
```

### Step 4: Start Fresh
```bash
npm run dev
```

### Step 5: Test Again
Visit: `http://localhost:3000/gap2-test`

---

## Expected Result After Restart

The diagnostic page should show:

**If logged in:**
```
Status: Session found!

Session Info:
{
  "email": "your@email.com",
  "hasRefreshToken": true,
  "minutesLeft": 55
}
```

**If NOT logged in:**
```
Status: No active session

Session Info:
{
  "message": "Not logged in"
}
```

Either way, you should NOT see the "supabaseKey is required" error anymore.

---

## Why This Happens

Next.js loads environment variables when the dev server **starts**, not when files change. If:
- The server started before `.env.local` existed
- The server was started in a different terminal
- There was a caching issue

Then it won't have the environment variables, even though the file exists.

**Solution:** Always restart the dev server after changing `.env.local`

---

## Quick Commands (All in One)

```bash
# Stop server (Ctrl+C), then run:
rm -rf .next && npm run dev
```

Then visit: `http://localhost:3000/gap2-test`

---

Let me know what you see after restarting! 🚀
