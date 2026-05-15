/**
 * Manual active event suggestion logic.
 * Exports: active event suggestion types, buildTodayLifeRefreshSuggestions, buildActiveEventWrites.
 * Dependencies: store data types and createId.
 * Maintenance note: this module is UI-free; callers must preview suggestions and explicitly confirm writes.
 */
import { createId } from '../../lib/utils';
import type {
  CalendarEvent,
  Character,
  ChatMessage,
  ChatSession,
  DiaryEntry,
  GalleryPhoto,
  LifeEvent,
  MemoEntry,
  MusicListenRecord,
  MusicTrack,
} from '../../store';
import type { XiaohongshuNote } from '../xiaohongshu/types';
import type { LifeEventDraft } from '../../lifeEvents';

export const ACTIVE_EVENT_REFRESH_COOLDOWN_MS = 6 * 60 * 60 * 1000;
export const ACTIVE_EVENT_MAX_SUGGESTIONS = 3;

export type ActiveEventAction = 'send_message' | 'write_diary' | 'recommend_music' | 'post_social' | 'create_notification';
export type ActiveEventWriteApp = 'wechat' | 'diary' | 'music' | 'xiaohongshu' | 'system';

export interface ActiveEventContext {
  characters: Character[];
  chatSessions: Record<string, ChatSession>;
  diaries: DiaryEntry[];
  calendarEvents: CalendarEvent[];
  galleryPhotos: GalleryPhoto[];
  memos: MemoEntry[];
  wechatMoments: string[];
  musicTracks: MusicTrack[];
  musicListenRecords: MusicListenRecord[];
  xiaohongshuNotes: XiaohongshuNote[];
  lifeEvents: LifeEvent[];
}

export interface ActiveEventSuggestion {
  id: string;
  action: ActiveEventAction;
  app: ActiveEventWriteApp;
  characterId?: string;
  title: string;
  preview: string;
  reason: string;
  sourceIds: string[];
  createdAt: number;
  cooldownMs: number;
  priority: number;
  payload: {
    channel?: 'wechat' | 'qq';
    content?: string;
    diaryTitle?: string;
    diaryContent?: string;
    mood?: string;
    trackId?: string;
    trackTitle?: string;
    socialContent?: string;
    notificationTitle?: string;
  };
}

export interface ActiveEventRefreshResult {
  canRefresh: boolean;
  cooldownRemainingMs: number;
  generatedAt: number;
  suggestions: ActiveEventSuggestion[];
}

export interface ActiveEventWrites {
  chatTarget?: { characterId: string; channel: 'wechat' | 'qq' };
  chatMessage?: ChatMessage;
  diaryEntry?: Omit<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<DiaryEntry, 'id' | 'createdAt' | 'updatedAt'>>;
  wechatMoment?: string;
  musicListenRecord?: Omit<MusicListenRecord, 'id' | 'createdAt'> & Partial<Pick<MusicListenRecord, 'id' | 'createdAt'>>;
  appLog?: { type: 'info'; title: string; detail: string };
  lifeEvent: LifeEventDraft;
}

interface BuildActiveEventOptions {
  now?: number;
  lastRefreshAt?: number;
  cooldownMs?: number;
  maxSuggestions?: number;
}

interface BuildActiveEventWritesOptions {
  now?: number;
}

function todayStart(now: number) {
  const date = new Date(now);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function shortText(value: unknown, maxLength = 42) {
  const text = cleanText(value);
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

function unique<T>(items: T[]) {
  return Array.from(new Set(items));
}

function isTodayTime(time: number | undefined, startAt: number, now: number) {
  return typeof time === 'number' && time >= startAt && time <= now;
}

function getCharacterName(characters: Character[], characterId?: string) {
  return characters.find((character) => character.id === characterId)?.name || 'char';
}

function getTodayChatSignals(context: ActiveEventContext, startAt: number, now: number) {
  return Object.values(context.chatSessions)
    .flatMap((session) =>
      session.messages
        .filter((message) => isTodayTime(message.timestamp, startAt, now))
        .map((message) => ({ session, message })),
    )
    .filter(({ message }) => !message.recalled && cleanText(message.content || message.transcript || message.stickerLabel))
    .sort((a, b) => b.message.timestamp - a.message.timestamp);
}

function buildSourceKey(action: ActiveEventAction, ids: string[]) {
  return `active-${action}-${ids.join('-')}`;
}

function hasAcceptedSource(context: ActiveEventContext, sourceId: string) {
  return context.lifeEvents.some((event) => event.sourceId === sourceId);
}

function pickTrack(context: ActiveEventContext) {
  return [...context.musicTracks].sort((a, b) => {
    const aScore = (a.liked ? 10 : 0) + (a.lastPlayedAt || 0) / 1000000000000 + a.playCount;
    const bScore = (b.liked ? 10 : 0) + (b.lastPlayedAt || 0) / 1000000000000 + b.playCount;
    return bScore - aScore;
  })[0];
}

function collectFacts(context: ActiveEventContext, startAt: number, now: number, chatSignals: ReturnType<typeof getTodayChatSignals>) {
  const facts: Array<{ id: string; text: string }> = [];
  const latestUserChat = chatSignals.find(({ message }) => message.role === 'user');
  if (latestUserChat) facts.push({ id: latestUserChat.message.id, text: `聊天里提到“${shortText(latestUserChat.message.content || latestUserChat.message.transcript)}”` });

  const diary = context.diaries.find((entry) => isTodayTime(entry.createdAt, startAt, now));
  if (diary) facts.push({ id: diary.id, text: `日记《${shortText(diary.title, 18)}》` });

  const photo = context.galleryPhotos.find((item) => isTodayTime(item.createdAt, startAt, now) && item.readableByChar !== false && !item.hidden);
  if (photo) facts.push({ id: photo.id, text: `相册《${shortText(photo.title, 18)}》` });

  const event = context.calendarEvents.find((item) => item.startAt >= now && item.startAt <= now + 24 * 60 * 60 * 1000);
  if (event) facts.push({ id: event.id, text: `日历约定《${shortText(event.title, 18)}》` });

  const moment = context.wechatMoments[0];
  if (moment) facts.push({ id: `moment-${shortText(moment, 18)}`, text: `动态“${shortText(moment)}”` });

  return facts;
}

export function buildTodayLifeRefreshSuggestions(
  context: ActiveEventContext,
  options: BuildActiveEventOptions = {},
): ActiveEventRefreshResult {
  const now = options.now || Date.now();
  const cooldownMs = options.cooldownMs ?? ACTIVE_EVENT_REFRESH_COOLDOWN_MS;
  const maxSuggestions = options.maxSuggestions ?? ACTIVE_EVENT_MAX_SUGGESTIONS;
  const lastRefreshAt = options.lastRefreshAt || 0;
  const cooldownRemainingMs = Math.max(0, cooldownMs - (now - lastRefreshAt));
  if (cooldownRemainingMs > 0) {
    return { canRefresh: false, cooldownRemainingMs, generatedAt: now, suggestions: [] };
  }

  const startAt = todayStart(now);
  const chatSignals = getTodayChatSignals(context, startAt, now);
  const suggestions: ActiveEventSuggestion[] = [];
  const pushSuggestion = (suggestion: ActiveEventSuggestion) => {
    if (!suggestion.sourceIds.length || hasAcceptedSource(context, suggestion.id)) return;
    suggestions.push(suggestion);
  };

  const latestUserChat = chatSignals.find(({ message }) => message.role === 'user');
  if (latestUserChat) {
    const characterName = getCharacterName(context.characters, latestUserChat.session.characterId);
    const snippet = shortText(latestUserChat.message.content || latestUserChat.message.transcript, 34);
    const id = buildSourceKey('send_message', [latestUserChat.session.characterId, latestUserChat.message.id]);
    pushSuggestion({
      id,
      action: 'send_message',
      app: 'wechat',
      characterId: latestUserChat.session.characterId,
      title: `${characterName} 发一条后续消息`,
      preview: `我刚刚还在想你说的“${snippet}”。这件事先别急，等你确定下来再告诉我。`,
      reason: '基于今天最近一条用户聊天，生成一条短后续，不自动发送。',
      sourceIds: [latestUserChat.message.id],
      createdAt: now,
      cooldownMs,
      priority: 100,
      payload: {
        channel: latestUserChat.session.channel,
        content: `我刚刚还在想你说的“${snippet}”。这件事先别急，等你确定下来再告诉我。`,
      },
    });
  }

  const facts = collectFacts(context, startAt, now, chatSignals);
  const diaryCharacter = context.characters[0];
  if (diaryCharacter && facts.length >= 2) {
    const sourceIds = facts.slice(0, 4).map((fact) => fact.id);
    const id = buildSourceKey('write_diary', [diaryCharacter.id, ...sourceIds]);
    const factText = facts.slice(0, 4).map((fact) => fact.text).join('；');
    pushSuggestion({
      id,
      action: 'write_diary',
      app: 'diary',
      characterId: diaryCharacter.id,
      title: `${diaryCharacter.name} 写一篇今日短日记`,
      preview: `${diaryCharacter.name}把今天的线索先记下来：${factText}。`,
      reason: '把今天已有聊天、日记、相册或日历压成一篇短记录，不扩写不存在的情节。',
      sourceIds,
      createdAt: now,
      cooldownMs,
      priority: 90,
      payload: {
        diaryTitle: `${diaryCharacter.name}的今日短记`,
        diaryContent: `${diaryCharacter.name}把今天的线索先记下来：${factText}。`,
        mood: '留意',
      },
    });
  }

  const track = pickTrack(context);
  if (track) {
    const id = buildSourceKey('recommend_music', [track.id]);
    const characterId = context.characters[0]?.id;
    pushSuggestion({
      id,
      action: 'recommend_music',
      app: 'music',
      characterId,
      title: `推荐《${track.title}》`,
      preview: `今天可以把《${track.title}》放进生活里，${track.artist}的这首歌和现在的节奏很贴。`,
      reason: '只从现有曲库选择歌曲，不凭空创建新歌。',
      sourceIds: [track.id],
      createdAt: now,
      cooldownMs,
      priority: 80,
      payload: {
        trackId: track.id,
        trackTitle: track.title,
        mood: track.tags[0] || '今日推荐',
        content: `今天可以把《${track.title}》放进生活里，${track.artist}的这首歌和现在的节奏很贴。`,
      },
    });
  }

  const readablePhoto = context.galleryPhotos.find((photo) => isTodayTime(photo.createdAt, startAt, now) && photo.readableByChar !== false && !photo.hidden);
  if (readablePhoto) {
    const id = buildSourceKey('post_social', [readablePhoto.id]);
    pushSuggestion({
      id,
      action: 'post_social',
      app: 'wechat',
      characterId: readablePhoto.characterId,
      title: '发一条今日动态',
      preview: `今天的照片《${shortText(readablePhoto.title, 18)}》先收好，${shortText(readablePhoto.description || readablePhoto.note || readablePhoto.tags.join('、'))}`,
      reason: '动态只引用相册里已经存在且可读的照片信息。',
      sourceIds: [readablePhoto.id],
      createdAt: now,
      cooldownMs,
      priority: 70,
      payload: {
        socialContent: `今天的照片《${shortText(readablePhoto.title, 18)}》先收好，${shortText(readablePhoto.description || readablePhoto.note || readablePhoto.tags.join('、'))}`,
      },
    });
  }

  const upcoming = context.calendarEvents.find((event) => event.startAt >= now && event.startAt <= now + 24 * 60 * 60 * 1000);
  if (upcoming) {
    const id = buildSourceKey('create_notification', [upcoming.id]);
    pushSuggestion({
      id,
      action: 'create_notification',
      app: 'system',
      characterId: upcoming.characterId,
      title: `提醒：${upcoming.title}`,
      preview: `${new Date(upcoming.startAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 有“${upcoming.title}”。`,
      reason: '只创建后台记录和生活事件，不接入通知中心或锁屏。',
      sourceIds: [upcoming.id],
      createdAt: now,
      cooldownMs,
      priority: 60,
      payload: {
        notificationTitle: upcoming.title,
        content: `${new Date(upcoming.startAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })} 有“${upcoming.title}”。`,
      },
    });
  }

  return {
    canRefresh: true,
    cooldownRemainingMs: 0,
    generatedAt: now,
    suggestions: suggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, Math.max(0, maxSuggestions)),
  };
}

export function buildActiveEventWrites(
  suggestion: ActiveEventSuggestion,
  options: BuildActiveEventWritesOptions = {},
): ActiveEventWrites {
  const now = options.now || Date.now();
  const sourceId = suggestion.id;
  const lifeEventBase = {
    characterId: suggestion.characterId,
    title: suggestion.title,
    summary: suggestion.preview,
    importance: 3 as const,
    sourceId,
    readableByChar: true,
    tags: ['主动事件', '手动刷新'],
    createdAt: now,
  };

  if (suggestion.action === 'send_message' && suggestion.characterId && suggestion.payload.content) {
    return {
      chatTarget: { characterId: suggestion.characterId, channel: suggestion.payload.channel || 'wechat' },
      chatMessage: {
        id: createId('msg'),
        role: 'model',
        content: suggestion.payload.content,
        timestamp: now,
        kind: 'text',
      },
      lifeEvent: { ...lifeEventBase, type: 'chat', app: suggestion.payload.channel || 'wechat' },
    };
  }

  if (suggestion.action === 'write_diary' && suggestion.payload.diaryContent) {
    return {
      diaryEntry: {
        owner: 'char',
        characterId: suggestion.characterId,
        title: suggestion.payload.diaryTitle || '今日短记',
        content: suggestion.payload.diaryContent,
        mood: suggestion.payload.mood,
        tags: ['主动事件', '今日生活'],
        source: 'manual',
        relatedMessageIds: suggestion.sourceIds.filter((id) => id.startsWith('msg-')),
      },
      lifeEvent: { ...lifeEventBase, type: 'diary', app: 'diary', importance: 4 },
    };
  }

  if (suggestion.action === 'recommend_music' && suggestion.payload.trackId) {
    return {
      musicListenRecord: {
        trackId: suggestion.payload.trackId,
        characterId: suggestion.characterId,
        mood: suggestion.payload.mood,
        note: suggestion.payload.content || suggestion.preview,
      },
      lifeEvent: { ...lifeEventBase, type: 'music', app: 'music' },
    };
  }

  if (suggestion.action === 'post_social' && suggestion.payload.socialContent) {
    return {
      wechatMoment: suggestion.payload.socialContent,
      lifeEvent: { ...lifeEventBase, type: 'social', app: 'wechat' },
    };
  }

  return {
    appLog: {
      type: 'info',
      title: suggestion.payload.notificationTitle || suggestion.title,
      detail: suggestion.payload.content || suggestion.preview,
    },
    lifeEvent: { ...lifeEventBase, type: 'system', app: 'system' },
  };
}
