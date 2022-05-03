import { h } from '../../lib/mini-vue.esm.js';
export const App = {
  // .vue
  // <template></template>
  // render
  render() {
    return h(
      "div",
      { id: 'root', class: ["red", "hard"] },
      // 'hello, ' + this.msg
      [h("p", { class: "red" }, "hi"), h("p", { class: "green" }, "hello") ]
    );
  },
  setup() {
    // composition
    return {
      msg: "hello world",
    }
  },
}