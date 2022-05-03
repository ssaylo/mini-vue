import { mutableHandlers, readonlyHandlers, shallowReadOnlyHandlers } from "./baseHandlers";

export const enum ReactiveFlags {
  IS_REACTIVE = '__v_isReactive',
  IS_READONLY = '__v_isReadOnly',
}

export function reactive(raw: any) {
  return createActiveObject(raw, mutableHandlers);
}

export function readonly(raw: any) {
  return createActiveObject(raw, readonlyHandlers);
}

export function shallowReadOnly(raw: any) {
  return createActiveObject(raw, shallowReadOnlyHandlers);
}

function createActiveObject(raw: any, baseHandlers: any) {
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

