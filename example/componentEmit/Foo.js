import { h } from "../../lib/mini-vue.esm.js";

export const Foo = {
  // setup(props ) {
  setup(props, { emit }) {
    const emitAdd = () => {
      console.log("emit add");
      emit("add", { a: 1, b : 2 });
      emit("add-foo", { a: 3, b: 4 });
    };
    return {
      emitAdd
    };
  },
  render() {
    const btn = h("button", {
      onClick: this.emitAdd
    }, "emitAdd");
    const foo = h("p", {}, "foo");
    return h("div", {}, [foo, btn]);
  },
};