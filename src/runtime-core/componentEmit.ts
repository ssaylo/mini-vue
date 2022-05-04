import { camelize, capitalize, toHandlerKey } from "../shared";

export function emit(instance: any, event: any, ...args: any[]) {
  console.log(">>>>>>>>>>>>>>>>>>>>emit");
  // instance.props -> event
  const { props } = instance;
  // top to bottom, small to big
  //  add -> Add
  const handlerKey = toHandlerKey(camelize(event));
  const handler = props[handlerKey];
  handler && handler(args);
}

// extract common logic is really important!
