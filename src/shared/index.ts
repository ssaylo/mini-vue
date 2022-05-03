// export function extend(target: any, options: any) {
//   return Object.assign(target, options);
// }
export const extend = Object.assign

// we can use lodjash
export function isObject(obj: any) {
  return obj !== null && typeof obj === "object";
}
