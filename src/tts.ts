/**
 * TTS provider helpers for browser, local HTTP, OpenAI, and Gemini speech.
 * Main functions: buildExternalTtsRequest, speakWithConfiguredTts, speakWithBrowserTts.
 * Maintenance note: keep provider-specific request shapes here instead of spreading them through App.tsx.
 */
export type TtsProvider = 'browser' | 'local' | 'openai' | 'gemini';

export interface TtsConfig {
  provider: TtsProvider;
  baseUrl: string;
  apiKey: string;
  model: string;
  voiceId: string;
}

export const defaultTtsConfig: TtsConfig = {
  provider: 'browser',
  baseUrl: '',
  apiKey: '',
  model: 'gpt-4o-mini-tts',
  voiceId: 'alloy',
};

export type TtsResponseType = 'auto' | 'audio' | 'gemini-json';

export interface BuiltTtsRequest {
  url: string;
  init: RequestInit & { headers: Record<string, string> };
  responseType: TtsResponseType;
}

function trimSlash(url: string) {
  return url.trim().replace(/\/+$/, '');
}

function normalizeOpenAiBaseUrl(url: string) {
  const base = trimSlash(url) || 'https://api.openai.com/v1';
  return base.endsWith('/v1') ? base : `${base}/v1`;
}

function normalizeGeminiBaseUrl(url: string) {
  return trimSlash(url) || 'https://generativelanguage.googleapis.com/v1beta';
}

export function buildExternalTtsRequest(config: TtsConfig, text: string): BuiltTtsRequest | null {
  const input = text.trim();
  if (!input || config.provider === 'browser') return null;
  if (config.provider === 'openai') {
    return {
      url: `${normalizeOpenAiBaseUrl(config.baseUrl)}/audio/speech`,
      responseType: 'audio',
      init: {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(config.apiKey.trim() ? { Authorization: `Bearer ${config.apiKey.trim()}` } : {}),
        },
        body: JSON.stringify({
          model: config.model.trim() || 'gpt-4o-mini-tts',
          voice: config.voiceId.trim() || 'alloy',
          input,
          format: 'mp3',
        }),
      },
    };
  }
  if (config.provider === 'gemini') {
    const model = config.model.trim() || 'gemini-2.5-flash-preview-tts';
    const key = encodeURIComponent(config.apiKey.trim());
    return {
      url: `${normalizeGeminiBaseUrl(config.baseUrl)}/models/${encodeURIComponent(model)}:generateContent${key ? `?key=${key}` : ''}`,
      responseType: 'gemini-json',
      init: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: input }] }],
          generationConfig: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: config.voiceId.trim() || 'Kore',
                },
              },
            },
          },
        }),
      },
    };
  }
  return {
    url: config.baseUrl.trim(),
    responseType: 'auto',
    init: {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: input,
        input,
        voice: config.voiceId.trim() || 'default',
        voiceId: config.voiceId.trim() || 'default',
      }),
    },
  };
}

export function speakWithBrowserTts(text: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    throw new Error('当前浏览器不支持内置 TTS。');
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  window.speechSynthesis.speak(utterance);
}

function base64ToBlob(base64: string, mimeType: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType || 'audio/wav' });
}

function playAudioBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const audio = new Audio(url);
  audio.onended = () => URL.revokeObjectURL(url);
  audio.onerror = () => URL.revokeObjectURL(url);
  return audio.play();
}

function playAudioUrl(url: string) {
  const audio = new Audio(url);
  return audio.play();
}

async function playJsonAudio(data: unknown) {
  const value = data as {
    audioUrl?: string;
    audio_url?: string;
    url?: string;
    audio?: string;
    data?: string;
    mimeType?: string;
    mime_type?: string;
    candidates?: Array<{
      content?: {
        parts?: Array<{
          inlineData?: { data?: string; mimeType?: string };
          inline_data?: { data?: string; mime_type?: string };
        }>;
      };
    }>;
  };
  const url = value.audioUrl || value.audio_url || value.url;
  if (url) return playAudioUrl(url);
  const inline = value.candidates?.[0]?.content?.parts?.find((part) => part.inlineData || part.inline_data);
  const inlineData = (inline?.inlineData || inline?.inline_data) as { data?: string; mimeType?: string; mime_type?: string } | undefined;
  const base64 = inlineData?.data || value.audio || value.data;
  if (!base64) throw new Error('TTS 没有返回可播放音频。');
  const mimeType = inlineData?.mimeType || inlineData?.mime_type || value.mimeType || value.mime_type || 'audio/wav';
  return playAudioBlob(base64ToBlob(base64, mimeType));
}

export async function speakWithConfiguredTts(text: string, config: TtsConfig) {
  if (config.provider === 'browser') {
    speakWithBrowserTts(text);
    return;
  }
  const request = buildExternalTtsRequest(config, text);
  if (!request) return;
  if (!request.url) throw new Error('先填写 TTS 接口地址。');
  const response = await fetch(request.url, request.init);
  if (!response.ok) throw new Error(`TTS 失败：${response.status}`);
  const contentType = response.headers.get('content-type') || '';
  if (request.responseType === 'audio' || contentType.startsWith('audio/')) {
    await playAudioBlob(await response.blob());
    return;
  }
  await playJsonAudio(await response.json());
}
