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

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function toHandlerKey(str: string) {
  return str ? "on" + capitalize(str) : "";
}

export function camelize(str: string) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : "");
}

