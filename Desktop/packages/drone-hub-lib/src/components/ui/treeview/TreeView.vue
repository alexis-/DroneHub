<template>
  <div class="tree-view" :style="customStyle">
    <!-- Content -->
    <div class="tree-view__content">
      <!-- If we have at least one root node, display them all. Otherwise show empty. -->
      <template v-if="rootTreeNodes.length > 0">
        <TreeNode
          v-for="(node, index) in rootTreeNodes"
          :key="node.id"
          :node="node"
          :depth="0"
        />
      </template>

      <div v-else class="tree-view__empty">
        <span class="material-symbols-outlined">
          error_outline
        </span>
        <span>No items to display</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
//#region Imports
import { ref, computed, watch } from 'vue';
import type { TreeNodeData as ITreeNode } from './TreeViewModels';
import { buildTreeModel } from './TreeViewBuilder';
import { default as TreeNode } from './TreeNode.vue';
import { TREE_MODEL_META } from './decorators/TreeModel';
//#endregion


/**
 * The updated TreeView component can accept:
 *  - A single @TreeModel-decorated instance, or
 *  - An array of @TreeModel-decorated instances.
 * 
 * If an array is provided, each decorated item is turned into a top-level node.
 * Non-decorated items within that array are ignored (not displayed).
 */

const props = defineProps<{
  /**
   * The @TreeModel-decorated instance OR an array of decorated instances.
   * If it's an array, every decorated item is treated as a top-level node.
   */
  model?: any; 

  /**
   * Optional size options to override default text and item row sizes.
   */
  sizeOptions?: {
    treeNodeHeight?: string;
    treeNodeFontSize?: string;
    treeNodeIconSize?: string;
    treeNodeIndentSpacing?: string;
    treeNodePaddingY?: string;
    treeNodePaddingX?: string;
    treeNodeIconMargin?: string;
    treeNodeToggleSize?: string;
    treeNodeToggleMargin?: string;
    treeNodeCheckboxSize?: string;
    treeNodeCheckboxMargin?: string;
    treeLineWidth?: string;
    treeLineStyle?: string;
    treeLineColor?: string;
    treeLineIndent?: string;
  }
}>();


//#region rootTreeNodes

/**
 * We store ALL top-level nodes (one for a single-model scenario,
 * or multiple if `props.model` is an array).
 */
const rootTreeNodes = ref<ITreeNode[]>([]);


/**
 * Builds the array of root nodes based on the current props.model.
 * - If model is a single decorated instance, we build exactly one root node.
 * - If model is an array of instances, we attempt to build one root node per
 *   decorated item (items lacking @TreeModel are ignored).
 */
function rebuildRootNodes(model: any) {
  // If no model is provided, clear out.
  if (!model) {
    rootTreeNodes.value = [];
    return;
  }

  // If it's an array, build multiple top-level nodes for each decorated item.
  if (Array.isArray(model)) {
    const nodes: ITreeNode[] = [];

    for (const item of model) {
      // Attempt to see if the item is decorated with @TreeModel
      const hasTreeModel = item && item.constructor
        ? Reflect.getMetadata(TREE_MODEL_META, item.constructor)
        : undefined;

      // If decorated, build a root node for it
      if (hasTreeModel) {
        nodes.push(buildTreeModel(item));
      }
    }

    rootTreeNodes.value = nodes;
  }
  // Otherwise, assume it's a single object. Check if it is decorated.
  else {
    const hasTreeModel = Reflect.getMetadata(TREE_MODEL_META, model.constructor);
    if (hasTreeModel) {
      rootTreeNodes.value = [buildTreeModel(model)];
    } else {
      // If single model is not decorated, show no items
      rootTreeNodes.value = [];
    }
  }
}
//#endregion


//#region Watchers

/**
 * Watch for changes to props.model. If the user replaces the entire object or array,
 * we rebuild the tree from scratch. If the user modifies array contents (add/remove),
 * the deep option ensures we re-check and build the updated top-level nodes.
 * 
 * Note that property-level changes to a decorated instance are handled by watchers
 * inside buildTreeModel, so they remain reactive. But adding/removing items from
 * an array is handled here by re-scanning the array.
 */
watch(
  () => props.model,
  (newVal) => {
    rebuildRootNodes(newVal);
  },
  { immediate: true, deep: true }
);
//#endregion


//#region customStyle Computed

/**
 * Computes inline styles based on optional size options.
 * Developers can override default sizes via the sizeOptions prop.
 */
const customStyle = computed(() => {
  const style: Record<string, string> = {};

  // Node Dimensions
  if (props.sizeOptions?.treeNodeHeight) {
    style['--tree-node-height'] = props.sizeOptions.treeNodeHeight;
  }
  if (props.sizeOptions?.treeNodeFontSize) {
    style['--tree-node-font-size'] = props.sizeOptions.treeNodeFontSize;
  }
  if (props.sizeOptions?.treeNodeIconSize) {
    style['--tree-node-icon-size'] = props.sizeOptions.treeNodeIconSize;
  }
  if (props.sizeOptions?.treeNodeIndentSpacing) {
    style['--tree-node-indent-spacing'] = props.sizeOptions.treeNodeIndentSpacing;
  }

  // Node Padding and Margins
  if (props.sizeOptions?.treeNodePaddingY) {
    style['--tree-node-padding-y'] = props.sizeOptions.treeNodePaddingY;
  }
  if (props.sizeOptions?.treeNodePaddingX) {
    style['--tree-node-padding-x'] = props.sizeOptions.treeNodePaddingX;
  }
  if (props.sizeOptions?.treeNodeIconMargin) {
    style['--tree-node-icon-margin'] = props.sizeOptions.treeNodeIconMargin;
  }

  // Toggle and Checkbox
  if (props.sizeOptions?.treeNodeToggleSize) {
    style['--tree-node-toggle-size'] = props.sizeOptions.treeNodeToggleSize;
  }
  if (props.sizeOptions?.treeNodeToggleMargin) {
    style['--tree-node-toggle-margin'] = props.sizeOptions.treeNodeToggleMargin;
  }
  if (props.sizeOptions?.treeNodeCheckboxSize) {
    style['--tree-node-checkbox-size'] = props.sizeOptions.treeNodeCheckboxSize;
  }
  if (props.sizeOptions?.treeNodeCheckboxMargin) {
    style['--tree-node-checkbox-margin'] = props.sizeOptions.treeNodeCheckboxMargin;
  }

  // Tree Lines
  if (props.sizeOptions?.treeLineWidth) {
    style['--tree-line-width'] = props.sizeOptions.treeLineWidth;
  }
  if (props.sizeOptions?.treeLineStyle) {
    style['--tree-line-style'] = props.sizeOptions.treeLineStyle;
  }
  if (props.sizeOptions?.treeLineColor) {
    style['--tree-line-color'] = props.sizeOptions.treeLineColor;
  }
  if (props.sizeOptions?.treeLineIndent) {
    style['--tree-line-indent'] = props.sizeOptions.treeLineIndent;
  }

  return style;
});
//#endregion
</script>

<style scoped>
.tree-view {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 2rem;
  background-color: transparent;
  border: none;
  border-radius: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tree-view__content {
  flex: 1;
  overflow: auto;
}

.tree-view__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  height: 100%;
  min-height: 4rem;
  padding: var(--spacing-4);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.tree-view__empty .material-symbols-outlined {
  font-size: var(--font-size-xl);
  color: var(--color-text-tertiary);
  font-variation-settings: 'FILL' 1, 'wght' 300;
}
</style>
