import {getSequence, isEmpty, isObject} from '../shared';
import {createComponentInstance, setupComponent} from './component';
import {ShapeFlags} from '../shared/ShapeFlags';
import {Fragment, Text} from './vnode';
import {createAppAPI} from './createApp';
import {effect} from '../reactivity/effect';

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
    patch(null, vnode, container, null, null);
  }

  // n1 -> oldVnode, n2 -> newVnode
  function patch(n1: any, n2: any, container: any, parentNodeComponent: any, anchor: any) {
    // component
    // shapeFlags
    // vnode -> flag
    // element

    const {shapeFlag, type} = n2;

    switch (type) {
      case Fragment:
        processFragment(n1, n2, container, parentNodeComponent, anchor);
        break;

      case Text:
        processText(n1, n2, container);
        break;

      default:
        if (shapeFlag & ShapeFlags.ELEMENT) {
          processElement(n1, n2, container, parentNodeComponent, anchor);
          // statefulComponent
        } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONENT) {
          processComponent(n1, n2, container, parentNodeComponent, anchor);
        }
    }

    //TODO: so how to distinguish between element and compoennt?
    // processElement();
    // check type of vnode

    // check isElement -> element
  }

  function processElement(n1: any, n2: any, container: any, parentNodeComponent: any, anchor: any) {
    if (!n1) {
      mountElement(n2, container, parentNodeComponent, anchor);
    } else {
      patchElement(n1, n2, container, parentNodeComponent, anchor);
    }
  }

  function processComponent(n1: any, n2: any, container: any, parentNodeComponent: any, anchor: any) {
    mountComponent(n2, container, parentNodeComponent, anchor);
  }

  function patchElement(n1: any, n2: any, container: any, parentComponent: any, anchor: any) {
    console.log("patch n1", n1);
    console.log("patch n2", n2);

    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    const el = n2.el = n1.el;

    patchProps(el, oldProps, newProps);
    patchChildren(n1, n2, el, parentComponent, anchor);
  }

  function patchChildren(n1: any, n2: any, container: any, parentComponent: any, anchor: any) {
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
        mountChildren(n2, container, parentComponent, anchor)
      } else {
        // array -> array
        patchKeyChildren(c1, c2, container, parentComponent, anchor);
      }
    }

    // 然后就是 diff Array->Array
    // 1. 双端对比
    // 2. 左侧对比
    // 3. 右侧对比
    // 4. 新的比老的长 -> 左侧新建 or 右侧新建
    // 5. 新的比老的短 -> 左侧删除 or 右侧删除
    // 6. 中间diff 大概有以下三种情况
    //  a. 创建新的 （老的里面不存在，新的里面存在）
    //  b. 删除老的 （老的里面存在，新的里面不存在）
    //  c. 移动（老的新的都存在，但是位置移动了）

    // text-text
  }

  function patchKeyChildren(c1: any, c2: any, container: any, parentComponent: any, parentAnchor: any) {
    const l1 = c1.length;
    const l2 = c2.length;

    let i = 0;
    let e1 = l1 - 1;
    let e2 = l2 - 1;

    function isSameVNodeType(n1: any, n2: any) {
      return n1.type === n2.type && n1.key === n2.key;
    }

    // 左侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[i]
      const n2 = c2[i]
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }

      i++;
      // console.log(i);
    }

    // 右侧
    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];

      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, container, parentComponent, parentAnchor);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    // 新建 or 删除 or 中间操作
    if (i > e1) { // 新建
      if (i <= e2) {
        const nextPos = e2 + 1;
        const anchor = nextPos < l2 ? c2[nextPos].el : null;
        while (i <= e2) { // 可能会有多个 children
          patch(null, c2[i], container, parentComponent, anchor);
          i++;
        }
      }
    } else if (i > e2) { // 删除
      while (i <= e1) {
        hostRemove(c1[i].el);
        i++;
      }
    } else { // 中间对比
      let s1 = i;
      let s2 = i;

      const toBePatched = e2 - s2 + 1;
      let patched = 0;
      const keyToNewIndexMap = new Map();
      const newIndexToOldIndexMap = new Array(toBePatched);

      // 优化，是否还需要用最长公共子序列去求 （只有后面的移动后的位置比前面的小才需要）
      let moved = false;
      let maxNewIndexSoFar = 0;

      for (let i = 0; i < toBePatched; i++) {
        newIndexToOldIndexMap[i] = 0;
      }

      for (let i = s2; i <= e2; i++) {
        const nextChild = c2[i];
        keyToNewIndexMap.set(nextChild.key, i);
      }

      for (let i = s1; i <= e1; i++) {
        const prevChild = c1[i];

        // 新的节点都 patch 了，后面的所有 old 节点都可以直接删了
        if (patched > toBePatched) {
          hostRemove(prevChild.el);
          continue;
        }

        let newIndex;
        if (prevChild.key !== null) {
          newIndex = keyToNewIndexMap.get(prevChild.key);
        } else {
          for (let j = 0; j < e2; j++) {
            if (isSameVNodeType(prevChild, c2[j])) {
              newIndex = j;
              break;
            }
          }
        }
        if (newIndex === undefined) { // 旧节点在新的里面不存在
          hostRemove(prevChild.el);
        } else {

          // 优化
          if(newIndex >= maxNewIndexSoFar) {
            maxNewIndexSoFar = newIndex;
          } else {
            // 标记新的节点有没有移动位置
            moved = true;
          }

          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(prevChild, c2[newIndex], container, parentComponent, null);
          patched++;
        }
      }
      // 获取到最长递增子序列
      const increasingNewIndexSequence = getSequence(newIndexToOldIndexMap);
      let j = increasingNewIndexSequence.length - 1;
      // for (let i = 0; i < toBePatched; i++) {
      //     if(i !== increasingNewIndexSequence[j]) {
      //       console.log("移动位置");
      //     } else {
      //       j++;
      //     }
      // }
      // 为了稳定，insertBefore 是插到前面，所以这里从后往前找比较好
      for (let i = toBePatched - 1; i >= 0; i--) {
        const nextIndex = i + s2;
        const nextChild = c2[nextIndex];
        const anchor = nextIndex + 1 < l2 ? c2[nextIndex+1].el : null;

        if(newIndexToOldIndexMap[i] === 0) { // 创建
          patch(null, nextChild, container, parentComponent, anchor);
        }

        if(moved === true) {
          if(i !== increasingNewIndexSequence[j]) {
            console.log("移动位置");
            hostInsert(nextChild.el, container, anchor);
          } else {
            j--;
          }
        }
      }
    }
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

  function processFragment(n1: any, n2: any, container: any, parentNodeComponent: any, anchor: any) {
    mountChildren(n2, container, parentNodeComponent, anchor);
  }

  function processText(n1: any, n2: any, container: any) {
    const {children} = n2;
    const textNode = (n2.el = document.createTextNode(children));
    container.append(textNode);
  }

  function mountElement(vnode: any, container: any, parentNodeComponent: any, anchor: any) {
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
    const {children, props, shapeFlag} = vnode;

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      // text_children
      el.textContent = children;
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILREN) {
      // array_children
      mountChildren(vnode, el, parentNodeComponent, anchor)
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
    hostInsert(el, container, anchor)
  }

  function mountComponent(initialVNode: any, container: any, parentNodeComponent: any, anchor: any) {
    const instance = createComponentInstance(initialVNode, parentNodeComponent);
    setupComponent(instance);
    // debugger
    setupRenderEffect(instance, container, initialVNode, anchor);
  }

  function mountChildren(vnode: any, container: any, parentNodeComponent: any, anchor: any) {
    vnode.children.forEach((child: any) => {
      patch(null, child, container, parentNodeComponent, anchor);
    })
  }

  function setupRenderEffect(instance: any, container: any, initialVNode: any, anchor: any) {
    effect(() => {
      if (!instance.isMounted) { //  初始化
        const {proxy} = instance;
        const subTree = (instance.subTree = instance.render.call(proxy));
        // vnode tree(element) -> patch
        // vnode -> element -> mountElement
        patch(null, subTree, container, instance, anchor);
        // SO ->  element -> mount
        initialVNode.el = subTree.el;

        instance.isMounted = true;
      } else {
        console.log('should update')
        const {proxy} = instance;
        const prevSubTree = instance.subTree;
        const subTree = instance.render.call(proxy);
        instance.subTree = subTree;

        console.log("prevSubTree", prevSubTree);
        console.log("currentSubTree", subTree);

        // vnode tree(element) -> patch
        // vnode -> element -> mountElement
        patch(prevSubTree, subTree, container, instance, anchor);
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




