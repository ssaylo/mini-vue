import { h } from "../../lib/mini-vue.esm.js";
import { Foo } from './Foo.js';

export const App = {
  name: "App",
  render() {
    const app = h('div', {}, "App");
    // 数组
    // const foo = h(Foo, {}, [h("p", {}, "123"), h("p", {}, "456")]);
    // 对象
    const foo = h(Foo, {}, { 'header': ({ age }) => h("p", {}, "header" + age), 'footer': ({ age }) => h("p", {}, "footer" + age) });
    return h("div", {}, [app, foo]);
  },
  setup() {
    return {
    };
  },
}