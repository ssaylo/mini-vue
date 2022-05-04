import { h, renderSlots } from "../../lib/mini-vue.esm.js";

export const Foo = {
  setup() {
    return {};
  },
  render() {
    const foo = h("p", {}, "foo");
    console.log("slotssssssssssss", this.$slots);

    // renderSlots
    // 1. 获取到要渲染的元素
    // 2. 获取到要渲染的位置

    // 具名插槽
    const age = 18;
    return h("div", {}, [renderSlots(this.$slots, "header", {age}), foo, renderSlots(this.$slots, "footer", { age })])
  }
}