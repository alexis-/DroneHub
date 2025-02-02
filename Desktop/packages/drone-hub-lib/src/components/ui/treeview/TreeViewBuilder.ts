//#region Imports
import 'reflect-metadata';
import { v4 as uuidv4 } from 'uuid';
import {
  reactive,
  watch,
  type WatchStopHandle,
} from 'vue';

import {
  TREE_MODEL_META,
  TEXT_TREE_ITEM_META,
  CHECKBOX_TREE_ITEM_META,
  COLLECTION_TREE_ITEM_META,
  type TreeModelOptions,
  type TextTreeItemOptions,
  type CheckboxTreeItemOptions,
  type CollectionTreeItemOptions,
} from './decorators';

import {
  type TreeNodeData,
  type TreeItemType,
  getStringLabel,
} from './TreeViewModels';
//#endregion

/**
 * A small structure that helps us track children for array-based collection nodes,
 * so we can do partial additions/removals without losing expansions or selection.
 */
interface CollectionNodeState {
  // The watch handle that listens for changes in the array
  stopWatching: WatchStopHandle;
  // A map from array item object -> TreeNodeData
  itemNodeMap: Map<any, TreeNodeData>;
}

/**
 * Builds a reactive root TreeNode for a given annotated model instance.
 * Any changes in the instance’s properties or arrays will be reflected in this TreeNode’s structure.
 * 
 * @param instance The annotated model instance (reactive or plain). 
 * @returns A reactive root TreeNodeData
 */
export function buildTreeModel(instance: any): TreeNodeData {
  // If invalid, return a fallback
  if (!instance) {
    return createFallbackRootNode('No model instance provided');
  }

  // Retrieve the constructor so we can read class-level metadata
  const ctor = instance.constructor;
  if (!ctor) {
    return createFallbackRootNode('Invalid constructor on instance');
  }

  // Read TreeModel options from the class metadata
  const treeModelOptions: TreeModelOptions =
    Reflect.getMetadata(TREE_MODEL_META, ctor) || {};

  // Return the fully reactive root node
  return buildRootNode(instance, treeModelOptions);
}

//#region buildRootNode

function buildRootNode(instance: any, modelOptions: TreeModelOptions): TreeNodeData {
  // We'll define a reactive node that automatically updates its label
  // from the model-level `name` property or fallback to the constructor name.
  const rootNode = reactive<TreeNodeData>({
    id: uuidv4(),
    // Label is computed from the top-level @TreeModel name:
    get label() {
      return getStringLabel(modelOptions.name, instance) || instance.constructor.name;
    },
    type: 'text',
    visible: true,
    selectable: modelOptions.selectable ?? false,
    selected: false,
    expanded: true,
    children: [],
    onExpand: modelOptions.onExpand
      ? () => modelOptions.onExpand?.(instance)
      : undefined,
    onCollapse: modelOptions.onCollapse
      ? () => modelOptions.onCollapse?.(instance)
      : undefined,
    onSelected: modelOptions.onSelected
      ? () => modelOptions.onSelected?.(instance)
      : undefined,
    onDeselected: modelOptions.onDeselected
      ? () => modelOptions.onDeselected?.(instance)
      : undefined,
    onDoubleClick: modelOptions.onDoubleClick
      ? () => modelOptions.onDoubleClick?.(instance)
      : undefined,
    onRightClick: modelOptions.onRightClick
      ? () => modelOptions.onRightClick?.(instance)
      : undefined,
    toggleFunc: undefined,
    originalValue: instance,
  });

  // Read property names from the instance
  //    We'll get all property keys from the instance (and possibly prototype for getters).
  //    Some of these might have decorators.
  const allProps = getAllPropertyKeys(instance);

  allProps.forEach((propKey) => {
    // Attempt to build child nodes for each property based on its decorators
    const childNodes = buildChildNodesForProperty(instance, propKey);
    
    // If we got any child nodes, push them to root children
    childNodes.forEach((childNode) => {
      rootNode.children.push(childNode);
    });
  });

  return rootNode;
}

//#endregion

//#region buildChildNodesForProperty

/**
 * Builds zero or more child TreeNodes for a given property. 
 * A property can have multiple decorators (e.g., `@TreeCollectionItem` + `@CheckboxTreeItem`).
 * 
 * @param instance The model instance
 * @param propKey The property name
 * @returns An array of child nodes (often of length 1, but could be more if you have e.g. a collection node plus sub-items).
 */
function buildChildNodesForProperty(instance: any, propKey: string | symbol): TreeNodeData[] {
  const textMeta: TextTreeItemOptions | undefined =
    Reflect.getMetadata(TEXT_TREE_ITEM_META, instance, propKey);
  const checkboxMeta: CheckboxTreeItemOptions | undefined =
    Reflect.getMetadata(CHECKBOX_TREE_ITEM_META, instance, propKey);
  const collectionMeta: CollectionTreeItemOptions | undefined =
    Reflect.getMetadata(COLLECTION_TREE_ITEM_META, instance, propKey);

  // If no decorators, skip
  if (!textMeta && !checkboxMeta && !collectionMeta) {
    return [];
  }

  // If there's a collectionMeta, we treat this property as a collection node.
  if (collectionMeta) {
    // Determine the item metadata – if a checkbox decorator is present, use that; otherwise, use text metadata.
    const itemTreeItemMeta: TextTreeItemOptions | CheckboxTreeItemOptions | undefined =
      checkboxMeta || textMeta;
    const collectionNode = buildCollectionNode(instance, propKey, collectionMeta, itemTreeItemMeta);
    return [collectionNode];
  }

  // Otherwise, handle as text or checkbox
  const singleNode = buildSingleNode(instance, propKey, textMeta, checkboxMeta);
  return [singleNode];
}

//#endregion

//#region buildCollectionNode

/**
 * Builds a single "collection node" (parent) with child nodes for each array element. 
 * 
 * If combined with `@CheckboxTreeItem` or `@TextTreeItem`, each child item will be built accordingly.
 * 
 * @param instance The model instance
 * @param propKey The property name that is a collection
 * @param collectionMeta The @TreeCollectionItem decorator options
 * @param itemTreeItemMeta The metadata for individual items in the collection (can be text, checkbox, etc.)
 */
function buildCollectionNode(
  instance: any,
  propKey: string | symbol,
  collectionMeta: CollectionTreeItemOptions,
  itemTreeItemMeta?: TextTreeItemOptions | CheckboxTreeItemOptions
): TreeNodeData {
  // Parent node is reactive; label is computed
  const parentNode = reactive<TreeNodeData>({
    id: uuidv4(),
    get label() {
      const arrayVal = getPropertyValue(instance, propKey);
      return getStringLabel(collectionMeta.name, arrayVal) || String(propKey);
    },
    type: 'collection',
    visible: true,
    selected: false,
    selectable: collectionMeta.selectable ?? false,
    expanded: false,
    children: [],
    onExpand: collectionMeta.onExpand
      ? (node) => collectionMeta.onExpand?.(getPropertyValue(instance, propKey))
      : undefined,
    onCollapse: collectionMeta.onCollapse
      ? (node) => collectionMeta.onCollapse?.(getPropertyValue(instance, propKey))
      : undefined,
    onSelected: collectionMeta.onSelected
      ? (node) => collectionMeta.onSelected?.(getPropertyValue(instance, propKey))
      : undefined,
    onDeselected: collectionMeta.onDeselected
      ? (node) => collectionMeta.onDeselected?.(getPropertyValue(instance, propKey))
      : undefined,
    onDoubleClick: collectionMeta.onDoubleClick
      ? (node) => collectionMeta.onDoubleClick?.(getPropertyValue(instance, propKey))
      : undefined,
    onRightClick: collectionMeta.onRightClick
      ? (node) => collectionMeta.onRightClick?.(getPropertyValue(instance, propKey))
      : undefined,
    toggleFunc: undefined,
    originalValue: getPropertyValue(instance, propKey),
  });

  // We maintain a map from array items -> their child node,
  // so that if the array changes, we can add/remove nodes
  // without re-building everything or losing expansions.
  const collectionState: CollectionNodeState = {
    stopWatching: null as unknown as WatchStopHandle,
    itemNodeMap: new Map<any, TreeNodeData>(),
  };

  // Initialize the child nodes for the current array
  initCollectionChildren(parentNode, instance, propKey, itemTreeItemMeta, collectionState);

  // Watch the array, reacting to changes
  collectionState.stopWatching = watch(
    () => getPropertyValue(instance, propKey),
    (newArr, oldArr) => {
      // Re-diff the array, add or remove child nodes
      updateCollectionChildren(parentNode, instance, propKey, itemTreeItemMeta, collectionState);
    },
    { deep: true }
  );

  return parentNode;
}

/**
 * Initializes child nodes for an array property
 */
function initCollectionChildren(
  parentNode: TreeNodeData,
  instance: any,
  propKey: string | symbol,
  itemTreeItemMeta: TextTreeItemOptions | CheckboxTreeItemOptions | undefined,
  collectionState: CollectionNodeState
) {
  updateCollectionChildren(parentNode, instance, propKey, itemTreeItemMeta, collectionState);
}

/**
 * Updates the children of a collection node to match the current array state,
 * preserving existing child nodes for items that remain in the array.
 */
function updateCollectionChildren(
  parentNode: TreeNodeData,
  instance: any,
  propKey: string | symbol,
  itemTreeItemMeta: TextTreeItemOptions | CheckboxTreeItemOptions | undefined,
  collectionState: CollectionNodeState
) {
  const rawArray = getPropertyValue(instance, propKey);
  const arrayVal = Array.isArray(rawArray) ? rawArray : [];

  // A new set to track items that remain or are newly added
  const newItemSet = new Set<any>();

  // Step 1: For each item in the updated array, ensure we have a node
  arrayVal.forEach((item) => {
    if (!collectionState.itemNodeMap.has(item)) {
      // Build a new child node for this item using the provided itemTreeItemMeta
      const childNode = buildChildNodeForCollectionItem(item, itemTreeItemMeta);
      collectionState.itemNodeMap.set(item, childNode);
    }
    newItemSet.add(item);
  });

  // Step 2: Remove any nodes from the map whose items are no longer in the array
  for (const [oldItem, node] of collectionState.itemNodeMap.entries()) {
    if (!newItemSet.has(oldItem)) {
      collectionState.itemNodeMap.delete(oldItem);
    }
  }

  // Step 3: Rebuild the parentNode.children array in the correct order
  parentNode.children.length = 0;
  arrayVal.forEach((item) => {
    const node = collectionState.itemNodeMap.get(item);
    if (node) {
      parentNode.children.push(node);
    }
  });
}

//#endregion

//#region buildChildNodesForCollection Items

/**
 * Builds a child node for one array item. 
 * If the item itself has a @TreeModel, we recursively build its tree instead.
 * Otherwise we build a single node based on the provided tree item metadata.
 * 
 * @param item The array element
 * @param itemTreeItemMeta Metadata describing how to render the item (checkbox, text, etc.)
 */
function buildChildNodeForCollectionItem(
  item: any,
  itemTreeItemMeta?: TextTreeItemOptions | CheckboxTreeItemOptions
): TreeNodeData {
  const hasTreeModelDecorator = item?.constructor
    ? Reflect.getMetadata(TREE_MODEL_META, item.constructor)
    : undefined;

  if (hasTreeModelDecorator) {
    // Recursively build the tree for that child model
    return buildTreeModel(item);
  } else {
    // Build a single node based on the provided tree item metadata
    const node = buildSingleNodeForItem(item, itemTreeItemMeta);
    return node;
  }
}

/**
 * Builds a single child node for an array element, possibly of type checkbox or text.
 * 
 * @param itemValue The array element value.
 * @param treeItemMeta Metadata specifying how to render the item.
 */
function buildSingleNodeForItem(
  itemValue: any,
  treeItemMeta?: TextTreeItemOptions | CheckboxTreeItemOptions
): TreeNodeData {
  if (treeItemMeta) {
    // Determine the node type based on the metadata.
    const nodeType: TreeItemType = isCheckboxTreeItem(treeItemMeta) ? 'checkbox' : 'text';
    return buildReactiveNode(nodeType, itemValue, treeItemMeta);
  } else {
    // Fallback as a text node if no metadata is provided.
    return buildReactiveNode(
      'text',
      itemValue,
      { name: (val) => String(val) } // Minimal text metadata
    );
  }
}

/**
 * Helper function to determine if the provided tree item metadata is for a checkbox.
 * 
 * @param meta The tree item metadata (could be for text or checkbox).
 * @returns True if the metadata is for a checkbox tree item.
 */
function isCheckboxTreeItem(meta: any): meta is CheckboxTreeItemOptions {
  return meta && typeof meta.toggleFunc === 'function';
}

//#endregion

//#region buildSingleNode

function buildSingleNode(
  instance: any,
  propKey: string | symbol,
  textMeta?: TextTreeItemOptions,
  checkboxMeta?: CheckboxTreeItemOptions
): TreeNodeData {
  const nodeType: TreeItemType = checkboxMeta ? 'checkbox' : 'text';
  // Instead of capturing the property’s value once, we reference `instance[propKey]` dynamically
  // so that changes to instance[propKey] reflect in the label, etc.
  return buildReactiveNode(nodeType, { instance, propKey }, checkboxMeta || textMeta);
}

/**
 * Creates a reactive node for a single property or single item.
 * If `target` is {instance, propKey}, we read from that each time. 
 * If `target` is a direct item (like a marker), we read from that item itself.
 * 
 * @param nodeType 'text' or 'checkbox'
 * @param target either a direct object or an {instance, propKey} to read from
 * @param meta the user-provided annotation options
 */
function buildReactiveNode(
  nodeType: TreeItemType,
  target: any,
  meta?: TextTreeItemOptions | CheckboxTreeItemOptions
): TreeNodeData {
  const node = reactive<TreeNodeData>({
    id: uuidv4(),
    get label() {
      // This is re-computed each time the underlying property changes
      const val = resolveValue(target);
      return computeNodeLabel(meta, val, resolvePropKey(target));
    },
    type: nodeType,
    get icon() {
      const val = resolveValue(target);
      return meta?.icon
        ? getStringLabel(meta.icon, val)
        : undefined;
    },
    visible: true,
    selected: false,
    selectable: meta?.selectable ?? false,
    expanded: false,
    children: [],
    onExpand: meta?.onExpand ? () => meta.onExpand?.(resolveValue(target)) : undefined,
    onCollapse: meta?.onCollapse ? () => meta.onCollapse?.(resolveValue(target)) : undefined,
    onSelected: meta?.onSelected ? () => meta.onSelected?.(resolveValue(target)) : undefined,
    onDeselected: meta?.onDeselected ? () => meta.onDeselected?.(resolveValue(target)) : undefined,
    onDoubleClick: meta?.onDoubleClick ? () => meta.onDoubleClick?.(resolveValue(target)) : undefined,
    onRightClick: meta?.onRightClick ? () => meta.onRightClick?.(resolveValue(target)) : undefined,
    get toggleFunc() {
      // For checkbox nodes, define the toggle if provided
      if (nodeType === 'checkbox' && (meta as CheckboxTreeItemOptions)?.toggleFunc) {
        const cbMeta = meta as CheckboxTreeItemOptions;
        return (itemVal: any, checked: boolean) => {
          cbMeta.toggleFunc?.(itemVal, checked);
        };
      }
      return undefined;
    },
    get originalValue() {
      // The actual raw property or object
      return resolveValue(target);
    },
  });

  return node;
}

//#endregion

//#region Utility Functions

function computeNodeLabel(
  meta: TextTreeItemOptions | undefined,
  value: any,
  propKey?: string | symbol
) {
  if (!meta) {
    // fallback
    return propKey ? String(propKey) : String(value);
  }

  if (meta.value) {
    // If user set `value: (val) => string`, we use that directly
    return getStringLabel(meta.value, value);
  }

  // Otherwise, use 'name' + formatted value
  const nameStr = getStringLabel(meta.name, value) || (propKey ? (camelToWords(String(propKey)) + ': ') : '');
  return nameStr + formatValue(value);
}

/**
 * If the user gave us { instance, propKey }, read from instance[propKey].
 * Otherwise, treat the target as a direct value.
 */
function resolveValue(target: any): any {
  if (target && typeof target === 'object' && 'instance' in target && 'propKey' in target) {
    const { instance, propKey } = target;
    return getPropertyValue(instance, propKey);
  } else {
    // The target itself is the value (like array items)
    return target;
  }
}

function resolvePropKey(target: any): string | symbol | undefined {
  if (target && typeof target === 'object' && 'instance' in target && 'propKey' in target) {
    return target.propKey;
  }
  return undefined;
}

/**
 * Safely gets instance[propKey], handling possible getters.
 */
function getPropertyValue(instance: any, propKey: string | symbol) {
  if (!instance) return undefined;
  try {
    return instance[propKey];
  } catch {
    return undefined;
  }
}

/**
 * For fallback error node
 */
function createFallbackRootNode(message: string): TreeNodeData {
  return reactive<TreeNodeData>({
    id: uuidv4(),
    label: `Invalid Model: ${message}`,
    type: 'text',
    visible: true,
    selectable: false,
    selected: false,
    expanded: false,
    children: [],
  });
}

/**
 * Gathers all property keys (including getters) from the instance
 * up its prototype chain, ignoring the constructor & Object prototype.
 */
function getAllPropertyKeys(instance: any): (string | symbol)[] {
  let current = instance;
  const keys = new Set<string | symbol>();

  while (current && current !== Object.prototype) {
    Reflect.ownKeys(current).forEach(k => {
      if (k !== 'constructor') {
        keys.add(k);
      }
    });
    current = Object.getPrototypeOf(current);
  }

  return Array.from(keys);
}

/**
 * Formats the value for text display
 */
function formatValue(value: any): string {
  if (value === undefined || value === null) return '';
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (Array.isArray(value)) {
    return `${value.length} items`;
  }
  return String(value);
}

/**
 * Converts camelCase -> `Title Case`.
 */
function camelToWords(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

//#endregion
