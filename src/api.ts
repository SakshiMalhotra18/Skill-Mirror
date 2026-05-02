import { SYSTEM_PROMPT, buildUserPrompt } from './prompt';

export interface SkillScore {
  name: string;
  score: number;
}

export interface GapItem {
  gap: string;
  impact: string;
  fix: string;
}

export interface AnalysisResult {
  verdict: {
    label: string;
    confidence: number;
    reason: string;
  };
  skill_vector: SkillScore[];
  signal_analysis: {
    strong_signals: string[];
    weak_signals: string[];
    missing_signals: string[];
  };
  gap_analysis: GapItem[];
  market_position: {
    competitive_for: string[];
    not_ready_for: string[];
  };
  enterprise_ml_assessment: {
    pipeline_maturity: string;
    production_readiness: string;
    scale_signal: string;
    comments: string;
  };
  impact_rewrite: string[];
  risk_flags: string[];
}

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CACHE_PREFIX = 'skillmirror_cache_';

// Simple hash for cache keys
async function hashText(text: string): Promise<string> {
  const data = new TextEncoder().encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 16);
}

function getCached(key: string): AnalysisResult | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const cached = JSON.parse(raw);
    // Cache expires after 24 hours
    if (Date.now() - cached.timestamp > 24 * 60 * 60 * 1000) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return cached.data as AnalysisResult;
  } catch { return null; }
}

function setCache(key: string, data: AnalysisResult): void {
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, timestamp: Date.now() }));
  } catch { /* storage full — ignore */ }
}

export async function analyzeCandidate(
  profileText: string,
  roleContext = '',
  forceRefresh = false
): Promise<AnalysisResult> {
  const finalApiKey = import.meta.env.VITE_GROQ_API_KEY;
  if (!finalApiKey) {
    throw new Error('Groq API key is required. Set VITE_GROQ_API_KEY in .env file.');
  }
  if (!profileText || profileText.trim().length < 30) {
    throw new Error('Profile text too short. Paste a meaningful resume or profile description.');
  }

  // Check cache first (unless force refresh)
  const cacheKey = await hashText(profileText + '|||' + roleContext);
  if (!forceRefresh) {
    const cached = getCached(cacheKey);
    if (cached) return cached;
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${finalApiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(profileText, roleContext) },
      ],
      temperature: 0,
      max_tokens: 4096,
      seed: 42,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    if (response.status === 401) throw new Error('Invalid API key. Get a free key at console.groq.com');
    if (response.status === 429) throw new Error('Rate limited. Groq free tier allows ~30 req/min. Wait and retry.');
    if (response.status === 413) throw new Error('Profile too long. Trim it down and try again.');
    throw new Error(`API error (${response.status}): ${errBody.slice(0, 200)}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;

  if (!text) throw new Error('Empty response from Groq. Try again.');

  try {
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const result = JSON.parse(cleaned) as AnalysisResult;
    setCache(cacheKey, result);
    return result;
  } catch {
    throw new Error('Failed to parse AI response. The model returned malformed JSON.');
  }
}
