import assert from 'node:assert/strict';
import { buildPeekViewModel, getPeekSection, type PeekInput } from './peekLogic';
import type {
  BrowserBookmark,
  BrowserHistoryItem,
  BrowserSearchRecord,
  CalendarEvent,
  Character,
  ChatSession,
  DiaryEntry,
  GalleryPhoto,
  MemoEntry,
  MusicListenRecord,
  MusicTrack,
} from '../../store';
import type { XiaohongshuNote } from '../xiaohongshu/types';

const now = new Date('2026-05-10T12:00:00+08:00').getTime();

function character(id: string, name: string): Character {
  return {
    id,
    name,
    avatar: '',
    description: `${name} keeps small traces in the phone.`,
    personality: 'quiet, careful, detail-oriented',
    firstMessage: '',
    systemPrompt: '',
  };
}

function baseInput(overrides: Partial<PeekInput> = {}): PeekInput {
  return {
    characters: [character('char-a', 'Lin'), character('char-b', 'Song')],
    chatSessions: {},
    diaries: [],
    calendarEvents: [],
    galleryPhotos: [],
    memos: [],
    browserSearches: [],
    browserBookmarks: [],
    browserHistory: [],
    xiaohongshuNotes: [],
    musicTracks: [],
    musicListenRecords: [],
    now,
    ...overrides,
  };
}

function chatSession(id: string, characterId: string, channel: 'wechat' | 'qq', content: string, timestamp = now): ChatSession {
  return {
    id,
    characterId,
    channel,
    lastUpdated: timestamp,
    messages: [
      { id: `${id}-1`, role: 'model', content, timestamp, kind: 'text' },
    ],
  };
}

const diary = (entry: Partial<DiaryEntry>): DiaryEntry => ({
  id: entry.id || 'diary',
  owner: entry.owner || 'char',
  characterId: entry.characterId,
  title: entry.title || 'Diary',
  content: entry.content || 'A private trace.',
  mood: entry.mood,
  tags: entry.tags || [],
  createdAt: entry.createdAt || now,
  updatedAt: entry.updatedAt || now,
  locked: entry.locked,
});

const event = (item: Partial<CalendarEvent>): CalendarEvent => ({
  id: item.id || 'event',
  owner: item.owner || 'char',
  characterId: item.characterId,
  title: item.title || 'Bookstore',
  note: item.note,
  location: item.location,
  startAt: item.startAt || now,
  tags: item.tags || [],
  createdAt: item.createdAt || now,
  updatedAt: item.updatedAt || now,
});

const photo = (item: Partial<GalleryPhoto>): GalleryPhoto => ({
  id: item.id || 'photo',
  url: item.url || 'data:image/png;base64,ok',
  title: item.title || 'Window',
  description: item.description,
  album: item.album || '生活',
  tags: item.tags || [],
  characterId: item.characterId,
  readableByChar: item.readableByChar,
  hidden: item.hidden,
  createdAt: item.createdAt || now,
  updatedAt: item.updatedAt || now,
});

const memo = (item: Partial<MemoEntry>): MemoEntry => ({
  id: item.id || 'memo',
  title: item.title || 'Umbrella',
  content: item.content || 'Bring an umbrella at dusk.',
  type: item.type || 'note',
  tags: item.tags || [],
  characterId: item.characterId,
  locked: item.locked,
  createdAt: item.createdAt || now,
  updatedAt: item.updatedAt || now,
});

const search = (item: Partial<BrowserSearchRecord>): BrowserSearchRecord => ({
  id: item.id || 'search',
  query: item.query || 'rainy bookstore hours',
  summary: item.summary || 'Searched bookstore hours and rainy route.',
  results: item.results || [],
  createdAt: item.createdAt || now,
});

const bookmark = (item: Partial<BrowserBookmark>): BrowserBookmark => ({
  id: item.id || 'bookmark',
  title: item.title || 'bookstore map',
  url: item.url || 'https://example.com/bookstore',
  snippet: item.snippet || 'Saved a bookstore location.',
  createdAt: item.createdAt || now,
});

const history = (item: Partial<BrowserHistoryItem>): BrowserHistoryItem => ({
  id: item.id || 'history',
  title: item.title || 'night song list',
  url: item.url || 'https://example.com/music',
  query: item.query,
  visitedAt: item.visitedAt || now,
});

const note = (item: Partial<XiaohongshuNote>): XiaohongshuNote => ({
  id: item.id || 'note',
  title: item.title || 'rain at the crossing',
  content: item.content || 'A small life note.',
  tags: item.tags || [],
  authorId: item.authorId || 'char-a',
  authorName: item.authorName || 'Lin',
  authorType: item.authorType || 'character',
  source: item.source || 'manual',
  createdAt: item.createdAt || now,
  updatedAt: item.updatedAt || now,
});

const track = (item: Partial<MusicTrack>): MusicTrack => ({
  id: item.id || 'track',
  title: item.title || 'night wind',
  artist: item.artist || 'Lin',
  characterId: item.characterId,
  tags: item.tags || [],
  liked: item.liked,
  playCount: item.playCount || 0,
  lastPlayedAt: item.lastPlayedAt,
  source: item.source,
  createdAt: item.createdAt || now,
  updatedAt: item.updatedAt || now,
});

const listen = (item: Partial<MusicListenRecord>): MusicListenRecord => ({
  id: item.id || 'listen',
  trackId: item.trackId || 'track',
  characterId: item.characterId,
  mood: item.mood,
  note: item.note,
  durationSeconds: item.durationSeconds,
  createdAt: item.createdAt || now,
});

const view = buildPeekViewModel(baseInput({
  chatSessions: {
    'wechat:char-a': chatSession('wechat-a', 'char-a', 'wechat', 'Xu: I left the umbrella by the door.'),
    'qq:char-b': chatSession('qq-b', 'char-b', 'qq', 'This should not be on Lin phone.'),
  },
  diaries: [
    diary({ id: 'a-diary', owner: 'char', characterId: 'char-a', title: 'After rain', content: 'Put the umbrella back.' }),
    diary({ id: 'b-diary', owner: 'char', characterId: 'char-b', title: 'Song diary', content: 'Do not show.' }),
    diary({ id: 'user-diary', owner: 'user', characterId: 'char-a', title: 'User diary', content: 'Not character phone data.' }),
  ],
  calendarEvents: [
    event({ id: 'char-event', owner: 'char', characterId: 'char-a', title: 'Go to bookstore' }),
    event({ id: 'shared-event', owner: 'shared', characterId: 'char-a', title: 'Shared event is not private phone calendar' }),
    event({ id: 'other-event', owner: 'char', characterId: 'char-b', title: 'Song event' }),
  ],
  galleryPhotos: [
    photo({ id: 'char-photo', characterId: 'char-a', title: 'Window after rain', description: 'Photo in Lin phone.' }),
    photo({ id: 'user-photo', readableByChar: true, title: 'User gallery photo' }),
    photo({ id: 'other-photo', characterId: 'char-b', title: 'Song photo' }),
  ],
  memos: [
    memo({ id: 'char-memo', characterId: 'char-a', title: 'Umbrella' }),
    memo({ id: 'user-memo', readableByChar: true, title: 'User memo' }),
    memo({ id: 'other-memo', characterId: 'char-b', title: 'Song memo' }),
  ],
  browserSearches: [search({ query: 'rainy bookstore hours' })],
  browserBookmarks: [bookmark({ title: 'bookstore map' })],
  browserHistory: [history({ title: 'night song list' })],
  xiaohongshuNotes: [
    note({ id: 'a-note', authorId: 'char-a', authorName: 'Lin', title: 'rain at the crossing' }),
    note({ id: 'b-note', authorId: 'char-b', authorName: 'Song', title: 'should not show' }),
    note({ id: 'world-note', authorId: 'world-1', authorName: 'local user', authorType: 'world', title: 'world note not character post' }),
  ],
  musicTracks: [
    track({ id: 'track-a', characterId: 'char-a', title: 'Lin song', source: 'char' }),
    track({ id: 'track-b', characterId: 'char-b', title: 'Song song', source: 'char' }),
  ],
  musicListenRecords: [
    listen({ id: 'listen-a', trackId: 'track-a', characterId: 'char-a', mood: 'alone', durationSeconds: 180 }),
    listen({ id: 'listen-b', trackId: 'track-b', characterId: 'char-b', mood: 'alone', durationSeconds: 180 }),
  ],
}));

assert.equal(view.selectedCharacter?.name, 'Lin');
assert.match(getPeekSection(view, 'chats').description, /Xu/);
assert.doesNotMatch(getPeekSection(view, 'chats').description, /This should not/);
assert.equal(getPeekSection(view, 'chats').items.length, 1);
assert.match(getPeekSection(view, 'chats').items[0].body, /Xu/);

assert.match(getPeekSection(view, 'diaries').description, /After rain/);
assert.doesNotMatch(getPeekSection(view, 'diaries').description, /User diary|Song diary/);
assert.equal(getPeekSection(view, 'diaries').items[0].title, 'After rain');

assert.match(getPeekSection(view, 'calendar').description, /Go to bookstore/);
assert.doesNotMatch(getPeekSection(view, 'calendar').description, /Shared event|Song event/);
assert.equal(getPeekSection(view, 'calendar').items[0].title, 'Go to bookstore');

assert.match(getPeekSection(view, 'gallery').description, /Window after rain/);
assert.doesNotMatch(getPeekSection(view, 'gallery').description, /User gallery|Song photo/);
assert.equal(getPeekSection(view, 'gallery').items[0].imageUrl, 'data:image/png;base64,ok');

assert.match(getPeekSection(view, 'memos').description, /Umbrella/);
assert.doesNotMatch(getPeekSection(view, 'memos').description, /User memo|Song memo/);
assert.equal(getPeekSection(view, 'memos').items[0].title, 'Umbrella');

assert.match(getPeekSection(view, 'browser').description, /rainy bookstore/);
assert.ok(getPeekSection(view, 'browser').items.length >= 3);
assert.match(getPeekSection(view, 'xiaohongshu').description, /rain at the crossing/);
assert.doesNotMatch(getPeekSection(view, 'xiaohongshu').description, /world note|should not show/);
assert.equal(getPeekSection(view, 'xiaohongshu').items[0].title, 'rain at the crossing');
assert.match(getPeekSection(view, 'music').description, /Lin song/);
assert.doesNotMatch(getPeekSection(view, 'music').description, /Song song/);
assert.ok(getPeekSection(view, 'music').items.some((item) => item.title.includes('Lin song')));

const generated = buildPeekViewModel(baseInput({
  characters: [character('char-z', 'Blank')],
  browserSearches: [],
  browserBookmarks: [],
  browserHistory: [],
}));

for (const section of generated.sections) {
  assert.equal(section.generated, true);
  assert.ok(section.items.length > 0);
  assert.doesNotMatch(section.description, /User|can show|readable/);
}
assert.match(getPeekSection(generated, 'chats').description, /Blank/);
assert.match(getPeekSection(generated, 'diaries').description, /Blank/);
assert.match(getPeekSection(generated, 'gallery').description, /Blank/);
assert.match(getPeekSection(generated, 'calendar').description, /Blank/);
assert.match(getPeekSection(generated, 'browser').description, /Blank/);
assert.match(getPeekSection(generated, 'music').description, /Blank/);

const noCharacter = buildPeekViewModel(baseInput({ characters: [] }));
assert.equal(noCharacter.selectedCharacter, undefined);
assert.equal(getPeekSection(noCharacter, 'chats').description, '导入角色后再生成 TA 的手机内容。');

console.log('peek character phone logic ok');
