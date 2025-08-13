import { Page, Locator, expect } from "@playwright/test";
import { TestDataLoader } from "../data/test-data-loader";

export interface TaskCard {
  title: string;
  priority: string;
  assignee: string;
  dueDate: string;
  tags: string[];
  status: string;
}

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
      const projectNames = TestDataLoader.getProjectNames();
      for (const projectName of projectNames) {
        if (text.includes(projectName)) return projectName;
      }
      return text;
    });
  }

  // Enhanced card functionality from CardPage
  async getAllTaskCards(): Promise<TaskCard[]> {
    const taskCards: TaskCard[] = [];

    // Get all task titles from test data
    const taskTitles = TestDataLoader.getTaskTitles();

    for (const title of taskTitles) {
      const taskCard = await this.getTaskCardDetails(title);
      if (taskCard) {
        taskCards.push(taskCard);
      }
    }

    return taskCards;
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
    const priority = this.extractPriority(cardText);
    const assignee = this.extractAssignee(cardText);
    const dueDate = this.extractDueDate(cardText);
    const tags = this.extractTags(cardText);
    const status = await this.getTaskStatus(title);

    return {
      title,
      priority,
      assignee,
      dueDate,
      tags,
      status,
    };
  }

  private extractPriority(cardText: string): string {
    const priorities = TestDataLoader.getPriorityNames();
    for (const priority of priorities) {
      if (cardText.includes(priority)) return priority;
    }
    return "";
  }

  private extractAssignee(cardText: string): string {
    const assignees = TestDataLoader.getAssigneeNames();
    for (const assignee of assignees) {
      if (cardText.includes(assignee)) return assignee;
    }
    return "";
  }

  private extractDueDate(cardText: string): string {
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

  async getTasksByStatus(status: string): Promise<TaskCard[]> {
    const tasks: TaskCard[] = [];
    const taskTitles = TestDataLoader.getTaskTitles();

    for (const title of taskTitles) {
      const taskCard = await this.getTaskCardDetails(title);
      if (taskCard && taskCard.status === status) {
        tasks.push(taskCard);
      }
    }

    return tasks;
  }

  async getTasksByTag(tag: string): Promise<TaskCard[]> {
    const allTasks = await this.getAllTaskCards();
    return allTasks.filter(task => task.tags.includes(tag));
  }

  async getTasksByAssignee(assignee: string): Promise<TaskCard[]> {
    const allTasks = await this.getAllTaskCards();
    return allTasks.filter(task => task.assignee === assignee);
  }

  async expectTaskCardVisible(title: string) {
    await expect(this.page.locator(`text=${title}`).first()).toBeVisible();
  }

  async expectTaskCardDetails(
    title: string,
    expectedDetails: Partial<TaskCard>
  ) {
    const taskCard = await this.getTaskCardDetails(title);

    if (!taskCard) {
      throw new Error(`Task card with title "${title}" not found`);
    }

    if (expectedDetails.priority) {
      expect(taskCard.priority).toBe(expectedDetails.priority);
    }

    if (expectedDetails.assignee) {
      expect(taskCard.assignee).toBe(expectedDetails.assignee);
    }

    if (expectedDetails.status) {
      expect(taskCard.status).toBe(expectedDetails.status);
    }

    if (expectedDetails.tags) {
      expect(taskCard.tags).toEqual(
        expect.arrayContaining(expectedDetails.tags)
      );
    }
  }

  // Legacy methods for backward compatibility
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
