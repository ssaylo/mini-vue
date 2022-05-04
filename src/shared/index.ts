// export function extend(target: any, options: any) {
//   return Object.assign(target, options);
// }
export const extend = Object.assign

// we can use lodjash
export function isObject(obj: any) {
  return obj !== null && typeof obj === "object";
}

export function hasOwn(obj: any, key: string) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export const hasChanged = (newValue: any, oldValue: any) => !Object.is(newValue, oldValue);