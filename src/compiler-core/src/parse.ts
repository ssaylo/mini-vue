import { NodeTypes } from "./ast";

const enum TagType {
  START,
  END
}

export function baseParse(content: string) {
  const context = createParserContext(content);

  return createRoot(parseChildren(context));
}

function parseChildren(context: any) {
  const nodes: any = [];

  let node;

  const s = context.source;
  if (s.startsWith("{{")) {
    node = parseInterpolation(context);
  } else if (context.source[0] === "<") {
    if (/[a-z]/i.test(context.source[1])) {
      console.log("process element");
      node = parseElement(context);
    }
  }

  if (!node) {
    node = parseText(context);
  }

  nodes.push(node);
  return nodes;
}

function parseText(context: any) {
  // 1. 获取content
  const content = context.source.slice(0, context.source.length);

  // 2. 推进
  advanceBy(context, content.length);

  console.log(context.source);

  return {
    type: NodeTypes.TEXT,
    content: content,
  }
}

function parseElement(context: any) {
  // 1. 解析tag
  // 2. 删除处理完成的代码
  const element = parseTag(context, TagType.START);
  parseTag(context, TagType.END);
  console.log("__________--------------__________", context.source)
  return element;
}

function parseTag(context: any, type: any) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source);
  console.log(match);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceBy(context, 1);

  if (type === TagType.END) return;
  return {
    type: NodeTypes.ELEMENT,
    tag: tag,
  };
}

function parseInterpolation(context: any) {
  // {{ message }}

  const openDelimiter = "{{"

  const closeDelimiter = "}}"

  const closeIndex = context.source.indexOf(closeDelimiter, openDelimiter.length);
  
  // 推进？扯犊子呢
  advanceBy(context, openDelimiter.length);

  const rawContextLength = closeIndex - openDelimiter.length;

  const rawContent = context.source.slice(0, rawContextLength);
  const content = rawContent.trim();

  advanceBy(context, rawContent.Length - closeDelimiter.length)

  return {
      type: NodeTypes.INTERPOLATION,
      content: {
        type: NodeTypes.SIMPLE_EXPRESSION,
        content: content,
      }
    }
}

function advanceBy(context: any, length: number) {
  context.source = context.source.slice(length);
}

function createRoot( children: any ) {
  return {
    children,
  }
}

function createParserContext(content: string) {
  return { 
    source: content,
  }
}