import { 
  TreeModel,
  TextTreeItem,
  CheckboxTreeItem,
  TreeCollectionItem,
} from '../';

//#region Interfaces

export interface IMarker {
  visible: boolean;
  title: string;
  coordinates: [number, number];
}

export interface IWaypoints {
  count: number;
}

export interface ITask {
  completed: boolean;
  description: string;
  priority: number;
}

//#endregion


//#region Helper Functions

export function getWaypointsDisplayName(waypoints: IWaypoints): string {
  if (!waypoints) return 'No Waypoints';
  return `${waypoints.count} Waypoints`;
}

//#endregion


//#region View Models

/**
 * Represents a drone project with its associated data
 */
@TreeModel({ name: (vm: MyViewModel) => vm.projectName })
export class MyViewModel {
  @TextTreeItem({
    name: "Project Name: ",
    onDoubleClick: (val) => console.log('Double-click on project name:', val)
  })
  projectName: string = 'Default Name';

  @TreeCollectionItem({ name: "Points of Interests" })
  @TextTreeItem({
    value: (marker) => marker.title,
    icon: 'place'
  })
  markers: IMarker[] = [];

  @TextTreeItem({ value: (waypoints) => `${waypoints.count} Waypoints` })
  waypoints: IWaypoints = { count: 32 };

  @TextTreeItem({ name: "Last Updated: " })
  lastUpdated: Date = new Date();
}

/**
 * Represents a task list with its associated tasks
 */
@TreeModel({ name: (vm: TaskListViewModel) => vm.taskListName })
export class TaskListViewModel {
  @TextTreeItem({
    name: "Task List Name: ",
    icon: 'place',
    onDoubleClick: (val) => console.log('Double-click on task list name:', val)
  })
  taskListName: string = 'Default Task List';

  @TreeCollectionItem({ name: "Tasks" })
  @CheckboxTreeItem({
    name: (task) => `[P${task.priority}] ${task.description}`,
    toggleFunc: (task, checked) => {
      task.completed = checked;
      console.log(`Task "${task.description}" marked as ${checked ? 'completed' : 'pending'}`);
    }
  })
  tasks: ITask[] = [];

  @TextTreeItem({ name: "Created: " })
  createdAt: Date = new Date();
}

/**
 * Root container model that holds multiple view models
 */
@TreeModel({ name: "Tree View Example" })
export class RootContainerModel {
  @TreeCollectionItem({ name: "Drone Projects" })
  @TextTreeItem()
  droneProjects: MyViewModel[] = [];

  @TreeCollectionItem({ name: "Task Lists" })
  @TextTreeItem()
  taskLists: TaskListViewModel[] = [];
}

//#endregion
