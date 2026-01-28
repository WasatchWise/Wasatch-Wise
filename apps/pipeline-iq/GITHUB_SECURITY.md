# GitHub Security & Deployment Checklist

## 🔒 Security First - Critical Items

### ✅ BEFORE Your First Git Commit

**STOP! Have you completed these steps?**

- [ ] `.env.local` is in `.gitignore`
- [ ] `.env.example` exists (with placeholder values only)
- [ ] No real API keys in any committed files
- [ ] No passwords in source code
- [ ] Service role keys are NOT in code

---

## 📋 Pre-Commit Security Checklist

### Run this command to check for secrets:

```bash
# Search for potential secrets
grep -r "sk-" . --exclude-dir={node_modules,.next,.git}
grep -r "eyJhbG" . --exclude-dir={node_modules,.next,.git}
grep -r "AKIA" . --exclude-dir={node_modules,.next,.git}
grep -r "@getgrooven.com" . --exclude-dir={node_modules,.next,.git}
```

### Verify `.env.local` is ignored:

```bash
# This should return nothing (file is ignored)
git status | grep ".env.local"

# This should show .env.local is ignored
git check-ignore .env.local
```

---

## 🚀 Initial Git Setup

### 1. Initialize Repository (Already Done)

```bash
cd /Users/johnlyman/Desktop/groove
git init
```

### 2. Review What Will Be Committed

```bash
# Check git status
git status

# Review files to be committed
git ls-files

# Check for any .env files
git ls-files | grep env
```

### 3. Stage Safe Files Only

```bash
# Add all safe files
git add .

# BUT first verify .env.local is NOT staged
git status | grep ".env"

# If .env.local appears, remove it immediately
git reset .env.local
```

### 4. First Commit

```bash
git commit -m "Initial commit: GrooveLeads Pro MVP

- Next.js 14 app with TypeScript
- Supabase integration
- Project pipeline management
- Scoring algorithm
- Dashboard and analytics
- Premium features with billing tiers
- Secure environment variable setup"
```

---

## 🌐 GitHub Repository Setup

### 1. Create GitHub Repository

Go to GitHub and create a new repository:
- Repository name: `grooveleads-pro` or `groove`
- Visibility: **Private** (recommended)
- Do NOT initialize with README (you already have one)

### 2. Add Remote and Push

```bash
# Add GitHub remote
git remote add origin https://github.com/YOUR_USERNAME/grooveleads-pro.git

# Or with SSH
git remote add origin git@github.com:YOUR_USERNAME/grooveleads-pro.git

# Push to GitHub
git branch -M main
git push -u origin main
```

---

## 🔐 GitHub Repository Security Settings

### After Creating Repository:

1. **Go to Settings → Secrets and Variables → Actions**
2. **Add Repository Secrets:**

   Add these as GitHub Secrets (for CI/CD):
   ```
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   SUPABASE_SERVICE_ROLE_KEY
   OPENAI_API_KEY
   GOOGLE_PLACES_API_KEY
   STRIPE_SECRET_KEY
   SENDGRID_API_KEY
   ```

3. **Enable Branch Protection (Recommended):**
   - Settings → Branches → Add branch protection rule
   - Branch name pattern: `main`
   - Enable:
     - ✅ Require pull request reviews before merging
     - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date before merging

---

## 🚨 Emergency: Secrets Were Committed!

### If you accidentally committed secrets:

**DON'T PANIC - Follow these steps:**

#### 1. Remove from current commit (if not pushed yet):

```bash
# Remove the file from git
git rm --cached .env.local

# Amend the commit
git commit --amend --no-edit

# Verify it's gone
git show HEAD
```

#### 2. If already pushed to GitHub:

```bash
# Remove from history using filter-branch
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env.local" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to rewrite history
git push origin --force --all
git push origin --force --tags
```

#### 3. Rotate ALL compromised secrets immediately:

- **Supabase:** Generate new service role key in dashboard
- **OpenAI:** Create new API key and delete old one
- **Stripe:** Roll your API keys
- **SendGrid:** Regenerate API key
- **Google Cloud:** Create new credentials
- **All Passwords:** Change them immediately

#### 4. Use BFG Repo-Cleaner (Alternative Method):

```bash
# Install BFG
brew install bfg

# Clean repository
bfg --delete-files .env.local
bfg --delete-files '*.env'

# Clean the git history
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push
git push --force
```

---

## 📂 Files That SHOULD Be Committed

### ✅ Safe to commit:

- `README.md` - Project documentation
- `.env.example` - Template with placeholders
- `.gitignore` - Ignore patterns
- `package.json` - Dependencies
- `package-lock.json` - Locked dependencies
- `tsconfig.json` - TypeScript config
- `next.config.js` - Next.js config
- `tailwind.config.ts` - Tailwind config
- All source code in `app/`, `components/`, `lib/`, `types/`
- Supabase migrations in `supabase/migrations/`
- Documentation files (*.md)

### ❌ NEVER commit:

- `.env` or `.env.local` - Contains real secrets
- `node_modules/` - Dependencies (huge)
- `.next/` - Build artifacts
- `screenshots/` - Scraper screenshots
- Any file with real API keys
- Any file with passwords
- Service role keys
- Stripe secret keys
- Database connection strings with passwords

---

## 🔍 Audit Git History

### Check for accidentally committed secrets:

```bash
# Search entire git history for patterns
git log -p | grep -i "sk-"
git log -p | grep -i "password"
git log -p | grep -i "api.key"
git log -p | grep -i "secret"

# Use git-secrets tool
brew install git-secrets
git secrets --install
git secrets --register-aws
git secrets --scan-history
```

---

## 🤖 Automated Secret Scanning

### GitHub Secret Scanning (Automatic)

GitHub automatically scans for known secret patterns and will alert you.

### Add Pre-Commit Hook

Create `.git/hooks/pre-commit`:

```bash
#!/bin/bash

# Check for common secret patterns
if git diff --cached | grep -qE '(sk-[a-zA-Z0-9]{48}|eyJhbG[a-zA-Z0-9_-]{40,})'; then
  echo "❌ ERROR: Potential secret detected in commit!"
  echo "Please review your changes and remove any API keys or secrets."
  exit 1
fi

# Check if .env.local is being committed
if git diff --cached --name-only | grep -q ".env.local"; then
  echo "❌ ERROR: .env.local should not be committed!"
  exit 1
fi

echo "✅ Pre-commit checks passed"
```

Make it executable:

```bash
chmod +x .git/hooks/pre-commit
```

---

## 📦 Deployment Environments

### Vercel (Recommended for Next.js)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   # Or for production
   sasquatch --prod
   ```

3. **Set Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add ALL variables from `.env.local`
   - Set for Production, Preview, and Development as needed

### Environment Variables in Vercel:

Add these in Vercel dashboard:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ORGANIZATION_ID`
- `OPENAI_API_KEY`
- `GOOGLE_PLACES_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `SENDGRID_API_KEY`
- etc.

---

## 🔄 Ongoing Maintenance

### Regular Security Checks:

```bash
# Weekly: Check for secrets in new commits
git log --since="1 week ago" -p | grep -i "sk-"
git log --since="1 week ago" -p | grep -i "key"

# Monthly: Audit dependencies for vulnerabilities
npm audit
npm audit fix

# Quarterly: Review and rotate API keys
# - Create new keys
# - Update in production
# - Delete old keys
```

---

## 📝 GitHub Actions CI/CD (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Type check
        run: npm run type-check
        
      - name: Lint
        run: npm run lint
        
      - name: Build
        run: npm run build
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.NEXT_PUBLIC_SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.NEXT_PUBLIC_SUPABASE_ANON_KEY }}
```

---

## ✅ Final Security Checklist

Before pushing to GitHub:

- [ ] `.gitignore` includes `.env.local`
- [ ] `.env.example` exists with placeholder values
- [ ] No real API keys in source code
- [ ] No passwords in source code
- [ ] No service role keys in source code
- [ ] Supabase migrations don't contain sensitive data
- [ ] README doesn't contain real URLs or keys
- [ ] All secrets are in environment variables
- [ ] GitHub repository is set to Private
- [ ] Branch protection is enabled
- [ ] GitHub Secrets are configured
- [ ] Pre-commit hooks are installed

---

## 📞 Emergency Contacts

**If secrets are exposed:**

1. **Immediately rotate all affected credentials**
2. **Contact the service providers:**
   - Supabase: support@supabase.io
   - OpenAI: support@openai.com
   - Stripe: support@stripe.com
   - SendGrid: support@sendgrid.com

3. **Document the incident**
4. **Review access logs for unauthorized usage**

---

## 📚 Additional Resources

- [GitHub Security Best Practices](https://docs.github.com/en/code-security)
- [Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
- [About secret scanning](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Last Updated:** October 31, 2025  
**Status:** Ready for secure deployment

