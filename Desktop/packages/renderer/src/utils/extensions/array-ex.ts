interface Array<T> {
  first(predicate?: (value: T) => boolean): T;
  firstOrDefault(predicate?: (value: T) => boolean, defaultValue?: T | null): T | null;
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
