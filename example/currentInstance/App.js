import { h, getCurrentInstance } from "../../lib/mini-vue.esm.js";
import { Foo } from './Foo.js';

export const App = {
  name: "App",
  render() {
    return h("div", {}, [h("p", {}, "currentInstanceDemo"), h(Foo)]);
  },
  setup() {
    const currentInstance = getCurrentInstance();
    console.log('currentInstance app', currentInstance);
  },
}