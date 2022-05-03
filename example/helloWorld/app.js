import { h } from '../../lib/mini-vue.esm.js';
export const App = {
  // .vue
  // <template></template>
  // render
  render() {
    return h("div", this.msg);
  },
  setup() {
    // composition
    return {
      msg: "hello world",
    }
  },
}