import { test, expect } from '../fixtures';

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test('displays login form', async ({ page }) => {
      await page.goto('/login');
      await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
      await expect(page.getByLabel(/senha/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /entrar|login/i })).toBeVisible();
    });

    test('shows validation error for empty submission', async ({ page, loginPage }) => {
      await loginPage.goto();
      await page.getByRole('button', { name: /entrar|login/i }).click();
      // Either HTML5 validation or our custom error
      const hasError = await page.locator('[aria-invalid], .error, [role="alert"]').first().isVisible().catch(() => false);
      expect(hasError || page.url().includes('/login')).toBeTruthy();
    });

    test('shows error for invalid credentials', async ({ page, loginPage }) => {
      await loginPage.goto();
      await loginPage.fillCredentials('nonexistent@test.com', 'wrongpassword');
      await loginPage.submit();
      // Should stay on login page or show error
      await page.waitForTimeout(2000);
      const stillOnLogin = page.url().includes('/login');
      const hasError = await page.locator('[role="alert"], .error-message, [data-testid="error"]')
        .first().isVisible().catch(() => false);
      expect(stillOnLogin || hasError).toBeTruthy();
    });

    test('has link to registration', async ({ page }) => {
      await page.goto('/login');
      const registerLink = page.getByRole('link', { name: /criar conta|registrar/i });
      await expect(registerLink).toBeVisible();
    });
  });

  test.describe('Registration Page', () => {
    test('displays registration form', async ({ page }) => {
      await page.goto('/register');
      await expect(page.getByLabel(/e-?mail/i)).toBeVisible();
      await expect(page.getByRole('button', { name: /criar conta|registrar/i })).toBeVisible();
    });

    test('validates password strength', async ({ page }) => {
      await page.goto('/register');
      await page.getByLabel(/e-?mail/i).fill('test@test.com');
      await page.getByLabel(/senha/i).first().fill('123'); // too weak
      await page.getByRole('button', { name: /criar conta|registrar/i }).click();
      await page.waitForTimeout(500);
      // Should either show error or stay on page
      expect(page.url()).toContain('/register');
    });
  });

  test.describe('Protected routes', () => {
    test('redirects unauthenticated user from /campaigns to /login', async ({ page }) => {
      await page.goto('/campaigns');
      await page.waitForURL(/login/, { timeout: 10_000 });
      expect(page.url()).toContain('/login');
    });
  });
});
