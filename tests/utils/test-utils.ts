import { Page } from "@playwright/test";

export interface TestCredentials {
  username: string;
  password: string;
}

export function getTestCredentials(): TestCredentials {
  const username = process.env.USERNAME;
  const password = process.env.PASSWORD;

  if (!username || !password) {
    throw new Error(
      "Missing required environment variables: USERNAME and PASSWORD must be set in .env file"
    );
  }

  return {
    username,
    password,
  };
}
