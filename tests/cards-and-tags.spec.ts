import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CardPage, TaskCard } from "./pages/CardPage";
import { TestDataLoader } from "./data/test-data-loader";
import { LoginHelper } from "./utils/login-helper";

test.describe("Cards and Tags Test Suite", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let cardPage: CardPage;

  test.beforeEach(async ({ page }) => {
    // Login once per test using the helper
    const { loginPage: login, dashboardPage: dashboard } =
      await LoginHelper.login(page);
    loginPage = login;
    dashboardPage = dashboard;
    cardPage = new CardPage(page);
  });

  test.describe("Project Cards", () => {
    test("should display all expected project cards", async ({ page }) => {
      const expectedProjects = TestDataLoader.getProjectNames();
      const actualProjects = await cardPage.getProjectCards();

      expect(actualProjects).toEqual(expect.arrayContaining(expectedProjects));
      expect(actualProjects.length).toBeGreaterThanOrEqual(
        expectedProjects.length
      );
    });

    test("should verify project card details", async ({ page }) => {
      const projects = await cardPage.getProjectCards();

      for (const project of projects) {
        expect(project).toBeTruthy();
        expect(typeof project).toBe("string");
        expect(project.length).toBeGreaterThan(0);
      }
    });
  });

  test.describe("Task Cards by Project", () => {
    test("should verify tasks for each project", async ({ page }) => {
      const projects = TestDataLoader.getProjects();

      for (const project of projects) {
        // Click on the project button
        const projectButton = page.locator(
          `button:has-text("${project.name}")`
        );
        await projectButton.click();
        await page.waitForLoadState("networkidle");

        // Verify each task in this project is visible
        for (const task of project.tasks) {
          await cardPage.expectTaskCardVisible(task.title);
        }

        // Verify task card structure and details
        for (const task of project.tasks) {
          const taskCard = await cardPage.getTaskCardDetails(task.title);

          if (taskCard) {
            expect(taskCard.title).toBe(task.title);
            expect(taskCard.status).toBe(task.status);

            if (task.priority) {
              expect(taskCard.priority).toBe(task.priority);
            }

            if (task.assignee) {
              expect(taskCard.assignee).toBe(task.assignee);
            }

            if (task.dueDate) {
              expect(taskCard.dueDate).toBe(task.dueDate);
            }

            expect(taskCard.tags).toEqual(expect.arrayContaining(task.tags));
          }
        }

        // Verify status columns are present
        const statuses = ["To Do", "In Progress", "Review", "Done"];
        for (const status of statuses) {
          await expect(page.locator(`text=${status}`).first()).toBeVisible();
        }

        // Verify task distribution by status for this project
        for (const status of statuses) {
          const tasksInStatus = TestDataLoader.getProjectTasksByStatus(
            project.name,
            status
          );
          const actualTasksInStatus = await cardPage.getTasksByStatus(status);

          // Filter actual tasks to only include those from this project
          const projectTasksInStatus = actualTasksInStatus.filter(task =>
            project.tasks.some(pt => pt.title === task.title)
          );

          expect(projectTasksInStatus.length).toBe(tasksInStatus.length);
        }
      }
    });
  });

  test.describe("Tags by Project", () => {
    test("should verify tags for each project", async ({ page }) => {
      const projects = TestDataLoader.getProjects();

      for (const project of projects) {
        const projectButton = page.locator(
          `button:has-text("${project.name}")`
        );
        await projectButton.click();
        await page.waitForLoadState("networkidle");

        // Get all tags used in this project
        const projectTags = new Set<string>();
        for (const task of project.tasks) {
          task.tags.forEach(tag => projectTags.add(tag));
        }

        // Verify each tag is present
        for (const tag of projectTags) {
          const tasksWithTag = await cardPage.getTasksByTag(tag);
          const expectedTasksWithTag = TestDataLoader.getProjectTasksByTag(
            project.name,
            tag
          );

          expect(tasksWithTag.length).toBe(expectedTasksWithTag.length);

          // Verify specific tasks with this tag
          const taskTitles = tasksWithTag.map(task => task.title);
          for (const expectedTask of expectedTasksWithTag) {
            expect(taskTitles).toContain(expectedTask.title);
          }
        }
      }
    });
  });

  test.describe("Assignees by Project", () => {
    test("should verify assignees for each project", async ({ page }) => {
      const projects = TestDataLoader.getProjects();

      for (const project of projects) {
        // Click on the project button
        const projectButton = page.locator(
          `button:has-text("${project.name}")`
        );
        await projectButton.click();
        await page.waitForLoadState("networkidle");

        // Get all assignees in this project
        const projectAssignees = new Set<string>();
        for (const task of project.tasks) {
          if (task.assignee) {
            projectAssignees.add(task.assignee);
          }
        }

        // Verify each assignee is present
        for (const assignee of projectAssignees) {
          const tasksForAssignee = await cardPage.getTasksByAssignee(assignee);
          const expectedTasksForAssignee =
            TestDataLoader.getProjectTasksByAssignee(project.name, assignee);

          expect(tasksForAssignee.length).toBe(expectedTasksForAssignee.length);

          // Verify specific tasks for this assignee
          const taskTitles = tasksForAssignee.map(task => task.title);
          for (const expectedTask of expectedTasksForAssignee) {
            expect(taskTitles).toContain(expectedTask.title);
          }
        }
      }
    });
  });

  test.describe("Data Integrity by Project", () => {
    test("should verify data integrity for each project", async ({ page }) => {
      const projects = TestDataLoader.getProjects();

      for (const project of projects) {
        // Click on the project button
        const projectButton = page.locator(
          `button:has-text("${project.name}")`
        );
        await projectButton.click();
        await page.waitForLoadState("networkidle");

        // Get all tasks for this project
        const allTasks = await cardPage.getAllTaskCards();

        // Verify no duplicate task titles
        const taskTitles = allTasks.map(task => task.title);
        const uniqueTitles = [...new Set(taskTitles)];
        expect(taskTitles.length).toBe(uniqueTitles.length);

        // Verify consistent data across all task cards
        for (const task of allTasks) {
          expect(task.title).toBeTruthy();
          expect(task.status).toBeTruthy();
          expect(TestDataLoader.getStatusNames()).toContain(task.status);

          for (const tag of task.tags) {
            expect(TestDataLoader.getTagNames()).toContain(tag);
          }

          if (task.assignee) {
            expect(TestDataLoader.getAssigneeNames()).toContain(task.assignee);
          }

          if (task.priority) {
            expect(TestDataLoader.getPriorityNames()).toContain(task.priority);
          }

          if (task.dueDate) {
            expect(task.dueDate).toMatch(/^\d{1,2}\/\d{1,2}\/\d{4}$/);
          }
        }
      }
    });
  });
});
