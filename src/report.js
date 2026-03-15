function escapeHtml(value) {
  return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function renderMarkdown(report) {
  const lines = [
    '# ToolSchema Lens Report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Summary',
    `- Tools: ${report.summary.toolCount}`,
    `- Approx. runtime tokens before: ${report.summary.totalTokens}`,
    `- Approx. runtime tokens after compaction: ${report.summary.compactedTokens}`,
    `- Estimated tokens saved: ${report.summary.savedTokens}`,
    `- Average score: ${report.summary.averageScore}/100`,
    `- Findings: ${report.summary.highFindings} high / ${report.summary.mediumFindings} medium / ${report.summary.lowFindings} low`,
    ''
  ];
  for (const item of report.results) {
    lines.push(`## ${item.name}`);
    lines.push('');
    lines.push(`- Score: ${item.score}/100`);
    lines.push(`- Tokens: ${item.stats.totalTokens} -> ${item.stats.compactedTokens} (saved ${item.stats.savedTokens})`);
    lines.push(`- Properties: ${item.stats.propertyCount}`);
    lines.push(`- Max depth: ${item.stats.maxDepth}`);
    lines.push('');
    if (item.findings.length === 0) {
      lines.push('- No major findings');
    } else {
      for (const finding of item.findings) lines.push(`- [${finding.level.toUpperCase()}] ${finding.message} Fix: ${finding.fix}`);
    }
    lines.push('');
  }
  return `${lines.join('\n')}\n`;
}

export function renderHtml(report) {
  const cards = report.results.map((item) => {
    const findings = item.findings.length
      ? item.findings.map((finding) => `<li class="finding ${finding.level}"><strong>${finding.level.toUpperCase()}</strong><span>${escapeHtml(finding.message)}</span><em>${escapeHtml(finding.fix)}</em></li>`).join('')
      : '<li class="finding low"><strong>OK</strong><span>No major findings</span><em>Still review field naming and examples manually.</em></li>';
    return `<section class="card"><div class="card-header"><div><h2>${escapeHtml(item.name)}</h2><p>${escapeHtml(item.description || 'No description provided.')}</p></div><div class="score">${item.score}<small>/100</small></div></div><div class="metrics"><div><span>Tokens</span><strong>${item.stats.totalTokens} → ${item.stats.compactedTokens}</strong></div><div><span>Saved</span><strong>${item.stats.savedTokens}</strong></div><div><span>Properties</span><strong>${item.stats.propertyCount}</strong></div><div><span>Depth</span><strong>${item.stats.maxDepth}</strong></div></div><div class="grid"><div><h3>Findings</h3><ul class="findings">${findings}</ul></div><div><h3>Optimized contract</h3><pre>${escapeHtml(JSON.stringify(item.optimized, null, 2))}</pre></div></div></section>`;
  }).join('');

  return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>ToolSchema Lens Report</title><style>:root{color-scheme:dark;--bg:#08111f;--panel:#101a2d;--ink:#e8eefc;--muted:#93a4c8;--line:#24314f;--good:#49d17d;--warn:#f4be52;--bad:#ff6b6b}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,sans-serif;background:radial-gradient(circle at top,#13213d,var(--bg));color:var(--ink)}.wrap{max-width:1200px;margin:0 auto;padding:32px 20px 80px}.hero{display:grid;gap:16px;margin-bottom:24px}.hero h1{margin:0;font-size:2.2rem}.summary{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px}.summary .pill,.card{background:color-mix(in oklab,var(--panel) 92%,white 8%);border:1px solid var(--line);border-radius:18px}.pill{padding:16px}.pill span{color:var(--muted);display:block;font-size:.9rem}.pill strong{font-size:1.5rem}.card{padding:20px;margin-top:18px}.card-header{display:flex;justify-content:space-between;gap:16px;align-items:start}.card-header h2{margin:0 0 6px}.card-header p{margin:0;color:var(--muted);max-width:760px}.score{font-size:2rem;font-weight:700;padding:10px 14px;border-radius:14px;background:rgba(73,209,125,.12);color:var(--good)}.metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;margin:18px 0}.metrics div{padding:12px;border:1px solid var(--line);border-radius:14px;background:rgba(255,255,255,.02)}.metrics span{display:block;color:var(--muted);font-size:.9rem}.metrics strong{font-size:1.05rem}.grid{display:grid;grid-template-columns:1.05fr 1fr;gap:18px}.findings{list-style:none;padding:0;margin:0;display:grid;gap:10px}.finding{border:1px solid var(--line);border-left-width:5px;border-radius:12px;padding:12px;display:grid;gap:5px}.finding.high{border-left-color:var(--bad)}.finding.medium{border-left-color:var(--warn)}.finding.low{border-left-color:var(--good)}.finding span{font-weight:600}.finding em{color:var(--muted);font-style:normal}pre{margin:0;padding:14px;border-radius:14px;border:1px solid var(--line);background:#091121;overflow:auto;white-space:pre-wrap;word-break:break-word}@media (max-width:920px){.grid{grid-template-columns:1fr}.card-header{flex-direction:column}}</style></head><body><div class="wrap"><section class="hero"><div><h1>ToolSchema Lens</h1><p>Find tool contracts that quietly waste prompt budget, confuse models, or needlessly duplicate metadata.</p></div><div class="summary"><div class="pill"><span>Tools</span><strong>${report.summary.toolCount}</strong></div><div class="pill"><span>Tokens before</span><strong>${report.summary.totalTokens}</strong></div><div class="pill"><span>Tokens after</span><strong>${report.summary.compactedTokens}</strong></div><div class="pill"><span>Saved</span><strong>${report.summary.savedTokens}</strong></div><div class="pill"><span>Average score</span><strong>${report.summary.averageScore}/100</strong></div></div></section>${cards}</div></body></html>`;
}
