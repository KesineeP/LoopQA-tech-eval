import { Page } from "@playwright/test";

export interface TestCredentials {
  username: string;
  password: string;
}

export function getTestCredentials(): TestCredentials {
  return {
    username: process.env.USERNAME || "admin",
    password: process.env.PASSWORD || "password123%",
  };
}

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("networkidle");
}

export function validateDateFormat(dateString: string): boolean {
  const dateRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  return dateRegex.test(dateString);
}

export function validatePriority(priority: string): boolean {
  const validPriorities = ["High Priority", "Medium Priority", "Low Priority"];
  return validPriorities.includes(priority);
}

export function validateStatus(status: string): boolean {
  const validStatuses = ["To Do", "In Progress", "Review", "Done"];
  return validStatuses.includes(status);
}

export function validateTag(tag: string): boolean {
  const validTags = ["Feature", "Bug", "Design"];
  return validTags.includes(tag);
}

export function validateAssignee(assignee: string): boolean {
  const validAssignees = [
    "Sarah Chen",
    "John Smith",
    "Emma Wilson",
    "Mike Johnson",
    "Lisa Brown",
  ];
  return validAssignees.includes(assignee);
}

export function validateProject(project: string): boolean {
  const validProjects = [
    "Web Application",
    "Mobile Application",
    "Marketing Campaign",
  ];
  return validProjects.includes(project);
}
