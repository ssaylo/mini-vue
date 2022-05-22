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

export function isEmpty(obj: any) {
  // simpley isEmpty
  // 懒得用 lodash
  for (var key in obj){
    if (key) return false;
  }
  return true;
}

//最长递增子序列
export function getSequence(arr: number[]): number[] {
  const p = arr.slice();
  const result = [0];
  let i, j, u, v, c;
  const len = arr.length;
  for (i = 0; i < len; i++) {
    const arrI = arr[i];
    if (arrI !== 0) {
      j = result[result.length - 1];
      if (arr[j] < arrI) {
        p[i] = j;
        result.push(i);
        continue;
      }
      u = 0;
      v = result.length - 1;
      while (u < v) {
        c = (u + v) >> 1;
        if (arr[result[c]] < arrI) {
          u = c + 1;
        } else {
          v = c;
        }
      }
      if (arrI < arr[result[u]]) {
        if (u > 0) {
          p[i] = result[u - 1];
        }
        result[u] = i;
      }
    }
  }
  u = result.length;
  v = result[u - 1];
  while (u-- > 0) {
    result[u] = v;
    v = p[v];
  }
  return result;
}
