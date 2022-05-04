export function createComponentInstance(vnode: any) {
  const component = {
    vnode,
    type: vnode.type,
    setupState: {}
  };
  return component;
}

export function setupComponent(instance: any) {
  // initProps()
  // initSlots()

  setupStatefulCompoennt(instance)
}

function setupStatefulCompoennt(instance: any) {
  const Component = instance.type;

  // ctx
  instance.proxy = new Proxy({}, {
    get(target: any, key: string) { 
      const { setupState } = instance
      // setupSstate
      if (key in setupState) {
        return setupState[key]; 
      }
    },
  })

  const { setup } = Component;

  if (setup) {
    // function => render
    // Object => ctx
    const setupResult = setup();

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