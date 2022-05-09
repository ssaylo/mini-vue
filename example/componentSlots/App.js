import { h, createTextVNode } from "../../lib/mini-vue.esm.js";
import { Foo } from './Foo.js';

export const App = {
  name: "App",
  render() {
    const app = h('div', {}, "App");
    // 数组
    // const foo = h(Foo, {}, [h("p", {}, "123"), h("p", {}, "456")]);
    // 对象
    const foo = h(
      Foo,
      {}, 
      {
        // 之前必须要节点类型，但是现在我们得特殊处理下 text 类型
        'header': ({ age }) => [h("p", {}, "header" + age + 1), h("h1", {}, 'h1h1'), createTextVNode('你好呀')],
        'footer': ({ age }) => h("p", {}, "footer" + age)
      },
    );
    return h("div", {}, [app, foo]);
  },
  setup() {
    return {
    };
  },
}