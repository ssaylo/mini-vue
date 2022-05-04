import { hasOwn } from "../shared";

const publicPropertiesMap: any = {
  $el: (instance: any) => instance.vnode.el
}

export const PublicInstanceProxyHandlers = {
  get({ _: instance }: any, key: string) { 
    const { setupState, props } = instance
    // setupSstate
    // if (key in setupState) {
      // return setupState[key];
    // }

    if (hasOwn(setupState, key)) {
      return setupState[key]; 
    } else if (hasOwn(props, key)) {
      return props[key]
    }

    // debugger
    // if (key === "$el") {
    //   // 一开始直接这样取并取不到，这是因为这取这里的时候是 app instance
    //   // 组件实例对象
    //   // 上面的 el 肯定是没有的
    //   // 刚才我们赋值的是 element
    //   // 一个是 mountComponent, 一个是 mountElement
    //   return instance.vnode.el;
    // }
    const publicGetter = publicPropertiesMap[key];
    if (publicGetter) {
      return publicGetter(instance);
    }

    // setup -> options data

    // $data
  },
}