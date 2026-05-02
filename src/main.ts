import './style.css';
import { analyzeCandidate } from './api';
import { renderResults } from './renderer';


const SAMPLE_PROFILE = `Senior Data Scientist at TechCorp (2022-Present)
- Built recommendation engine using collaborative filtering, serving 2M+ daily users
- Designed and deployed ML pipeline on AWS SageMaker with automated retraining
- Reduced model inference latency from 200ms to 45ms through quantization and caching
- Led cross-functional team of 4 engineers to ship real-time fraud detection system

Data Scientist at StartupXYZ (2020-2022)
- Developed NLP models for customer sentiment analysis using BERT fine-tuning
- Created dashboards in Tableau for executive stakeholders
- Built ETL pipelines using Apache Airflow and Spark

Education: M.S. Computer Science, Stanford University
Skills: Python, TensorFlow, PyTorch, SQL, AWS, Docker, Kubernetes, Spark`;

const SAMPLE_JD = `Staff Machine Learning Engineer — Google Search
Requirements:
- 5+ years building production ML systems at scale (100M+ users)
- Deep expertise in ranking, recommendation, or NLP systems
- Experience with distributed training (TPU/GPU clusters)
- Strong system design for low-latency serving (<10ms p99)
- Published research or equivalent industry contributions
- Track record of mentoring engineers and driving technical strategy`;

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <!-- Animated background particles -->
  <div class="bg-particles">
    <div class="particle p1"></div>
    <div class="particle p2"></div>
    <div class="particle p3"></div>
    <div class="particle p4"></div>
    <div class="particle p5"></div>
  </div>

  <header class="header">
    <div class="container header-inner">
      <div class="logo">
        <div class="logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div class="logo-text">SkillMirror</div>
          <div class="logo-tag">Hiring Intelligence Engine</div>
        </div>
      </div>

    </div>
  </header>

  <main class="container">
    <section class="hero-section">
      <h1 class="hero-title">Decode any candidate.<br/><span class="gradient-text">In seconds.</span></h1>
      <p class="hero-subtitle">Paste a resume + target role. Get a brutally honest, panel-grade assessment powered by AI.</p>
    </section>

    <section class="input-section">
      <div class="input-grid">
        <!-- Left: Profile -->
        <div class="input-card">
          <div class="input-label">
            <span class="dot"></span>
            Candidate Profile
          </div>
          <textarea
            id="profile-input"
            class="profile-textarea"
            placeholder="Paste resume text, LinkedIn summary, or project descriptions..."
            spellcheck="false"
          ></textarea>
          <div class="input-meta">
            <span class="char-count" id="char-count">0 chars</span>
            <button class="btn-ghost" id="sample-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              Load Sample
            </button>
          </div>
        </div>

        <!-- Right: Role / JD -->
        <div class="input-card">
          <div class="input-label">
            <span class="dot dot-cyan"></span>
            Target Role / Job Description
            <span class="optional-tag">Required for verdict</span>
          </div>
          <textarea
            id="role-input"
            class="profile-textarea"
            placeholder="Paste the job description, or just type the role title (e.g. 'Staff ML Engineer at Google')..."
            spellcheck="false"
          ></textarea>
          <div class="input-meta">
            <span class="char-count" id="role-char-count">0 chars</span>
            <button class="btn-ghost" id="sample-jd-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="8" y1="10" x2="16" y2="10"/><line x1="8" y1="14" x2="12" y2="14"/></svg>
              Load Sample JD
            </button>
          </div>
        </div>
      </div>

      <!-- Action bar -->
      <div class="action-bar">
        <div class="action-info">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.4"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span class="action-hint">Without a target role, verdict scoring is disabled</span>
        </div>
        <div class="action-buttons">
          <button class="btn-secondary" id="reanalyze-btn" style="display:none;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
            Re-analyze
          </button>
          <button class="btn-primary" id="analyze-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Analyze Candidate
          </button>
        </div>
      </div>
    </section>

    <section class="results-section" id="results-section"></section>
  </main>

  <footer class="footer">
    <div class="footer-inner">
      <span>SkillMirror</span>
      <span class="footer-sep">·</span>
      <span>AI-powered hiring intelligence</span>
      <span class="footer-sep">·</span>
      <span>Evaluations are advisory, not final decisions</span>
    </div>
  </footer>

  <div class="loading-overlay" id="loading-overlay">
    <div class="loading-ring">
      <div class="loading-spinner"></div>
    </div>
    <div class="loading-text">Analyzing candidate signals<span class="loading-dots"></span></div>
    <div class="loading-sub">Running through 7-dimensional skill assessment</div>
  </div>

  <div class="why-us-widget">
    <div class="why-us-card" id="why-us-card">
      <div class="why-us-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--purple)" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
        Why SkillMirror?
      </div>
      <ul class="why-us-list">
        <li class="why-us-item">
          <span class="why-us-icon">✓</span>
          <div><span class="why-us-highlight">Deterministic Scoring:</span> Zero temperature output guarantees consistent, reproducible panel evaluations.</div>
        </li>
        <li class="why-us-item">
          <span class="why-us-icon">✓</span>
          <div><span class="why-us-highlight">Role-Anchored:</span> Doesn't just praise general skills, but scores exactly against the provided JD.</div>
        </li>
        <li class="why-us-item">
          <span class="why-us-icon">✓</span>
          <div><span class="why-us-highlight">Structured JSON:</span> Enforces rigorous multi-dimensional rubrics instead of conversational chat text.</div>
        </li>
        <li class="why-us-item">
          <span class="why-us-icon">✓</span>
          <div><span class="why-us-highlight">Blazing Fast:</span> Powered by Groq's LPU hardware for near-instant 70B parameter inferences.</div>
        </li>
      </ul>
    </div>
    <button class="why-us-button" id="why-us-btn" title="Why us vs ChatGPT?">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    </button>
  </div>

  <div class="error-toast" id="error-toast"></div>
`;

// --- Elements ---
const textarea = document.getElementById('profile-input') as HTMLTextAreaElement;
const roleInput = document.getElementById('role-input') as HTMLTextAreaElement;
const charCount = document.getElementById('char-count') as HTMLSpanElement;
const roleCharCount = document.getElementById('role-char-count') as HTMLSpanElement;
const analyzeBtn = document.getElementById('analyze-btn') as HTMLButtonElement;
const reanalyzeBtn = document.getElementById('reanalyze-btn') as HTMLButtonElement;
const sampleBtn = document.getElementById('sample-btn') as HTMLButtonElement;
const sampleJdBtn = document.getElementById('sample-jd-btn') as HTMLButtonElement;

const resultsSection = document.getElementById('results-section') as HTMLElement;
const loadingOverlay = document.getElementById('loading-overlay') as HTMLElement;
const errorToast = document.getElementById('error-toast') as HTMLElement;
const whyUsBtn = document.getElementById('why-us-btn') as HTMLButtonElement;
const whyUsCard = document.getElementById('why-us-card') as HTMLDivElement;



// --- Character counts ---
textarea.addEventListener('input', () => {
  charCount.textContent = `${textarea.value.length} chars`;
});
roleInput.addEventListener('input', () => {
  roleCharCount.textContent = `${roleInput.value.length} chars`;
});



// --- Load samples ---
sampleBtn.addEventListener('click', () => {
  textarea.value = SAMPLE_PROFILE;
  charCount.textContent = `${SAMPLE_PROFILE.length} chars`;
});
sampleJdBtn.addEventListener('click', () => {
  roleInput.value = SAMPLE_JD;
  roleCharCount.textContent = `${SAMPLE_JD.length} chars`;
});

// --- Error toast ---
let toastTimer: ReturnType<typeof setTimeout>;
function showError(msg: string): void {
  errorToast.textContent = msg;
  errorToast.classList.add('active');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => errorToast.classList.remove('active'), 6000);
}

// --- Shared analyze logic ---
async function runAnalysis(forceRefresh: boolean): Promise<void> {
  const profileText = textarea.value.trim();
  const roleContext = roleInput.value.trim();
  const envKey = import.meta.env.VITE_GROQ_API_KEY;

  if (!envKey) { showError('Please set VITE_GROQ_API_KEY in your .env file and restart the server.'); return; }
  if (profileText.length < 30) { showError('Profile text too short. Paste a real resume or profile.'); return; }

  analyzeBtn.disabled = true;
  reanalyzeBtn.disabled = true;
  loadingOverlay.classList.add('active');
  resultsSection.classList.remove('active');

  try {
    const result = await analyzeCandidate(profileText, roleContext, forceRefresh);
    renderResults(result, resultsSection);
    resultsSection.classList.add('active');
    reanalyzeBtn.style.display = 'inline-flex';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (err) {
    showError(err instanceof Error ? err.message : 'Analysis failed. Try again.');
  } finally {
    analyzeBtn.disabled = false;
    reanalyzeBtn.disabled = false;
    loadingOverlay.classList.remove('active');
  }
}

analyzeBtn.addEventListener('click', () => runAnalysis(false));
reanalyzeBtn.addEventListener('click', () => runAnalysis(true));

// --- Why Us Toggle ---
whyUsBtn.addEventListener('click', () => whyUsCard.classList.toggle('active'));
document.addEventListener('click', (e) => {
  if (!whyUsBtn.contains(e.target as Node) && !whyUsCard.contains(e.target as Node)) {
    whyUsCard.classList.remove('active');
  }
});
