import testData from "./test-data.json";

export interface Credentials {
  username: string;
  password: string;
}

export interface Task {
  title: string;
  description: string;
  status: string;
  priority: string;
  assignee: string;
  dueDate: string;
  tags: string[];
}

export interface Project {
  name: string;
  description: string;
  tasks: Task[];
}

export interface Tag {
  name: string;
  count: number;
  tasks: string[];
}

export interface Assignee {
  name: string;
  taskCount: number;
  tasks: string[];
}

export interface Status {
  name: string;
  count: number;
  tasks: string[];
}

export interface Priority {
  name: string;
  count: number;
  tasks: string[];
}

export interface TestData {
  credentials: { valid: Credentials; invalid: Credentials };
  projects: Project[];
  tags: Tag[];
  assignees: Assignee[];
  statuses: Status[];
  priorities: Priority[];
}

export class TestDataLoader {
  private static data: TestData = testData;

  static getCredentials(type: "valid" | "invalid" = "valid"): Credentials {
    return this.data.credentials[type];
  }

  static getProjectNames(): string[] {
    return this.data.projects.map(project => project.name);
  }

  static getProjects(): Project[] {
    return this.data.projects;
  }

  static getProjectByName(projectName: string): Project | undefined {
    return this.data.projects.find(project => project.name === projectName);
  }

  static getTaskTitles(): string[] {
    return this.data.projects.flatMap(project =>
      project.tasks.map(task => task.title)
    );
  }

  static getTasks(): Task[] {
    return this.data.projects.flatMap(project => project.tasks);
  }

  static getTasksByProject(projectName: string): Task[] {
    const project = this.getProjectByName(projectName);
    return project ? project.tasks : [];
  }

  static getTasksByStatus(status: string): Task[] {
    return this.data.projects.flatMap(project =>
      project.tasks.filter(task => task.status === status)
    );
  }

  static getTasksByTag(tag: string): Task[] {
    return this.data.projects.flatMap(project =>
      project.tasks.filter(task => task.tags.includes(tag))
    );
  }

  static getTasksByAssignee(assignee: string): Task[] {
    return this.data.projects.flatMap(project =>
      project.tasks.filter(task => task.assignee === assignee)
    );
  }

  static getTagNames(): string[] {
    return this.data.tags.map(tag => tag.name);
  }

  static getTags(): Tag[] {
    return this.data.tags;
  }

  static getAssigneeNames(): string[] {
    return this.data.assignees.map(assignee => assignee.name);
  }

  static getAssignees(): Assignee[] {
    return this.data.assignees;
  }

  static getStatusNames(): string[] {
    return this.data.statuses.map(status => status.name);
  }

  static getStatuses(): Status[] {
    return this.data.statuses;
  }

  static getPriorityNames(): string[] {
    return this.data.priorities.map(priority => priority.name);
  }

  static getPriorities(): Priority[] {
    return this.data.priorities;
  }

  // Project-specific methods
  static getProjectTaskCount(projectName: string): number {
    const project = this.getProjectByName(projectName);
    return project ? project.tasks.length : 0;
  }

  static getProjectTasksByStatus(projectName: string, status: string): Task[] {
    const project = this.getProjectByName(projectName);
    return project ? project.tasks.filter(task => task.status === status) : [];
  }

  static getProjectTasksByTag(projectName: string, tag: string): Task[] {
    const project = this.getProjectByName(projectName);
    return project ? project.tasks.filter(task => task.tags.includes(tag)) : [];
  }

  static getProjectTasksByAssignee(
    projectName: string,
    assignee: string
  ): Task[] {
    const project = this.getProjectByName(projectName);
    return project
      ? project.tasks.filter(task => task.assignee === assignee)
      : [];
  }

  // Helper methods for aggregated data
  static getAllTaskTitles(): string[] {
    return this.getTaskTitles();
  }

  static getTaskByTitle(title: string): Task | undefined {
    for (const project of this.data.projects) {
      const task = project.tasks.find(task => task.title === title);
      if (task) return task;
    }
    return undefined;
  }
}
