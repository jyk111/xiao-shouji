import {
  BookOpen,
  Bot,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock,
  Clapperboard,
  Copy,
  Droplets,
  FileText,
  Gift,
  Heart,
  Import,
  Image as ImageIcon,
  KeyRound,
  Link,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Palette,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  ShoppingBag,
  Shuffle,
  SmilePlus,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Undo2,
  Users,
  UserPlus,
  Video,
  Wand2,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { cn, createId } from '../../lib/utils';
import { Header, Panel, Pill, Field, Row, Empty, EmptyScreen, Avatar } from '../shared/AppPrimitives';
import { buildMemoWorldContext, delay, describeChatMessage, getCharacterPrompt, requestChatCompletion, requestChatCompletionStream } from '../shared/aiText';
import type { CalendarEvent, Character, DiaryEntry, MemoEntry } from '../../store';
import { useAppStore } from '../../store';

type CalendarTab = 'month' | 'today' | 'list';
type CalendarView = 'main' | 'edit' | 'detail';
type CalendarDraft = {
  owner: CalendarEvent['owner'];
  characterId: string;
  title: string;
  note: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  allDay: boolean;
  repeat: NonNullable<CalendarEvent['repeat']>;
  reminder: 'none' | 'start' | '15m' | '1h' | '1d';
  tags: string;
  source: NonNullable<CalendarEvent['source']>;
  relatedDiaryIds: string[];
};

const calendarSourceLabels: Record<NonNullable<CalendarEvent['source']>, string> = {
  manual: '手动',
  wechat: '微信',
  qq: 'QQ',
  diary: '日记',
  memo: '备忘录',
  moment: '朋友圈',
  order: '订单',
};

function getDiarySummary(entry: DiaryEntry) {
  return entry.content.replace(/\s+/g, ' ').slice(0, 62) || '还没有正文';
}

function padDatePart(value: number) {
  return String(value).padStart(2, '0');
}

function formatDateInput(time: number) {
  const date = new Date(time);
  return `${date.getFullYear()}-${padDatePart(date.getMonth() + 1)}-${padDatePart(date.getDate())}`;
}

function formatTimeInput(time?: number) {
  if (!time) return '';
  const date = new Date(time);
  return `${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`;
}

function formatDateLabel(time: number) {
  const date = new Date(time);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function formatEventTime(event: CalendarEvent) {
  if (event.allDay) return '全天';
  const start = formatTimeInput(event.startAt);
  const end = formatTimeInput(event.endAt);
  return end ? `${start}-${end}` : start;
}

function getDayStart(time: number) {
  const date = new Date(time);
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function isSameCalendarDay(left: number, right: number) {
  return getDayStart(left) === getDayStart(right);
}

function isEventOnDay(event: CalendarEvent, day: number) {
  const dayStart = getDayStart(day);
  const eventStart = getDayStart(event.startAt);
  const eventEnd = getDayStart(event.endAt || event.startAt);
  return dayStart >= eventStart && dayStart <= eventEnd;
}

function getHolidayEvents(year: number): CalendarEvent[] {
  const makeHoliday = (id: string, title: string, month: number, day: number, tags: string[] = ['节日']): CalendarEvent => ({
    id: `holiday-${year}-${id}`,
    owner: 'shared',
    title,
    note: '按当前年份内置节日显示。',
    startAt: new Date(year, month - 1, day).getTime(),
    allDay: true,
    repeat: 'yearly',
    tags,
    source: 'manual',
    favorite: false,
    createdAt: new Date(year, month - 1, day).getTime(),
    updatedAt: new Date(year, month - 1, day).getTime(),
  });
  const fixed = [
    makeHoliday('new-year', '元旦', 1, 1),
    makeHoliday('valentine', '情人节', 2, 14, ['节日', '约会']),
    makeHoliday('women', '妇女节', 3, 8),
    makeHoliday('qingming', '清明节', 4, 4),
    makeHoliday('labor', '劳动节', 5, 1),
    makeHoliday('childrens', '儿童节', 6, 1),
    makeHoliday('national', '国庆节', 10, 1),
    makeHoliday('christmas', '圣诞节', 12, 25),
  ];
  if (year === 2026) {
    return [
      ...fixed,
      makeHoliday('spring', '春节', 2, 17, ['节日', '团圆']),
      makeHoliday('lantern', '元宵节', 3, 3, ['节日']),
      makeHoliday('dragon-boat', '端午节', 6, 19, ['节日']),
      makeHoliday('qixi', '七夕', 8, 19, ['节日', '约会']),
      makeHoliday('mid-autumn', '中秋节', 9, 25, ['节日', '团圆']),
    ];
  }
  return fixed;
}

function getCalendarEventTone(event: CalendarEvent) {
  const text = `${event.title} ${event.tags.join(' ')}`;
  if (/月经|经期|生理|姨妈/.test(text)) return 'period';
  if (/约会|情人|七夕|纪念|喜欢|爱/.test(text)) return 'date';
  if (/节日|春节|元旦|清明|劳动|端午|中秋|国庆|圣诞/.test(text)) return 'holiday';
  if (/生日|礼物|惊喜/.test(text)) return 'gift';
  if (/地点|出门|旅行|见面|电影|吃饭/.test(text)) return 'place';
  return 'default';
}

function CalendarToneIcon({ event, className = 'h-5 w-5' }: { event: CalendarEvent; className?: string }) {
  const tone = getCalendarEventTone(event);
  if (tone === 'period') return <Droplets className={className} />;
  if (tone === 'date') return <Heart className={className} />;
  if (tone === 'holiday') return <Sparkles className={className} />;
  if (tone === 'gift') return <Gift className={className} />;
  if (tone === 'place') return <MapPin className={className} />;
  return <CalendarDays className={className} />;
}

function parseCalendarTime(dateValue: string, timeValue: string, allDay: boolean) {
  const [year, month, day] = dateValue.split('-').map(Number);
  if (allDay || !timeValue) return new Date(year, month - 1, day).getTime();
  const [hours, minutes] = timeValue.split(':').map(Number);
  return new Date(year, month - 1, day, hours || 0, minutes || 0).getTime();
}

function emptyCalendarDraft(date = Date.now()): CalendarDraft {
  return {
    owner: 'user',
    characterId: '',
    title: '',
    note: '',
    location: '',
    date: formatDateInput(date),
    startTime: '09:00',
    endTime: '',
    allDay: false,
    repeat: 'none',
    reminder: 'none',
    tags: '',
    source: 'manual',
    relatedDiaryIds: [],
  };
}

function draftFromCalendarEvent(event: CalendarEvent): CalendarDraft {
  let reminder: CalendarDraft['reminder'] = 'none';
  if (event.reminderAt === event.startAt) reminder = 'start';
  if (event.reminderAt === event.startAt - 15 * 60 * 1000) reminder = '15m';
  if (event.reminderAt === event.startAt - 60 * 60 * 1000) reminder = '1h';
  if (event.reminderAt === event.startAt - 24 * 60 * 60 * 1000) reminder = '1d';
  return {
    owner: event.owner,
    characterId: event.characterId || '',
    title: event.title,
    note: event.note || '',
    location: event.location || '',
    date: formatDateInput(event.startAt),
    startTime: event.allDay ? '' : formatTimeInput(event.startAt),
    endTime: event.allDay ? '' : formatTimeInput(event.endAt),
    allDay: Boolean(event.allDay),
    repeat: event.repeat || 'none',
    reminder,
    tags: event.tags.join('、'),
    source: event.source || 'manual',
    relatedDiaryIds: event.relatedDiaryIds || [],
  };
}

function calendarEventFromDraft(draft: CalendarDraft): Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'> {
  const startAt = parseCalendarTime(draft.date, draft.startTime, draft.allDay);
  const endAt = draft.endTime && !draft.allDay ? parseCalendarTime(draft.date, draft.endTime, false) : undefined;
  const reminderOffsets: Record<CalendarDraft['reminder'], number | null> = {
    none: null,
    start: 0,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
  };
  const offset = reminderOffsets[draft.reminder];
  return {
    owner: draft.owner,
    characterId: draft.owner === 'user' ? undefined : draft.characterId || undefined,
    title: draft.title,
    note: draft.note,
    location: draft.location,
    startAt,
    endAt: endAt && endAt > startAt ? endAt : undefined,
    allDay: draft.allDay,
    repeat: draft.repeat,
    reminderAt: offset === null ? undefined : startAt - offset,
    tags: draft.tags.split(/[，,、\s]+/).map((tag) => tag.trim()).filter(Boolean),
    source: draft.source,
    relatedDiaryIds: draft.relatedDiaryIds,
    relatedMessageIds: [],
    favorite: false,
  };
}

export function CalendarScreen() {
  const {
    characters,
    diaries,
    memos,
    calendarEvents,
    addCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    toggleCalendarEventFavorite,
  } = useAppStore();
  const [tab, setTab] = useState<CalendarTab>('month');
  const [view, setView] = useState<CalendarView>('main');
  const [visibleMonth, setVisibleMonth] = useState(() => getDayStart(Date.now()));
  const [selectedDay, setSelectedDay] = useState(() => getDayStart(Date.now()));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState<CalendarDraft>(() => emptyCalendarDraft());
  const [ownerFilter, setOwnerFilter] = useState<'all' | CalendarEvent['owner']>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | NonNullable<CalendarEvent['source']>>('all');
  const holidayEvents = getHolidayEvents(new Date(visibleMonth).getFullYear());
  const allCalendarEvents = [...calendarEvents, ...holidayEvents].sort((a, b) => a.startAt - b.startAt);
  const activeEvent = allCalendarEvents.find((event) => event.id === activeId);
  const selectedDayEvents = allCalendarEvents.filter((event) => isEventOnDay(event, selectedDay));
  const todayEvents = allCalendarEvents.filter((event) => isEventOnDay(event, Date.now()));
  const upcomingEvents = calendarEvents.filter((event) => event.startAt >= getDayStart(Date.now())).slice(0, 12);
  const upcomingHolidayEvents = getHolidayEvents(new Date().getFullYear())
    .filter((event) => event.startAt >= getDayStart(Date.now()))
    .slice(0, 2);
  const tagOptions = Array.from(new Set(allCalendarEvents.flatMap((event) => event.tags))).slice(0, 8);
  const filteredEvents = allCalendarEvents.filter((event) => {
    if (ownerFilter !== 'all' && event.owner !== ownerFilter) return false;
    if (sourceFilter !== 'all' && event.source !== sourceFilter) return false;
    return true;
  });
  const monthDate = new Date(visibleMonth);
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const monthDays = Array.from({ length: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate() }, (_, index) =>
    new Date(monthDate.getFullYear(), monthDate.getMonth(), index + 1),
  );
  const calendarCells = [...Array(firstDay.getDay()).fill(null), ...monthDays];

  const openCreate = (date = selectedDay, preset?: Partial<CalendarDraft>) => {
    setActiveId(null);
    setDraft({ ...emptyCalendarDraft(date), ...preset });
    setView('edit');
  };
  const openEdit = (event: CalendarEvent) => {
    setActiveId(event.id);
    setDraft(draftFromCalendarEvent(event));
    setView('edit');
  };
  const saveEvent = () => {
    if (!draft.title.trim()) return;
    const payload = calendarEventFromDraft(draft);
    if (activeId) {
      updateCalendarEvent(activeId, payload);
      setView('detail');
      return;
    }
    const id = addCalendarEvent(payload);
    setActiveId(id);
    setSelectedDay(getDayStart(payload.startAt));
    setView('detail');
  };
  const convertDiary = (entry: DiaryEntry) => {
    openCreate(entry.createdAt, {
      title: `${entry.title} 相关日程`,
      note: getDiarySummary(entry),
      owner: entry.owner === 'char' ? 'char' : 'user',
      characterId: entry.characterId || '',
      source: 'diary',
      tags: entry.tags.length > 0 ? entry.tags.join('、') : '日记',
      relatedDiaryIds: [entry.id],
    });
  };
  const convertMemo = (memo: MemoEntry) => {
    openCreate(memo.reminderAt || Date.now(), {
      title: memo.title,
      note: memo.content,
      source: 'memo',
      tags: memo.tags.length > 0 ? memo.tags.join('、') : '备忘录',
    });
  };
  const recordPeriod = (date = selectedDay) => {
    const startAt = getDayStart(date);
    const id = addCalendarEvent({
      owner: 'user',
      title: '经期记录',
      note: '经期开始。默认显示 5 天，可以进详情编辑备注。',
      startAt,
      endAt: startAt + 4 * 24 * 60 * 60 * 1000,
      allDay: true,
      repeat: 'none',
      tags: ['月经', '经期', '健康'],
      source: 'manual',
      relatedDiaryIds: [],
      relatedMessageIds: [],
      favorite: false,
    });
    setActiveId(id);
    setSelectedDay(startAt);
    setView('detail');
  };
  const isReadonlyEvent = activeEvent?.id.startsWith('holiday-');

  if (view === 'edit') {
    return (
      <section className="calendar-screen h-full overflow-y-auto pb-8">
        <Header title={activeId ? '编辑日程' : '新增日程'} subtitle="标题、时间、角色和来源" onBack={() => setView(activeId ? 'detail' : 'main')} onSave={saveEvent} saveLabel={activeId ? '更新' : '添加'} />
        <Panel>
          <Field icon={<CalendarDays />} label="标题">
            <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} className="hand-input w-full" placeholder="例如：一起去看电影" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field icon={<CalendarDays />} label="日期">
              <input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} className="hand-input w-full" />
            </Field>
            <Field icon={<Zap />} label="全天">
              <button onClick={() => setDraft({ ...draft, allDay: !draft.allDay, startTime: draft.allDay ? '09:00' : '', endTime: '' })} className={cn('pill w-full', draft.allDay && 'active')}>
                {draft.allDay ? '已开启' : '未开启'}
              </button>
            </Field>
          </div>
          {!draft.allDay && (
            <div className="grid grid-cols-2 gap-3">
              <Field icon={<CalendarDays />} label="开始">
                <input type="time" value={draft.startTime} onChange={(event) => setDraft({ ...draft, startTime: event.target.value })} className="hand-input w-full" />
              </Field>
              <Field icon={<CalendarDays />} label="结束">
                <input type="time" value={draft.endTime} onChange={(event) => setDraft({ ...draft, endTime: event.target.value })} className="hand-input w-full" />
              </Field>
            </div>
          )}
          <Field icon={<Users />} label="归属">
            <select value={draft.owner} onChange={(event) => setDraft({ ...draft, owner: event.target.value as CalendarEvent['owner'] })} className="hand-input w-full">
              <option value="user">用户</option>
              <option value="char">char</option>
              <option value="shared">共同</option>
            </select>
          </Field>
          {draft.owner !== 'user' && (
            <Field icon={<CircleUserRound />} label="关联角色">
              <select value={draft.characterId} onChange={(event) => setDraft({ ...draft, characterId: event.target.value })} className="hand-input w-full">
                <option value="">未指定</option>
                {characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
              </select>
            </Field>
          )}
          <Field icon={<Search />} label="地点">
            <input value={draft.location} onChange={(event) => setDraft({ ...draft, location: event.target.value })} className="hand-input w-full" placeholder="可留空" />
          </Field>
          <Field icon={<RefreshCw />} label="重复">
            <select value={draft.repeat} onChange={(event) => setDraft({ ...draft, repeat: event.target.value as CalendarDraft['repeat'] })} className="hand-input w-full">
              <option value="none">不重复</option>
              <option value="daily">每天</option>
              <option value="weekly">每周</option>
              <option value="monthly">每月</option>
              <option value="yearly">每年</option>
            </select>
          </Field>
          <Field icon={<Zap />} label="提醒">
            <select value={draft.reminder} onChange={(event) => setDraft({ ...draft, reminder: event.target.value as CalendarDraft['reminder'] })} className="hand-input w-full">
              <option value="none">不提醒</option>
              <option value="start">开始时</option>
              <option value="15m">提前 15 分钟</option>
              <option value="1h">提前 1 小时</option>
              <option value="1d">提前 1 天</option>
            </select>
          </Field>
          <Field icon={<Tag />} label="标签">
            <input value={draft.tags} onChange={(event) => setDraft({ ...draft, tags: event.target.value })} className="hand-input w-full" placeholder="约会、纪念日、工作" />
          </Field>
          <Field icon={<FileText />} label="备注">
            <textarea value={draft.note} onChange={(event) => setDraft({ ...draft, note: event.target.value })} className="hand-input min-h-[112px] w-full resize-none" placeholder="写一点细节" />
          </Field>
        </Panel>
      </section>
    );
  }

  if (view === 'detail' && activeEvent) {
    const character = characters.find((item) => item.id === activeEvent.characterId);
    const relatedDiaries = diaries.filter((entry) => activeEvent.relatedDiaryIds?.includes(entry.id));
    return (
      <section className="calendar-screen h-full overflow-y-auto pb-8">
        <Header title="日程详情" subtitle={formatDateLabel(activeEvent.startAt)} onBack={() => setView('main')} />
        <Panel>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-2xl font-black leading-tight">{activeEvent.title}</p>
              <p className="mt-2 text-sm font-black opacity-60">{formatEventTime(activeEvent)} · {calendarSourceLabels[activeEvent.source || 'manual']}</p>
            </div>
            {!isReadonlyEvent && (
              <button onClick={() => toggleCalendarEventFavorite(activeEvent.id)} className={cn('circle-button small shrink-0', activeEvent.favorite && 'bg-[#fff0b8]')}>
                <Star className={cn('h-5 w-5', activeEvent.favorite && 'fill-[#111]')} />
              </button>
            )}
          </div>
          <div className="mt-4 grid gap-3 text-sm font-bold">
            <p>归属：{activeEvent.owner === 'user' ? '用户' : activeEvent.owner === 'char' ? 'char' : '共同'}{character ? ` · ${character.name}` : ''}</p>
            {activeEvent.location && <p>地点：{activeEvent.location}</p>}
            {activeEvent.repeat && activeEvent.repeat !== 'none' && <p>重复：{activeEvent.repeat}</p>}
            {activeEvent.reminderAt && <p>提醒：{formatDateLabel(activeEvent.reminderAt)} {formatTimeInput(activeEvent.reminderAt)}</p>}
            {activeEvent.tags.length > 0 && <p>标签：{activeEvent.tags.join('、')}</p>}
          </div>
          {activeEvent.note && <p className="mt-4 whitespace-pre-wrap rounded-2xl bg-white/70 p-4 text-sm font-bold leading-7">{activeEvent.note}</p>}
          {relatedDiaries.length > 0 && (
            <div className="mt-4 border-t-[2px] border-[#111]/15 pt-3">
              <p className="text-sm font-black opacity-60">关联日记</p>
              {relatedDiaries.map((entry) => <p key={entry.id} className="mt-2 text-sm font-bold">{entry.title}：{getDiarySummary(entry)}</p>)}
            </div>
          )}
          {!isReadonlyEvent && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => openEdit(activeEvent)} className="fetch-button">编辑</button>
              <button onClick={() => { deleteCalendarEvent(activeEvent.id); setActiveId(null); setView('main'); }} className="fetch-button bg-[#ffd6d6]">
                删除
              </button>
            </div>
          )}
        </Panel>
      </section>
    );
  }

  return (
    <section className="calendar-screen h-full overflow-y-auto pb-8">
      <Header
        title="日历"
        subtitle="生活时间线和 char 日程"
        onSave={() => openCreate(selectedDay)}
        saveLabel="新增"
        tabs={
          <>
            <Pill active={tab === 'month'} icon={<CalendarDays />} label="月视图" onClick={() => setTab('month')} />
            <Pill active={tab === 'today'} icon={<Zap />} label="今天" onClick={() => setTab('today')} />
            <Pill active={tab === 'list'} icon={<FileText />} label="日程" onClick={() => setTab('list')} />
          </>
        }
      />

      {tab === 'month' && (
        <>
          <Panel>
            <div className="mb-4 flex items-center justify-between">
              <button onClick={() => setVisibleMonth(new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1).getTime())} className="circle-button small">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <p className="text-xl font-black">{monthDate.getFullYear()}年 {monthDate.getMonth() + 1}月</p>
              <button onClick={() => setVisibleMonth(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1).getTime())} className="circle-button small">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-black opacity-60">
              {['日', '一', '二', '三', '四', '五', '六'].map((day) => <span key={day}>{day}</span>)}
            </div>
            <div className="mt-2 grid grid-cols-7 gap-1">
              {calendarCells.map((date, index) => {
                if (!date) return <span key={`empty-${index}`} className="aspect-square" />;
                const time = date.getTime();
                const events = allCalendarEvents.filter((event) => isEventOnDay(event, time));
                return (
                  <button key={time} onClick={() => setSelectedDay(getDayStart(time))} className={cn('calendar-day-cell flex aspect-square flex-col items-center justify-center rounded-2xl border-[2px] border-[#111]/10 bg-white/60 text-sm font-black', isSameCalendarDay(time, selectedDay) && 'border-[#111] bg-[#d9e8f6]', isSameCalendarDay(time, Date.now()) && 'bg-[#fff0b8]', events.some((event) => getCalendarEventTone(event) === 'period') && 'calendar-day-period', events.some((event) => getCalendarEventTone(event) === 'date') && 'calendar-day-date')}>
                    {date.getDate()}
                    {events.length > 0 && (
                      <span className="mt-1 flex gap-0.5">
                        {events.slice(0, 3).map((event) => (
                          <span key={event.id} className={cn('h-1.5 w-1.5 rounded-full bg-[#111]', getCalendarEventTone(event) === 'period' && 'bg-[#e65d8f]', getCalendarEventTone(event) === 'date' && 'bg-[#ff6b9a]', getCalendarEventTone(event) === 'holiday' && 'bg-[#e4b13c]')} />
                        ))}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </Panel>
          <Panel>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-lg font-black">{formatDateLabel(selectedDay)}</p>
              <div className="flex gap-2">
                <button onClick={() => recordPeriod(selectedDay)} className="pill"><Droplets className="h-4 w-4" />经期</button>
                <button onClick={() => openCreate(selectedDay)} className="pill active"><Plus className="h-4 w-4" />添加</button>
              </div>
            </div>
            {selectedDayEvents.length > 0 ? selectedDayEvents.map((event) => (
              <CalendarEventRow key={event.id} event={event} characters={characters} onClick={() => { setActiveId(event.id); setView('detail'); }} />
            )) : <Empty text="这一天还没有日程。" />}
          </Panel>
        </>
      )}

      {tab === 'today' && (
        <>
          <Panel>
            <p className="text-2xl font-black">今天</p>
            <p className="mt-1 text-sm font-bold opacity-60">{formatDateLabel(Date.now())} · {todayEvents.length} 个日程</p>
            <div className="mt-4">
              {todayEvents.length > 0 ? todayEvents.map((event) => (
                <CalendarEventRow key={event.id} event={event} characters={characters} onClick={() => { setActiveId(event.id); setView('detail'); }} />
              )) : <Empty text="今天没有安排，可以临时加一条。" />}
            </div>
          </Panel>
          <Panel>
            <p className="text-lg font-black">接下来</p>
            {upcomingEvents.length > 0 ? upcomingEvents.map((event) => (
              <CalendarEventRow key={event.id} event={event} characters={characters} onClick={() => { setActiveId(event.id); setView('detail'); }} />
            )) : <Empty text="还没有未来日程。" />}
          </Panel>
          <Panel>
            <p className="text-lg font-black">最近节日</p>
            {upcomingHolidayEvents.length > 0 ? upcomingHolidayEvents.map((event) => (
              <CalendarEventRow key={event.id} event={event} characters={characters} showDate onClick={() => { setActiveId(event.id); setView('detail'); }} />
            )) : <Empty text="今年后面没有内置节日。" />}
          </Panel>
        </>
      )}

      {tab === 'list' && (
        <>
          <Panel>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <Pill active={ownerFilter === 'all'} icon={<Users />} label="全部" onClick={() => setOwnerFilter('all')} />
              <Pill active={ownerFilter === 'user'} icon={<CircleUserRound />} label="用户" onClick={() => setOwnerFilter('user')} />
              <Pill active={ownerFilter === 'char'} icon={<LockKeyhole />} label="char" onClick={() => setOwnerFilter('char')} />
              <Pill active={ownerFilter === 'shared'} icon={<MessageCircle />} label="共同" onClick={() => setOwnerFilter('shared')} />
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              <Pill active={sourceFilter === 'all'} icon={<Sparkles />} label="来源" onClick={() => setSourceFilter('all')} />
              {Object.entries(calendarSourceLabels).map(([source, label]) => (
                <Pill key={source} active={sourceFilter === source} icon={<Tag />} label={label} onClick={() => setSourceFilter(source as NonNullable<CalendarEvent['source']>)} />
              ))}
            </div>
          </Panel>
          <Panel>
            {filteredEvents.length > 0 ? filteredEvents.map((event) => (
              <CalendarEventRow key={event.id} event={event} characters={characters} showDate onClick={() => { setActiveId(event.id); setView('detail'); }} />
            )) : <Empty text="筛选下没有日程。" />}
          </Panel>
          <Panel>
            <p className="text-lg font-black">从日记/备忘录转入</p>
            {diaries.slice(0, 3).map((entry) => (
              <button key={entry.id} onClick={() => convertDiary(entry)} className="w-full border-b-[2px] border-[#111]/15 py-3 text-left last:border-b-0">
                <p className="text-sm font-black">{entry.title}</p>
                <p className="line-clamp-1 text-xs font-bold opacity-60">{getDiarySummary(entry)}</p>
              </button>
            ))}
            {memos.slice(0, 3).map((memo) => (
              <button key={memo.id} onClick={() => convertMemo(memo)} className="w-full border-b-[2px] border-[#111]/15 py-3 text-left last:border-b-0">
                <p className="text-sm font-black">{memo.title}</p>
                <p className="line-clamp-1 text-xs font-bold opacity-60">{memo.content || '转为备忘录来源日程'}</p>
              </button>
            ))}
            {diaries.length === 0 && memos.length === 0 && <Empty text="暂无可转入内容。" />}
          </Panel>
          {tagOptions.length > 0 && (
            <Panel>
              <p className="text-lg font-black">常用标签</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {tagOptions.map((tag) => <span key={tag} className="rounded-full border-[2px] border-[#111] bg-white px-3 py-1 text-xs font-black">{tag}</span>)}
              </div>
            </Panel>
          )}
        </>
      )}
    </section>
  );
}

function CalendarEventRow({ event, characters, showDate, onClick }: { key?: React.Key; event: CalendarEvent; characters: Character[]; showDate?: boolean; onClick: () => void }) {
  const character = characters.find((item) => item.id === event.characterId);
  const tone = getCalendarEventTone(event);
  return (
    <button onClick={onClick} className="flex w-full gap-3 border-b-[2px] border-[#111]/15 py-3 text-left last:border-b-0">
      <div className={cn('app-chip', event.favorite && 'bg-[#fff0b8]', tone === 'period' && 'bg-[#ffe1ec]', tone === 'date' && 'bg-[#ffd6e4]', tone === 'holiday' && 'bg-[#fff0b8]', tone === 'gift' && 'bg-[#e9c4d5]', tone === 'place' && 'bg-[#dceecd]')}>
        <CalendarToneIcon event={event} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-base font-black">{event.title}</p>
          <span className="shrink-0 text-xs font-black opacity-60">{formatEventTime(event)}</span>
        </div>
        <p className="line-clamp-1 text-xs font-bold opacity-60">
          {showDate ? `${formatDateLabel(event.startAt)} · ` : ''}{calendarSourceLabels[event.source || 'manual']} · {event.owner === 'user' ? '用户' : event.owner === 'char' ? 'char' : '共同'}{character ? ` · ${character.name}` : ''}
        </p>
        {event.tags.length > 0 && <p className="mt-1 line-clamp-1 text-xs font-black opacity-50">{event.tags.join('、')}</p>}
      </div>
    </button>
  );
}
