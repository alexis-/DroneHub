//#region Imports and Symbol Declaration
import 'reflect-metadata';
import type { TreeItemOptionsBase } from './TreeItemOptionsBase';

/**
 * Symbol to store metadata for TextTreeItem on a specific property
 */
export const TEXT_TREE_ITEM_META = Symbol('TEXT_TREE_ITEM_META');

//#endregion


//#region TextTreeItem Decorator

/**
 * Options for a TextTreeItem decorator.
 */
export interface TextTreeItemOptions extends TreeItemOptionsBase {
  /**
   * Optional function to format the value display.
   * If provided, the name property is ignored and this function's output is used directly.
   */
  value?: (value: any) => string;
}

/**
 * Decorator that marks a property as a **Text Tree Item** (a simple label).
 * 
 * @param options Configuration for rendering a text item in the tree.
 */
export function TextTreeItem(options: TextTreeItemOptions = {}): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(TEXT_TREE_ITEM_META, options, target, propertyKey);
  };
}

//#endregion
