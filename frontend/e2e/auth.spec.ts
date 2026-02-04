import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should display login page', async ({ page }) => {
    await expect(page.getByText('Bienvenido de vuelta')).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(page.getByRole('button', { name: /iniciar sesión/i })).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /iniciar sesión/i });
    await submitButton.click();
    
    const emailInput = page.getByLabel('Correo electrónico');
    await expect(emailInput).toHaveAttribute('required', '');
  });

  test('should navigate to register page', async ({ page }) => {
    const registerLink = page.getByRole('link', { name: /crear una cuenta/i });
    await registerLink.click();
    
    await expect(page).toHaveURL(/.*register/);
  });

  test('should login with test credentials', async ({ page }) => {
    await page.getByLabel('Correo electrónico').fill('familia1@test.com');
    await page.getByLabel('Contraseña').fill('password123');
    
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });

  test('should stay on login page with invalid credentials', async ({ page }) => {
    await page.getByLabel('Correo electrónico').fill('invalid@test.com');
    await page.getByLabel('Contraseña').fill('wrongpassword');
    
    await page.getByRole('button', { name: /iniciar sesión/i }).click();
    
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveURL(/.*login/);
    
    const errorVisible = await page.getByText(/login|error|failed|invalid/i).isVisible().catch(() => false);
    
    expect(page.url()).toContain('/login');
  });
});

test.describe('Register Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display register page', async ({ page }) => {
    await expect(page.getByText('Crear cuenta', { exact: false })).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    const loginLink = page.getByRole('link', { name: /iniciar sesión/i });
    await loginLink.click();
    
    await expect(page).toHaveURL(/.*login/);
  });
});
