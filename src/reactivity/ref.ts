import { hasChanged, isObject } from '../shared';
import { trackEffects, triggerEffects, isTracking } from './effect';
import { reactive } from './reactive';

class RefImpl {
  private _value: any;
  private _rawValue: any;
  public dep: any;
  public __v_isRef = true;

  constructor(value: any) {
    this._rawValue = value;
    this._value = convert(value);
    // value -> reactive，变成了 proxy，所以下面的hasChanged需要做一定的修改
    this.dep = new Set();
  }

  public get value() {
    trackRefValue(this);
    return this._value;
  }

  public set value(newValue) {
    if (!hasChanged(newValue, this._rawValue)) return;

    this._rawValue = newValue;
    this._value = convert(newValue);
    triggerEffects(this.dep);
  }
}

function trackRefValue(ref: any) {
  if (isTracking()) {
    trackEffects(ref.dep);
  }
}

function convert(value: any) {
  return isObject(value) ? reactive(value) : value;
}

export function ref(value: any) {
  return new RefImpl(value);
}

export function isRef(ref: any) {
  return !!ref.__v_isRef;
}

export function unRef(ref: any) {
  return isRef(ref) ? ref.value : ref;
}

export function proxyRefs(objectWithRefs: any) {
  return new Proxy(objectWithRefs, {
    get(target, key) {
      return unRef(Reflect.get(target, key))
    },
    set(target, key, value) {
      // set -> ref .value
      if (isRef(target[key]) && !isRef(value)) {
        return (target[key].value = value);
      } else {
        return Reflect.set(target, key, value);
      }
    }
  })
}