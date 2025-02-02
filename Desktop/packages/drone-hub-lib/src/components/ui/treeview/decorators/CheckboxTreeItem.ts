//#region Imports and Symbol Declaration
import 'reflect-metadata';
import type { TextTreeItemOptions } from './TextTreeItem';

/**
 * Symbol to store metadata for CheckboxTreeItem on a specific property
 */
export const CHECKBOX_TREE_ITEM_META = Symbol('CHECKBOX_TREE_ITEM_META');

//#endregion


//#region CheckboxTreeItem Decorator

/**
 * Options for a CheckboxTreeItem decorator.
 */
export interface CheckboxTreeItemOptions extends TextTreeItemOptions {
  /**
   * Toggles an item's boolean property based on user interaction in the tree.
   * @param itemValue The property value (or array element) being toggled.
   * @param isChecked The new boolean state requested.
   */
  toggleFunc?: (itemValue: any, isChecked: boolean) => void;
}

/**
 * Decorator that marks a property (or items in a collection) as a **Checkbox Tree Item**.
 *
 * If it's placed on an array property combined with `@TreeCollectionItem`, each array element
 * will become a checkbox item in the tree.  
 * If it's placed on a single property, that property itself is a checkbox item.
 * 
 * @param options Configuration for rendering a checkbox item in the tree.
 */
export function CheckboxTreeItem(options: CheckboxTreeItemOptions = {}): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(CHECKBOX_TREE_ITEM_META, options, target, propertyKey);
  };
}

//#endregion
