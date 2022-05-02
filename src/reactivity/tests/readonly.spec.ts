import { readonly } from "../reactive";

describe("readonly", () => {
  it("happy path", () => {
    // can not set value
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped = readonly(original);
    expect(wrapped).not.toBe(original);
    expect(wrapped.foo).toBe(1);
  })

  it("console log warnings when call set in readonly reactive object", () => {
    // console.warn()
    // mock

    console.warn = jest.fn(); 

    const user = readonly({
      age: 10
    })

    console.log(user);
    user.age = 11
    
    expect(console.warn).toBeCalled();
  })
}) 