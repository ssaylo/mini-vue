import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { shallowReadOnly } from '../reactivity/reactive';
import { emit } from "./componentEmit";
import { initSlots } from "./componentSlots";
import { proxyRefs } from "../reactivity";

export function createComponentInstance(vnode: any, parent: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
    emit: (event: string, ...args: any[]) => {},
    slots: {},
    provides: parent ? parent.provides : {},
    parent,
    isMounted: false,
    subTree: {},
    next: null,
  };

  component.emit = emit.bind(null, component);

  return component;
}

export function setupComponent(instance: any) {
  initProps(instance, instance.vnode.props);
  initSlots(instance, instance.vnode.children);

  setupStatefulCompoennt(instance)
}

function setupStatefulCompoennt(instance: any) {
  const Component = instance.type;

  // ctx
  instance.proxy = new Proxy(
    { _: instance },
    PublicInstanceProxyHandlers
  )

  const { setup } = Component;

  if (setup) {
    // function => render
    // Object => ctx
    setCurrentInstance(instance);
    const setupResult = setup(shallowReadOnly(instance.props), {
      emit: instance.emit,
    });
    // 清空 currentInstance
    setCurrentInstance(null);
    handleSetupResult(instance, setupResult);
  }
}

function handleSetupResult(instance: any, setupResult: any) {
  // function / object
  // TODO function

  if (typeof setupResult === "object") {
    instance.setupState = proxyRefs(setupResult);
  }

  // make sure render is exist
  finishComponentSetup(instance);
}

function finishComponentSetup(instance: any) {
  // Implement
  const Component = instance.type
  // if (Component.render) {
  instance.render = Component.render;
  // }
}

let currentInstance: any = null;
export function getCurrentInstance() {
  return currentInstance;
}

export function setCurrentInstance(instance: any) {
  currentInstance = instance;
}
