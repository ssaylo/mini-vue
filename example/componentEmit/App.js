import { h } from '../../lib/mini-vue.esm.js';
import { Foo } from './Foo.js';

export const App = {
  name: "App",
  render() {
    // emit
    return h(
      "div",
      {},
      [
        h("div", {}, "App"),
        h(Foo, {
          onAdd() {
            alert('123')
            // on + Event listen emit and trigger
            console.log("listen emit add, onAdd");
          }
        })
      ]
    )
  },
  setup() {
    return {};
  }
}