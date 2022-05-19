import { isObject } from '../shared';
import { createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/ShapeFlags';
import { Fragment, Text } from './vnode';
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';

export function createRenderer(options: any) {

  // hostCreateElement 好看出是我们传入的接口的问题
  const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert } = options;

  function render(vnode: any, container: any) {
    // patch
    patch(vnode, container, null);
  }

  function patch(vnode: any, container: any, parentNodeComponent: any) {
    // component

    console.log(vnode.type);

    // shapeFlags
    // vnode -> flag
    // element

    const { shapeFlag, type } = vnode;

    switch (type) {
      case Fragment:
        processFragment(vnode, container, parentNodeComponent);
        break;

      case Text:
        processText(vnode, container);
        break;
    
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(vnode, container, parentNodeComponent);
          // statefulComponent
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(vnode, container, parentNodeComponent);
        }
    }

    //TODO: so how to distinguish between element and compoennt?
    // processElement();
    // check type of vnode

    // check isElement -> element
  }

  function processElement(vnode: any, container: any, parentNodeComponent: any) {
    mountElement(vnode, container, parentNodeComponent);
  }

  function processComponent(vnode: any, container: any, parentNodeComponent: any) {
    mountComponent(vnode, container, parentNodeComponent);
  }

  function processFragment(vnode: any, container: any, parentNodeComponent: any) {
    mountChildren(vnode, container, parentNodeComponent);
  }

  function processText(vnode: any, container: any) {
    const { children } = vnode;
    const textNode = (vnode.el = document.createTextNode(children));
    container.append(textNode);
  }

  function mountElement(vnode: any, container: any, parentNodeComponent: any) {
    // createElement
    // mountElement -> patch

    // before
    // const el = document.createElement("div");
    // el.textContent = "hello world";
    // el.setAttribute("id", "root");
    // document.body.appendChild(el);

    // after vnode
    const el = (vnode.el = hostCreateElement(vnode.type));
    // string 
    const { children, props, shapeFlag } = vnode;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // text_children
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILREN) {
      // array_children
      mountChildren(vnode, el, parentNodeComponent)
    }

    for (const key in props) {
      const val = props[key];
      // 具体的 click
      // on + Event name
      // onMousedown
      // const isOn = (key: string) => /^on[A-Z]/.test(key);
      // if (isOn(key)) {
      //   const event = key.slice(2).toLowerCase();
      //   el.addEventListener(event, val);
      // } else {
      //   el.setAttribute(key, val);
      // }
      hostPatchProps(el, key, val);
    }
    // container.append(el);
    hostInsert(el, container)
  }

  function mountComponent(initialVNode: any, container: any, parentNodeComponent: any) {
    const instance = createComponentInstance(initialVNode, parentNodeComponent);
    setupComponent(instance);
    // debugger
    setupRenderEffect(instance, container, initialVNode);
  }

  function mountChildren(vnode: any, container: any, parentNodeComponent: any) {
    vnode.children.forEach((child: any) => {
      patch(child, container, parentNodeComponent);
    })
  }

  function setupRenderEffect(instance: any, container: any, initialVNode: any) {
    effect(() => {
      const { proxy } = instance;
      const subTree = instance.render.call(proxy);
      // vnode tree(element) -> patch
      // vnode -> element -> mountElement
      patch(subTree, container, instance);
    
      // SO ->  element -> mount
      initialVNode.el = subTree.el;
 
    })
  }

  return {
    createApp: createAppAPI(render)
  }

}