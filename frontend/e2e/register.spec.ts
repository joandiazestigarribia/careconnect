import { test, expect } from '@playwright/test';

test.describe('Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should display register page with all elements', async ({ page }) => {
    await expect(page.getByText('Crear una cuenta')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Familia Busco cuidador' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cuidador Ofrezco servicios' })).toBeVisible();
    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
    await expect(page.getByLabel('Confirmar')).toBeVisible();
    await expect(page.getByRole('button', { name: /crear cuenta/i })).toBeVisible();
  });

  test('should show error when passwords do not match', async ({ page }) => {
    await page.getByLabel('Correo electrónico').fill('test@example.com');
    await page.getByLabel('Contraseña').fill('password123');
    await page.getByLabel('Confirmar').fill('different123');
    
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    
    await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible();
  });

  test('should show error when password is too short', async ({ page }) => {
    await page.getByLabel('Correo electrónico').fill('test@example.com');
    await page.getByLabel('Contraseña').fill('123');
    await page.getByLabel('Confirmar').fill('123');
    
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    
    await expect(page.getByText(/al menos 6 caracteres/)).toBeVisible();
  });

  test('should allow selecting different roles', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Familia Busco cuidador' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cuidador Ofrezco servicios' })).toBeVisible();
    
    await page.getByRole('button', { name: 'Cuidador Ofrezco servicios' }).click();
    
    await expect(page.getByText('Ofrezco servicios')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: /iniciar sesión/i }).click();
    
    await expect(page).toHaveURL(/.*login/);
    await expect(page.getByText('Bienvenido de vuelta')).toBeVisible();
  });

  test('should complete registration with valid data', async ({ page }) => {
    const uniqueEmail = `test${Date.now()}@example.com`;
    
    await page.getByLabel('Correo electrónico').fill(uniqueEmail);
    await page.getByLabel('Contraseña').fill('password123');
    await page.getByLabel('Confirmar').fill('password123');
    
    await page.getByRole('button', { name: /crear cuenta/i }).click();
    
    await expect(page).toHaveURL('/', { timeout: 5000 });
  });
});
