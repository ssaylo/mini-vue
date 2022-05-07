import { ShapeFlags } from "../shared/ShapeFlags";

export function initSlots(instance: any, children: any) {
  // instance.slots = children;
  // instance.slots = Array.isArray(children) ? children : [children];
  const { vnode } = instance;
  if (vnode.shapeFlag & ShapeFlags.SLOT_CHILDREN) {
    normalizeObjectSlots(children, instance);
  }
}

function normalizeObjectSlots(children: any, instance: any) {
  const slots: any = {};
  for (const key in children) {
    const value = children[key];
    // slot
    slots[key] = (props: any) => normalizeSlotsValue(value(props));
  }
  instance.slots = slots;
}

function normalizeSlotsValue(value: any) {
  return Array.isArray(value) ? value : [value]
}