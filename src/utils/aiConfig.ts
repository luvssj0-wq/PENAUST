/**
 * Configuration and helpers for AI providers (Certainty Companion / Lucia AI, Gemini, Offline)
 */

export type AiProvider = 'lucia' | 'gemini' | 'offline';

export interface AiConfig {
  provider: AiProvider;
  apiKey: string;
  endpoint: string;
}

const STORAGE_KEY = 'peanuts_ai_config_v1';

export const DEFAULT_AI_CONFIG: AiConfig = {
  provider: 'lucia',
  apiKey: '',
  endpoint: 'https://certainty-companion.lovable.app'
};

export function getAiConfig(): AiConfig {
  if (typeof window === 'undefined') return DEFAULT_AI_CONFIG;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_AI_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      provider: parsed.provider || 'lucia',
      apiKey: (parsed.apiKey || '').trim(),
      endpoint: (parsed.endpoint || 'https://certainty-companion.lovable.app').trim()
    };
  } catch {
    return DEFAULT_AI_CONFIG;
  }
}

export function saveAiConfig(config: Partial<AiConfig>): AiConfig {
  const current = getAiConfig();
  const updated: AiConfig = {
    provider: config.provider || current.provider,
    apiKey: config.apiKey !== undefined ? config.apiKey.trim() : current.apiKey,
    endpoint: config.endpoint !== undefined ? config.endpoint.trim() : current.endpoint
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save AI config to localStorage', e);
  }
  return updated;
}

export function getAiHeaders(): Record<string, string> {
  const config = getAiConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-ai-provider': config.provider,
    'x-ai-endpoint': config.endpoint || 'https://certainty-companion.lovable.app'
  };

  if (config.apiKey) {
    headers['x-user-api-key'] = config.apiKey;
    headers['x-api-key'] = config.apiKey;
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  return headers;
}
