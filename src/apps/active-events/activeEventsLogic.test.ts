import assert from 'node:assert/strict';

import {
  ACTIVE_EVENT_REFRESH_COOLDOWN_MS,
  buildActiveEventWrites,
  buildTodayLifeRefreshSuggestions,
  type ActiveEventContext,
} from './activeEventsLogic';

const now = new Date('2026-05-10T12:00:00+08:00').getTime();
const character = {
  id: 'char-1',
  name: '林雾',
  avatar: '',
  description: '喜欢把日常细节记下来。',
  personality: '温柔、敏锐',
  firstMessage: '',
  systemPrompt: '',
};

const baseContext: ActiveEventContext = {
  characters: [character],
  chatSessions: {
    'wechat:char-1': {
      id: 'session-1',
      characterId: 'char-1',
      channel: 'wechat',
      lastUpdated: now - 10 * 60 * 1000,
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: '今天下班想去江边走一走，顺便买热可可。',
          kind: 'text',
          timestamp: now - 20 * 60 * 1000,
        },
      ],
    },
  },
  diaries: [
    {
      id: 'diary-1',
      owner: 'user',
      title: '午后的计划',
      content: '想去江边散步，晚上早点休息。',
      tags: ['生活'],
      createdAt: now - 60 * 60 * 1000,
      updatedAt: now - 60 * 60 * 1000,
    },
  ],
  calendarEvents: [
    {
      id: 'calendar-1',
      owner: 'shared',
      characterId: 'char-1',
      title: '傍晚散步',
      note: '江边见面。',
      startAt: now + 5 * 60 * 60 * 1000,
      tags: ['约定'],
      createdAt: now - 2 * 60 * 60 * 1000,
      updatedAt: now - 2 * 60 * 60 * 1000,
    },
  ],
  galleryPhotos: [
    {
      id: 'photo-1',
      url: 'photo://river',
      title: '江边照片',
      description: '今天拍到的云和水面。',
      album: '生活',
      tags: ['日常'],
      readableByChar: true,
      createdAt: now - 30 * 60 * 1000,
      updatedAt: now - 30 * 60 * 1000,
    },
  ],
  memos: [],
  wechatMoments: ['今天想喝热可可。'],
  musicTracks: [
    {
      id: 'track-1',
      title: 'River Light',
      artist: '小手机曲库',
      tags: ['散步'],
      liked: true,
      playCount: 2,
      createdAt: now - 10 * 24 * 60 * 60 * 1000,
      updatedAt: now - 10 * 24 * 60 * 60 * 1000,
    },
  ],
  musicListenRecords: [],
  xiaohongshuNotes: [],
  lifeEvents: [],
};

const refresh = buildTodayLifeRefreshSuggestions(baseContext, { now, lastRefreshAt: now - ACTIVE_EVENT_REFRESH_COOLDOWN_MS - 1 });
assert.equal(refresh.canRefresh, true);
assert.ok(refresh.suggestions.length > 0, 'manual refresh should produce suggestions from real same-day data');
assert.ok(refresh.suggestions.length <= 3, 'manual refresh should stay low-volume');
assert.ok(refresh.suggestions.every((suggestion) => suggestion.reason && suggestion.preview && suggestion.sourceIds.length > 0));
assert.ok(refresh.suggestions.some((suggestion) => suggestion.action === 'send_message'));
assert.ok(refresh.suggestions.some((suggestion) => suggestion.action === 'recommend_music'));

const cooledDown = buildTodayLifeRefreshSuggestions(baseContext, { now, lastRefreshAt: now - 30 * 60 * 1000 });
assert.equal(cooledDown.canRefresh, false);
assert.equal(cooledDown.suggestions.length, 0);
assert.ok(cooledDown.cooldownRemainingMs > 0);

const empty = buildTodayLifeRefreshSuggestions({ ...baseContext, chatSessions: {}, diaries: [], calendarEvents: [], galleryPhotos: [], wechatMoments: [], musicTracks: [] }, { now });
assert.equal(empty.canRefresh, true);
assert.equal(empty.suggestions.length, 0, 'refresh should not invent suggestions without source data');

const messageSuggestion = refresh.suggestions.find((suggestion) => suggestion.action === 'send_message');
assert.ok(messageSuggestion);
const messageWrites = buildActiveEventWrites(messageSuggestion, { now });
assert.equal(messageWrites.chatMessage?.role, 'model');
assert.equal(messageWrites.chatTarget?.channel, 'wechat');
assert.equal(messageWrites.lifeEvent.app, 'wechat');
assert.equal(messageWrites.lifeEvent.sourceId, messageSuggestion.id);
assert.ok(!messageWrites.diaryEntry, 'previewing a message suggestion should only prepare writes for confirmation');

const musicSuggestion = refresh.suggestions.find((suggestion) => suggestion.action === 'recommend_music');
assert.ok(musicSuggestion);
const musicWrites = buildActiveEventWrites(musicSuggestion, { now });
assert.equal(musicWrites.musicListenRecord?.trackId, 'track-1');
assert.equal(musicWrites.lifeEvent.app, 'music');

console.log('active event logic ok');
