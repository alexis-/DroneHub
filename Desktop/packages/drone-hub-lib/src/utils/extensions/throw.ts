// declare global {
//   interface Object {
//     throwIfNullish(message?: string): this;
//   }
// }

// function getCallerInfo(): string {
//   const error = new Error();
//   const stack = error.stack?.split('\n');
//   if (!stack || stack.length < 4) return 'Unknown';
  
//   // Get the caller's stack frame (index 3 because: 0=Error, 1=getCallerInfo, 2=throwIfNullish, 3=actual caller)
//   const callerFrame = stack[3].trim();
//   // Extract just the function/class name and location
//   const match = callerFrame.match(/at (?:([^.]+)\.)?([^(\s]+)\s*\(([^)]+)\)/);
//   if (match) {
//     const [, className, methodName, location] = match;
//     return `${className ? className + '.' : ''}${methodName} (${location})`;
//   }
//   return callerFrame.replace(/^\s*at\s*/, '');
// }

// Object.prototype.throwIfNullish = function(message?: string): any {
//   const caller = getCallerInfo();
  
//   if (this === undefined) {
//     throw new Error(`[${caller}] ${message ?? 'parameter is undefined'}`);
//   }

//   if (this === null) {
//     throw new Error(`[${caller}] ${message ?? 'parameter is null'}`);
//   }

//   return this;
// };

// export {}