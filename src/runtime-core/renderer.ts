import { isObject } from '../shared';
import { createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/ShapeFlags';
import { Fragment } from './vnode';

export function render(vnode: any, container: any) {
  // patch
  patch(vnode, container);
}

export function patch(vnode: any, container: any) {
  // component

  console.log(vnode.type);

  // shapeFlags
  // vnode -> flag
  // element

  const { shapeFlag, type } = vnode;

  switch (type) {
    case Fragment:
      processFragment(vnode, container);
      break;
    
    default:
      if (shapeFlag & ShapeFlags.ELEMENT) { 
        processElement(vnode, container);
        // statefulComponent
      } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
        processComponent(vnode, container);
      }
  }

  //TODO: so how to distinguish between element and compoennt?
  // processElement();
  // check type of vnode

  // check isElement -> element
}

function processElement(vnode: any, container: any) {
  mountElement(vnode, container);
}

function processComponent(vnode: any, container: any) {
  mountComponent(vnode, container);
}

function processFragment(vnode: any, container: any) {
  mountChildren(vnode, container);
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
  const { children, props, shapeFlag } = vnode;

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    // text_children
    el.textContent = children;
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILREN) {
    // array_children
    mountChildren(vnode, el)
  }

  for (const key in props) {
    const val = props[key];
    // 具体的 click
    // on + Event name
    // onMousedown
    const isOn = (key: string) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, val);
    } else {
      el.setAttribute(key, val);
    }
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