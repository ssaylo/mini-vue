
class ReactiveEffect {
  private _fn: any;

  constructor(fn: any) {
    this._fn = fn;
  }

  run() {
    activeEffect = this;
    return this._fn();  
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
  dep.add(activeEffect);
}

export function trigger(target: string, key: string | symbol) {
  let depsMap = targetMap.get(target);
  let dep = depsMap.get(key);
  for (const effect of dep) {
    effect.run();
  }
}

let activeEffect: any;
export function effect(fn: any) {
  // fn
  const _effect = new ReactiveEffect(fn);

  _effect.run();

  // 这里需要处理一下指针的问题，以当前的这个实例作为 this 的一个指向。
  return _effect.run.bind(_effect);
}