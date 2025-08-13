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

export class CardPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

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

  async getProjectCards(): Promise<string[]> {
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
}
