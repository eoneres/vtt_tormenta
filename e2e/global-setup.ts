/**
 * Global E2E Setup
 *
 * Creates authenticated session state once for all tests.
 * Run before test suite; stores cookies/localStorage to e2e/.auth/user.json
 */

import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const BASE_URL = process.env['BASE_URL'] ?? 'http://localhost:3000';
const AUTH_FILE = path.join(__dirname, '.auth', 'user.json');

const E2E_EMAIL    = process.env['E2E_USER_EMAIL']    ?? 'e2e@vtt-test.com';
const E2E_PASSWORD = process.env['E2E_USER_PASSWORD'] ?? 'E2eTestPass123!';
const E2E_USERNAME = process.env['E2E_USER_USERNAME'] ?? 'e2e_test_user';

async function globalSetup(_config: FullConfig): Promise<void> {
  // Ensure auth directory exists
  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Try login first (user may already exist from previous run)
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    const emailField = page.getByLabel(/e-?mail/i);
    await emailField.fill(E2E_EMAIL);
    await page.getByLabel(/senha/i).fill(E2E_PASSWORD);
    await page.getByRole('button', { name: /entrar|login/i }).click();

    try {
      await page.waitForURL(/dashboard|campaigns/, { timeout: 8_000 });
    } catch {
      // Login failed — try to register
      await page.goto(`${BASE_URL}/register`);
      await page.waitForLoadState('networkidle');

      const usernameField = page.getByLabel(/nome de usuário|username/i);
      if (await usernameField.isVisible()) {
        await usernameField.fill(E2E_USERNAME);
      }
      await page.getByLabel(/e-?mail/i).fill(E2E_EMAIL);
      await page.getByLabel(/senha/i).first().fill(E2E_PASSWORD);

      const confirmField = page.getByLabel(/confirmar senha/i);
      if (await confirmField.isVisible()) {
        await confirmField.fill(E2E_PASSWORD);
      }

      await page.getByRole('button', { name: /criar conta|registrar/i }).click();
      await page.waitForURL(/dashboard|campaigns|login/, { timeout: 15_000 });
    }

    // Save auth state
    await page.context().storageState({ path: AUTH_FILE });
    console.log('✅ E2E auth state saved to', AUTH_FILE);
  } catch (err) {
    console.warn('⚠️  E2E global setup warning:', err);
    // Create empty auth state so tests can still run (and fail gracefully)
    fs.writeFileSync(AUTH_FILE, JSON.stringify({ cookies: [], origins: [] }));
  } finally {
    await browser.close();
  }
}

export default globalSetup;
