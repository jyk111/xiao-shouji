/**
 * Derived notifications for the phone shell.
 * Main exports: ShellNotification, buildShellNotifications, getShellNotificationBadges.
 * Dependencies: existing store data only; this module does not write state or schedule background work.
 * Maintenance note: keep app business logic inside each app. Shell notifications only summarize unread/reminder data.
 */
import type { CalendarEvent, Character, ChatSession, MemoEntry, PhoneCallRecord, Screen } from '../store';

export type ShellNotificationKind = 'chat' | 'call' | 'calendar' | 'memo';

export interface ShellNotification {
  id: string;
  kind: ShellNotificationKind;
  screen: Screen;
  title: string;
  body: string;
  timestamp: number;
  count?: number;
  sourceId: string;
}

export interface ShellNotificationInput {
  characters: Character[];
  chatSessions: Record<string, ChatSession>;
  phoneCallRecords: PhoneCallRecord[];
  calendarEvents: CalendarEvent[];
  memos: MemoEntry[];
  now?: number;
}

const REMINDER_LOOKAHEAD_MS = 7 * 24 * 60 * 60 * 1000;
const REMINDER_STALE_MS = 24 * 60 * 60 * 1000;

function characterName(characters: Character[], characterId?: string) {
  return characters.find((character) => character.id === characterId)?.name || '某位联系人';
}

function isReminderInWindow(reminderAt: number | undefined, now: number) {
  if (typeof reminderAt !== 'number') return false;
  return reminderAt >= now - REMINDER_STALE_MS && reminderAt <= now + REMINDER_LOOKAHEAD_MS;
}

function formatRelativeReminder(time: number, now: number) {
  const diff = time - now;
  if (Math.abs(diff) < 60 * 1000) return '现在';
  const absMinutes = Math.round(Math.abs(diff) / (60 * 1000));
  const suffix = diff >= 0 ? '后' : '前';
  if (absMinutes < 60) return `${absMinutes} 分钟${suffix}`;
  const absHours = Math.round(absMinutes / 60);
  if (absHours < 24) return `${absHours} 小时${suffix}`;
  return `${Math.round(absHours / 24)} 天${suffix}`;
}

export function buildShellNotifications({
  characters,
  chatSessions,
  phoneCallRecords,
  calendarEvents,
  memos,
  now = Date.now(),
}: ShellNotificationInput): ShellNotification[] {
  const chatNotifications = Object.values(chatSessions)
    .filter((session) => (session.unread || 0) > 0)
    .map((session) => {
      const appName = session.channel === 'qq' ? 'QQ' : '微信';
      return {
        id: `chat:${session.channel}:${session.characterId}`,
        kind: 'chat' as const,
        screen: session.channel,
        title: `${appName} · ${characterName(characters, session.characterId)}`,
        body: `${session.unread || 0} 条未读消息`,
        timestamp: session.lastUpdated,
        count: session.unread,
        sourceId: session.id,
      } satisfies ShellNotification;
    });

  const callNotifications = phoneCallRecords
    .filter((record) => record.status === 'missed' || record.status === 'no-answer')
    .slice(0, 5)
    .map((record) => ({
      id: `call:${record.id}`,
      kind: 'call' as const,
      screen: 'phone' as const,
      title: '未接来电',
      body: `${characterName(characters, record.characterId)}有一通${record.status === 'no-answer' ? '未接通' : '未接'}来电`,
      timestamp: record.endedAt || record.startedAt,
      sourceId: record.id,
    } satisfies ShellNotification));

  const calendarNotifications = calendarEvents
    .filter((event) => isReminderInWindow(event.reminderAt, now))
    .map((event) => ({
      id: `calendar:${event.id}`,
      kind: 'calendar' as const,
      screen: 'calendar' as const,
      title: '日历提醒',
      body: `${formatRelativeReminder(event.reminderAt || event.startAt, now)} · ${event.title}`,
      timestamp: event.reminderAt || event.startAt,
      sourceId: event.id,
    } satisfies ShellNotification));

  const memoNotifications = memos
    .filter((memo) => !memo.completed && !memo.locked && isReminderInWindow(memo.reminderAt, now))
    .map((memo) => ({
      id: `memo:${memo.id}`,
      kind: 'memo' as const,
      screen: 'memo' as const,
      title: '备忘提醒',
      body: `${formatRelativeReminder(memo.reminderAt || memo.updatedAt, now)} · ${memo.title}`,
      timestamp: memo.reminderAt || memo.updatedAt,
      sourceId: memo.id,
    } satisfies ShellNotification));

  return [...chatNotifications, ...callNotifications, ...calendarNotifications, ...memoNotifications]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 12);
}

export function getShellNotificationBadges(notifications: ShellNotification[]) {
  return notifications.reduce<Partial<Record<Screen, number>>>((badges, notification) => {
    badges[notification.screen] = (badges[notification.screen] || 0) + (notification.count || 1);
    return badges;
  }, {});
}
