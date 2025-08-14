import { test, expect } from "@playwright/test";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { TestDataLoader } from "./data/test-data-loader";
import { LoginHelper } from "./utils/login-helper";

const projectsTestData = TestDataLoader.getProjects();
const expectedProjects = TestDataLoader.getProjectNames();

test.describe("Dashboard Test Suite", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    const { loginPage: login, dashboardPage: dashboard } =
      await LoginHelper.login(page);
    loginPage = login;
    dashboardPage = dashboard;
  });

  test("should display all expected project names on the side navigation", async ({
    page,
  }) => {
    const actualProjects = await dashboardPage.getProjectNamesFromUI();

    // Verify browser data matches test data
    expect(actualProjects).toEqual(expect.arrayContaining(expectedProjects));
    expect(actualProjects.length).toEqual(expectedProjects.length);
  });

  test("should verify header title matches navigation button when clicked", async ({}) => {
    const actualProjects = await dashboardPage.getProjectNamesFromUI();

    for (const projectName of actualProjects) {
      await dashboardPage.clickProjectButton(projectName);

      const headerTitle = await dashboardPage.getHeaderTitle();
      expect(headerTitle).toBe(projectName);
    }
  });

  test("should verify each project has correct amount of tasks", async ({}) => {
    for (const project of projectsTestData) {
      await dashboardPage.clickProjectButton(project.name);

      const taskTitlesFromUI = await dashboardPage.getTaskTitlesFromUI();
      // Verify the task count matches expected count
      const expectedTaskCount = project.tasks.length;
      const actualTaskCount = taskTitlesFromUI.length;

      expect(actualTaskCount).toBe(expectedTaskCount);
      expect(actualTaskCount).toBeGreaterThan(0);
    }
  });

  test("should verify amount of tasks in each status column", async ({
    page,
  }) => {
    for (const project of projectsTestData) {
      await dashboardPage.clickProjectButton(project.name);
      const statusesFromUI = await dashboardPage.getStatusElementsFromUI();

      // Verify each status column has the correct number of tasks
      for (const status of statusesFromUI) {
        const expectedTasksInStatus = TestDataLoader.getProjectTasksByStatus(
          project.name,
          status
        );
        const expectedCount = expectedTasksInStatus.length;

        const actualTasksInStatus =
          await dashboardPage.getTasksByStatusFromUI(status);

        // Filter to only include tasks from this project
        const projectTasksInStatus = actualTasksInStatus.filter(task =>
          project.tasks.some(expectedTask => expectedTask.title === task)
        );

        const actualCount = projectTasksInStatus.length;

        expect(actualCount).toBe(expectedCount);

        // Verify the status column shows the correct count
        const statusTotalTasks = await page
          .locator(`text=${status}`)
          .locator("span")
          .innerText();

        expect(statusTotalTasks).toMatch(`(${expectedCount})`);
      }
    }
  });

  test("should verify assignees are correctly assigned to tasks", async ({}) => {
    for (const project of projectsTestData) {
      await dashboardPage.clickProjectButton(project.name);
      const taskTitlesFromUI = await dashboardPage.getTaskTitlesFromUI();

      // Verify each task has the correct assignee
      for (const taskTitle of taskTitlesFromUI) {
        const expectedTask = project.tasks.find(
          task => task.title === taskTitle
        );

        if (expectedTask) {
          const actualTaskDetails =
            await dashboardPage.getTaskCardDetails(taskTitle);

          expect(actualTaskDetails).toBeTruthy();
          expect(actualTaskDetails?.assignee).toBe(expectedTask.assignee);
        }
      }
    }
  });

  test("should verify task details are correctly displayed", async ({}) => {
    for (const project of projectsTestData) {
      await dashboardPage.clickProjectButton(project.name);
      const taskTitlesFromUI = await dashboardPage.getTaskTitlesFromUI();

      // Verify each task has correct details
      for (const taskTitle of taskTitlesFromUI) {
        const expectedTask = project.tasks.find(
          task => task.title === taskTitle
        );

        if (expectedTask) {
          const actualTaskDetails =
            await dashboardPage.getTaskCardDetails(taskTitle);

          expect(actualTaskDetails).toBeTruthy();
          expect(actualTaskDetails?.tags.sort()).toEqual(
            expectedTask.tags.sort()
          );
          expect(actualTaskDetails?.createdOn).toBe(expectedTask.createdOn);
          expect(actualTaskDetails?.status).toBe(expectedTask.status);
        }
      }
    }
  });
});
