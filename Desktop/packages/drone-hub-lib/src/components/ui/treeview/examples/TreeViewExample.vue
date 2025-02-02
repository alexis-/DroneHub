<!--
  This example demonstrates the TreeView's ability to handle multiple models
  within a single root model, reactivity, and various data modifications.
-->
<template>
  <div class="p-4 space-y-8">
    <!-- Model Management -->
    <div>
      <h2 class="text-lg font-semibold mb-4">Model Management</h2>
      
      <!-- Project Controls -->
      <div class="mb-6">
        <h3 class="font-medium mb-2">Drone Projects</h3>
        <div class="flex flex-col gap-2">
          <!-- Add/Remove Controls -->
          <div class="flex gap-2">
            <button 
              class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              @click="addDroneProject"
            >
              Add Drone Project
            </button>
            <button 
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              @click="removeLastDroneProject"
              :disabled="!hasProjects"
            >
              Remove Last Project
            </button>
          </div>

          <!-- Modification Controls -->
          <div class="flex flex-wrap gap-2">
            <button 
              class="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              @click="updateLastProjectName"
              :disabled="!hasProjects"
            >
              Update Name
            </button>
            <button 
              class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              @click="addMarkerToLastProject"
              :disabled="!hasProjects"
            >
              Add Marker
            </button>
            <button 
              class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              @click="updateLastProjectMarker"
              :disabled="!hasProjects"
            >
              Update Random Marker
            </button>
            <button 
              class="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600"
              @click="updateLastProjectWaypoints"
              :disabled="!hasProjects"
            >
              Update Waypoints
            </button>
          </div>
        </div>
      </div>

      <!-- Task List Controls -->
      <div class="mb-6">
        <h3 class="font-medium mb-2">Task Lists</h3>
        <div class="flex flex-col gap-2">
          <!-- Add/Remove Controls -->
          <div class="flex gap-2">
            <button 
              class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              @click="addTaskList"
            >
              Add Task List
            </button>
            <button 
              class="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              @click="removeLastTaskList"
              :disabled="!hasTaskLists"
            >
              Remove Last List
            </button>
          </div>

          <!-- Modification Controls -->
          <div class="flex flex-wrap gap-2">
            <button 
              class="px-3 py-1 bg-indigo-500 text-white rounded hover:bg-indigo-600"
              @click="updateLastTaskListName"
              :disabled="!hasTaskLists"
            >
              Update Name
            </button>
            <button 
              class="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
              @click="addTaskToLastList"
              :disabled="!hasTaskLists"
            >
              Add Task
            </button>
            <button 
              class="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              @click="toggleRandomTask"
              :disabled="!hasTaskLists"
            >
              Toggle Random Task
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Tree View -->
    <div class="border rounded p-4 bg-primary">
      <TreeView :model="rootModel" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { 
  RootContainerModel,
  MyViewModel, 
  TaskListViewModel,
  type IMarker, 
  type ITask 
} from './TreeViewExampleModel';
import { TreeView } from '../';

//#region Root Model Management

/**
 * The root container model that holds all our view models
 */
const rootModel = ref(new RootContainerModel());

/**
 * Checks if there are any drone projects
 */
const hasProjects = computed(() => rootModel.value.droneProjects.length > 0);

/**
 * Checks if there are any task lists
 */
const hasTaskLists = computed(() => rootModel.value.taskLists.length > 0);

/**
 * Gets the last drone project
 */
const getLastProject = (): MyViewModel | null => {
  const projects = rootModel.value.droneProjects;
  return projects.length > 0 ? projects[projects.length - 1] : null;
};

/**
 * Gets the last task list
 */
const getLastTaskList = (): TaskListViewModel | null => {
  const lists = rootModel.value.taskLists;
  return lists.length > 0 ? lists[lists.length - 1] : null;
};

//#endregion


//#region Model Creation

/**
 * Creates a new drone project with some sample data
 */
const createDroneProject = (): MyViewModel => {
  const vm = new MyViewModel();
  vm.projectName = `Drone Project ${rootModel.value.droneProjects.length + 1}`;
  vm.markers = [
    { visible: false, title: 'Starting Point', coordinates: [40, -75] },
    { visible: true, title: 'Target Area', coordinates: [41, -76] }
  ];
  vm.waypoints = { count: Math.floor(Math.random() * 50) + 1 };
  vm.lastUpdated = new Date();
  return vm;
};

/**
 * Creates a new task list with some sample tasks
 */
const createTaskList = (): TaskListViewModel => {
  const vm = new TaskListViewModel();
  vm.taskListName = `Task List ${rootModel.value.taskLists.length + 1}`;
  vm.tasks = [
    { completed: false, description: 'Plan flight path', priority: 1 },
    { completed: false, description: 'Check weather conditions', priority: 2 },
    { completed: false, description: 'Verify equipment', priority: 1 }
  ];
  vm.createdAt = new Date();
  return vm;
};

//#endregion


//#region Model Addition/Removal

/**
 * Adds a new drone project
 */
const addDroneProject = () => {
  rootModel.value.droneProjects = [...rootModel.value.droneProjects, createDroneProject()];
};

/**
 * Removes the last drone project
 */
const removeLastDroneProject = () => {
  if (hasProjects.value) {
    rootModel.value.droneProjects = rootModel.value.droneProjects.slice(0, -1);
  }
};

/**
 * Adds a new task list
 */
const addTaskList = () => {
  rootModel.value.taskLists = [...rootModel.value.taskLists, createTaskList()];
};

/**
 * Removes the last task list
 */
const removeLastTaskList = () => {
  if (hasTaskLists.value) {
    rootModel.value.taskLists = rootModel.value.taskLists.slice(0, -1);
  }
};

//#endregion


//#region Project Modifications

/**
 * Updates the name of the last drone project
 */
const updateLastProjectName = () => {
  const project = getLastProject();
  if (project) {
    project.projectName = `Drone Project (Updated: ${new Date().toLocaleTimeString()})`;
  }
};

/**
 * Adds a new marker to the last drone project
 */
const addMarkerToLastProject = () => {
  const project = getLastProject();
  if (project) {
    const newMarker: IMarker = {
      visible: false,
      title: `Marker ${String.fromCharCode(65 + project.markers.length)}`,
      coordinates: [40 + Math.random(), -75 - Math.random()]
    };
    project.markers = [...project.markers, newMarker];
  }
};

/**
 * Updates a random marker in the last drone project
 */
const updateLastProjectMarker = () => {
  const project = getLastProject();
  if (project && project.markers.length > 0) {
    const randomIndex = Math.floor(Math.random() * project.markers.length);
    const updatedMarkers = [...project.markers];
    updatedMarkers[randomIndex] = {
      ...updatedMarkers[randomIndex],
      title: `${updatedMarkers[randomIndex].title} (Updated: ${new Date().toLocaleTimeString()})`
    };
    project.markers = updatedMarkers;
  }
};

/**
 * Updates the waypoints count in the last drone project
 */
const updateLastProjectWaypoints = () => {
  const project = getLastProject();
  if (project) {
    project.waypoints = {
      count: Math.floor(Math.random() * 100) + 1
    };
  }
};

//#endregion


//#region Task List Modifications

/**
 * Updates the name of the last task list
 */
const updateLastTaskListName = () => {
  const taskList = getLastTaskList();
  if (taskList) {
    taskList.taskListName = `Task List (Updated: ${new Date().toLocaleTimeString()})`;
  }
};

/**
 * Adds a new task to the last task list
 */
const addTaskToLastList = () => {
  const taskList = getLastTaskList();
  if (taskList) {
    const newTask: ITask = {
      completed: false,
      description: `New Task ${taskList.tasks.length + 1}`,
      priority: Math.floor(Math.random() * 3) + 1
    };
    taskList.tasks = [...taskList.tasks, newTask];
  }
};

/**
 * Toggles a random task in the last task list
 */
const toggleRandomTask = () => {
  const taskList = getLastTaskList();
  if (taskList && taskList.tasks.length > 0) {
    const randomIndex = Math.floor(Math.random() * taskList.tasks.length);
    const updatedTasks = [...taskList.tasks];
    updatedTasks[randomIndex] = {
      ...updatedTasks[randomIndex],
      completed: !updatedTasks[randomIndex].completed
    };
    taskList.tasks = updatedTasks;
  }
};

//#endregion


// Add initial models
addDroneProject();
addTaskList();
</script>
