import { extend } from "../shared";

let activeEffect: any;
let shouldTrack: boolean;

export class ReactiveEffect {
  private _fn: any;

  public _scheduler: any;
  public deps: any = [];
  public onStop: any;

  // runner isStop?
  public active = true;

  constructor(fn: any, public scheduler?: any, onStop?: any) {
    this._fn = fn;
    this.onStop = onStop;
  }

  run() {
    if (!this.active) {
      return this._fn();
    }

    shouldTrack = true;
    activeEffect = this;
    const res = this._fn();
    shouldTrack = false;

    return res;
  }

  stop() {
    if (this.active) {
      cleanUpEffect(this);
      this.active = false;
      if (this.onStop) {
        this.onStop();
      }
    }
  }
}

export function trackEffects(dep: any) {
  // 已经在 dep 中, 则不需要收集
  if (dep.has(activeEffect)) return;

  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

const targetMap = new Map();
export function track(target: string, key: string | symbol) {
  if (!isTracking()) return;

  //  taget -> key -> dep
  let depsMap = targetMap.get(target);

  if (!depsMap) { 
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Set();
    depsMap.set(key, dep);
  } 
  trackEffects(dep);
}

export function isTracking() {
  return shouldTrack && activeEffect !== undefined;
}

export function triggerEffects(dep: any) {
    for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

export function trigger(target: string, key: string | symbol) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  triggerEffects(dep);
}

export function effect(fn: any, options: { scheduler?: any, onStop?: any } = {}) {
  // scheduler
  const { scheduler, onStop } = options
  // fn
  const _effect: any = new ReactiveEffect(fn, scheduler, onStop);

  extend(_effect, options);
  // Object.assign(_effect, options)

  _effect.run();

  // 这里需要处理一下指针的问题，以当前的这个实例作为 this 的一个指向。
  const runner = _effect.run.bind(_effect);
  runner.effect = _effect;
  return runner;
}

export function stop(runner: any) {
  runner.effect.stop();
}

function cleanUpEffect(effect: any) {
  effect.deps.forEach((dep: any) => {
    dep.delete(effect);
  })
}