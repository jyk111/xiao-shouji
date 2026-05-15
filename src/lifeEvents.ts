/**
 * Shared life event timeline helpers.
 * Exports: LifeEvent types, build/normalize timeline helpers, high-value chat gate.
 * Dependencies: createId from src/lib/utils.ts.
 * Maintenance note: keep this module UI-free so every app can write high-value life traces without coupling to a screen.
 */
import { createId } from './lib/utils';

export type LifeEventType = 'chat' | 'call' | 'diary' | 'photo' | 'calendar' | 'music' | 'social' | 'video' | 'memo' | 'system';
export type LifeEventApp = 'wechat' | 'qq' | 'phone' | 'diary' | 'calendar' | 'gallery' | 'xiaohongshu' | 'bilibili' | 'music' | 'memo' | 'system';
export type LifeEventImportance = 1 | 2 | 3 | 4 | 5;

export interface LifeEvent {
  id: string;
  type: LifeEventType;
  app: LifeEventApp;
  characterId?: string;
  title: string;
  summary: string;
  mood?: string;
  importance: LifeEventImportance;
  sourceId?: string;
  readableByChar?: boolean;
  tags?: string[];
  createdAt: number;
}

export type LifeEventDraft = Omit<LifeEvent, 'id' | 'createdAt' | 'importance'> & Partial<Pick<LifeEvent, 'id' | 'createdAt' | 'importance'>>;

export interface LifeEventTimelineFilter {
  characterId?: string;
  apps?: LifeEventApp[];
  types?: LifeEventType[];
  minImportance?: LifeEventImportance;
  readableByChar?: boolean;
  limit?: number;
}

export interface ChatLifeEventGateInput {
  favorite?: boolean;
  importance?: number;
  summary?: string;
}

const validTypes = new Set<LifeEventType>(['chat', 'call', 'diary', 'photo', 'calendar', 'music', 'social', 'video', 'memo', 'system']);
const validApps = new Set<LifeEventApp>(['wechat', 'qq', 'phone', 'diary', 'calendar', 'gallery', 'xiaohongshu', 'bilibili', 'music', 'memo', 'system']);

function cleanText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeImportance(value: unknown): LifeEventImportance {
  if (typeof value !== 'number' || Number.isNaN(value)) return 3;
  const rounded = Math.round(value);
  if (rounded <= 1) return 1;
  if (rounded >= 5) return 5;
  return rounded as LifeEventImportance;
}

function normalizeTags(tags: unknown) {
  if (!Array.isArray(tags)) return undefined;
  const cleaned = tags.map((tag) => cleanText(tag)).filter(Boolean);
  return cleaned.length > 0 ? Array.from(new Set(cleaned)) : undefined;
}

export function buildLifeEvent(event: LifeEventDraft): LifeEvent {
  const title = cleanText(event.title) || '生活事件';
  const summary = cleanText(event.summary);

  return {
    id: cleanText(event.id) || createId('life'),
    type: validTypes.has(event.type) ? event.type : 'system',
    app: validApps.has(event.app) ? event.app : 'system',
    characterId: cleanText(event.characterId) || undefined,
    title,
    summary,
    mood: cleanText(event.mood) || undefined,
    importance: normalizeImportance(event.importance),
    sourceId: cleanText(event.sourceId) || undefined,
    readableByChar: event.readableByChar === undefined ? undefined : Boolean(event.readableByChar),
    tags: normalizeTags(event.tags),
    createdAt: typeof event.createdAt === 'number' && Number.isFinite(event.createdAt) ? event.createdAt : Date.now(),
  };
}

export function normalizeLifeEvents(events: unknown, fallbackNow = Date.now()): LifeEvent[] {
  if (!Array.isArray(events)) return [];

  return events
    .filter((event) => event && typeof event === 'object')
    .map((event, index) => {
      const item = event as Partial<LifeEvent>;
      const type = item.type;
      const app = item.app;
      if (!type || !validTypes.has(type) || !app || !validApps.has(app)) return null;

      const summary = cleanText(item.summary);
      if (!summary) return null;

      return buildLifeEvent({
        ...item,
        type,
        app,
        title: cleanText(item.title) || summary.slice(0, 24) || '生活事件',
        summary,
        createdAt: typeof item.createdAt === 'number' && Number.isFinite(item.createdAt) ? item.createdAt : fallbackNow - index,
      });
    })
    .filter((event): event is LifeEvent => Boolean(event))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getLifeEventTimeline(events: LifeEvent[], filter: LifeEventTimelineFilter = {}): LifeEvent[] {
  const appSet = filter.apps ? new Set(filter.apps) : undefined;
  const typeSet = filter.types ? new Set(filter.types) : undefined;
  const minImportance = filter.minImportance ?? 1;

  const timeline = normalizeLifeEvents(events)
    .filter((event) => !filter.characterId || event.characterId === filter.characterId)
    .filter((event) => !appSet || appSet.has(event.app))
    .filter((event) => !typeSet || typeSet.has(event.type))
    .filter((event) => event.importance >= minImportance)
    .filter((event) => filter.readableByChar === undefined || event.readableByChar === filter.readableByChar);

  return typeof filter.limit === 'number' && filter.limit >= 0 ? timeline.slice(0, filter.limit) : timeline;
}

export function isHighValueChatLifeEventInput(input: ChatLifeEventGateInput): boolean {
  if (input.favorite) return true;
  if (typeof input.importance === 'number' && input.importance >= 4) return true;
  return Boolean(input.summary && input.summary.trim().length >= 16 && input.summary.includes('重要'));
}
