# Error Prevention & Detection Guide

## 🔍 How to Find Errors

### 1. **Automated Checks (Run Before Commits)**

```bash
# Full health check (recommended before every commit)
npm run check:all

# Individual checks
npm run type-check      # TypeScript errors
npm run lint           # ESLint issues
npm run check:health   # Custom code health check
```

### 2. **Before Deploying**

```bash
# Full CI pipeline
npm run ci

# Build check
npm run build
```

### 3. **Visual Checks**

- **Accessibility**: Use browser DevTools accessibility panel
- **Dark Mode**: Test with browser dark mode extension
- **Mobile**: Test responsive design on different sizes
- **Console**: Check browser console for errors

## 🛡️ Prevention Strategies

### 1. **TypeScript Strict Mode** ✅ (Already Enabled)

Your `tsconfig.json` has `strict: true` - this catches many errors at compile time.

### 2. **ESLint Rules** ✅ (Now Enhanced)

New rules in `.eslintrc.json` catch:
- Missing alt text on images
- Console.logs in production
- Unused variables
- React hooks issues

### 3. **Pre-commit Hooks** (Recommended Setup)

Install husky for automatic pre-commit checks:

```bash
npm install --save-dev husky
npx husky init
npx husky add .husky/pre-commit "npm run check:all"
```

### 4. **Code Health Script** ✅ (New)

The `check-code-health.mjs` script automatically finds:
- Headings without text colors
- Images without alt text
- Links without href
- Console.logs
- TODO comments

## 🚨 Common Issues & How to Prevent

### Issue: Invisible Headings
**Problem**: Headings without explicit text colors
**Prevention**: 
- Always add `text-white` on dark backgrounds
- Always add `text-gray-900` on light backgrounds
- Use gradients: `bg-clip-text text-transparent`

**Check**: `npm run check:health`

### Issue: Missing Alt Text
**Problem**: Images without alt attributes
**Prevention**: 
- Always include `alt` prop
- Use `SafeImage` component which requires alt

**Check**: ESLint + `check:health`

### Issue: TypeScript Errors
**Problem**: Type mismatches, missing types
**Prevention**: 
- Run `npm run type-check` before commits
- Fix all TypeScript errors immediately

**Check**: `npm run type-check`

### Issue: Console Logs
**Problem**: Debug logs in production
**Prevention**: 
- Use `logger.ts` utility instead
- Gate with `process.env.NODE_ENV === 'development'`

**Check**: ESLint + `check:health`

### Issue: Accessibility
**Problem**: Missing ARIA labels, keyboard navigation
**Prevention**: 
- Use semantic HTML
- Test with keyboard navigation
- Run Playwright accessibility tests

**Check**: `npm run test:e2e` (accessibility suite)

## 📋 Pre-Deployment Checklist

Before telling marketing "we're ready":

```bash
# 1. Run all checks
npm run check:all

# 2. Build and verify
npm run build

# 3. Run tests
npm run test:all

# 4. Manual spot checks:
# - [ ] Homepage loads
# - [ ] TripKits page works
# - [ ] Checkout flow works
# - [ ] No console errors
# - [ ] Headings visible
# - [ ] Mobile responsive
# - [ ] Dark mode works (if applicable)
```

## 🎯 Quick Fix Commands

```bash
# Fix all auto-fixable ESLint issues
npm run lint:fix

# Check for specific issues
npm run check:health | grep "invisible"
npm run check:health | grep "alt"
npm run check:health | grep "console"

# Type check specific file
npx tsc --noEmit src/app/tripkits/page.tsx
```

## 🔄 Continuous Improvement

### Weekly
- Run `npm run check:health` and fix all issues
- Review Sentry error logs
- Check browser console on live site

### Before Features
- Run checks before starting
- Write tests for new features
- Update type definitions

### After Features
- Run full check suite
- Test manually
- Deploy to staging first

## 🚀 CI/CD Integration

Add to your GitHub Actions or Vercel build:

```yaml
- name: Run checks
  run: npm run check:all
  
- name: Build
  run: npm run build
  
- name: Test
  run: npm run test:all
```

## 📊 Monitoring

- **Sentry**: Already configured for runtime errors
- **Vercel Analytics**: Performance monitoring
- **Browser DevTools**: Console errors
- **Code Health Script**: Static analysis

---

**Remember**: It's better to catch errors early than fix them in production! 🛡️

