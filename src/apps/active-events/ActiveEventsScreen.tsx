import { Bell, Check, Clock, FileText, MessageCircle, Music, RefreshCw, Sparkles } from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';

import { cn } from '../../lib/utils';
import { useAppStore } from '../../store';
import { Empty, Header, Panel } from '../shared/AppPrimitives';
import {
  ACTIVE_EVENT_REFRESH_COOLDOWN_MS,
  buildActiveEventWrites,
  buildTodayLifeRefreshSuggestions,
  type ActiveEventSuggestion,
} from './activeEventsLogic';

const actionLabels: Record<ActiveEventSuggestion['action'], string> = {
  send_message: '发消息',
  write_diary: '写日记',
  recommend_music: '推荐歌',
  post_social: '发动态',
  create_notification: '创建提醒',
};

const actionIcons: Record<ActiveEventSuggestion['action'], React.ReactNode> = {
  send_message: <MessageCircle />,
  write_diary: <FileText />,
  recommend_music: <Music />,
  post_social: <Sparkles />,
  create_notification: <Bell />,
};

function formatCooldown(ms: number) {
  if (ms <= 0) return '可以刷新';
  const hours = Math.floor(ms / 60 / 60 / 1000);
  const minutes = Math.ceil((ms - hours * 60 * 60 * 1000) / 60 / 1000);
  if (hours <= 0) return `${minutes} 分钟后`;
  return `${hours} 小时 ${minutes} 分钟后`;
}

function SuggestionCard({
  suggestion,
  confirmed,
  onConfirm,
}: {
  key?: React.Key;
  suggestion: ActiveEventSuggestion;
  confirmed: boolean;
  onConfirm: (suggestion: ActiveEventSuggestion) => void;
}) {
  return (
    <article className="mb-3 rounded-[18px] border-[3px] border-[#111] bg-white/70 p-4 shadow-[2px_3px_0_rgba(0,0,0,0.12)] last:mb-0">
      <div className="flex items-start gap-3">
        <div className="app-chip">
          {actionIcons[suggestion.action]}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-base font-black">{suggestion.title}</p>
            <span className="shrink-0 rounded-full border-[2px] border-[#111]/20 bg-white px-2 py-1 text-[10px] font-black">
              {actionLabels[suggestion.action]}
            </span>
          </div>
          <p className="mt-2 text-sm font-bold leading-5">{suggestion.preview}</p>
          <p className="mt-2 text-xs font-black opacity-55">{suggestion.reason}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onConfirm(suggestion)}
        disabled={confirmed}
        className={cn('fetch-button mt-4', confirmed && 'bg-[#dceecd] opacity-70')}
      >
        {confirmed ? <Check className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
        {confirmed ? '已写入' : '确认写入'}
      </button>
    </article>
  );
}

export function ActiveEventsScreen() {
  const state = useAppStore();
  const {
    activeEventLastRefreshAt,
    setActiveEventLastRefreshAt,
    addMessage,
    addDiary,
    addWechatMoment,
    addMusicListenRecord,
    addLifeEvent,
    addAppLog,
  } = state;
  const [suggestions, setSuggestions] = useState<ActiveEventSuggestion[]>([]);
  const [confirmedIds, setConfirmedIds] = useState<string[]>([]);
  const [status, setStatus] = useState('等待手动刷新');
  const [cooldownRemainingMs, setCooldownRemainingMs] = useState(() =>
    Math.max(0, ACTIVE_EVENT_REFRESH_COOLDOWN_MS - (Date.now() - activeEventLastRefreshAt)),
  );

  const context = useMemo(() => ({
    characters: state.characters,
    chatSessions: state.chatSessions,
    diaries: state.diaries,
    calendarEvents: state.calendarEvents,
    galleryPhotos: state.galleryPhotos,
    memos: state.memos,
    wechatMoments: state.wechatMoments,
    musicTracks: state.musicTracks,
    musicListenRecords: state.musicListenRecords,
    xiaohongshuNotes: state.xiaohongshuNotes,
    lifeEvents: state.lifeEvents,
  }), [state]);

  const refreshTodayLife = () => {
    const now = Date.now();
    const result = buildTodayLifeRefreshSuggestions(context, {
      now,
      lastRefreshAt: activeEventLastRefreshAt,
    });
    setCooldownRemainingMs(result.cooldownRemainingMs);
    if (!result.canRefresh) {
      setStatus(`冷却中，${formatCooldown(result.cooldownRemainingMs)}可再次刷新`);
      return;
    }

    setActiveEventLastRefreshAt(now);
    setSuggestions(result.suggestions);
    setConfirmedIds([]);
    setCooldownRemainingMs(ACTIVE_EVENT_REFRESH_COOLDOWN_MS);
    setStatus(result.suggestions.length > 0 ? `生成 ${result.suggestions.length} 条建议` : '今天还没有足够的新线索');
  };

  const confirmSuggestion = (suggestion: ActiveEventSuggestion) => {
    if (confirmedIds.includes(suggestion.id)) return;
    const writes = buildActiveEventWrites(suggestion);
    if (writes.chatTarget && writes.chatMessage) {
      addMessage(writes.chatTarget.characterId, writes.chatTarget.channel, writes.chatMessage);
    }
    if (writes.diaryEntry) addDiary(writes.diaryEntry);
    if (writes.wechatMoment) addWechatMoment(writes.wechatMoment);
    if (writes.musicListenRecord) addMusicListenRecord(writes.musicListenRecord);
    if (writes.appLog) addAppLog(writes.appLog);
    addLifeEvent(writes.lifeEvent);
    setConfirmedIds((ids) => [...ids, suggestion.id]);
    setStatus(`已写入：${suggestion.title}`);
  };

  return (
    <section className="no-scrollbar h-full overflow-y-auto pb-8">
      <Header title="char 主动" subtitle={status} />

      <Panel>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-black">刷新 char 主动</p>
            <p className="mt-1 text-sm font-bold opacity-60">上次刷新：{activeEventLastRefreshAt ? new Date(activeEventLastRefreshAt).toLocaleString('zh-CN') : '还没有'}</p>
          </div>
          <span className="app-chip shrink-0">
            <Clock />
          </span>
        </div>
        <button type="button" onClick={refreshTodayLife} className="fetch-button mt-4">
          <RefreshCw className="h-5 w-5" />
          刷新主动事件
        </button>
        <p className="mt-3 text-xs font-black opacity-55">再次刷新：{formatCooldown(cooldownRemainingMs)}</p>
      </Panel>

      <Panel>
        {suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <SuggestionCard
              key={suggestion.id}
              suggestion={suggestion}
              confirmed={confirmedIds.includes(suggestion.id)}
              onConfirm={confirmSuggestion}
            />
          ))
        ) : (
          <Empty text="点刷新后，这里会出现少量可确认的建议。" />
        )}
      </Panel>
    </section>
  );
}
