export function estimateTokens(value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return Math.max(1, Math.ceil(text.length / 4));
}

export function clampText(text, max = 160) {
  if (!text || typeof text !== 'string') return '';
  const firstSentence = text.split(/(?<=[.!?])\s+/)[0] || text;
  const cleaned = firstSentence.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= max) return cleaned;
  return `${cleaned.slice(0, max - 1).trimEnd()}…`;
}

export function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function walkSchema(schema, visitor, path = '$', depth = 0) {
  if (!schema || typeof schema !== 'object') return;
  visitor(schema, path, depth);

  if (schema.properties && typeof schema.properties === 'object') {
    for (const [key, child] of Object.entries(schema.properties)) {
      walkSchema(child, visitor, `${path}.properties.${key}`, depth + 1);
    }
  }

  if (schema.items) {
    walkSchema(schema.items, visitor, `${path}.items`, depth + 1);
  }

  if (schema.anyOf) {
    schema.anyOf.forEach((child, index) => walkSchema(child, visitor, `${path}.anyOf[${index}]`, depth + 1));
  }

  if (schema.oneOf) {
    schema.oneOf.forEach((child, index) => walkSchema(child, visitor, `${path}.oneOf[${index}]`, depth + 1));
  }

  if (schema.allOf) {
    schema.allOf.forEach((child, index) => walkSchema(child, visitor, `${path}.allOf[${index}]`, depth + 1));
  }
}

export function collectTools(input) {
  if (Array.isArray(input)) return input;
  if (input?.tools && Array.isArray(input.tools)) return input.tools;
  if (input?.result?.tools && Array.isArray(input.result.tools)) return input.result.tools;
  if (input?.capabilities?.tools && Array.isArray(input.capabilities.tools)) return input.capabilities.tools;
  if (input?.functions && Array.isArray(input.functions)) return input.functions;
  return [];
}

export function normalizeTool(raw, index) {
  const tool = raw?.function ? raw.function : raw;
  const schema = tool.parameters || tool.input_schema || tool.schema || { type: 'object', properties: {} };
  return {
    index,
    name: tool.name || `tool_${index + 1}`,
    description: tool.description || '',
    schema,
    raw
  };
}

export function severityWeight(level) {
  return { high: 5, medium: 3, low: 1 }[level] || 0;
}
