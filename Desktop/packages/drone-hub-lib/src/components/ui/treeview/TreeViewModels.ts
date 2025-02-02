//#region TreeNode Interfaces

/**
 * A high-level enumeration of possible item types in the tree.
 * Add more as needed (e.g., 'button', 'slider', 'custom', etc.)
 */
export type TreeItemType = 'text' | 'checkbox' | 'collection';

/**
 * Describes a single node in our tree. 
 */
export interface TreeNodeData {
  /**
   * A stable unique ID for the node (useful to track expansions/selections).
   */
  id: string;

  /**
   * The node's display label.
   */
  label: string;

  /**
   * The item type (text, checkbox, collection, etc.)
   */
  type: TreeItemType;

  /**
   * The Material Symbols icon to display for this node.
   * If not provided, a default icon will be chosen based on type and content.
   */
  icon?: string;

  /**
   * Indicates whether this node is visible in the tree. (optional usage)
   */
  visible: boolean;

  /**
   * Indicates whether this node is selected. (optional usage)
   */
  selected: boolean;

  /**
   * Indicates whether this node can be selected.
   * Only nodes with selectable === true will respond to selection toggling.
   */
  selectable: boolean;

  /**
   * Indicates whether this node is expanded. If `true`, children are displayed.
   */
  expanded: boolean;

  /**
   * Array of child nodes, if any.
   */
  children: TreeNodeData[];

  /**
   * Optional callback to handle node expansion.
   */
  onExpand?: (node: TreeNodeData) => void;

  /**
   * Optional callback to handle node collapse.
   */
  onCollapse?: (node: TreeNodeData) => void;

  /**
   * Optional callback invoked when the node is selected.
   */
  onSelected?: (node: TreeNodeData) => void;

  /**
   * Optional callback invoked when the node is deselected.
   */
  onDeselected?: (node: TreeNodeData) => void;

  /**
   * Optional callback invoked when user double-clicks this node.
   */
  onDoubleClick?: (node: TreeNodeData) => void;

  /**
   * Optional callback invoked when user right-clicks this node.
   */
  onRightClick?: (node: TreeNodeData) => void;

  /**
   * For a checkbox node, the function that toggles the actual value in the model.
   */
  toggleFunc?: (itemValue: any, checked: boolean) => void;

  /**
   * The original model instance or property value that this node represents,
   * used by checkboxes or advanced functionalities.
   */
  originalValue?: any;
}

/**
 * Helper type for building an item in the tree. This is 
 * a partial of TreeNode plus mandatory `id` and `type`.
 */
export interface PartialTreeNode extends Partial<TreeNodeData> {
  id: string;
  type: TreeItemType;
}

/**
 * For convenience, a function that obtains a string from either 
 * a string literal or a function that returns a string.
 */
export function getStringLabel<T>(labelOrFn?: string | ((arg: T) => string), arg?: T): string {
  if (!labelOrFn) {
    return '';
  }
  if (typeof labelOrFn === 'function') {
    try {
      return labelOrFn(arg!);
    } catch {
      return '';
    }
  }
  return labelOrFn;
}

//#endregion
