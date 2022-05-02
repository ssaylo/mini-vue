import { extend } from "../shared";

class ReactiveEffect {
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
    activeEffect = this;
    return this._fn();  
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

const targetMap = new Map();
export function track(target: string, key: string | symbol) {
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
  if (!activeEffect) return;
  dep.add(activeEffect);
  activeEffect.deps.push(dep);
}

export function trigger(target: string, key: string | symbol) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  for (const effect of dep) {
    if (effect.scheduler) {
      effect.scheduler();
    } else {
      effect.run();
    }
  }
}

let activeEffect: any;
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