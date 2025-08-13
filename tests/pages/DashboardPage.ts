import { Page, Locator, expect } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly projectCards: Locator;
  readonly taskCards: Locator;
  readonly logoutButton: Locator;
  readonly statusColumns: Locator;

  constructor(page: Page) {
    this.page = page;
    this.projectCards = page.locator(
      'button:has-text("Web Application"), button:has-text("Mobile Application"), button:has-text("Marketing Campaign")'
    );
    this.taskCards = page.locator(
      "text=Implement user authentication, text=Fix navigation bug, text=Design system updates, text=API integration, text=Update documentation"
    );
    this.logoutButton = page.locator('button:has-text("Logout")');
    this.statusColumns = page.locator(
      "text=To Do, text=In Progress, text=Review, text=Done"
    );
  }

  async expectDashboardLoaded() {
    // Wait for dashboard content to load
    await this.page.waitForLoadState("networkidle");

    // Check if we can see project names - use first() to avoid strict mode violation
    await expect(
      this.page.locator("text=Web Application").first()
    ).toBeVisible();
    await expect(
      this.page.locator("text=Mobile Application").first()
    ).toBeVisible();
    await expect(
      this.page.locator("text=Marketing Campaign").first()
    ).toBeVisible();
  }

  async getProjectNames(): Promise<string[]> {
    const projectElements = this.page.locator(
      'button:has-text("Web Application"), button:has-text("Mobile Application"), button:has-text("Marketing Campaign")'
    );
    const projectTexts = await projectElements.allTextContents();
    return projectTexts.map(text => {
      // Extract just the project name from the button text
      if (text.includes("Web Application")) return "Web Application";
      if (text.includes("Mobile Application")) return "Mobile Application";
      if (text.includes("Marketing Campaign")) return "Marketing Campaign";
      return text;
    });
  }

  async getTaskCardsByStatus(status: string): Promise<Locator[]> {
    const statusColumn = this.page.locator(`text=${status}`).first();
    const taskCards = statusColumn
      .locator("xpath=..")
      .locator(
        "text=Implement user authentication, text=Fix navigation bug, text=Design system updates, text=API integration, text=Update documentation"
      );
    return await taskCards.all();
  }

  async getTaskDetails(taskTitle: string) {
    const taskCard = this.page.locator(`text=${taskTitle}`).first();
    const parentCard = taskCard.locator("xpath=..");

    return {
      title: await taskCard.textContent(),
      priority: await parentCard
        .locator("text=High Priority, text=Medium Priority, text=Low Priority")
        .textContent(),
      assignee: await parentCard
        .locator(
          "text=Sarah Chen, text=John Smith, text=Emma Wilson, text=Mike Johnson, text=Lisa Brown"
        )
        .textContent(),
      dueDate: await parentCard
        .locator("text=/\\d{1,2}\\/\\d{1,2}\\/\\d{4}/")
        .textContent(),
      tags: await parentCard
        .locator("text=Feature, text=Bug, text=Design")
        .allTextContents(),
    };
  }

  async logout() {
    await this.logoutButton.click();
    await this.page.waitForLoadState("networkidle");
  }

  async expectLogoutSuccessful() {
    // Should redirect to login page
    await expect(this.page.locator('input[type="password"]')).toBeVisible();
  }
}
