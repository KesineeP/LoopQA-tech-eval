import { Page, Locator, expect } from "@playwright/test";
import { TestDataLoader } from "../data/test-data-loader";

export interface TaskCard {
  title: string;
  assignee: string;
  createdOn: string;
  tags: string[];
  status: string;
}

export class DashboardPage {
  readonly page: Page;
  readonly logoutButton: Locator;
  readonly webAppButton: Locator;
  readonly mobileAppButton: Locator;
  readonly marketingCampaignButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoutButton = page.locator('button:has-text("Logout")');
    this.webAppButton = page.locator('button:has-text("Web Application")');
    this.mobileAppButton = page.locator(
      'button:has-text("Mobile Application")'
    );
    this.marketingCampaignButton = page.locator(
      'button:has-text("Marketing Campaign")'
    );
  }

  async expectDashboardLoaded() {
    await expect(this.webAppButton).toBeVisible();
    await expect(this.mobileAppButton).toBeVisible();
    await expect(this.marketingCampaignButton).toBeVisible();
  }

  async getTaskCardDetails(title: string): Promise<TaskCard | null> {
    // Find the task card container
    const taskCard = this.page.locator(`text=${title}`).first();
    const exists = (await taskCard.count()) > 0;

    if (!exists) {
      return null;
    }

    // Get the parent container
    const cardContainer = taskCard.locator("xpath=..");

    // Extract all details from the card container
    const cardText = (await cardContainer.textContent()) || "";

    // Parse the card text to extract details
    const assignee = this.extractAssignee(cardText);
    const createdOn = this.extractCreatedOn(cardText);
    const tags = this.extractTags(cardText);
    const status = await this.getTaskStatus(title);

    return {
      title,
      assignee,
      createdOn,
      tags,
      status,
    };
  }

  private extractAssignee(cardText: string): string {
    const assignees = TestDataLoader.getAssigneeNames();
    for (const assignee of assignees) {
      if (cardText.includes(assignee)) return assignee;
    }
    return "";
  }

  private extractCreatedOn(cardText: string): string {
    const dateMatch = cardText.match(/\d{1,2}\/\d{1,2}\/\d{4}/);
    return dateMatch ? dateMatch[0] : "";
  }

  private extractTags(cardText: string): string[] {
    const tags: string[] = [];
    const validTags = TestDataLoader.getTagNames();
    for (const tag of validTags) {
      if (cardText.includes(tag)) tags.push(tag);
    }
    return tags;
  }

  async getTaskStatus(title: string): Promise<string> {
    // Check which status column contains this task by looking at the status column text
    const statusColumns = TestDataLoader.getStatusNames();

    for (const status of statusColumns) {
      const statusElement = this.page.locator(`text=${status}`).first();
      const statusContainer = statusElement.locator("xpath=..");
      const statusText = (await statusContainer.textContent()) || "";

      if (statusText.includes(title)) {
        return status;
      }
    }

    return "Unknown";
  }

  async getHeaderTitle(): Promise<string> {
    // Get the main header title (usually h1 or the main title element)
    const headerTitle = this.page.locator("header div div h1").first();
    const titleText = await headerTitle.textContent();
    return titleText?.trim() || "";
  }

  async getProjectNamesFromUI(): Promise<string[]> {
    // Get project names directly from the browser UI
    const projectElements = await this.page
      .locator("nav button h2")
      .allTextContents();
    return projectElements;
  }

  async getTaskTitlesFromUI(): Promise<string[]> {
    // Get all task titles directly from the browser UI
    const taskElements = await this.page.locator("h3").allTextContents();
    return taskElements;
  }

  async getTasksByStatusFromUI(status: string): Promise<string[]> {
    // Get task titles for a specific status directly from the browser UI
    const statusElement = this.page.locator(`text=${status}`).first();
    const statusContainer = statusElement.locator("xpath=..");
    const statusText = (await statusContainer.textContent()) || "";

    // Extract task titles from the status column
    const taskElements = statusContainer.locator("h3");
    const taskCount = await taskElements.count();
    const taskTitles: string[] = [];

    for (let i = 0; i < taskCount; i++) {
      const taskElement = taskElements.nth(i);
      const title = await taskElement.textContent();
      if (title?.trim()) {
        taskTitles.push(title.trim());
      }
    }

    return taskTitles;
  }

  async getStatusElementsFromUI(): Promise<string[]> {
    // Get status names directly from the browser UI
    const statusElements = await this.page
      .locator("h2")
      .filter({ hasText: /To Do|In Progress|Review|Done/ })
      .allTextContents();
    return statusElements
      .map(text => text.trim())
      .filter(text => text.length > 0)
      .map(status => status.replace(/\s*\(\d+\)$/, "")); // Remove count like "(2)" from "To Do (2)"
  }

  async clickProjectButton(projectName: string) {
    // Click on a project button and wait for the page to load
    const projectButton = this.page.locator(
      `button:has-text("${projectName}")`
    );
    await projectButton.click();
    await this.page.waitForLoadState("networkidle");
  }
}
