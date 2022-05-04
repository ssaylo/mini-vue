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
          onAdd([{a, b}]) {
            // alert('123')
            // on + Event listen emit and trigger
            console.log("listen emit add, onAdd", a + b);
          },
          onAddFoo([{a, b}]) {
            console.log("parscal case")
          }
        })
      ]
    )
  },
  setup() {
    return {};
  }
}