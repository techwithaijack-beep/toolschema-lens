import fs from 'node:fs';
import { analyzeInput } from '../src/analyzer.js';
import { renderHtml, renderMarkdown } from '../src/report.js';

const input = JSON.parse(fs.readFileSync(new URL('../examples/verbose-tools.json', import.meta.url), 'utf8'));
const report = analyzeInput(input);
if (report.summary.toolCount !== 2) throw new Error('Expected 2 tools in sample report');
if (report.summary.savedTokens <= 0) throw new Error('Expected token savings to be positive');
if (!renderMarkdown(report).includes('ToolSchema Lens Report')) throw new Error('Markdown render failed');
if (!renderHtml(report).includes('<!DOCTYPE html>')) throw new Error('HTML render failed');
console.log('smoke ok');
