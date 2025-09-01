/** 
 * Clone Object Utility
 */

export function cloneObject<T>(this: T, cloneMethods = true): T {

  /** Return the original data if it's not an object */
  if (this === null || typeof this !== 'object') {
    console.warn(`Warning: obj passed to deepClone is not an object. (Value: ${this})`);
    return this;
  }

  const clone = JSON.parse(JSON.stringify(this));

  /** Return clone without functions if specified */
  if (!cloneMethods) {
    return clone;
  }

  /** Iterate through the object and extract methods */
  for (const key in this) {
    
    // Check the original prototype
    if (Object.prototype.hasOwnProperty.call(this, key)) {

      // Check if it's a function
      if (typeof this[key] === 'function') {
        clone[key] = this[key].bind(clone);
      }

      // Check if it's an object and it's not null (therefore it might have children)
      // Call this function recursively if so
      clone[key] = clone(this[key]);
    }
  }

  return clone;
}

