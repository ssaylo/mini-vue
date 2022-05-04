import { initProps } from "./componentProps";
import { PublicInstanceProxyHandlers } from "./componentPublicInstance";
import { shallowReadOnly } from '../reactivity/reactive';

export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {},
    props: {},
  };
  return component;
}

export function setupComponent(instance: any) {
  initProps(instance, instance.vnode.props);
  // initSlots()

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

    const setupResult = setup(shallowReadOnly(instance.props));

    handleSetupResult(instance, setupResult);

  }
}

function handleSetupResult(instance: any, setupResult: any) {
  // function / object
  // TODO function

  if (typeof setupResult === "object") {
    instance.setupState = setupResult;
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