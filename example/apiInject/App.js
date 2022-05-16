// 组件 provide 和 inject 功能
import {
  h,
  provide,
  inject,
} from "../../lib/mini-vue.esm.js";

const Provider = {
  name: "Provider",
  setup() {
    provide("foo", "fooVal 11111");
    provide("bar", "barVal 22222");
  },
  render() {
    return h("div", {}, [h("p", {}, "this will Provider"), h(Consumer)]);
  }
};

const Consumer = {
  name: "Consumer",
  setup() {
    const foo = inject("foo");
    const bar = inject("bar");
    return {
      foo,
      bar
    }
  },
  render() {
    return h("div", {}, `this will Consume: - ${this.foo} - ${this.bar} -`);
  }
};

export default {
  name: "App",
  setup() {

  },
  render() {
    return h("div", {}, [h("p", {}, "apiInject in top"), h(Provider)]);
  },
};
