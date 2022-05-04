export function createVNode(type: string, props?: any, children?: any) {
  const vnode = {
    type,
    props,
    children,
    el: null,
  }
  return vnode;
}