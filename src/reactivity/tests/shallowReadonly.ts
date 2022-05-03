import { isReadOnly, shallowReadOnly } from "../reactive";

describe("shallowReadOnly", () => {
  test("only readOnly fist layer of obj", () => {
    const props = shallowReadOnly({ n: { foo: 1 } });
    expect(isReadOnly(props)).toBe(true);
    expect(isReadOnly(props.n)).toBe(false);
  })
})