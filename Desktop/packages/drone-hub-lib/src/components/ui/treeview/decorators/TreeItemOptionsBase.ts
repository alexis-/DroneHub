/**
 * Base interface for all tree item options.
 * Contains common properties shared across different types of tree items.
 */
export interface TreeItemOptionsBase {
  /**
   * The displayed name for this item.
   * Can be a string or a function that receives the item value and returns a string.
   */
  name?: string | ((value: any) => string);

  /**
   * The Material Symbols icon to display for this item.
   * Can be a string or a function that receives the item value and returns a string.
   * If not provided, a default icon will be chosen based on the item type and content.
   */
  icon?: string | ((value: any) => string);

  /**
   * Indicates whether this tree item is selectable.
   * Defaults to false if not provided.
   */
  selectable?: boolean;

  /**
   * Handler invoked when node is expanded.
   */
  onExpand?: (value: any) => void;

  /**
   * Handler invoked when node is collapsed.
   */
  onCollapse?: (value: any) => void;

  /**
   * Handler invoked when node is selected.
   */
  onSelected?: (value: any) => void;

  /**
   * Handler invoked when node is deselected.
   */
  onDeselected?: (value: any) => void;

  /**
   * Handler invoked when user double-clicks this item.
   */
  onDoubleClick?: (value: any) => void;

  /**
   * Handler invoked when user right-clicks this item.
   */
  onRightClick?: (value: any) => void;
}
