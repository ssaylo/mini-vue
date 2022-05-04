import { h } from '../../lib/mini-vue.esm.js';
import { Foo } from './foo.js';

window.self = null;

export const App = {
  name: 'app',
  // .vue
  // <template></template>
  // render
  render() {
    window.self = this;
    return h(
      "div",
      {
        id: 'root',
        class: ["red", "hard"],
        onClick() {
          alert('onClick');
        },
        onMouseOver() { 
          alert('onMouseOver');
        }
      },
      // setupState 这里并没有 $el
      // this.$el
      // this.$data
      // ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>proxy<<<<<<<<<<<<<<<<<<<-
      // 'hello, ' + this.msg
      // [h("p", { class: "red" }, "hi"), h("p", { class: "green" }, "hello") ]

      [
        h(
          "div",
          {},
          "hi," + this.msg
        ),
        h(Foo, {
          count: 1, 
        })
      ]
    );
  },
  setup() {
    // composition
    return {
      msg: "hello world",
    }
  },
}