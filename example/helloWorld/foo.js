import { h } from "../../lib/mini-vue.esm.js"

export const Foo = {
  setup(props) {
    // props.count
    // props.count++; // -> 2, this is wrong, it should be immutable
    console.log(props)
    // props is readOnly
  },
  render() {
    return h("div", {}, "foo: " + this.count);
  }
}