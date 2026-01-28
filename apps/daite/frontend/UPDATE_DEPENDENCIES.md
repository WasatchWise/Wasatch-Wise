# Dependency Update Instructions

## Security Vulnerabilities Fixed

This update addresses critical security vulnerabilities in Next.js (CVE-2025-66478) and other dependencies.

## Steps to Apply Updates

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Remove old lock file and node_modules:**
   ```bash
   rm -rf node_modules package-lock.json
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

4. **Install updated dependencies:**
   ```bash
   # This will install the latest versions matching the ranges in package.json
   npm install
   
   # OR, to get the absolute latest versions (recommended for security):
   npm install next@latest react@latest react-dom@latest eslint-config-next@latest
   ```

5. **Verify the build works:**
   ```bash
   npm run build
   ```

6. **Test locally:**
   ```bash
   npm run dev
   ```

7. **Commit the changes:**
   ```bash
   git add package.json package-lock.json
   git commit -m "Security: Update Next.js and dependencies to patch vulnerabilities"
   git push origin main
   ```

## Updated Packages

- **next**: Updated to ^15.1.6 (includes security patches for CVE-2025-55182, CVE-2025-55183, CVE-2025-55184, CVE-2025-66478)
- **eslint-config-next**: Updated to ^15.1.6 (to match Next.js version)
- **lucide-react**: Updated to ^0.468.0 (latest)
- **tailwindcss**: Updated to ^3.4.17 (latest patch)

## Important Notes

- After updating, if your application was online and unpatched, consider rotating any secrets/API keys
- Monitor the application after deployment to ensure everything works correctly
- Run `npm audit` after installation to verify all vulnerabilities are resolved

