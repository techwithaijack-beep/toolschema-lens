#!/usr/bin/env node
import fs from 'node:fs';
import { analyzeInput } from '../src/analyzer.js';
import { renderHtml, renderMarkdown } from '../src/report.js';

function usage() {
  console.log(`ToolSchema Lens\n\nUsage:\n  node ./bin/toolschema-lens.js <input.json> [--json-out report.json] [--md-out report.md] [--html-out report.html] [--compact-out compact.json]`);
}

const args = process.argv.slice(2);
if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
  usage();
  process.exit(args.length === 0 ? 1 : 0);
}

const inputPath = args[0];
const options = {};
for (let i = 1; i < args.length; i += 1) {
  const key = args[i];
  const value = args[i + 1];
  if (key.startsWith('--')) {
    options[key.slice(2)] = value;
    i += 1;
  }
}

const report = analyzeInput(JSON.parse(fs.readFileSync(inputPath, 'utf8')));
if (options['json-out']) fs.writeFileSync(options['json-out'], JSON.stringify(report, null, 2));
if (options['md-out']) fs.writeFileSync(options['md-out'], renderMarkdown(report));
if (options['html-out']) fs.writeFileSync(options['html-out'], renderHtml(report));
if (options['compact-out']) fs.writeFileSync(options['compact-out'], JSON.stringify({ tools: report.optimizedTools }, null, 2));

console.log(`Analyzed ${report.summary.toolCount} tools | avg score ${report.summary.averageScore}/100 | saved ~${report.summary.savedTokens} tokens | ${report.summary.highFindings} high-severity findings`);
for (const item of report.results) console.log(`- ${item.name}: ${item.score}/100, ${item.stats.totalTokens} -> ${item.stats.compactedTokens} tokens, ${item.findings.length} findings`);
