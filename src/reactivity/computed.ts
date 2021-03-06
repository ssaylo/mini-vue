import { ReactiveEffect } from './effect'

class ComputedRefImpl {
  private _getter: any;
  private _dirty = true;
  private _value: any;
  private _effect: any;
  constructor(getter: any) {
    this._getter = getter;

    this._effect = new ReactiveEffect(getter, () => { // this is scheduler
      if (this._dirty) {
        this._dirty = true;
      }
    });
  }

  public get value() {
    if (this._dirty) {
      this._dirty = false;
      this._value = this._effect.run();
    }
    return this._value;
  }
}

export function computed(getter: any) {
  return new ComputedRefImpl(getter);
} 