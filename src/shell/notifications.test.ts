import assert from 'node:assert/strict';

import type { CalendarEvent, Character, ChatSession, MemoEntry, PhoneCallRecord } from '../store';
import { buildShellNotifications, getShellNotificationBadges } from './notifications';

const now = new Date('2026-05-10T09:00:00+08:00').getTime();

const characters: Character[] = [
  {
    id: 'char-a',
    name: '林夏',
    avatar: '',
    description: '',
    personality: '',
    firstMessage: '',
    systemPrompt: '',
  },
];

const chatSessions: Record<string, ChatSession> = {
  'wechat:char-a': {
    id: 'session-wechat',
    characterId: 'char-a',
    channel: 'wechat',
    unread: 2,
    lastUpdated: now - 10 * 60 * 1000,
    messages: [],
  },
  'qq:char-a': {
    id: 'session-qq',
    characterId: 'char-a',
    channel: 'qq',
    unread: 0,
    lastUpdated: now - 20 * 60 * 1000,
    messages: [],
  },
};

const phoneCallRecords: PhoneCallRecord[] = [
  {
    id: 'call-missed',
    characterId: 'char-a',
    direction: 'incoming',
    status: 'missed',
    startedAt: now - 30 * 60 * 1000,
    endedAt: now - 28 * 60 * 1000,
    durationSeconds: 0,
    summary: '',
    transcript: [],
  },
  {
    id: 'call-answered',
    characterId: 'char-a',
    direction: 'incoming',
    status: 'answered',
    startedAt: now - 60 * 60 * 1000,
    endedAt: now - 55 * 60 * 1000,
    durationSeconds: 300,
    summary: '',
    transcript: [],
  },
];

const calendarEvents: CalendarEvent[] = [
  {
    id: 'calendar-date',
    owner: 'shared',
    characterId: 'char-a',
    title: '下午一起去书店',
    startAt: now + 3 * 60 * 60 * 1000,
    reminderAt: now + 2 * 60 * 60 * 1000,
    tags: ['约定'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'calendar-far',
    owner: 'user',
    title: '下个月再看',
    startAt: now + 20 * 24 * 60 * 60 * 1000,
    reminderAt: now + 20 * 24 * 60 * 60 * 1000,
    tags: [],
    createdAt: now,
    updatedAt: now,
  },
];

const memos: MemoEntry[] = [
  {
    id: 'memo-reminder',
    title: '买草莓蛋糕',
    content: '路过甜品店时带一块',
    type: 'todo',
    tags: ['待办'],
    reminderAt: now + 60 * 60 * 1000,
    completed: false,
    locked: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'memo-done',
    title: '已完成事项',
    content: '不用提醒',
    type: 'todo',
    tags: [],
    reminderAt: now + 60 * 60 * 1000,
    completed: true,
    locked: false,
    createdAt: now,
    updatedAt: now,
  },
];

const notifications = buildShellNotifications({
  characters,
  chatSessions,
  phoneCallRecords,
  calendarEvents,
  memos,
  now,
});

assert.deepEqual(
  notifications.map((notification) => notification.id),
  ['calendar:calendar-date', 'memo:memo-reminder', 'chat:wechat:char-a', 'call:call-missed'],
);

assert.deepEqual(
  notifications.map((notification) => notification.screen),
  ['calendar', 'memo', 'wechat', 'phone'],
);

assert.equal(notifications.find((notification) => notification.id === 'chat:wechat:char-a')?.title, '微信 · 林夏');
assert.equal(notifications.find((notification) => notification.id === 'call:call-missed')?.body, '林夏有一通未接来电');
assert.equal(notifications.find((notification) => notification.id === 'calendar:calendar-date')?.body.includes('下午一起去书店'), true);

const badges = getShellNotificationBadges(notifications);

assert.equal(badges.wechat, 2);
assert.equal(badges.phone, 1);
assert.equal(badges.calendar, 1);
assert.equal(badges.memo, 1);
assert.equal(badges.qq, undefined);

console.log('shell notifications ok');
