# Cards and Tags Test Suite

This test suite verifies all relevant details regarding cards and tags within the project management application using the Page Object Model pattern.

## Test Structure

### Page Objects

- **LoginPage** (`pages/LoginPage.ts`): Handles authentication functionality
- **DashboardPage** (`pages/DashboardPage.ts`): Manages dashboard interactions and card operations

### Test Categories

1. **Authentication Tests**
   - Login with valid credentials
   - Login with invalid credentials (error handling)
   - Logout functionality

2. **Project Cards Tests**
   - Verify all expected project cards are displayed
   - Validate project card details

3. **Task Cards Tests**
   - Verify all expected task cards are displayed
   - Validate task card structure and details
   - Test specific task details

4. **Status Columns Tests**
   - Verify all status columns are present
   - Validate task distribution across status columns

5. **Tags Tests**
   - Verify all expected tags are present
   - Test task filtering by tags
   - Validate tag consistency

6. **Assignees Tests**
   - Verify all expected assignees are present
   - Test task filtering by assignee

7. **Data Integrity Tests**
   - Verify no duplicate task titles
   - Validate consistent data across all task cards

## Test Data

### Expected Projects

- Web Application
- Mobile Application
- Marketing Campaign

### Expected Tasks

- Implement user authentication (To Do, High Priority, Sarah Chen, Feature)
- Fix navigation bug (To Do, John Smith, Bug)
- Design system updates (In Progress, Emma Wilson, Design)
- API integration (Review, High Priority, Mike Johnson, Feature)
- Update documentation (Done, Lisa Brown, Feature)
- Push notification system (To Do, David Kim, Feature)
- Offline mode (In Progress, High Priority, Rachel Green, Feature)
- App icon design (Done, Emma Wilson, Design)
- Social media calendar (To Do, Sophie Turner, Feature)
- Email campaign (In Progress, High Priority, Mark Wilson, Design)
- Landing page copy (Review, Lisa Brown, Design)

### Expected Tags

- Feature
- Bug
- Design

### Expected Assignees

- Sarah Chen
- John Smith
- Emma Wilson
- Mike Johnson
- Lisa Brown
- David Kim
- Rachel Green
- Sophie Turner
- Mark Wilson

### Expected Statuses

- To Do
- In Progress
- Review
- Done

## Running Tests

```bash
# Run all tests
npm test

# Run tests in headed mode
npm run test:headed

# Run specific test file
npx playwright test tests/dashboard.spec.ts

# Run tests with UI
npm run test:ui

# Generate test report
npm run test:report
```

## Environment Variables

The tests use the following environment variables from `.env`:

- `USERNAME`: Login username (required)
- `PASSWORD`: Login password (required)
- `BASE_URL`: Application URL (required)

If any required environment variables are missing, the tests will fail with a clear error message.

**Important**: Never commit the `.env` file to version control. It's already included in `.gitignore`.

## Page Object Model Benefits

1. **Reusability**: Page objects can be reused across multiple tests
2. **Maintainability**: Changes to selectors only need to be made in one place
3. **Readability**: Tests are more readable and focused on business logic
4. **Separation of Concerns**: UI interactions are separated from test logic
5. **Minimized Duplication**: Common operations are centralized in page objects

## Security Features

- ✅ No hardcoded credentials in source code
- ✅ Credentials only come from environment variables
- ✅ Clear error messages for missing environment variables
- ✅ `.env` file is properly ignored by version control
- ✅ Support for both valid and invalid credential testing

## Code Quality

- ✅ Clean, maintainable codebase
- ✅ No unused code or dead functions
- ✅ Proper TypeScript typing
- ✅ Consistent code formatting
- ✅ Comprehensive test coverage

## Test Coverage

The test suite covers:

- ✅ Authentication flow (valid and invalid credentials)
- ✅ Project card verification
- ✅ Task card verification
- ✅ Status column validation
- ✅ Tag verification and filtering
- ✅ Assignee verification and filtering
- ✅ Data integrity checks
- ✅ Card details validation
- ✅ Error handling
- ✅ Navigation between projects
- ✅ Logout functionality

## Project Structure

```
tests/
├── pages/
│   ├── LoginPage.ts          # Authentication page object
│   └── DashboardPage.ts      # Dashboard and card operations
├── data/
│   ├── test-data.json        # Test data (no credentials)
│   └── test-data-loader.ts   # Data loading utilities
├── utils/
│   ├── login-helper.ts       # Login utility functions
│   └── test-utils.ts         # General test utilities
├── dashboard.spec.ts    # Main test suite
├── login.spec.ts             # Authentication tests
└── navigation.spec.ts        # Navigation tests
```

## Screenshots

Test screenshots are saved to the `screenshots/` directory for debugging purposes.
