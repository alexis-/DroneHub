//#region Imports and Symbol Declaration
import 'reflect-metadata';
import type { TreeItemOptionsBase } from './TreeItemOptionsBase';

/**
 * Symbol to store metadata for TreeCollectionItem on a specific property
 */
export const COLLECTION_TREE_ITEM_META = Symbol('COLLECTION_TREE_ITEM_META');

//#endregion


//#region TreeCollectionItem Decorator

/**
 * Options for a TreeCollectionItem decorator.
 * This marks a property as a "collection" that becomes a parent node in the tree,
 * with child nodes representing each array element.
 */
export interface CollectionTreeItemOptions extends TreeItemOptionsBase {
  // Note: TreeModel inherit everything for consistency and future extensibility
}

/**
 * Decorator that marks an array property as a "collection" to be shown as a **parent node** in the tree.
 * 
 * @param options Configuration for rendering a collection in the tree.
 */
export function TreeCollectionItem(options: CollectionTreeItemOptions = {}): PropertyDecorator {
  return (target: Object, propertyKey: string | symbol) => {
    Reflect.defineMetadata(COLLECTION_TREE_ITEM_META, options, target, propertyKey);
  };
}

//#endregion
