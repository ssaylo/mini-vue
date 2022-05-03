import { createComponentInstance, setupComponent } from './component';

export function render(vnode: any, container: any) {
  // patch
  patch(vnode, container);
}

export function patch(vnode: any, container: any) {
  // component

  // check type of vnode
  processComponent(vnode, container);

  // check isElement -> element
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountComponent(vnode: any, container: any) {
  const instance = createComponentInstance(vnode);
  setupComponent(instance);
  setupRenderEffect(instance, container);
}

function setupRenderEffect(instance: any, container: any) {
  const subTree = instance.render();
  // vnode tree(element) -> patch
  // vnode -> element -> mountElement
  patch(subTree, container);
}