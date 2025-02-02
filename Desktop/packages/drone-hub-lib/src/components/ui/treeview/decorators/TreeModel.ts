//#region Imports and Symbol Declaration
import 'reflect-metadata';
import type { TreeItemOptionsBase } from './TreeItemOptionsBase';

/**
 * Symbol to store metadata about the root model definition, if any.
 */
export const TREE_MODEL_META = Symbol('TREE_MODEL_META');

//#endregion


//#region TreeModel Decorator

/**
 * Options for a TreeModel decorator, specifying how the **root node** is named.
 */
export interface TreeModelOptions extends TreeItemOptionsBase {
  // Note: TreeModel inherit everything for consistency and future extensibility
}

/**
 * Decorator that designates a class as a "TreeModel" 
 * and defines how the **root node** of the tree should be labeled.
 * 
 * @param options The options for the tree model, including a `name` property
 */
export function TreeModel(options: TreeModelOptions = {}): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(TREE_MODEL_META, options, target);
  };
}

//#endregion
