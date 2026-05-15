import assert from 'node:assert/strict';
import {
  buildLifeEvent,
  getLifeEventTimeline,
  isHighValueChatLifeEventInput,
  normalizeLifeEvents,
  type LifeEvent,
} from './lifeEvents';
import { useAppStore } from './store';

const rawEvents = [
  {
    id: 'evt-old',
    type: 'call',
    app: 'phone',
    characterId: 'char-1',
    title: '通话结束',
    summary: '聊完了晚上的安排。',
    mood: '放松',
    importance: 4,
    sourceId: 'call-1',
    createdAt: 200,
  },
  {
    type: 'unknown',
    app: 'wechat',
    title: '坏数据',
    summary: '',
    importance: 9,
    createdAt: 'later',
  },
  {
    id: 'evt-photo',
    type: 'photo',
    app: 'gallery',
    title: '可读照片',
    summary: '新增了一张允许角色读取的照片。',
    importance: 3,
    sourceId: 'photo-1',
    createdAt: 100,
  },
];

const normalized = normalizeLifeEvents(rawEvents, 500);
assert.equal(normalized.length, 2, 'normalization should drop invalid blank events');
assert.deepEqual(
  normalized.map((event) => event.id),
  ['evt-old', 'evt-photo'],
  'normalization should keep valid events sorted newest first',
);
assert.equal(normalized[0].importance, 4);
assert.equal(normalized[1].app, 'gallery');

const built = buildLifeEvent({
  type: 'diary',
  app: 'diary',
  characterId: 'char-1',
  title: '写了一篇日记',
  summary: '记录了今天的约定和心情。',
  mood: '期待',
  importance: 5,
  sourceId: 'diary-1',
  createdAt: 300,
});
assert.match(built.id, /^life-/);
assert.equal(built.importance, 5);
assert.equal(built.summary, '记录了今天的约定和心情。');

const timeline = getLifeEventTimeline([...normalized, built], {
  characterId: 'char-1',
  apps: ['phone', 'diary'],
  minImportance: 4,
});
assert.deepEqual(
  timeline.map((event) => event.id),
  [built.id, 'evt-old'],
  'timeline should filter by character, app and minimum importance',
);

assert.equal(isHighValueChatLifeEventInput({ favorite: false, importance: 2, summary: '普通一句话' }), false);
assert.equal(isHighValueChatLifeEventInput({ favorite: true, summary: '被收藏的聊天节点' }), true);
assert.equal(isHighValueChatLifeEventInput({ importance: 4, summary: '明确标记为重要' }), true);

const store = useAppStore.getState();
useAppStore.setState({ lifeEvents: [] as LifeEvent[] });
const firstId = store.addLifeEvent({
  type: 'calendar',
  app: 'calendar',
  title: '新增日程',
  summary: '明天下午的约定。',
  importance: 3,
  sourceId: 'calendar-1',
  createdAt: 400,
});
const secondId = useAppStore.getState().addLifeEvent({
  type: 'calendar',
  app: 'calendar',
  title: '新增日程更新',
  summary: '明天下午的约定改到四点。',
  importance: 4,
  sourceId: 'calendar-1',
  createdAt: 450,
});

const storedEvents = useAppStore.getState().lifeEvents;
assert.equal(firstId, secondId, 'events with the same app/sourceId should update instead of duplicating');
assert.equal(storedEvents.length, 1);
assert.equal(storedEvents[0].title, '新增日程更新');
assert.equal(storedEvents[0].importance, 4);

useAppStore.getState().deleteLifeEvent(firstId);
assert.equal(useAppStore.getState().lifeEvents.length, 0);
