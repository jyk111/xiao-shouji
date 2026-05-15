export type ImageGenerationConfig = {
  provider: 'novelai';
  baseUrl: string;
  apiKey: string;
  model: string;
  width: number;
  height: number;
  steps: number;
  scale: number;
  sampler: string;
  promptPreset: string;
  negativePrompt: string;
};

export const defaultImageGenerationConfig: ImageGenerationConfig = {
  provider: 'novelai',
  baseUrl: 'https://image.novelai.net/ai/generate-image',
  apiKey: '',
  model: 'nai-diffusion-3',
  width: 512,
  height: 512,
  steps: 18,
  scale: 5,
  sampler: 'k_euler_ancestral',
  promptPreset: 'high quality, clean composition, mobile friendly image, no watermark',
  negativePrompt: 'lowres, blurry, text, watermark, logo, worst quality',
};

function u16(bytes: Uint8Array, offset: number) {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function u32(bytes: Uint8Array, offset: number) {
  return (bytes[offset] | (bytes[offset + 1] << 8) | (bytes[offset + 2] << 16) | (bytes[offset + 3] << 24)) >>> 0;
}

async function inflateRaw(bytes: Uint8Array) {
  if (typeof DecompressionStream === 'undefined') {
    throw new Error('当前浏览器不支持解压 NAI 返回的图片包，请使用 Chrome/Edge 或配置图片代理返回 PNG。');
  }
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function extractImageBytes(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  if (isPng) return bytes;

  let eocd = -1;
  for (let index = bytes.length - 22; index >= 0; index -= 1) {
    if (u32(bytes, index) === 0x06054b50) {
      eocd = index;
      break;
    }
  }
  if (eocd < 0) throw new Error('NAI 返回了数据，但没有找到图片包。');

  const entries = u16(bytes, eocd + 10);
  let cursor = u32(bytes, eocd + 16);
  for (let index = 0; index < entries; index += 1) {
    if (u32(bytes, cursor) !== 0x02014b50) break;
    const method = u16(bytes, cursor + 10);
    const compressedSize = u32(bytes, cursor + 20);
    const nameLength = u16(bytes, cursor + 28);
    const extraLength = u16(bytes, cursor + 30);
    const commentLength = u16(bytes, cursor + 32);
    const localOffset = u32(bytes, cursor + 42);
    const fileName = new TextDecoder().decode(bytes.slice(cursor + 46, cursor + 46 + nameLength)).toLowerCase();
    if (fileName.endsWith('.png') || index === 0) {
      const localNameLength = u16(bytes, localOffset + 26);
      const localExtraLength = u16(bytes, localOffset + 28);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      const compressed = bytes.slice(start, start + compressedSize);
      if (method === 0) return compressed;
      if (method === 8) return inflateRaw(compressed);
      throw new Error(`NAI 图片包使用了暂不支持的压缩方式：${method}`);
    }
    cursor += 46 + nameLength + extraLength + commentLength;
  }

  throw new Error('NAI 图片包里没有 PNG 文件。');
}

async function bytesToDataUrl(bytes: Uint8Array, mimeType = 'image/png') {
  const blob = new Blob([bytes], { type: mimeType });
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('图片读取失败。'));
    reader.readAsDataURL(blob);
  });
}

export function buildNovelAiPrompt(prompt: string, context: 'wechat' | 'xiaohongshu' | 'gallery' = 'gallery') {
  const base = prompt.trim();
  const style =
    context === 'xiaohongshu'
      ? 'mobile photo, natural lifestyle composition, clean cover image'
      : context === 'wechat'
        ? 'casual mobile chat image, expressive but clean, no text overlay'
        : 'clean mobile friendly image';
  return [base || 'soft ink wash still life', style, 'high quality, detailed, tasteful, no watermark'].join(', ');
}

export async function requestNaiImage({
  config,
  prompt,
  signal,
  timeoutMs = 45000,
}: {
  config: ImageGenerationConfig;
  prompt: string;
  signal?: AbortSignal;
  timeoutMs?: number;
}) {
  const apiKey = config.apiKey.trim();
  const baseUrl = config.baseUrl.trim();
  if (!apiKey) throw new Error('请先在设置里填写 NAI API key。');
  if (!baseUrl) throw new Error('请先填写 NAI 生图接口地址。');

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
  const abortFromCaller = () => controller.abort();
  signal?.addEventListener('abort', abortFromCaller, { once: true });
  let response: Response;
  try {
    response = await fetch(baseUrl, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/zip, image/png, application/octet-stream, */*',
      },
      body: JSON.stringify({
        action: 'generate',
      input: [config.promptPreset, prompt].map((item) => item.trim()).filter(Boolean).join(', '),
        model: config.model || defaultImageGenerationConfig.model,
        parameters: {
          width: Math.max(256, Math.min(1024, Math.round(config.width || 512))),
          height: Math.max(256, Math.min(1024, Math.round(config.height || 512))),
          scale: config.scale || defaultImageGenerationConfig.scale,
          sampler: config.sampler || defaultImageGenerationConfig.sampler,
          steps: Math.max(4, Math.min(50, Math.round(config.steps || 18))),
          n_samples: 1,
          seed: Math.floor(Math.random() * 4294967295),
          ucPreset: 0,
          qualityToggle: true,
          sm: false,
          sm_dyn: false,
          dynamic_thresholding: false,
          controlnet_strength: 1,
          legacy: false,
          add_original_image: false,
          cfg_rescale: 0,
          noise_schedule: 'native',
          negative_prompt: config.negativePrompt || defaultImageGenerationConfig.negativePrompt,
        },
      }),
    });
  } catch (error) {
    if (controller.signal.aborted) throw new Error('NAI 请求超时或被取消，请检查网络/代理。');
    throw error;
  } finally {
    window.clearTimeout(timeout);
    signal?.removeEventListener('abort', abortFromCaller);
  }

  const buffer = await response.arrayBuffer();
  if (!response.ok) {
    const detail = new TextDecoder().decode(buffer.slice(0, 500)).trim();
    throw new Error(detail || `NAI 请求失败：${response.status}`);
  }

  const imageBytes = await extractImageBytes(buffer);
  return bytesToDataUrl(imageBytes);
}
