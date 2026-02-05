import { test, expect } from '@playwright/test';

test.describe('Navigation and Layout', () => {
  test('should navigate to home page', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveURL(/.*login/);
    
    await expect(page.getByText('¡Bienvenido!')).toBeVisible();
  });

  test('should have correct page title', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page).toHaveTitle(/CareConnect/i);
  });

  test('should be responsive', async ({ page }) => {
    await page.goto('/login');
    
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();
    
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();
    
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });
});
