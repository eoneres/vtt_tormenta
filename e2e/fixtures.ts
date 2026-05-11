import { test as base, expect, Page } from '@playwright/test';

// ─── Test data ────────────────────────────────────────────────────────────────

export const TEST_USER = {
  email: `e2e_${Date.now()}@vtt-test.com`,
  password: 'TestPass123!',
  username: `e2e_user_${Date.now()}`,
};

export const TEST_CAMPAIGN = {
  name: `E2E Campaign ${Date.now()}`,
  system: 'tormenta20',
  description: 'Auto-generated E2E test campaign',
};

// ─── Page Objects ─────────────────────────────────────────────────────────────

export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');
  }

  async fillCredentials(email: string, password: string) {
    await this.page.getByLabel(/e-?mail/i).fill(email);
    await this.page.getByLabel(/senha/i).fill(password);
  }

  async submit() {
    await this.page.getByRole('button', { name: /entrar|login/i }).click();
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillCredentials(email, password);
    await this.submit();
    await this.page.waitForURL(/dashboard|campaigns/, { timeout: 10_000 });
  }
}

export class RegisterPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/register');
    await this.page.waitForLoadState('networkidle');
  }

  async register(opts: { email: string; password: string; username: string }) {
    await this.goto();
    await this.page.getByLabel(/nome de usuário|username/i).fill(opts.username);
    await this.page.getByLabel(/e-?mail/i).fill(opts.email);
    await this.page.getByLabel(/senha/i).first().fill(opts.password);
    await this.page.getByLabel(/confirmar senha/i).fill(opts.password);
    await this.page.getByRole('button', { name: /criar conta|registrar/i }).click();
    await this.page.waitForURL(/dashboard|campaigns|login/, { timeout: 15_000 });
  }
}

export class CampaignsPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/campaigns');
    await this.page.waitForLoadState('networkidle');
  }

  async createCampaign(name: string, system = 'tormenta20') {
    await this.page.getByRole('button', { name: /nova campanha|criar/i }).click();
    await this.page.getByLabel(/nome/i).fill(name);
    // Select system if dropdown exists
    const systemSelect = this.page.getByLabel(/sistema/i);
    if (await systemSelect.isVisible()) {
      await systemSelect.selectOption(system);
    }
    await this.page.getByRole('button', { name: /criar|salvar|confirmar/i }).click();
    await this.page.waitForTimeout(1000);
  }

  async getCampaignCards() {
    return this.page.locator('[data-testid="campaign-card"]').all();
  }
}

export class TablePage {
  constructor(private readonly page: Page) {}

  async waitForCanvasReady() {
    await this.page.waitForSelector('canvas', { timeout: 15_000 });
    await this.page.waitForTimeout(1000); // PixiJS init
  }

  async openPanel(panel: 'chat' | 'initiative' | 'sheet' | 'compendium') {
    const labels: Record<string, string> = {
      chat: 'Chat',
      initiative: 'Iniciativa',
      sheet: 'Ficha',
      compendium: 'Compêndio',
    };
    await this.page.getByRole('button', { name: labels[panel]! }).click();
    await this.page.waitForTimeout(300);
  }

  async searchCompendium(query: string) {
    await this.openPanel('compendium');
    await this.page.getByPlaceholder(/buscar no compêndio/i).fill(query);
    await this.page.waitForTimeout(500); // debounce
  }

  async sendChatMessage(message: string) {
    await this.openPanel('chat');
    const input = this.page.getByPlaceholder(/mensagem|enviar/i);
    await input.fill(message);
    await input.press('Enter');
    await this.page.waitForTimeout(200);
  }

  async selectTool(toolLabel: string) {
    await this.page.getByTitle(toolLabel).click();
  }
}

// ─── Custom fixture ───────────────────────────────────────────────────────────

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  campaignsPage: CampaignsPage;
  tablePage: TablePage;
  authenticatedPage: Page;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  registerPage: async ({ page }, use) => {
    await use(new RegisterPage(page));
  },
  campaignsPage: async ({ page }, use) => {
    await use(new CampaignsPage(page));
  },
  tablePage: async ({ page }, use) => {
    await use(new TablePage(page));
  },
  // Pre-authenticated page using stored state
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      storageState: 'e2e/.auth/user.json',
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect };
