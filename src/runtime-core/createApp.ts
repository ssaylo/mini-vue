import { render } from "./renderer";
import { createVNode } from "./vnode";

export function createApp(rootComponent: any) {
  return {
    mount(rootComponent: any) {
      // compoennt -> vnode
      // we use vnode instead of dom so that we can caculate the dom by js
      // and improve the performance by diff
      const vnode = createVNode(rootComponent);

      render(vnode, rootComponent);
    }
  }
}
