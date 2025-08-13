import { Page } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { TestDataLoader } from "../data/test-data-loader";

export class LoginHelper {
  static async login(
    page: Page
  ): Promise<{ loginPage: LoginPage; dashboardPage: DashboardPage }> {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    const credentials = TestDataLoader.getCredentials("valid");
    const username = process.env.USERNAME || credentials.username;
    const password = process.env.PASSWORD || credentials.password;

    await loginPage.login(username, password);
    await dashboardPage.expectDashboardLoaded();

    return { loginPage, dashboardPage };
  }
}
