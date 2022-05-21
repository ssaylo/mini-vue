import { isEmpty, isObject } from '../shared';
import { createComponentInstance, setupComponent } from './component';
import { ShapeFlags } from '../shared/ShapeFlags';
import { Fragment, Text } from './vnode';
import { createAppAPI } from './createApp';
import { effect } from '../reactivity/effect';

export function createRenderer(options: any) {

  // hostCreateElement 好看出是我们传入的接口的问题
  const {
    createElement:
    hostCreateElement,
    patchProps: hostPatchProps,
    insert: hostInsert,
    remove: hostRemove,
    setElementText: hostSetElementText,
  } = options;

  function render(vnode: any, container: any) {
    // patch
    patch(null, vnode, container, null);
  }

  // n1 -> oldVnode, n2 -> newVnode
  function patch(n1: any, n2: any, container: any, parentNodeComponent: any) {
    // component
    // shapeFlags
    // vnode -> flag
    // element

    const { shapeFlag, type } = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentNodeComponent);
        break;

      case Text:
        processText(n1, n2, container);
        break;
    
      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentNodeComponent);
          // statefulComponent
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentNodeComponent);
        }
    }

    //TODO: so how to distinguish between element and compoennt?
    // processElement();
    // check type of vnode

    // check isElement -> element
  }

  function processElement(n1: any, n2: any, container: any, parentNodeComponent: any) {
    if (!n1) {
      mountElement(n2, container, parentNodeComponent);
    } else {
      patchElement(n1, n2, container, parentNodeComponent);
    }
  }

  function processComponent(n1: any, n2: any, container: any, parentNodeComponent: any) {
    mountComponent(n2, container, parentNodeComponent);
  }

  function patchElement(n1: any, n2: any, container: any, parentComponent: any) {
    console.log("patch n1", n1);
    console.log("patch n2", n2);

    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    const el = n2.el = n1.el;

    patchProps(el, oldProps, newProps);
    patchChildren(n1, n2, el, parentComponent);
  }

  function patchChildren(n1: any, n2: any, container: any, parentComponent: any) {
    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag

    const c1 = n1.children;
    const c2 = n2.children;

    // array -> text 
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // if (prevShapeFlag & ShapeFlags.ARRAY_CHILREN) {
      //   // 1. 把老的 children 清空
      //   unmountChildren(n1.children);
      //   // 2. 设置 text
      //   hostSetElementText(container, n2.children);
      // } else {
      //   if (c1 !== c2) {
      //     hostSetElementText(container, n2.children);
      //   }

      if (prevShapeFlag & ShapeFlags.ARRAY_CHILREN) {
        unmountChildren(n1.children);
      }
      if (c1 !== c2) {
        hostSetElementText(container, n2.children);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
        hostSetElementText(container, "");
        mountChildren(n2, container, parentComponent )
      }
    }

    // text-text
  }

  function unmountChildren(children: any) {
    for (let i = 0; i < children.length; i++) { 
      const el = children[i].el;
      hostRemove(el);
    }
  }

  function patchProps(el: any, oldProps: any, newProps: any) {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prevProp = oldProps[key];
        const nextProp = newProps[key];

        if (prevProp !== nextProp) {
          hostPatchProps(el, key, prevProp, nextProp);
        }

        if (!isEmpty(oldProps)) {
          for (const key in oldProps) {
            if (!(key in newProps)) {
              hostPatchProps(el, key, oldProps[key], null);
            }
          }
        }
      }
    }
 }

  function processFragment(n1: any, n2: any, container: any, parentNodeComponent: any) {
    mountChildren(n2, container, parentNodeComponent);
  }

  function processText(n1: any, n2: any, container: any) {
    const { children } = n2;
    const textNode = (n2.el = document.createTextNode(children));
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
      hostPatchProps(el, key, null, val);
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
      patch(null, child, container, parentNodeComponent);
    })
  }

  function setupRenderEffect(instance: any, container: any, initialVNode: any) {
    effect(() => {
      if (!instance.isMounted) { //  初始化
        const { proxy } = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        // vnode tree(element) -> patch
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance);
        // SO ->  element -> mount
        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        console.log('should update')
        const { proxy } = instance;
        const prevSubTree = instance.subTree;
        const subTree = instance.render.call(proxy);
        instance.subTree = subTree;

        console.log("prevSubTree", prevSubTree);
        console.log("currentSubTree", subTree);

        // vnode tree(element) -> patch
        // vnode -> element -> mountElement
        patch(prevSubTree, subTree, container, instance);
        // SO ->  element -> mount
        initialVNode.el = subTree.el;

        instance.isMounted = true;
      }
    })
  }

  return {
    createApp: createAppAPI(render)
  }

}