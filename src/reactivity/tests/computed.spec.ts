import { computed } from "../computed";
import { reactive } from '../reactive';

describe("computed", () => {
  it("happy path", () => {
    const user = reactive({
      age: 1,
    })
    const age = computed(() => {
      return user.age
    })

    expect(age.value).toBe(1);
  })

  it("should compute lazily", () => {
    const value = reactive({ foo: 1 });
    const getter = jest.fn(() => value.foo);
    const computedValue = computed(getter);

    // lazy
    expect(getter).not.toHaveBeenCalled();
    expect(computedValue.value).toBe(1);
    expect(getter).toHaveBeenCalledTimes(1);
    
    // should not compute again
    computedValue.value;
    expect(getter).toHaveBeenCalledTimes(1);

    // should not compute untill needed
    value.foo = 2;
    expect(getter).toHaveBeenCalledTimes(1);

    // // so call it
    // expect(computedValue.value).toBe(2);
    // expect(getter).toHaveBeenCalledTimes(2);

    // // should not compute again
    // expect(getter).toHaveBeenCalledTimes(2);
  })
})