import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly signinButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.locator(
      'input[type="text"], input[name*="username"], input[placeholder*="username" i]'
    );
    this.passwordInput = page.locator('input[type="password"]');
    this.signinButton = page.locator(
      'button[type="submit"], button:has-text("Sign in")'
    );
    this.errorMessage = page.locator("div > div > form > div", {
      hasText: "Invalid username or password",
    });
  }

  async goto() {
    await this.page.goto("/");
    await this.page.waitForLoadState("networkidle");
  }

  async login(username: string, password: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signinButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async expectLoginFormVisible() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.signinButton).toBeVisible();
  }

  async expectErrorMessageVisible() {
    await expect(this.errorMessage).toBeVisible();
  }
}
