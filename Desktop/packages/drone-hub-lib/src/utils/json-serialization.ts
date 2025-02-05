//#region [TRANSIENT DECORATOR AND SERIALIZATION UTILITY]

import 'reflect-metadata';

/**
 * Unique symbol key used to store transient property metadata.
 */
const TRANSIENT_METADATA_KEY = Symbol('transient_properties');

/**
 * Decorator to mark a property as transient so it won't be persisted.
 *
 * @param target The target object.
 * @param propertyKey The name of the property.
 */
export function Transient(target: any, propertyKey: string): void {
  // Retrieve existing transient properties from the target (if any)
  const transientProperties: string[] = Reflect.getMetadata(TRANSIENT_METADATA_KEY, target) || [];
  // Add the current property key to the transient list
  transientProperties.push(propertyKey);
  // Update the metadata on the target with the new transient properties list
  Reflect.defineMetadata(TRANSIENT_METADATA_KEY, transientProperties, target);
}

/**
 * Serializes an object while omitting properties marked as transient.
 * This serializer does not handle circular references.
 *
 * @param viewModel The view model object to serialize.
 * @returns A JSON string with transient properties removed.
 */
export function serializeViewModel(viewModel: any): string {
  // Retrieve the list of transient properties from the root object's prototype.
  const transientProperties: string[] =
    Reflect.getMetadata(TRANSIENT_METADATA_KEY, Object.getPrototypeOf(viewModel)) || [];

  // Use a replacer function that excludes the transient properties.
  return JSON.stringify(
    viewModel,
    (key, value) => {
      // Only check for transient properties for non-root keys
      if (key !== "" && transientProperties.includes(key)) {
        return undefined;
      }
      return value;
    },
    2
  );
}

//#endregion


//#region [NEWTONSOFT-STYLE CIRCULAR REFERENCE HANDLING]

/**
 * Returns a replacer function for JSON.stringify that handles circular references
 * using the Newtonsoft JSON circular reference system.
 *
 * Circular references are replaced with an object containing a "$ref" property.
 * First occurrences of objects are tagged with a "$id" property.
 *
 * Additionally, this replacer omits any properties marked as transient on the parent object.
 *
 * @returns A replacer function for JSON.stringify.
 */
export function getNewtonsoftCircularReplacer(): (key: string, value: any) => any {

  // WeakMap to track seen objects and assign them unique ids.
  const seen = new WeakMap<object, number>();

  // Counter for generating unique ids.
  let idCounter = 1;

  /**
   * The replacer function used by JSON.stringify.
   *
   * @param key The property key.
   * @param value The property value.
   * @returns The value to be serialized.
   */
  const replacer = function (this: any, key: string, value: any): any {

    ////////////////////////////////////////////////////////////////////////////////////////
    // Remove properties marked as transient on the parent object.
    // "this" refers to the parent object when processing a property.
    ////////////////////////////////////////////////////////////////////////////////////////

    if (key !== "") {
      // Retrieve transient properties from the parent's prototype.
      const parentTransientProperties: string[] =
        Reflect.getMetadata(TRANSIENT_METADATA_KEY, Object.getPrototypeOf(this)) || [];
      if (parentTransientProperties.includes(key)) {
        return undefined;
      }
    }

    ////////////////////////////////////////////////////////////////////////////////////////
    // Handle circular references.
    // If a non-null object is encountered, check if it has already been seen.
    // If so, return a reference object; otherwise, assign a new "$id".
    ////////////////////////////////////////////////////////////////////////////////////////

    if (value && typeof value === "object") {
      // Check if the object has already been processed.
      if (seen.has(value)) {
        // Object already encountered: return a reference using its assigned id.
        return { "$ref": seen.get(value)?.toString() };
      } else {
        // First time encountering this object: assign a new id.
        const currentId = idCounter++;
        seen.set(value, currentId);

        // If the object is an array, we do not modify its structure.
        if (Array.isArray(value)) {
          return value;
        } else {
          // For non-array objects, create a shallow copy and inject the "$id" property.
          const newObj: any = { "$id": currentId.toString() };
          for (const prop in value) {
            if (Object.prototype.hasOwnProperty.call(value, prop)) {
              newObj[prop] = value[prop];
            }
          }
          return newObj;
        }
      }
    }

    // For all other types (primitives, functions, etc.), return the value unchanged.
    return value;
  };

  return replacer;
}

/**
 * Serializes an object using a JSON serializer that supports both
 * transient properties and circular references in the style of Newtonsoft JSON.
 *
 * This function injects "$id" for first occurrences of objects,
 * and uses a {"$ref": "<id>"} object for subsequent references.
 *
 * @param viewModel The view model object to serialize.
 * @returns A JSON string representing the object with circular references handled.
 */
export function serializeViewModelNewtonsoft(viewModel: any): string {
  return JSON.stringify(viewModel, getNewtonsoftCircularReplacer(), 2);
}

//#endregion


//#region [LEGACY CIRCULAR REPLACER FUNCTION]

/**
 * Legacy helper function to get a basic circular reference replacer.
 * 
 * This implementation is preserved for backward compatibility,
 * but it does not produce the Newtonsoft "$id" / "$ref" structure.
 *
 * @returns A replacer function that removes repeated references.
 */
export const getSimpleCircularReplacer = () => {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  };
};

//#endregion
