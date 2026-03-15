import { clampText, collectTools, deepClone, estimateTokens, normalizeTool, severityWeight, walkSchema } from './utils.js';

function compactSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema;
  const next = deepClone(schema);
  delete next.title;
  delete next.$schema;
  delete next.examples;
  delete next.example;
  delete next.default;
  delete next.deprecated;

  if (typeof next.description === 'string') next.description = clampText(next.description, 140);

  if (next.properties && typeof next.properties === 'object') {
    for (const [key, child] of Object.entries(next.properties)) {
      next.properties[key] = compactSchema(child);
    }
  }

  if (next.items) next.items = compactSchema(next.items);
  for (const combiner of ['anyOf', 'oneOf', 'allOf']) {
    if (Array.isArray(next[combiner])) next[combiner] = next[combiner].map((child) => compactSchema(child));
  }
  if (Array.isArray(next.enum) && next.enum.length > 16) {
    next['x-toolschema-warning'] = `Large enum preserved (${next.enum.length} values). Consider moving this list server-side.`;
  }
  return next;
}

function analyzeOne(tool) {
  const findings = [];
  const stats = {
    propertyCount: 0,
    requiredCount: Array.isArray(tool.schema?.required) ? tool.schema.required.length : 0,
    enumCount: 0,
    maxDepth: 0,
    longDescriptions: 0,
    titleCount: 0,
    exampleCount: 0,
    optionalWithoutDescription: 0,
    largeEnums: [],
    duplicatedDescriptions: []
  };
  const seenDescriptions = new Map();

  walkSchema(tool.schema, (node, path, depth) => {
    stats.maxDepth = Math.max(stats.maxDepth, depth);
    if (node.properties && typeof node.properties === 'object') stats.propertyCount += Object.keys(node.properties).length;
    if (Array.isArray(node.enum)) {
      stats.enumCount += node.enum.length;
      if (node.enum.length >= 12) stats.largeEnums.push({ path, count: node.enum.length });
    }
    if (typeof node.title === 'string') stats.titleCount += 1;
    if (node.examples || node.example) stats.exampleCount += 1;
    if (typeof node.description === 'string') {
      const desc = node.description.trim();
      if (desc.length > 140) stats.longDescriptions += 1;
      const key = desc.toLowerCase();
      if (key.length > 20) seenDescriptions.set(key, (seenDescriptions.get(key) || 0) + 1);
    } else if (path.includes('.properties.')) {
      stats.optionalWithoutDescription += 1;
    }
  });

  for (const [desc, count] of seenDescriptions.entries()) {
    if (count >= 3) stats.duplicatedDescriptions.push({ description: desc.slice(0, 80), count });
  }

  const standardizedOriginal = {
    name: tool.name,
    description: tool.description || tool.name,
    input_schema: tool.schema
  };
  const schemaTokens = estimateTokens(tool.schema);
  const descriptionTokens = estimateTokens(tool.description || tool.name);
  const totalTokens = estimateTokens(standardizedOriginal);

  if ((tool.description || '').length > 220) findings.push({ level: 'high', message: 'Tool description is long enough to inflate every agent call.', fix: 'Keep the headline short and move edge cases to docs.' });
  if (schemaTokens >= 220) findings.push({ level: 'high', message: `Schema is approximately ${schemaTokens} tokens before the model even sees user input.`, fix: 'Shorten descriptions, strip metadata, and split oversized tools.' });
  if (stats.maxDepth >= 4) findings.push({ level: 'medium', message: `Nested depth reaches ${stats.maxDepth}, which makes tool use harder to infer reliably.`, fix: 'Flatten nested objects or split the contract.' });
  if (stats.largeEnums.length > 0) findings.push({ level: 'medium', message: `${stats.largeEnums.length} field(s) contain large enums that bloat prompt budget.`, fix: 'Prefer smaller enums, short codes, or server-side lookup tables.' });
  if (stats.longDescriptions >= 3) findings.push({ level: 'medium', message: `${stats.longDescriptions} field descriptions are unusually long.`, fix: 'Trim field descriptions to one sentence focused on runtime decisions.' });
  if (stats.titleCount >= 2 || stats.exampleCount >= 2) findings.push({ level: 'low', message: 'Schema includes titles/examples/defaults that mainly help humans, not runtime inference.', fix: 'Keep verbose docs outside the runtime contract.' });
  if (stats.duplicatedDescriptions.length > 0) findings.push({ level: 'low', message: 'Repeated schema descriptions were detected across multiple fields.', fix: 'Avoid repeating the same wording on every property.' });
  if (stats.optionalWithoutDescription >= 3) findings.push({ level: 'medium', message: `${stats.optionalWithoutDescription} fields have no description.`, fix: 'Every field should explain what the model should put there.' });

  const optimized = {
    name: tool.name,
    description: clampText(tool.description || tool.name, 140),
    input_schema: compactSchema(tool.schema)
  };
  const compactedTokens = estimateTokens(optimized);
  const savedTokens = Math.max(0, totalTokens - compactedTokens);
  const score = Math.max(0, 100 - findings.reduce((sum, f) => sum + severityWeight(f.level) * 4, 0));

  return {
    name: tool.name,
    description: tool.description,
    schema: tool.schema,
    score,
    findings,
    stats: { ...stats, schemaTokens, descriptionTokens, totalTokens, compactedTokens, savedTokens },
    optimized
  };
}

export function analyzeInput(input) {
  const tools = collectTools(input).map((tool, index) => normalizeTool(tool, index));
  if (tools.length === 0) throw new Error('No tools found. Expected an array, { tools: [...] }, or MCP-style { result: { tools: [...] } }.');
  const results = tools.map(analyzeOne);
  return {
    generatedAt: new Date().toISOString(),
    summary: {
      toolCount: results.length,
      totalTokens: results.reduce((sum, item) => sum + item.stats.totalTokens, 0),
      compactedTokens: results.reduce((sum, item) => sum + item.stats.compactedTokens, 0),
      savedTokens: results.reduce((sum, item) => sum + item.stats.savedTokens, 0),
      highFindings: results.reduce((sum, item) => sum + item.findings.filter((f) => f.level === 'high').length, 0),
      mediumFindings: results.reduce((sum, item) => sum + item.findings.filter((f) => f.level === 'medium').length, 0),
      lowFindings: results.reduce((sum, item) => sum + item.findings.filter((f) => f.level === 'low').length, 0),
      averageScore: Math.round(results.reduce((sum, item) => sum + item.score, 0) / results.length)
    },
    results,
    optimizedTools: results.map((item) => item.optimized)
  };
}
