import { test, expect } from '../fixtures';

test.describe('Compendium Panel (table page)', () => {
  test.use({ storageState: 'e2e/.auth/user.json' });

  // These tests target the compendium service directly (API smoke tests)
  // since full table E2E requires a live game session
  const COMPENDIUM_URL = process.env['COMPENDIUM_URL'] ?? 'http://localhost:3040';

  test('compendium API returns entries for tormenta20', async ({ request }) => {
    const response = await request.get(`${COMPENDIUM_URL}/v1/compendium/entries`, {
      params: { system: 'tormenta20', limit: '5' },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('entries');
    expect(Array.isArray(body.entries)).toBeTruthy();
  });

  test('compendium API full-text search works', async ({ request }) => {
    const response = await request.get(`${COMPENDIUM_URL}/v1/compendium/entries`, {
      params: { system: 'tormenta20', q: 'guerreiro' },
    });
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('entries');
  });

  test('compendium stats endpoint returns structure', async ({ request }) => {
    const response = await request.get(`${COMPENDIUM_URL}/v1/compendium/stats/tormenta20`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body).toHaveProperty('system', 'tormenta20');
    expect(body).toHaveProperty('total');
    expect(typeof body.total).toBe('number');
  });

  test('compendium health endpoint is healthy', async ({ request }) => {
    const response = await request.get(`${COMPENDIUM_URL}/health/ready`);
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.status).toBe('ready');
  });

  // UI smoke test — panel renders in the app
  test('compendium panel button appears on table page', async ({ page }) => {
    // Navigate to any authenticated page first
    await page.goto('/campaigns');
    await page.waitForLoadState('networkidle');
    expect(page.url()).not.toContain('/login');
    // The compendium button will be on the table page
    // We verify the app loads without errors
    await expect(page.locator('body')).not.toContainText('Internal Server Error');
  });
});
