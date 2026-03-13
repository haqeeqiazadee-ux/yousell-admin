# Deployment Instructions

## 1. Push to GitHub

```bash
cd yousell-admin
git remote set-url origin https://github.com/haqeeqiazadee-ux/yousell-admin.git
git push -u origin main --force
```

## 2. Create `.env.local` (already created, but won't be in git)

```bash
cp .env.local.example .env.local
# Edit with your actual values
```

## 3. Deploy to Netlify

### Option A: Link to GitHub (Recommended)
1. Go to https://app.netlify.com
2. Import the `haqeeqiazadee-ux/yousell-admin` repo
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Add environment variables in Netlify UI:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

### Option B: CLI Deploy
```bash
npm install -g netlify-cli
netlify login
netlify link --id inquisitive-cendol-4771eb
netlify deploy --prod --build
```

## 4. Set Supabase Auth Redirect URL

In your Supabase dashboard:
1. Go to Authentication > URL Configuration
2. Add your Netlify URL to "Redirect URLs":
   - `https://your-site.netlify.app/api/auth/callback`
