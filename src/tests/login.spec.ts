import { test, expect } from "@playwright/test";
import { LoginPage } from "../page-objects/LoginPage";
import { DashboardPage } from "../page-objects/DashboardPage";
import { TestDataLoader } from "../data/test-data-loader";
import { LoginHelper } from "../utils/login-helper";

test.describe("Authentication", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test("should login successfully with valid credentials", async ({ page }) => {
    await loginPage.goto();
    await loginPage.expectLoginFormVisible();

    // Use LoginHelper to get credentials and login
    await LoginHelper.login(page);
    await dashboardPage.expectDashboardLoaded();
  });

  test("should show error message with invalid credentials", async ({
    page,
  }) => {
    await loginPage.goto();
    await loginPage.expectLoginFormVisible();

    // Get invalid credentials from test data
    const invalidCredentials = TestDataLoader.getCredentials("invalid");
    const username = invalidCredentials.username;
    const password = invalidCredentials.password;

    // Attempt to login with invalid credentials
    await loginPage.login(username, password);

    // Verify error message is displayed
    await loginPage.expectErrorMessageVisible();

    // Verify we're still on the login page (not redirected to dashboard)
    await loginPage.expectLoginFormVisible();
  });
});
