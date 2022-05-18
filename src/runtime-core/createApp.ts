import { createVNode } from "./vnode";

export function createAppAPI(render: any) {
  return function createApp(rootComponent: any) {
    return {
      mount(rootContainer: any) {
        // compoennt -> vnode
        // we use vnode instead of dom so that we can caculate the dom by js
        // and improve the performance by diff
        const vnode = createVNode(rootComponent);

        render(vnode, rootContainer);
      }
    }
  } 
}
