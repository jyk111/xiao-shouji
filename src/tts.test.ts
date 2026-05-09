import { strict as assert } from 'node:assert';
import { buildExternalTtsRequest, defaultTtsConfig } from './tts';

const openai = buildExternalTtsRequest(
  {
    ...defaultTtsConfig,
    provider: 'openai',
    apiKey: 'sk-test',
    model: 'gpt-4o-mini-tts',
    voiceId: 'alloy',
  },
  '电话里说一句。',
);
assert.equal(openai?.url, 'https://api.openai.com/v1/audio/speech');
assert.equal(openai?.responseType, 'audio');
assert.equal(openai?.init.headers.Authorization, 'Bearer sk-test');
assert.equal(JSON.parse(String(openai?.init.body)).input, '电话里说一句。');

const gemini = buildExternalTtsRequest(
  {
    ...defaultTtsConfig,
    provider: 'gemini',
    apiKey: 'gemini-key',
    model: 'gemini-2.5-flash-preview-tts',
    voiceId: 'Kore',
  },
  '请生成电话音色。',
);
const geminiBody = JSON.parse(String(gemini?.init.body));
assert.equal(gemini?.url, 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=gemini-key');
assert.equal(gemini?.responseType, 'gemini-json');
assert.deepEqual(geminiBody.generationConfig.responseModalities, ['AUDIO']);
assert.equal(geminiBody.generationConfig.speechConfig.voiceConfig.prebuiltVoiceConfig.voiceName, 'Kore');

const local = buildExternalTtsRequest(
  {
    ...defaultTtsConfig,
    provider: 'local',
    baseUrl: 'http://127.0.0.1:9880/tts',
    voiceId: 'char-a',
  },
  '本地服务读这句。',
);
assert.equal(local?.url, 'http://127.0.0.1:9880/tts');
assert.equal(local?.responseType, 'auto');
assert.equal(JSON.parse(String(local?.init.body)).voiceId, 'char-a');

assert.equal(buildExternalTtsRequest({ ...defaultTtsConfig, provider: 'browser' }, '免费浏览器语音'), null);

console.log('tts request builders ok');
