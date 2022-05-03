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