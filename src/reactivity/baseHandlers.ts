import { track, trigger } from "./effect";

const get = createGetter();
const set = createSetter();
const readOnlyGet = createGetter(true);

function createGetter(isReadOnly: boolean = false) {
  return function get(target: any, key: string | symbol) {
    const res = Reflect.get(target, key);
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