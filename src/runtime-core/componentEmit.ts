export function emit(instance: any, event: any) {
  console.log(">>>>>>>>>>>>>>>>>>>>emit");
  // instance.props -> event
  const { props } = instance;
  // TPP
  debugger
  // 先去写一个特定的行为，然后重构成能用的行为
  const handler = props["onAdd"];
  handler && handler();
}