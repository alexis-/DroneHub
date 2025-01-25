export {};

/**
 * Extends the Array prototype with additional utility methods
 */

declare global {
  interface Array<T> {
    /**
     * Returns the first element of the array that satisfies the provided predicate.
     * If no predicate is provided, returns the first element of the array.
     * @throws Error if the array is empty or no element satisfies the predicate
     */
    first(predicate?: (value: T) => boolean): T;

    /**
     * Returns the first element of the array that satisfies the provided predicate,
     * or a default value if no element is found.
     * If no predicate is provided, returns the first element or the default value.
     */
    firstOrDefault(predicate?: (value: T) => boolean, defaultValue?: T | null): T | null;
  }
}

Array.prototype.first = function <T>(this: T[], predicate?: (value: T) => boolean): T {
  if (!predicate) {
    if (this.length === 0) {
      throw new Error('The array is empty.');
    }
    return this[0];
  }

  const result = this.find(predicate);
  if (result === undefined) {
    throw new Error('No element satisfies the condition in predicate.');
  }
  return result;
};

Array.prototype.firstOrDefault = function <T>(
  this: T[],
  predicate?: (value: T) => boolean,
  defaultValue: T | null = null,
): T | null {
  if (!predicate) {
    return this.length > 0 ? this[0] : defaultValue;
  }

  const result = this.find(predicate);
  return result !== undefined ? result : defaultValue;
};
