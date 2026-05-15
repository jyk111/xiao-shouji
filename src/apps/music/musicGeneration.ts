export type MiniMaxMusicResponseType = 'minimax-music-json';

export type MiniMaxMusicGenerationRequest = {
  url: string;
  init: RequestInit;
  responseType: MiniMaxMusicResponseType;
};

export type MiniMaxMusicGenerationInput = {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  prompt: string;
  lyrics: string;
};

export type MiniMaxMusicAudio = {
  audio: string;
  kind: 'hex' | 'url';
  durationMs?: number;
};

const defaultMiniMaxMusicUrl = 'https://api.minimax.io/v1/music_generation';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function cleanString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function cleanNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

export function normalizeMiniMaxMusicUrl(url = '') {
  const base = url.trim().replace(/\/+$/, '');
  if (!base) return defaultMiniMaxMusicUrl;
  if (base.endsWith('/music_generation')) return base;
  if (base.endsWith('/v1')) return `${base}/music_generation`;
  return `${base}/v1/music_generation`;
}

export function formatMiniMaxLyrics(lyrics: string) {
  const text = lyrics.trim();
  if (!text) return '';
  if (/^\s*\[[^\]]+\]/m.test(text)) return text;

  const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length <= 4) {
    const splitAt = Math.max(2, Math.ceil(lines.length / 2));
    return [
      '[Verse]',
      ...lines.slice(0, splitAt),
      '',
      '[Chorus]',
      ...lines.slice(splitAt),
    ].join('\n').trim();
  }

  const verseSize = Math.max(2, Math.floor(lines.length / 3));
  return [
    '[Verse]',
    ...lines.slice(0, verseSize),
    '',
    '[Chorus]',
    ...lines.slice(verseSize, verseSize * 2),
    '',
    '[Verse]',
    ...lines.slice(verseSize * 2),
  ].join('\n').trim();
}

export function buildMiniMaxMusicGenerationRequest(input: MiniMaxMusicGenerationInput): MiniMaxMusicGenerationRequest {
  const model = input.model?.trim() || 'music-2.6';
  const prompt = input.prompt.trim() || 'Pop song, emotional, polished arrangement';
  const lyrics = formatMiniMaxLyrics(input.lyrics);

  return {
    url: normalizeMiniMaxMusicUrl(input.baseUrl),
    responseType: 'minimax-music-json',
    init: {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(input.apiKey.trim() ? { Authorization: `Bearer ${input.apiKey.trim()}` } : {}),
      },
      body: JSON.stringify({
        model,
        prompt,
        lyrics,
        output_format: 'hex',
        audio_setting: {
          sample_rate: 44100,
          bitrate: 256000,
          format: 'mp3',
        },
      }),
    },
  };
}

export function extractMiniMaxMusicAudio(value: unknown): MiniMaxMusicAudio {
  const root = asRecord(value);
  const baseResp = asRecord(root.base_resp);
  const statusCode = cleanNumber(baseResp.status_code);
  if (statusCode !== undefined && statusCode !== 0) {
    throw new Error(cleanString(baseResp.status_msg) || `MiniMax 音乐生成失败：${statusCode}`);
  }

  const data = asRecord(root.data);
  const audio = cleanString(data.audio) || cleanString(data.audio_url) || cleanString(data.url);
  if (!audio) {
    throw new Error(cleanString(baseResp.status_msg) || 'MiniMax 音乐没有返回可播放音频。');
  }

  const extraInfo = asRecord(root.extra_info);
  const durationMs =
    cleanNumber(extraInfo.music_duration) ??
    cleanNumber(extraInfo.duration) ??
    cleanNumber(data.duration);

  return {
    audio,
    kind: /^https?:\/\//i.test(audio) || audio.startsWith('blob:') || audio.startsWith('data:') ? 'url' : 'hex',
    durationMs,
  };
}

export function hexToAudioBlobUrl(hex: string, mimeType = 'audio/mpeg') {
  const cleaned = hex.trim().replace(/^0x/i, '').replace(/\s+/g, '');
  if (!cleaned || cleaned.length % 2 !== 0 || /[^0-9a-f]/i.test(cleaned)) {
    throw new Error('MiniMax 音频数据不是有效的十六进制内容。');
  }
  const bytes = new Uint8Array(cleaned.length / 2);
  for (let index = 0; index < cleaned.length; index += 2) {
    bytes[index / 2] = Number.parseInt(cleaned.slice(index, index + 2), 16);
  }
  return URL.createObjectURL(new Blob([bytes], { type: mimeType }));
}
