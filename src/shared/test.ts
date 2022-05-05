const ShapeFlags = {
  ELEMENT: 0,
  STATEFUL_COMPONENT: 0,
  TEXT_CHILDREN: 0,
  ARRAY_CHILREN: 0
};

// vnode -> stateful_component
// 1. 可以设置、修改
// ShapeFlags.stateful_compoennt = 1;
// ShapeFlags.array_children = 1;
// 2. 可以查找
// if (ShapeFlags.element) {
  
// }
// if (ShapeFlags.stateful_compoennt) {

// }


// key->value 不够高效 -> 位运算
// 0001 -> element
// 0010 -> stateful_component
// 0100 -> text_children 
// 1000 -> array_children
// 1010 -> array_chilren, stateful_compoennt

// 修改 或 |
// 0000
// 0001
// ----
// 0001

// 查找 与 |
// 0001
// 0001
// ----
// 0001

// 0010
// 0001
// ----
// 0000

