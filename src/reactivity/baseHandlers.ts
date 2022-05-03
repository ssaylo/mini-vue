import { isObject } from "../shared";
import { track, trigger } from "./effect";
import { reactive, readonly, ReactiveFlags } from './reactive';

const get = createGetter();
const set = createSetter();
const readOnlyGet = createGetter(true);

function createGetter(isReadOnly: boolean = false) {
  return function get(target: any, key: string | symbol) {
    const res = Reflect.get(target, key);

    // 看看 res 是不是一个 Object
    if (isObject(res)) {
      return isReadOnly ? readonly(res) : reactive(res);
    }

    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadOnly
    }

    if (key === ReactiveFlags.IS_READONLY) {
      return isReadOnly
    }

    if (!isReadOnly) { 
      track(target, key);
    }
    return res;
  }
}

function createSetter() {
  return function set(target: any, key: string | symbol, value: any) {
    const res = Reflect.set(target, key, value);
    trigger(target, key);
    return res;
  }
}

export const mutableHandlers = {
  get,
  set
}

export const readonlyHandlers = {
  get: readOnlyGet,
  set: (target: any, key: string | symbol, value: string) => {
    console.warn('you can\'t set value of readonly Object');
    return true;
  }
}