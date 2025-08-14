import { test, expect } from "@playwright/test";
import { TestDataLoader } from "../data/test-data-loader";
import { LoginHelper } from "../utils/login-helper";

test.describe("Navigation Tests", () => {
  test("should test navigation between all projects", async ({ page }) => {
    // Login to dashboard
    await LoginHelper.login(page);

    // Get all project buttons (excluding logout)
    const projectButtons = page.locator("button");
    const buttonCount = await projectButtons.count();
    const projectButtonCount = buttonCount - 1; // Exclude logout

    // Test each project
    for (let i = 0; i < projectButtonCount; i++) {
      const button = projectButtons.nth(i);
      const buttonText = await button.textContent();

      // Extract project name
      let projectName = "";
      if (buttonText?.includes("Web Application")) {
        projectName = "Web Application";
      } else if (buttonText?.includes("Mobile Application")) {
        projectName = "Mobile Application";
      } else if (buttonText?.includes("Marketing Campaign")) {
        projectName = "Marketing Campaign";
      }

      // Click the project button
      await button.click();
      await page.waitForLoadState("networkidle");

      // Get expected tasks for this project
      const expectedTasks = TestDataLoader.getTasksByProject(projectName);

      // Verify each expected task is visible
      for (const expectedTask of expectedTasks) {
        const taskElement = page.locator(`text=${expectedTask.title}`).first();
        const isVisible = await taskElement.isVisible();
        expect(isVisible).toBe(true);
      }

      // Verify status columns are present
      const statuses = ["To Do", "In Progress", "Review", "Done"];
      for (const status of statuses) {
        const statusElement = page.locator(`text=${status}`).first();
        const isVisible = await statusElement.isVisible();
        expect(isVisible).toBe(true);
      }

      // Verify task distribution by status
      for (const status of statuses) {
        const expectedTasksInStatus = TestDataLoader.getProjectTasksByStatus(
          projectName,
          status
        );

        // Count visible tasks in this status (this is a simplified check)
        const statusElement = page.locator(`text=${status}`).first();
        if ((await statusElement.count()) > 0) {
          const statusContainer = statusElement.locator("xpath=..");
          const containerText = await statusContainer.textContent();

          // Count expected tasks that should be in this status
          let foundTasks = 0;
          for (const expectedTask of expectedTasksInStatus) {
            if (containerText?.includes(expectedTask.title)) {
              foundTasks++;
            }
          }

          expect(foundTasks).toBe(expectedTasksInStatus.length);
        }
      }

      // Take a screenshot
      await page.screenshot({
        path: `screenshots/navigation-${projectName?.replace(/\s+/g, "-")}.png`,
      });
    }
  });

  test("should verify logout button functionality", async ({ page }) => {
    // Login to dashboard
    await LoginHelper.login(page);

    // Find logout button
    const logoutButton = page.locator("button:has-text('Logout')");

    // Verify logout button is present
    await expect(logoutButton).toBeVisible();
    await expect(logoutButton).toBeEnabled();

    // Click logout
    await logoutButton.click();
    await page.waitForLoadState("networkidle");

    // Verify we're back to login page
    const loginInput = page.locator('input[type="password"]');
    await expect(loginInput).toBeVisible();
  });
});
