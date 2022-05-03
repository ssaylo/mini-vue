import { effect } from '../effect';
import { reactive, isReactive } from '../reactive';
import { isRef, ref, unRef, proxyRefs } from '../ref';

describe("ref", () => {
  it("happy path", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
  })

  it("should be reactive", () => {
    const a = ref(1);
    let dummy;
    let calls = 0;

    effect(() => {
      calls++;
      dummy = a.value;
    })

    expect(calls).toBe(1);
    expect(dummy).toBe(1);
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
    // same value should not trigger
    a.value = 2;
    expect(calls).toBe(2);
    expect(dummy).toBe(2);
  })

  it("should make nested properties reactive", () => {
    const a = ref({ count: 1 })
    let dummy;
    effect(() => {
      dummy = a.value.count
    })
    expect(dummy).toBe(1);
    a.value.count = 2;
    expect(dummy).toBe(2);
  })

  it("isRef", () => {
    const a = ref(1)
    const user = reactive({
      age: 1,
    })
    expect(isRef(a)).toBe(true);
    expect(isRef(1)).toBe(false);
    expect(isRef(user)).toBe(false);
  })

  it("unRef", () => {
    const a = ref(1);
    expect(a.value).toBe(1);
    expect(isRef(a)).toBe(true);
    const unref_a = unRef(a);
    expect(isRef(unref_a)).toBe(false);
    expect(isReactive(unref_a)).toBe(false);
    expect(unref_a).toBe(1);
  })

  it("proxyRefs", () => {
    const user = {
      age: ref(10),
      name: "xiaohong"
    };
    // 省得去调用 .value
    const proxyUser = proxyRefs(user);
    expect(user.age.value).toBe(10);
    expect(proxyUser.age).toBe(10);
    expect(proxyUser.name).toBe("xiaohong");

    proxyUser.age = 20
    // set -> ref -> .value
    // set -> value
    expect(proxyUser.age).toBe(20);
    expect(user.age.value).toBe(20);
  })
})
