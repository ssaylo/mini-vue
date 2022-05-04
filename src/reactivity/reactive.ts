import { mutableHandlers, readonlyHandlers, shallowReadOnlyHandlers } from "./baseHandlers";
import { isObject } from '../shared/index';

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadOnly',
}

export function reactive(raw: any) {
  return createReactiveObject(raw, mutableHandlers);
}

export function readonly(raw: any) {
  return createReactiveObject(raw, readonlyHandlers);
}

export function shallowReadOnly(raw: any) {
  return createReactiveObject(raw, shallowReadOnlyHandlers);
}

function createReactiveObject(raw: any, baseHandlers: any) {
  if (!isObject(raw)) {
    console.warn("target: " + raw + " is not an object");
    return raw;
  }
  return new Proxy(raw, baseHandlers);
}

export function isReactive(obj: any) {
  // 这里用一个值的转换，非 proxy 时肯定是个 undefined,
  return !!obj[ReactiveFlags.IS_REACTIVE];
}

export function isReadOnly(obj: any) {
  return !!obj[ReactiveFlags.IS_READONLY];
}

export function isProxy(obj: any) {
  return isReactive(obj) || isReadOnly(obj);
}

