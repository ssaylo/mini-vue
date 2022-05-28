export function baseParse(content: string) {
  const context = createParserContext(content);

  return createRoot(parseChildren(context));
}

function parseChildren(context: any) {
  const nodes: any = [];
  const node = parseInterpolation(context);
  nodes.push(node);
  return nodes;
}

function parseInterpolation(context: any) {
  // {{ message }}
  const closeIndex = context.source.indexOf("}}", 2);
  context.source = context.source.slice(2);

  const rawContextLength = closeIndex - 2;

  const content = context.source.slice(0, rawContextLength);

  context.source = context.source.slice(rawContextLength + 2);

  return {
      type: "interpolation",
      content: {
        type: "simple_expression",
        content: content,
      }
    }
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