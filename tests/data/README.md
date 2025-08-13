# Test Data Folder

This folder contains all test data used by the test suite in JSON format for better organization and maintainability.

## Files

### `test-data.json`

Contains all test data including:

- **Credentials** - Valid and invalid login credentials
- **Projects** - Project names and descriptions
- **Tasks** - Complete task information including title, status, priority, assignee, due date, and tags
- **Tags** - Available tags with their counts and associated tasks
- **Assignees** - Team members with their task counts and assigned tasks
- **Statuses** - Available statuses with their counts and associated tasks
- **Priorities** - Available priorities with their counts and associated tasks

### `test-data-loader.ts`

Utility class that provides easy access to test data with methods like:

- `getCredentials()` - Get login credentials
- `getProjects()` - Get all projects
- `getTasks()` - Get all tasks
- `getTags()` - Get all tags
- `getAssignees()` - Get all assignees
- `getStatuses()` - Get all statuses
- `getPriorities()` - Get all priorities

## Benefits

1. **Centralized Data Management** - All test data in one place
2. **Easy Maintenance** - Update data without touching test code
3. **Reusability** - Data can be used across multiple test files
4. **Type Safety** - TypeScript interfaces ensure data consistency
5. **Scalability** - Easy to add new data or modify existing data

## Usage

```typescript
import { TestDataLoader } from "./data/test-data-loader";

// Get credentials
const credentials = TestDataLoader.getCredentials("valid");

// Get all task titles
const taskTitles = TestDataLoader.getTaskTitles();

// Get tasks by status
const toDoTasks = TestDataLoader.getTasksByStatus("To Do");

// Get expected counts
const expectedTaskCount = TestDataLoader.getExpectedTaskCount();
```

## Data Structure

The JSON structure is organized hierarchically:

- Each entity type has its own section
- Related data is grouped together
- Counts and relationships are pre-calculated
- Data is validated through TypeScript interfaces

This approach makes the test suite more maintainable and reduces duplication of test data across files.
