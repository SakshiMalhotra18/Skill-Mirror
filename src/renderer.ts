import type { AnalysisResult } from './api';
import { renderRadarChart } from './chart';

function esc(str: string): string {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
}

function verdictClass(label: string): string {
  const l = label.toLowerCase().replace(/\s+/g, '-');
  if (l.includes('strong')) return 'strong-hire';
  if (l.includes('no')) return 'no-hire';
  if (l.includes('borderline')) return 'borderline';
  return 'hire';
}

function maturityClass(val: string): string {
  const l = val.toLowerCase();
  if (l === 'high' || l === 'strong') return l;
  if (l === 'medium' || l === 'moderate') return l;
  return 'low';
}

export function renderResults(data: AnalysisResult, container: HTMLElement): void {
  const vc = verdictClass(data.verdict.label);

  container.innerHTML = `
    <!-- EXPORT BAR -->
    <div class="export-bar" id="export-bar">
      <button class="btn-secondary" id="copy-report-btn" title="Copy to clipboard for ATS">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        Copy to ATS
      </button>
      <button class="btn-secondary" id="export-pdf-btn" title="Save as PDF">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        Export PDF
      </button>
    </div>

    <!-- VERDICT -->
    <div class="verdict-banner" id="verdict-banner">
      <div class="verdict-badge ${vc}">${esc(data.verdict.label)}</div>
      <div class="verdict-info">
        <div class="verdict-reason">${esc(data.verdict.reason)}</div>
        <div class="verdict-confidence">
          <div class="confidence-bar-bg">
            <div class="confidence-bar-fill" style="width: ${data.verdict.confidence}%"></div>
          </div>
          <span class="confidence-label">${data.verdict.confidence}% confidence</span>
        </div>
      </div>
    </div>

    <div class="results-grid">
      <!-- RADAR CHART -->
      <div class="card" id="skill-card">
        <div class="card-header">
          <div class="card-icon purple">📊</div>
          <span class="card-title">Skill Vector</span>
        </div>
        <div class="radar-chart-container">
          <canvas id="radar-canvas"></canvas>
        </div>
      </div>

      <!-- SIGNAL ANALYSIS -->
      <div class="card" id="signals-card">
        <div class="card-header">
          <div class="card-icon cyan">📡</div>
          <span class="card-title">Signal Analysis</span>
        </div>
        <ul class="signal-list">
          ${data.signal_analysis.strong_signals.map(s =>
            `<li class="signal-item strong">${esc(s)}</li>`
          ).join('')}
          ${data.signal_analysis.weak_signals.map(s =>
            `<li class="signal-item weak">${esc(s)}</li>`
          ).join('')}
          ${data.signal_analysis.missing_signals.map(s =>
            `<li class="signal-item missing">${esc(s)}</li>`
          ).join('')}
        </ul>
      </div>

      <!-- GAP ANALYSIS -->
      <div class="card" id="gap-card">
        <div class="card-header">
          <div class="card-icon amber">🎯</div>
          <span class="card-title">Gap Analysis</span>
        </div>
        <div class="gap-cards">
          ${data.gap_analysis.map(g => `
            <div class="gap-card">
              <div class="gap-card-title">${esc(g.gap)}</div>
              <div class="gap-card-impact"><span class="gap-card-label">Impact:</span>${esc(g.impact)}</div>
              <div class="gap-card-fix"><span class="gap-card-label">Fix:</span>${esc(g.fix)}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- MARKET POSITION -->
      <div class="card" id="market-card">
        <div class="card-header">
          <div class="card-icon emerald">🏷️</div>
          <span class="card-title">Market Position</span>
        </div>
        <div class="market-cols">
          <div>
            <div class="market-col-title ready">Competitive For</div>
            ${data.market_position.competitive_for.map(r =>
              `<span class="market-tag ready">${esc(r)}</span>`
            ).join('')}
          </div>
          <div>
            <div class="market-col-title not-ready">Not Ready For</div>
            ${data.market_position.not_ready_for.map(r =>
              `<span class="market-tag not-ready">${esc(r)}</span>`
            ).join('')}
          </div>
        </div>
      </div>

      <!-- ENTERPRISE ML -->
      <div class="card results-grid-full" id="enterprise-card">
        <div class="card-header">
          <div class="card-icon blue">⚙️</div>
          <span class="card-title">Enterprise ML Assessment</span>
        </div>
        <div class="enterprise-grid">
          <div class="enterprise-metric">
            <div class="enterprise-metric-label">Pipeline Maturity</div>
            <div class="enterprise-metric-value ${maturityClass(data.enterprise_ml_assessment.pipeline_maturity)}">
              ${esc(data.enterprise_ml_assessment.pipeline_maturity)}
            </div>
          </div>
          <div class="enterprise-metric">
            <div class="enterprise-metric-label">Production Readiness</div>
            <div class="enterprise-metric-value ${maturityClass(data.enterprise_ml_assessment.production_readiness)}">
              ${esc(data.enterprise_ml_assessment.production_readiness)}
            </div>
          </div>
          <div class="enterprise-metric">
            <div class="enterprise-metric-label">Scale Signal</div>
            <div class="enterprise-metric-value ${maturityClass(data.enterprise_ml_assessment.scale_signal)}">
              ${esc(data.enterprise_ml_assessment.scale_signal)}
            </div>
          </div>
        </div>
        <div class="enterprise-comment">${esc(data.enterprise_ml_assessment.comments)}</div>
      </div>

      <!-- IMPACT REWRITE -->
      <div class="card" id="rewrite-card">
        <div class="card-header">
          <div class="card-icon cyan">✍️</div>
          <span class="card-title">Impact Rewrite</span>
        </div>
        <div class="rewrite-list">
          ${data.impact_rewrite.map(r =>
            `<div class="rewrite-item">${esc(r)}</div>`
          ).join('')}
        </div>
      </div>

      <!-- RISK FLAGS -->
      <div class="card" id="risk-card">
        <div class="card-header">
          <div class="card-icon rose">🚩</div>
          <span class="card-title">Risk Flags</span>
        </div>
        <div class="risk-list">
          ${data.risk_flags.map(r =>
            `<div class="risk-item">${esc(r)}</div>`
          ).join('')}
        </div>
      </div>
    </div>
  `;

  // Render radar chart after DOM is ready
  requestAnimationFrame(() => {
    const canvas = document.getElementById('radar-canvas') as HTMLCanvasElement | null;
    if (canvas) renderRadarChart(canvas, data.skill_vector);
  });

  // Attach Export Listeners
  const copyBtn = document.getElementById('copy-report-btn');
  copyBtn?.addEventListener('click', () => {
    const reportText = `SkillMirror Report: ${data.verdict.label} (${data.verdict.confidence}%)
Reason: ${data.verdict.reason}

=== SKILL VECTOR ===
${data.skill_vector.map(s => `${s.name}: ${s.score}/100`).join('\n')}

=== SIGNAL ANALYSIS ===
Strong: ${data.signal_analysis.strong_signals.join(' | ').replace(/\*\*/g, '')}
Weak: ${data.signal_analysis.weak_signals.join(' | ').replace(/\*\*/g, '')}
Missing: ${data.signal_analysis.missing_signals.join(' | ').replace(/\*\*/g, '')}

=== GAP ANALYSIS ===
${data.gap_analysis.map(g => `- ${g.gap.replace(/\*\*/g, '')}: Impact: ${g.impact.replace(/\*\*/g, '')} -> Fix: ${g.fix.replace(/\*\*/g, '')}`).join('\n')}

=== ENTERPRISE ML ===
Maturity: ${data.enterprise_ml_assessment.pipeline_maturity}
Readiness: ${data.enterprise_ml_assessment.production_readiness}
Scale: ${data.enterprise_ml_assessment.scale_signal}
Comment: ${data.enterprise_ml_assessment.comments.replace(/\*\*/g, '')}
`;
    navigator.clipboard.writeText(reportText).then(() => {
      const orig = copyBtn.innerHTML;
      copyBtn.innerHTML = 'Copied!';
      setTimeout(() => copyBtn.innerHTML = orig, 2000);
    });
  });

  const pdfBtn = document.getElementById('export-pdf-btn');
  pdfBtn?.addEventListener('click', () => {
    window.print();
  });
}
