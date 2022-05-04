import { h } from '../../lib/mini-vue.esm.js';

window.self = null;

export const App = {
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
          alert('click');
        },
        onMouseOver() { 
          alert('click');
        }
      },
      // setupState 这里并没有 $el
      // this.$el
      // this.$data
      // ->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>proxy<<<<<<<<<<<<<<<<<<<-
      'hello, ' + this.msg
      // [h("p", { class: "red" }, "hi"), h("p", { class: "green" }, "hello") ]
    );
  },
  setup() {
    // composition
    return {
      msg: "hello world",
    }
  },
}