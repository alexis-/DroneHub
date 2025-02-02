<template>
  <div 
    class="tree-node"
    :class="{
      'tree-node--selected': node.selected,
      'tree-node--expanded': node.expanded,
      [`tree-node--depth-${depth}`]: true,
      'tree-node--has-children': hasChildren,
    }"
    :style="{ '--node-depth': depth }"
    @click="onNodeClick"
    @dblclick="onNodeDoubleClick"
    @contextmenu.prevent="onNodeRightClick"
  >
    <!-- Indentation and Connector Lines -->
    <div class="tree-node__indent">
      <div 
        v-for="n in depth" 
        :key="n"
        class="tree-node__indent-guide"
      />
    </div>

    <!-- Expand/Collapse Control -->
    <div 
      v-if="hasChildren"
      class="tree-node__expand-control"
      @click.stop="toggleExpanded"
    >
      <span class="material-symbols-outlined">
        {{ node.expanded ? 'expand_more' : 'chevron_right' }}
      </span>
    </div>
    <div v-else class="tree-node__expand-control--placeholder" />

    <!-- Node Icon or Checkbox -->
    <div 
      class="tree-node__icon"
      :class="getIconColorClass"
    >
      <template v-if="node.type === 'checkbox'">
        <input
          type="checkbox"
          class="tree-node__checkbox"
          ref="checkboxRef"
          :checked="isChecked"
          @change="onToggleCheckbox"
          @click.stop
        />
      </template>
      <span v-else class="material-symbols-outlined">
        {{ node.icon || getDefaultNodeIcon }}
      </span>
    </div>

    <!-- Node Content -->
    <div class="tree-node__content">
      <span 
        class="tree-node__label"
        :class="{
          'font-medium': node.type === 'collection' || node.label.toLowerCase().includes('project'),
          'text-text-secondary': !node.selected && node.type !== 'collection',
        }"
      >
        {{ node.label }}
      </span>
    </div>
  </div>

  <!-- Child Nodes -->
  <div 
    v-if="hasChildren && node.expanded"
    class="tree-node__children"
  >
    <TreeNode
      v-for="child in node.children"
      :key="child.id"
      :node="child"
      :depth="depth + 1"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { TreeNodeData } from './TreeViewModels';

const props = defineProps<{
  node: TreeNodeData;
  depth: number;
}>();

const checkboxRef = ref<HTMLInputElement | null>();

const hasChildren = computed(() => props.node.children.length > 0);

/**
 * Gets the default material icon for the node type and state if no custom icon is provided
 */
const getDefaultNodeIcon = computed(() => {
  switch (props.node.type) {
    case 'collection':
      return props.node.expanded ? 'folder_open' : 'folder';
    case 'checkbox':
      throw new Error('Checkbox nodes should not have icons');
    case 'text':
    default:
      // Return empty string for text nodes, container will maintain dimensions
      return '';
  }
});

/**
 * Gets the icon color class based on node type and state
 */
const getIconColorClass = computed(() => {
  switch (props.node.type) {
    case 'collection':
      return 'text-accent';
    case 'checkbox':
      return '';
    case 'text':
    default:
      return props.node.selected ? 'text-primary' : 'text-text-secondary';
  }
});

const isChecked = computed(() => {
  if (props.node.type !== 'checkbox') {
    return false;
  }
  if (!props.node.originalValue || !props.node.toggleFunc) {
    return false;
  }
  const val = props.node.originalValue;
  if (typeof val.visible === 'boolean') return val.visible;
  if (typeof val.completed === 'boolean') return val.completed;
  return false;
});

function toggleExpanded() {
  props.node.expanded = !props.node.expanded;
  if (props.node.expanded) {
    props.node.onExpand?.(props.node);
  } else {
    props.node.onCollapse?.(props.node);
  }
}

function onNodeClick() {
  // Only process selection if this node is selectable.
  if (!props.node.selectable) {
    if (props.node.children.length > 0) {
      toggleExpanded();
    }
    
    else if (props.node.type === 'checkbox' && props.node.toggleFunc) {
      props.node.toggleFunc(props.node.originalValue, !checkboxRef.value.checked);
    }

    return;
  }

  const wasSelected = props.node.selected;
  props.node.selected = !wasSelected;

  if (!wasSelected) {
    props.node.onSelected?.(props.node);
  } else {
    props.node.onDeselected?.(props.node);
  }
}

function onNodeDoubleClick() {
  props.node.onDoubleClick?.(props.node);
}

function onNodeRightClick() {
  props.node.onRightClick?.(props.node);
}

function onToggleCheckbox(e: Event) {
  if (!props.node.toggleFunc || props.node.type !== 'checkbox') {
    return;
  }
  
  props.node.toggleFunc(props.node.originalValue, checkboxRef.value.checked);
}
</script>

<style scoped>
/* 
  Use CSS custom properties to enable sizing customization.
  Developers can override these via the `sizeOptions` prop in TreeView
  or by setting them globally.
*/

.tree-node {
  position: relative;
  display: flex;
  align-items: center;
  min-height: var(--tree-node-height, 2rem);
  padding: var(--tree-node-padding-y, 0.15rem) 0;
  color: var(--color-text-primary);
  cursor: pointer;
  user-select: none;
  transition: all var(--transition-duration-fast) var(--transition-timing-function);
}

.tree-node:hover {
  background-color: rgb(var(--color-surface-hover-rgb) / 0.35);
}

.tree-node--selected {
  background-color: rgb(var(--color-surface-hover-rgb) / 0.6);
}

.tree-node--selected:hover {
  background-color: rgb(var(--color-surface-hover-rgb) / 0.7);
}

/* Indentation and Guide Lines */
.tree-node__indent {
  display: flex;
  margin-left: var(--tree-node-indent-spacing, var(--spacing-2));
  height: 100%;
}

.tree-node__indent-guide {
  position: relative;
  width: var(--tree-line-indent, var(--spacing-4));
  height: 100%;
}

.tree-node__indent-guide::before,
.tree-node__indent-guide::after {
  content: '';
  position: absolute;
  background-color: var(--tree-line-color, rgb(107 114 128 / 0.25));
  width: var(--tree-line-width, 1px);
  border-style: var(--tree-line-style);
}

/* Vertical line – extends beyond node boundaries */
.tree-node__indent-guide::before {
  top: calc(-0.5 * (var(--tree-node-height) + var(--tree-node-padding-y)));
  bottom: calc(-0.5 * (var(--tree-node-height) + var(--tree-node-padding-y)));
  /* Adjusted to account for the toggle margin */
  left: calc((var(--tree-node-toggle-size) + 2 * var(--tree-node-toggle-margin)) / 2 - var(--tree-line-width) / 2);
  height: calc(100% + (var(--tree-node-height) + 0.5 * var(--tree-node-padding-y)));
}

/* Horizontal line – only for the last guide */
.tree-node__indent-guide:last-child::after {
  top: 50%;
  transform: translateY(-50%);
  /* Adjusted similarly */
  left: calc((var(--tree-node-toggle-size) + 2 * var(--tree-node-toggle-margin)) / 2 - var(--tree-line-width) / 2);
  width: 50%;
  height: var(--tree-line-width);
}

/* Hide vertical line for the last node at each level */
.tree-node:last-child > .tree-node__indent > .tree-node__indent-guide:last-child::before {
  height: calc(0.5 * (var(--tree-node-height) + var(--tree-node-padding-y)));
  top: calc(-0.5 * (var(--tree-node-height) + var(--tree-node-padding-y))); /* Half of min-height */
  bottom: auto;
}

/* Hide the vertical line for single children */
.tree-node:only-child > .tree-node__indent > .tree-node__indent-guide:last-child::before {
  display: none;
}

/* Show horizontal line for single children */
.tree-node:only-child > .tree-node__indent > .tree-node__indent-guide:last-child::after {
  display: block;
}

/* Expand/Collapse Control */
.tree-node__expand-control,
.tree-node__expand-control--placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--tree-node-toggle-size, var(--spacing-4));
  height: var(--tree-node-toggle-size, var(--spacing-4));
  margin: 0 var(--tree-node-toggle-margin, 0);
  color: var(--color-text-secondary);
}

.tree-node__expand-control .material-symbols-outlined {
  font-size: var(--tree-node-toggle-size, var(--font-size-sm));
  font-variation-settings: 'FILL' 0, 'wght' 400;
  transition: transform var(--transition-duration-fast) var(--transition-timing-function);
}

.tree-node__expand-control:hover {
  color: var(--color-accent);
}

/* Node Icon and Checkbox */
.tree-node__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--tree-node-icon-size, var(--spacing-4));
  height: var(--tree-node-icon-size, var(--spacing-4));
  margin-right: var(--tree-node-icon-margin, var(--spacing-2));
  /* Ensure minimum width even when no icon is present */
  min-width: var(--tree-node-icon-size, var(--spacing-4));
}

.tree-node__icon .material-symbols-outlined {
  /* Use custom property for icon size with fallback */
  font-size: var(--tree-node-icon-size, var(--font-size-base));
  font-variation-settings: 'FILL' 1, 'wght' 400;
}

.tree-node__checkbox {
  width: var(--tree-node-checkbox-size, var(--spacing-3));
  height: var(--tree-node-checkbox-size, var(--spacing-3));
  margin: 0 var(--tree-node-checkbox-margin, 0);
  cursor: pointer;
  border: 1.5px solid rgb(var(--color-surface-500-rgb));
  border-radius: 3px;
  background-color: transparent;
  transition: all var(--transition-duration-fast) var(--transition-timing-function);
}

.tree-node__checkbox:checked {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
}

.tree-node__checkbox:hover {
  border-color: var(--color-accent);
}

/* Node Content */
.tree-node__content {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  min-width: 0;
  padding: 0 var(--tree-node-padding-x, var(--spacing-2));
}

.tree-node__label {
  /* Use custom property for node font size */
  font-size: var(--tree-node-font-size, var(--font-size-sm));
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-duration-fast) var(--transition-timing-function);
}

/* Color Classes */
.text-accent {
  color: var(--color-accent);
}

.text-primary {
  color: var(--color-text-primary);
}

.text-text-secondary {
  color: var(--color-text-secondary);
}

/* Child Nodes Container */
.tree-node__children {
  position: relative;
}
</style>
