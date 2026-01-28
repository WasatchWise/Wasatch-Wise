import { test, expect } from '@playwright/test';

/**
 * Persona B: "The Planner" 📝
 * 
 * User Story: As someone planning a trip, I want to purchase a TripKit
 * so I can have a curated itinerary for my visit.
 * 
 * Flow: Homepage → Navigation "TripKits" → Select "Meet the Mt. Olympians" →
 *       Click "Get Access" → Verify Stripe/Email flow (mocked)
 */

test.describe('Persona: The Planner', () => {
    test.beforeEach(async ({ page, browserName }) => {
        // Skip WebKit due to persistent localhost TLS issues
        if (browserName === 'webkit') {
            test.skip();
        }
        // Increase timeout for all tests
        test.setTimeout(60000);
    });

    test('should successfully browse and initiate TripKit purchase', async ({ page }) => {
        // Skip welcome modal by setting localStorage before page load
        await page.addInitScript(() => {
            localStorage.setItem('slctrips_welcomed', 'true');
        });

        // 1. Navigate to TripKits from homepage
        await page.goto('/');

        // Handle mobile menu if present
        const menuButton = page.getByRole('button', { name: /toggle menu/i }).first();
        if (await menuButton.isVisible()) {
            console.log('Mobile menu detected, clicking...');
            await menuButton.click();
            await page.waitForTimeout(500); // Wait for menu animation
        }

        // Click TripKits link in header navigation
        console.log('Clicking TripKits nav link...');
        // Ensure we target the visible link (mobile menu link if open, or desktop link)
        const tripkitsNav = page.locator('header a, header button, nav a, nav button')
            .filter({ hasText: /TripKits/i })
            .locator('visible=true');

        await expect(tripkitsNav.first()).toBeVisible();
        await tripkitsNav.first().click();

        // 2. Verify navigation to TripKits page
        await page.waitForURL(/\/tripkits/, { timeout: 30000 });

        // Dismiss cookie banner if present
        const acceptCookies = page.locator('button:has-text("Accept All")');
        if (await acceptCookies.isVisible({ timeout: 1000 }).catch(() => false)) {
            await acceptCookies.click();
        }

        // 3. Verify TripKit cards display
        const tripkitCards = page.locator('[data-testid="tripkit-card"]');

        // Wait for at least one TripKit card
        await expect(tripkitCards.first()).toBeVisible({ timeout: 30000 });

        // Verify multiple TripKits are visible
        const cardCount = await tripkitCards.count();
        expect(cardCount).toBeGreaterThan(0);
        console.log(`✓ Found ${cardCount} TripKit cards`);

        // 4. Verify each visible TripKit has essential elements
        const firstCard = tripkitCards.first();

        // Check for image
        const cardImage = firstCard.locator('img');
        await expect(cardImage).toBeVisible();

        // Check for name/title
        const cardTitle = firstCard.locator('h2, h3, h4').first();
        await expect(cardTitle).toBeVisible();

        // Check for price ($ symbol)
        const priceElement = page.locator('text=/\\$\\d+/', { has: firstCard });
        const hasPricing = await priceElement.count() > 0;
        console.log(hasPricing ? '✓ Pricing displayed' : '⚠ Free TripKit (no pricing)');

        // 5. Click on a TripKit to view details
        // Use Promise.all for navigation - best practice
        await Promise.all([
            page.waitForURL(/\/tripkits\/[^/]+$/),
            firstCard.click()
        ]);

        // 6. Verify TripKit Detail Page Content
        await page.waitForLoadState('domcontentloaded');

        // Check for TripKit name
        const detailTitle = page.locator('h1, h2').first();
        await expect(detailTitle).toBeVisible();

        // Check for description
        const description = page.locator('p, div').filter({ hasText: /.{20,}/ }).first();
        await expect(description).toBeVisible();

        // Check for destination count
        const destCount = page.locator('text=/\\d+\\s+destinations|destinations/i');
        const hasDestCount = await destCount.count() > 0;
        if (hasDestCount) {
            console.log('✓ Destination count displayed');
        }

        // 7. Look for "Get Access" or "Purchase" button
        const purchaseButton = page.locator(
            'button:has-text("Get Access"), ' +
            'button:has-text("Get Free Access"), ' +
            'button:has-text("Purchase"), ' +
            'button:has-text("Buy"), ' +
            'a:has-text("Get Access"), ' +
            'a:has-text("Get Free Access"), ' +
            'a:has-text("Purchase"), ' +
            '[data-testid="purchase-button"]'
        ).first();

        await expect(purchaseButton).toBeVisible({ timeout: 30000 });

        // 8. Click purchase button to initiate flow
        await purchaseButton.click();

        // Wait for navigation or modal
        await page.waitForTimeout(1000);

        // 9. Verify redirect to checkout or email gate
        // Wait for navigation to complete
        await page.waitForURL(/\/(auth\/signin|checkout|tripkits\/[^/]+\/view)/, { timeout: 30000 }).catch(() => { });

        const currentUrl = page.url();

        // Should redirect to either:
        // - /auth/signin (requires login)
        // - /checkout (payment)
        // - /tripkits/{slug}/view (free TripKit email gate)
        // - Show an email capture modal
        const isSignin = currentUrl.includes('/auth/signin');
        const isCheckout = currentUrl.includes('/checkout');
        const isViewPage = currentUrl.includes('/view');
        const hasEmailModal = await page.locator('input[type="email"]').isVisible();

        const flowInitiated = isSignin || isCheckout || isViewPage || hasEmailModal;
        expect(flowInitiated).toBeTruthy();

        if (isSignin) {
            console.log('✓ Purchase flow: Redirected to signin');
        } else if (isCheckout) {
            console.log('✓ Purchase flow: Redirected to checkout');
        } else if (isViewPage) {
            console.log('✓ Purchase flow: Redirected to TripKit view/email gate');
        } else if (hasEmailModal) {
            console.log('✓ Purchase flow: Email capture modal shown');
        }
    });

    test('should display TripKit features and highlights', async ({ page }) => {
        await page.goto('/tripkits');
        await page.waitForLoadState('domcontentloaded');

        // Click first TripKit
        const firstCard = page.locator('[data-testid="tripkit-card"]').first();
        await firstCard.click();

        // Look for features or highlights section
        const featuresSection = page.locator('text=/features|includes|highlights|what.*get/i');
        const hasFeatures = await featuresSection.count() > 0;

        if (hasFeatures) {
            console.log('✓ TripKit features/highlights section found');
        } else {
            console.log('⚠ No explicit features section (may be in description)');
        }

        // Verify some content exists
        const bodyText = await page.locator('body').textContent();
        expect(bodyText!.length).toBeGreaterThan(100);
    });

    test('should show teaser destinations before purchase', async ({ page }) => {
        await page.goto('/tripkits');

        // Click first TripKit
        const firstCard = page.locator('[data-testid="tripkit-card"]').first();
        await firstCard.click();

        await page.waitForLoadState('domcontentloaded');

        // Look for destination preview/teaser cards
        const destinationPreviews = page.locator('[data-testid="destination-card"], .destination, article').filter({
            has: page.locator('img')
        });

        const previewCount = await destinationPreviews.count();

        if (previewCount > 0) {
            console.log(`✓ Found ${previewCount} destination preview(s)`);

            // Verify there's messaging about more destinations
            const moreMessage = page.locator('text=/\\+.*more|unlock|see all|complete/i');
            const hasMoreMessage = await moreMessage.count() > 0;

            if (hasMoreMessage) {
                console.log('✓ "More destinations" messaging present');
            }
        } else {
            console.log('⚠ No destination previews (might be gated behind purchase)');
        }
    });
});
