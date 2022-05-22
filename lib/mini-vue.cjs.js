'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// export function extend(target: any, options: any) {
//   return Object.assign(target, options);
// }
const extend = Object.assign;
// we can use lodjash
function isObject(obj) {
    return obj !== null && typeof obj === "object";
}
function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
const hasChanged = (newValue, oldValue) => !Object.is(newValue, oldValue);
const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
function toHandlerKey(str) {
    return str ? "on" + capitalize(str) : "";
}
function camelize(str) {
    return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : "");
}
function isEmpty(obj) {
    // simpley isEmpty
    // 懒得用 lodash
    for (var key in obj) {
        if (key)
            return false;
    }
    return true;
}
//最长递增子序列
function getSequence(arr) {
    const p = arr.slice();
    const result = [0];
    let i, j, u, v, c;
    const len = arr.length;
    for (i = 0; i < len; i++) {
        const arrI = arr[i];
        if (arrI !== 0) {
            j = result[result.length - 1];
            if (arr[j] < arrI) {
                p[i] = j;
                result.push(i);
                continue;
            }
            u = 0;
            v = result.length - 1;
            while (u < v) {
                c = (u + v) >> 1;
                if (arr[result[c]] < arrI) {
                    u = c + 1;
                }
                else {
                    v = c;
                }
            }
            if (arrI < arr[result[u]]) {
                if (u > 0) {
                    p[i] = result[u - 1];
                }
                result[u] = i;
            }
        }
    }
    u = result.length;
    v = result[u - 1];
    while (u-- > 0) {
        result[u] = v;
        v = p[v];
    }
    return result;
}

let activeEffect;
let shouldTrack;
class ReactiveEffect {
    constructor(fn, scheduler, onStop) {
        this.scheduler = scheduler;
        this.deps = [];
        // runner isStop?
        this.active = true;
        this._fn = fn;
        this.onStop = onStop;
    }
    run() {
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        const res = this._fn();
        shouldTrack = false;
        return res;
    }
    stop() {
        if (this.active) {
            cleanUpEffect(this);
            this.active = false;
            if (this.onStop) {
                this.onStop();
            }
        }
    }
}
function trackEffects(dep) {
    // 已经在 dep 中, 则不需要收集
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
const targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    //  taget -> key -> dep
    let depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    let dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function triggerEffects(dep) {
    for (const effect of dep) {
        if (effect.scheduler) {
            effect.scheduler();
        }
        else {
            effect.run();
        }
    }
}
function trigger(target, key) {
    let depsMap = targetMap.get(target);
    let dep = depsMap.get(key);
    triggerEffects(dep);
}
function effect(fn, options = {}) {
    // scheduler
    const { scheduler, onStop } = options;
    // fn
    const _effect = new ReactiveEffect(fn, scheduler, onStop);
    extend(_effect, options);
    // Object.assign(_effect, options)
    _effect.run();
    // 这里需要处理一下指针的问题，以当前的这个实例作为 this 的一个指向。
    const runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
}
function cleanUpEffect(effect) {
    effect.deps.forEach((dep) => {
        dep.delete(effect);
    });
}

const get = createGetter();
const set = createSetter();
const readOnlyGet = createGetter(true);
function createGetter(isReadOnly = false, shallow = false) {
    return function get(target, key) {
        const res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        // 看看 res 是不是一个 Object
        if (isObject(res)) {
            return isReadOnly ? readonly(res) : reactive(res);
        }
        if (key === "__v_isReactive" /* IS_REACTIVE */) {
            return !isReadOnly;
        }
        if (key === "__v_isReadOnly" /* IS_READONLY */) {
            return isReadOnly;
        }
        if (!isReadOnly) {
            track(target, key);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        const res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
const mutableHandlers = {
    get,
    set
};
const readonlyHandlers = {
    get: readOnlyGet,
    set: (target, key, value) => {
        console.warn('you can\'t set value of readonly Object');
        return true;
    }
};
// export const shallowReadOnlyHandlers = {
//   get: shallowReadOnlyGet,
//   set: (target: any, key: string | symbol, value: string) => {
//     console.warn('you can\'t set value of readonly Object');
//     return true;
//   }
// }
const shallowReadOnlyHandlers = extend({}, readonlyHandlers, { get: shallowReadOnly });

function reactive(raw) {
    return createReactiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createReactiveObject(raw, readonlyHandlers);
}
function shallowReadOnly(raw) {
    return createReactiveObject(raw, shallowReadOnlyHandlers);
}
function createReactiveObject(raw, baseHandlers) {
    if (!isObject(raw)) {
        console.warn("target: " + raw + " is not an object");
        return raw;
    }
    return new Proxy(raw, baseHandlers);
}

class RefImpl {
    constructor(value) {
        this.__v_isRef = true;
        this._rawValue = value;
        this._value = convert(value);
        // value -> reactive，变成了 proxy，所以下面的hasChanged需要做一定的修改
        this.dep = new Set();
    }
    get value() {
        trackRefValue(this);
        return this._value;
    }
    set value(newValue) {
        if (!hasChanged(newValue, this._rawValue))
            return;
        this._rawValue = newValue;
        this._value = convert(newValue);
        triggerEffects(this.dep);
    }
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get(target, key) {
            return unRef(Reflect.get(target, key));
        },
        set(target, key, value) {
            // set -> ref .value
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        }
    });
}

// const Fragment = Symbol.for('Fragment')
const Fragment = Symbol('Fragment');
const Text = Symbol('Text');
function createVNode(type, props, children) {
    const vnode = {
        type,
        props,
        children,
        shapeFlag: getShapeFlag(type),
        el: null,
        key: props && props.key,
    };
    // children
    if (typeof children === "string") {
        vnode.shapeFlag |= 4 /* TEXT_CHILDREN */;
    }
    else if (Array.isArray(children)) {
        vnode.shapeFlag |= 8 /* ARRAY_CHILREN */;
    }
    if (vnode.shapeFlag & 2 /* STATEFUL_COMPONENT */) {
        if (typeof children === 'object') {
            vnode.shapeFlag |= 16 /* SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}
function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ELEMENT */
        : 2 /* STATEFUL_COMPONENT */;
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    const slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
    // attrs
}

const publicPropertiesMap = {
    $el: (instance) => instance.vnode.el,
    $slots: (instance) => instance.slots
};
const PublicInstanceProxyHandlers = {
    get({ _: instance }, key) {
        const { setupState, props } = instance;
        // setupSstate
        // if (key in setupState) {
        // return setupState[key];
        // }
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
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
};

function emit(instance, event, ...args) {
    console.log(">>>>>>>>>>>>>>>>>>>>emit");
    // instance.props -> event
    const { props } = instance;
    // top to bottom, small to big
    //  add -> Add
    const handlerKey = toHandlerKey(camelize(event));
    const handler = props[handlerKey];
    handler && handler(args);
}
// extract common logic is really important!

function initSlots(instance, children) {
    // instance.slots = children;
    // instance.slots = Array.isArray(children) ? children : [children];
    const { vnode } = instance;
    if (vnode.shapeFlag & 16 /* SLOT_CHILDREN */) {
        normalizeObjectSlots(children, instance);
    }
}
function normalizeObjectSlots(children, instance) {
    const slots = {};
    for (const key in children) {
        const value = children[key];
        // slot
        slots[key] = (props) => normalizeSlotsValue(value(props));
    }
    instance.slots = slots;
}
function normalizeSlotsValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    const component = {
        vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        emit: (event, ...args) => { },
        slots: {},
        provides: parent ? parent.provides : {},
        parent,
        isMounted: false,
        subTree: {}
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props);
    initSlots(instance, instance.vnode.children);
    setupStatefulCompoennt(instance);
}
function setupStatefulCompoennt(instance) {
    const Component = instance.type;
    // ctx
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    const { setup } = Component;
    if (setup) {
        // function => render
        // Object => ctx
        setCurrentInstance(instance);
        const setupResult = setup(shallowReadOnly(instance.props), {
            emit: instance.emit,
        });
        // 清空 currentInstance
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // function / object
    // TODO function
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    // make sure render is exist
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    // Implement
    const Component = instance.type;
    // if (Component.render) {
    instance.render = Component.render;
    // }
}
let currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        let { provides } = currentInstance;
        const parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        // 这里要解决一个问题
        // 当父级 key 和 爷爷级别的 key 重复的时候，对于子组件来讲，需要取最近的父级别组件的值
        // 那这里的解决方案就是利用原型链来解决
        // provides 初始化的时候是在 createComponent 时处理的，当时是直接把 parent.provides 赋值给组件的 provides 的
        // 所以，如果说这里发现 provides 和 parentProvides 相等的话，那么就说明是第一次做 provide(对于当前组件来讲)
        // 我们就可以把 parent.provides 作为 currentInstance.provides 的原型重新赋值
        // 至于为什么不在 createComponent 的时候做这个处理，可能的好处是在这里初始化的话，是有个懒执行的效果（优化点，只有需要的时候在初始化）
        if (parentProvides === provides) {
            provides = currentInstance.provides = Object.create(parentProvides);
        }
        provides[key] = value;
    }
}
function inject(key, defaultValue) {
    var _a;
    const currentInstance = getCurrentInstance();
    if (currentInstance) {
        const provides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
        if (key in provides) {
            return provides[key];
        }
        else if (defaultValue) {
            if (typeof defaultValue === "function") {
                return defaultValue();
            }
            return defaultValue;
        }
    }
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            mount(rootContainer) {
                // compoennt -> vnode
                // we use vnode instead of dom so that we can caculate the dom by js
                // and improve the performance by diff
                const vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            }
        };
    };
}

function createRenderer(options) {
    // hostCreateElement 好看出是我们传入的接口的问题
    const { createElement: hostCreateElement, patchProps: hostPatchProps, insert: hostInsert, remove: hostRemove, setElementText: hostSetElementText, } = options;
    function render(vnode, container) {
        // patch
        patch(null, vnode, container, null, null);
    }
    // n1 -> oldVnode, n2 -> newVnode
    function patch(n1, n2, container, parentNodeComponent, anchor) {
        // component
        // shapeFlags
        // vnode -> flag
        // element
        const { shapeFlag, type } = n2;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentNodeComponent, anchor);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ELEMENT */) {
                    processElement(n1, n2, container, parentNodeComponent, anchor);
                    // statefulComponent
                }
                else if (shapeFlag & 2 /* STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentNodeComponent, anchor);
                }
        }
        //TODO: so how to distinguish between element and compoennt?
        // processElement();
        // check type of vnode
        // check isElement -> element
    }
    function processElement(n1, n2, container, parentNodeComponent, anchor) {
        if (!n1) {
            mountElement(n2, container, parentNodeComponent, anchor);
        }
        else {
            patchElement(n1, n2, container, parentNodeComponent, anchor);
        }
    }
    function processComponent(n1, n2, container, parentNodeComponent, anchor) {
        mountComponent(n2, container, parentNodeComponent, anchor);
    }
    function patchElement(n1, n2, container, parentComponent, anchor) {
        console.log("patch n1", n1);
        console.log("patch n2", n2);
        const oldProps = n1.props || {};
        const newProps = n2.props || {};
        const el = n2.el = n1.el;
        patchProps(el, oldProps, newProps);
        patchChildren(n1, n2, el, parentComponent, anchor);
    }
    function patchChildren(n1, n2, container, parentComponent, anchor) {
        const prevShapeFlag = n1.shapeFlag;
        const shapeFlag = n2.shapeFlag;
        const c1 = n1.children;
        const c2 = n2.children;
        // array -> text
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            // if (prevShapeFlag & ShapeFlags.ARRAY_CHILREN) {
            //   // 1. 把老的 children 清空
            //   unmountChildren(n1.children);
            //   // 2. 设置 text
            //   hostSetElementText(container, n2.children);
            // } else {
            //   if (c1 !== c2) {
            //     hostSetElementText(container, n2.children);
            //   }
            if (prevShapeFlag & 8 /* ARRAY_CHILREN */) {
                unmountChildren(n1.children);
            }
            if (c1 !== c2) {
                hostSetElementText(container, n2.children);
            }
        }
        else {
            if (prevShapeFlag & 4 /* TEXT_CHILDREN */) {
                hostSetElementText(container, "");
                mountChildren(n2, container, parentComponent, anchor);
            }
            else {
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
    function patchKeyChildren(c1, c2, container, parentComponent, parentAnchor) {
        const l1 = c1.length;
        const l2 = c2.length;
        let i = 0;
        let e1 = l1 - 1;
        let e2 = l2 - 1;
        function isSameVNodeType(n1, n2) {
            return n1.type === n2.type && n1.key === n2.key;
        }
        // 左侧
        while (i <= e1 && i <= e2) {
            const n1 = c1[i];
            const n2 = c2[i];
            if (isSameVNodeType(n1, n2)) {
                patch(n1, n2, container, parentComponent, parentAnchor);
            }
            else {
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
            }
            else {
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
        }
        else if (i > e2) { // 删除
            while (i <= e1) {
                hostRemove(c1[i].el);
                i++;
            }
        }
        else { // 中间对比
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
                }
                else {
                    for (let j = 0; j < e2; j++) {
                        if (isSameVNodeType(prevChild, c2[j])) {
                            newIndex = j;
                            break;
                        }
                    }
                }
                if (newIndex === undefined) { // 旧节点在新的里面不存在
                    hostRemove(prevChild.el);
                }
                else {
                    // 优化
                    if (newIndex >= maxNewIndexSoFar) {
                        maxNewIndexSoFar = newIndex;
                    }
                    else {
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
                const anchor = nextIndex + 1 < l2 ? c2[nextIndex + 1].el : null;
                if (newIndexToOldIndexMap[i] === 0) { // 创建
                    patch(null, nextChild, container, parentComponent, anchor);
                }
                if (moved === true) {
                    if (i !== increasingNewIndexSequence[j]) {
                        console.log("移动位置");
                        hostInsert(nextChild.el, container, anchor);
                    }
                    else {
                        j--;
                    }
                }
            }
        }
    }
    function unmountChildren(children) {
        for (let i = 0; i < children.length; i++) {
            const el = children[i].el;
            hostRemove(el);
        }
    }
    function patchProps(el, oldProps, newProps) {
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
    function processFragment(n1, n2, container, parentNodeComponent, anchor) {
        mountChildren(n2, container, parentNodeComponent, anchor);
    }
    function processText(n1, n2, container) {
        const { children } = n2;
        const textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    function mountElement(vnode, container, parentNodeComponent, anchor) {
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
        if (shapeFlag & 4 /* TEXT_CHILDREN */) {
            // text_children
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ARRAY_CHILREN */) {
            // array_children
            mountChildren(vnode, el, parentNodeComponent, anchor);
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
        hostInsert(el, container, anchor);
    }
    function mountComponent(initialVNode, container, parentNodeComponent, anchor) {
        const instance = createComponentInstance(initialVNode, parentNodeComponent);
        setupComponent(instance);
        // debugger
        setupRenderEffect(instance, container, initialVNode, anchor);
    }
    function mountChildren(vnode, container, parentNodeComponent, anchor) {
        vnode.children.forEach((child) => {
            patch(null, child, container, parentNodeComponent, anchor);
        });
    }
    function setupRenderEffect(instance, container, initialVNode, anchor) {
        effect(() => {
            if (!instance.isMounted) { //  初始化
                const { proxy } = instance;
                const subTree = (instance.subTree = instance.render.call(proxy));
                // vnode tree(element) -> patch
                // vnode -> element -> mountElement
                patch(null, subTree, container, instance, anchor);
                // SO ->  element -> mount
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                console.log('should update');
                const { proxy } = instance;
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
        });
    }
    return {
        createApp: createAppAPI(render)
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProps(el, key, prevVal, nextVal) {
    const isOn = (key) => /^on[A-Z]/.test(key);
    if (isOn(key)) {
        const event = key.slice(2).toLowerCase();
        el.addEventListener(event, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(el, parent, anchor) {
    // parent.append(el);
    parent.insertBefore(el, anchor || null);
}
function remove(child) {
    const parent = child.parentNode;
    if (parent) {
        parent.removeChild(child);
    }
}
function setElementText(el, text) {
    el.textContent = text;
}
const renderer = createRenderer({
    createElement,
    patchProps,
    insert,
    remove,
    setElementText,
});
function createApp(...args) {
    return renderer.createApp(...args);
}

exports.createApp = createApp;
exports.createRenderer = createRenderer;
exports.createTextVNode = createTextVNode;
exports.getCurrentInstance = getCurrentInstance;
exports.h = h;
exports.inject = inject;
exports.provide = provide;
exports.proxyRefs = proxyRefs;
exports.ref = ref;
exports.renderSlots = renderSlots;
