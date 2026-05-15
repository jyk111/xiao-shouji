import assert from 'node:assert/strict';
import {
  buildMiniMaxMusicGenerationRequest,
  extractMiniMaxMusicAudio,
  formatMiniMaxLyrics,
} from './musicGeneration';

const formattedLyrics = formatMiniMaxLyrics('第一句\n第二句\n副歌来了');
assert.match(formattedLyrics, /\[Verse\]/);
assert.match(formattedLyrics, /\[Chorus\]/);

const request = buildMiniMaxMusicGenerationRequest({
  apiKey: 'mini-key',
  baseUrl: '',
  model: 'music-2.6-free',
  prompt: 'Dream pop, late night, intimate duet',
  lyrics: formattedLyrics,
});

assert.equal(request.url, 'https://api.minimax.io/v1/music_generation');
assert.equal(request.responseType, 'minimax-music-json');
assert.equal(request.init.method, 'POST');
assert.equal((request.init.headers as Record<string, string>).Authorization, 'Bearer mini-key');

const body = JSON.parse(request.init.body as string);
assert.equal(body.model, 'music-2.6-free');
assert.equal(body.prompt, 'Dream pop, late night, intimate duet');
assert.equal(body.lyrics, formattedLyrics);
assert.equal(body.output_format, 'hex');
assert.equal(body.audio_setting.format, 'mp3');
assert.equal(body.audio_setting.sample_rate, 44100);
assert.equal(body.audio_setting.bitrate, 256000);

const audio = extractMiniMaxMusicAudio({
  data: { audio: 'fff3abcd', status: 2 },
  extra_info: { music_duration: 25364 },
  base_resp: { status_code: 0, status_msg: 'success' },
});

assert.equal(audio.audio, 'fff3abcd');
assert.equal(audio.kind, 'hex');
assert.equal(audio.durationMs, 25364);

assert.throws(
  () => extractMiniMaxMusicAudio({ data: {}, base_resp: { status_code: 1001, status_msg: 'no balance' } }),
  /no balance/,
);

console.log('music generation helpers ok');
