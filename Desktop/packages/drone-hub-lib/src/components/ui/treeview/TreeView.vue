<template>
  <div class="tree-view" :style="customStyle">
    <!-- Content -->
    <div class="tree-view__content">
      <TreeNode
        v-if="rootTreeNode"
        :node="rootTreeNode"
        :depth="0"
      />
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
import { watch, ref, computed } from 'vue';
import { buildTreeModel } from './TreeViewBuilder';
import TreeNode from './TreeNode.vue';
import type { TreeNodeData as ITreeNode } from './TreeViewModels';

/**
 * The top-level TreeView that receives an annotated model instance and 
 * automatically builds a reactive tree.
 */
const props = defineProps<{
  /**
   * The annotated model instance (should be reactive if you want full reactivity).
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

//#region rootTreeNode reactivity

/**
 * The root node built from the model. 
 * We rebuild it whenever props.model changes.
 */
const rootTreeNode = ref<ITreeNode | null>(null);

/**
 * Watch for the model reference changing. If the user replaces
 * the entire model instance, we rebuild the entire tree from scratch.
 * Otherwise, partial changes are handled by watchers in buildTreeModel’s reactive nodes.
 */
watch(
  () => props.model,
  (newModel) => {
    rootTreeNode.value = newModel ? buildTreeModel(newModel) : null;
  },
  { immediate: true }
);

//#endregion

//#region customStyle computed

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
