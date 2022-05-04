import { isObject } from '../shared';
import { createComponentInstance, setupComponent } from './component';

export function render(vnode: any, container: any) {
  // patch
  patch(vnode, container);
}

export function patch(vnode: any, container: any) {
  // component

  console.log(vnode.type);

  //TODO: so how to distinguish between element and compoennt?
  // processElement();
  // check type of vnode

  if (typeof vnode.type === 'string') { 
    processElement(vnode, container);
  } else if (isObject(vnode.type)) {
    processComponent(vnode, container);
  }

  // check isElement -> element
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function mountElement(vnode: any, container: any) {
  // createElement
  // mountElement -> patch

  // before
  // const el = document.createElement("div");
  // el.textContent = "hello world";
  // el.setAttribute("id", "root");
  // document.body.appendChild(el);

  // after vnode
  const el = (vnode.el = document.createElement(vnode.type));
  // string 
  const { children, props } = vnode;

  if (typeof children === 'string') {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    mountChildren(vnode, el)
  }

  for (const key in props) {
    const val = props[key];
    el.setAttribute(key, val);
  }
  container.append(el);
}

function mountComponent(initialVNode: any, container: any) {
  const instance = createComponentInstance(initialVNode);
  setupComponent(instance);
  setupRenderEffect(instance, container, initialVNode);
}

function mountChildren(vnode: any, container: any) {
  vnode.children.forEach((child: any) => {
    patch(child, container);
  })
}

function setupRenderEffect(instance: any, container: any, initialVNode: any) {
  const { proxy } = instance;
  const subTree = instance.render.call(proxy);
  // vnode tree(element) -> patch
  // vnode -> element -> mountElement
  patch(subTree, container);
  
  // SO ->  element -> mount
  initialVNode.el = subTree.el;
}