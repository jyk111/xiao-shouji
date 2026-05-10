/**
 * Small phone app shell and current production UI.
 * Main functions/components: App, AppErrorBoundary, Desktop, FeatureScreen, XiaohongshuApp, BilibiliScreen, WeChatApp,
 * WeChatApp, ChatScreen, Bubble, repairMojibake,
 * fetchModelList, requestChatCompletion, describeChatMessage, getCharacterPrompt,
 * delay, formatMessageTime, clampNumber,
 * CalendarScreen, ContactsScreen, SettingsScreen, ThemesScreen, VideoCallScreen.
 * State dependencies: useAppStore from src/store.ts; Character/Screen/ThemeType/CalendarEvent/GalleryPhoto types.
 * Utility dependencies: pageApps/dockApps from src/shell/appCatalog.tsx, PhoneScreen from src/apps/phone/PhoneScreen.tsx, GalleryScreen from src/apps/gallery/GalleryScreen.tsx, BilibiliScreen from src/apps/bilibili/BilibiliScreen.tsx, MusicScreen from src/apps/music/MusicScreen.tsx, speakWithConfiguredTts from src/tts.ts, parseCharacterCard from src/lib/charaParser.ts, cn/createId from src/lib/utils.ts.
 * Styling dependencies: src/index.css owns theme variables, phone shell, WeChat, chat, desktop styles.
 * Maintenance note: this file is still the active UI entry; src/pages/* are placeholders until routed in.
 */
import {
  BookOpen,
  Bot,
  CalendarDays,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  Clock,
  Clapperboard,
  Compass,
  Copy,
  Droplets,
  FileText,
  Gift,
  Grid2X2,
  Heart,
  Headphones,
  Image as ImageIcon,
  ImagePlus,
  Import,
  KeyRound,
  Link,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Music,
  Pause,
  Palette,
  Phone,
  Play,
  Plus,
  Quote,
  RefreshCw,
  Search,
  Send,
  Settings,
  Shield,
  ShoppingBag,
  Shuffle,
  SkipBack,
  SkipForward,
  SmilePlus,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Undo2,
  Users,
  UserPlus,
  Video,
  Volume2,
  Wand2,
  Zap,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { parseCharacterCard } from './lib/charaParser';
import { PhoneScreen } from './apps/phone/PhoneScreen';
import { speakWithConfiguredTts } from './tts';
import { BrowserSearchResult, CalendarEvent, Character, ChatMessage, CustomWidget, DiaryEntry, GalleryPhoto, LayoutMode, MemoEntry, MemoEntryColor, MemoEntryType, MusicPlaylist, MusicTrack, Screen, StickerItem, TheaterScene, TheaterWorldBookEntry, ThemeType, useAppStore } from './store';
import { cn, createId } from './lib/utils';
import { BilibiliScreen } from './apps/bilibili/BilibiliScreen';
import { BrowserScreen } from './apps/browser/BrowserScreen';
import { CalendarScreen } from './apps/calendar/CalendarScreen';
import { DiaryScreen } from './apps/diary/DiaryScreen';
import { PeekScreen } from './apps/diary/PeekScreen';
import { MemoScreen } from './apps/memo/MemoScreen';
import { MusicScreen } from './apps/music/MusicScreen';
import { QQScreen } from './apps/qq/QQScreen';
import { SettingsScreen } from './apps/settings/SettingsScreen';
import { ThemesScreen } from './apps/themes/ThemesScreen';
import { PresetsScreen } from './apps/presets/PresetsScreen';
import { LogsScreen } from './apps/logs/LogsScreen';
import { AIContextScreen } from './apps/ai-context/AIContextScreen';
import { ContactsScreen } from './apps/contacts/ContactsScreen';
import { TheaterScreen } from './apps/theater/TheaterScreen';
import { VideoCallScreen } from './apps/video/VideoCallScreen';
import { ChatScreen } from './apps/wechat/chat/ChatScreen';
import { WeChatApp } from './apps/wechat/WeChatApp';
import { XiaohongshuApp } from './apps/xiaohongshu/XiaohongshuApp';
import { GalleryScreen } from './apps/gallery/GalleryScreen';
import { buildXiaohongshuContext } from './apps/xiaohongshu/xiaohongshuLogic';
import type { XiaohongshuNote } from './apps/xiaohongshu/types';
import { dockApps, pageApps } from './shell/appCatalog';
import { buildWeChatSystemPrompt, fallbackWeChatReply, parseWeChatReplyParts } from './apps/wechat/ai/wechatAi';
import type { WeChatAiParsedPart } from './apps/wechat/ai/wechatAiMessages';
import { WeChatChats } from './apps/wechat/chats/WeChatChats';
import { WeChatContacts } from './apps/wechat/contacts/WeChatContacts';
import { WeChatDiscover } from './apps/wechat/discover/WeChatDiscover';
import { WeChatMe } from './apps/wechat/me/WeChatMe';
import { WeChatAvatar } from './apps/wechat/shared/WeChatShared';

const gothicDesktopPositions: Record<string, { x: number; y: number }> = {
  wechat: { x: 24, y: 72 },
  qq: { x: 108, y: 72 },
  gallery: { x: 24, y: 172 },
  calendar: { x: 108, y: 172 },
  diary: { x: 38, y: 382 },
  memo: { x: 132, y: 382 },
  peek: { x: 226, y: 382 },
  'image-bed': { x: 198, y: 86 },
  'time-card': { x: 18, y: 270 },
};

const themeOptions: Array<{ id: ThemeType; name: string; desc: string }> = [
  { id: 'pastel', name: '奶油手绘', desc: '粗描边、浅色块、正常手机桌面。' },
  { id: 'gothic', name: '哥特玻璃', desc: '参考图二的灰黑玻璃手机，叠加红黑素材纹理。' },
];

const presetCards = [
  ['手机沉浸破限预设', '允许模拟微信、QQ、电话、日记、查手机等手机行为。'],
  ['日常陪伴', '适合语音条、聊天、朋友圈评论、生活琐事。'],
  ['剧情推进', '适合小剧场、偷窥 char、隐藏相册、搜索记录。'],
  ['强沉浸通话', '电话/视频通话时强调画面、停顿、环境声。'],
];

function speak(text: string) {
  const { ttsConfig, addAppLog } = useAppStore.getState();
  void speakWithConfiguredTts(text, ttsConfig).catch((error) => {
    addAppLog?.({
      type: 'tts',
      title: 'TTS 播放失败',
      detail: error instanceof Error ? error.message : '未知错误',
    });
  });
}

function normalizeApiBaseUrl(url: string) {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return trimmed.endsWith('/v1') ? trimmed : `${trimmed}/v1`;
}

async function fetchModelList(baseUrl: string, apiKey: string) {
  const endpoint = `${normalizeApiBaseUrl(baseUrl)}/models`;
  const response = await fetch(endpoint, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
  });
  if (!response.ok) throw new Error(`拉取模型失败：${response.status}`);
  const data = await response.json();
  const models = Array.isArray(data?.data)
    ? data.data.map((item: { id?: string }) => item.id).filter(Boolean)
    : [];
  return models as string[];
}

async function requestChatCompletion({
  baseUrl,
  apiKey,
  model,
  messages,
  temperature,
  maxTokens,
}: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  temperature: number;
  maxTokens: number;
}) {
  const endpoint = `${normalizeApiBaseUrl(baseUrl)}/chat/completions`;
  useAppStore.getState().addAppLog?.({
    type: 'ai',
    title: '发送给 AI 的消息',
    detail: JSON.stringify({ endpoint, model, messages, temperature, maxTokens }, null, 2),
  });
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
    }),
  });
  if (!response.ok) {
    useAppStore.getState().addAppLog?.({ type: 'error', title: 'AI 接口失败', detail: `${endpoint}\n${response.status}` });
    throw new Error(`聊天接口失败：${response.status}`);
  }
  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';
  useAppStore.getState().addAppLog?.({ type: 'ai', title: 'AI 返回内容', detail: content });
  return content;
}

async function requestChatCompletionStream({
  baseUrl,
  apiKey,
  model,
  messages,
  temperature,
  onToken,
}: {
  baseUrl: string;
  apiKey: string;
  model: string;
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  temperature: number;
  onToken: (token: string) => void;
}) {
  const endpoint = `${normalizeApiBaseUrl(baseUrl)}/chat/completions`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream: true,
    }),
  });
  if (!response.ok) throw new Error(`聊天接口失败：${response.status}`);
  if ((response.headers.get('content-type') || '').includes('application/json')) {
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    onToken(content);
    return content;
  }
  if (!response.body) {
    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content || '';
    onToken(content);
    return content;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let fullText = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const dataText = trimmed.replace(/^data:\s*/, '');
      if (!dataText || dataText === '[DONE]') continue;
      try {
        const data = JSON.parse(dataText);
        const token = data?.choices?.[0]?.delta?.content || data?.choices?.[0]?.text || '';
        if (token) {
          fullText += token;
          onToken(token);
        }
      } catch {
        // Ignore non-JSON keepalive chunks from OpenAI-compatible gateways.
      }
    }
  }
  return fullText;
}

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function formatMessageTime(timestamp?: number) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function clampNumber(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min;
  return Math.min(max, Math.max(min, value));
}

function describeChatMessage(message: Pick<ChatMessage, 'kind' | 'content' | 'stickerLabel' | 'transcript' | 'recalled' | 'speakerId' | 'amount' | 'note' | 'itemName'>, forAi = false, speakers: Character[] = []) {
  if (message.recalled) return '已撤回一条消息';
  const speaker = message.speakerId ? speakers.find((character) => character.id === message.speakerId)?.name : '';
  const prefix = forAi && speaker ? `${speaker}：` : '';
  if (message.kind === 'sticker') return forAi ? `表情包注释：${message.stickerLabel || '表情包'}` : '表情';
  if (message.kind === 'image') return '图片';
  if (message.kind === 'voice') return `${prefix}${message.transcript || message.content || '语音'}`;
  if (message.kind === 'call-note') return `${prefix}通话：${message.content}`;
  if (message.kind === 'transfer') return `${prefix}转账：${message.amount || message.content}${message.note ? `，${message.note}` : ''}`;
  if (message.kind === 'red-packet') return `${prefix}红包：${message.note || message.content || '恭喜发财，大吉大利'}${message.amount ? `，${message.amount}` : ''}`;
  if (message.kind === 'shopping') return `${prefix}购物：${message.itemName || message.content}${message.amount ? `，${message.amount}` : ''}${message.note ? `，${message.note}` : ''}`;
  return `${prefix}${message.content}`;
}

function stringifyForPrompt(value: unknown, maxLength = 6000) {
  if (!value) return '';
  const text = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  return text.length > maxLength ? `${text.slice(0, maxLength)}\n...` : text;
}

function getCharacterPrompt(character: Character) {
  return [
    `角色名：${character.name}`,
    character.description && `简介：${character.description}`,
    character.personality && `性格：${character.personality}`,
    character.firstMessage && `开场白参考：${character.firstMessage}`,
    character.systemPrompt && `角色系统提示：${character.systemPrompt}`,
    character.worldBook && `世界书：\n${stringifyForPrompt(character.worldBook)}`,
  ].filter(Boolean).join('\n');
}

function formatDateLabel(time: number) {
  const date = new Date(time);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function getDiarySummary(entry: DiaryEntry) {
  return entry.content.replace(/\s+/g, ' ').slice(0, 62) || '还没有正文';
}

function buildMemoWorldContext({
  characters,
  chatSessions,
  wechatMoments,
  purchaseRecords,
  diaries,
  calendarEvents,
  galleryPhotos,
  memos,
  xiaohongshuNotes,
  characterId,
}: {
  characters: Character[];
  chatSessions: Record<string, { characterId: string; messages: ChatMessage[] }>;
  wechatMoments: string[];
  purchaseRecords: Array<{ itemName: string; amount: string; note: string }>;
  diaries: DiaryEntry[];
  calendarEvents: CalendarEvent[];
  galleryPhotos: GalleryPhoto[];
  memos: MemoEntry[];
  xiaohongshuNotes: XiaohongshuNote[];
  characterId?: string;
}) {
  const character = characters.find((item) => item.id === characterId);
  const recentMessages = Object.values(chatSessions)
    .filter((session) => !character || session.characterId === character.id)
    .flatMap((session) => session.messages.slice(-10).map((message) => `${message.role === 'user' ? '用户' : character?.name || 'char'}：${describeChatMessage(message, true, characters)}`))
    .slice(-24)
    .join('\n');
  const moments = wechatMoments.slice(0, 8).map((moment) => `朋友圈：${moment}`).join('\n');
  const orders = purchaseRecords.slice(0, 6).map((record) => `订单：${record.itemName} ${record.amount} ${record.note}`).join('\n');
  const diaryNotes = diaries.slice(0, 5).map((entry) => `日记：${entry.title}：${getDiarySummary(entry)}`).join('\n');
  const calendarNotes = calendarEvents.slice(0, 6).map((event) => `日历：${formatDateLabel(event.startAt)} ${event.title}${event.note ? `：${event.note}` : ''}`).join('\n');
  const photoNotes = galleryPhotos.slice(0, 5).map((photo) => `相册：${photo.title}：${photo.description || photo.note || photo.tags.join('、')}`).join('\n');
  const memoNotes = memos.filter((memo) => !memo.locked).slice(0, 8).map((memo) => `备忘录：${memo.title}：${memo.content}`).join('\n');
  const xiaohongshuContext = xiaohongshuNotes.length > 0 ? buildXiaohongshuContext(xiaohongshuNotes, 8) : '';
  return [
    recentMessages && `最近聊天\n${recentMessages}`,
    moments && `朋友圈\n${moments}`,
    xiaohongshuContext,
    diaryNotes && `最近日记\n${diaryNotes}`,
    calendarNotes && `最近日历\n${calendarNotes}`,
    photoNotes && `最近相册\n${photoNotes}`,
    orders && `最近订单\n${orders}`,
    memoNotes && `已有备忘\n${memoNotes}`,
  ].filter(Boolean).join('\n\n') || '当前没有太多最近记录，请写一条符合角色世界观的短备忘。';
}

function useMemoCharWriterAutomation() {
  const {
    memoCharWriter,
    characters,
    chatSessions,
    wechatMoments,
    purchaseRecords,
    diaries,
    calendarEvents,
    galleryPhotos,
    memos,
    xiaohongshuNotes,
    apiBaseUrl,
    apiKey,
    selectedModel,
    chatTemperature,
    addMemoEntry,
    setMemoCharWriter,
  } = useAppStore();

  useEffect(() => {
    if (!memoCharWriter.enabled || !memoCharWriter.scheduledAt) return;
    const tick = async () => {
      const scheduledAt = memoCharWriter.scheduledAt || 0;
      if (Date.now() < scheduledAt || (memoCharWriter.lastRunAt || 0) >= scheduledAt) return;
      const character = characters.find((item) => item.id === memoCharWriter.characterId) || characters[0];
      if (!character) return;
      setMemoCharWriter({ lastRunAt: Date.now() });
      const context = buildMemoWorldContext({
        characters,
        chatSessions,
        wechatMoments,
        purchaseRecords,
        diaries,
        calendarEvents,
        galleryPhotos,
        memos,
        xiaohongshuNotes,
        characterId: character.id,
      });
      let content = '';
      if (apiBaseUrl && selectedModel) {
        try {
          content = await requestChatCompletion({
            baseUrl: apiBaseUrl,
            apiKey,
            model: selectedModel,
            temperature: chatTemperature,
            maxTokens: 320,
            messages: [
              {
                role: 'system',
                content: [
                  getCharacterPrompt(character) || `你是${character.name}。`,
                  '你会在固定时间打开备忘录，总结最近发生的事，写一条短备忘。只输出备忘录正文，不要编号，不要解释。',
                ].join('\n'),
              },
              {
                role: 'user',
                content: `现在到了设定时间：${new Date(scheduledAt).toLocaleString('zh-CN')}。\n请结合这些最近内容写一条符合世界观的备忘：\n\n${context}`,
              },
            ],
          });
        } catch {
          content = '';
        }
      }
      const finalContent = content.trim() || `${character.name}把最近发生的事整理成一句：明天继续确认那些还没有说完、也不该被忘掉的细节。`;
      addMemoEntry({
        title: `${character.name}的备忘`,
        content: finalContent,
        type: 'note',
        tags: ['给char看', '收藏'],
        color: 'yellow',
        characterId: character.id,
        readableByChar: true,
        reminderAt: scheduledAt,
        pinned: true,
        locked: false,
        completed: false,
        source: 'char',
      });
      setMemoCharWriter({ enabled: false, lastRunAt: Date.now() });
    };
    const timer = window.setInterval(tick, 15000);
    void tick();
    return () => window.clearInterval(timer);
  }, [memoCharWriter, characters, chatSessions, wechatMoments, purchaseRecords, diaries, calendarEvents, galleryPhotos, memos, apiBaseUrl, apiKey, selectedModel, chatTemperature, addMemoEntry, setMemoCharWriter]);
}

export default function App() {
  const { theme, activeScreen } = useAppStore();
  useMemoCharWriterAutomation();

  return (
    <AppErrorBoundary>
      <div className={cn('min-h-screen phone-stage flex items-center justify-center bg-[#101010] p-2 sm:p-4', `theme-${theme}`)}>
        <main className={cn('phone-shell relative h-[844px] max-h-[calc(100dvh-16px)] w-[390px] max-w-full overflow-hidden bg-[var(--phone-bg)] text-[var(--phone-text)] rounded-[34px] border-[8px] border-[#111]', `screen-${activeScreen}`)}>
          <GlobalMusicAudio />
          {activeScreen === 'desktop' && <Desktop />}
          {activeScreen === 'chat' && <ChatScreen />}
          {activeScreen !== 'desktop' && activeScreen !== 'chat' && <FeatureScreen screen={activeScreen} />}
        </main>
      </div>
    </AppErrorBoundary>
  );
}

function GlobalMusicAudio() {
  const { musicTracks, musicPlayer, setMusicPlayer } = useAppStore();
  const currentTrack = musicTracks.find((track) => track.id === musicPlayer.trackId);
  const lastTrackId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const audio = document.getElementById('global-music-audio') as HTMLAudioElement | null;
    if (!audio || !currentTrack?.audioUrl) return;
    if (lastTrackId.current !== currentTrack.id && audio.src !== currentTrack.audioUrl) {
      audio.src = currentTrack.audioUrl;
      lastTrackId.current = currentTrack.id;
    }
    if (musicPlayer.playing) {
      audio.play().catch(() => setMusicPlayer({ playing: false }));
    } else {
      audio.pause();
      audio.muted = false;
      audio.volume = 1;
    }
  }, [currentTrack?.audioUrl, currentTrack?.id, musicPlayer.playing, setMusicPlayer]);

  return (
    <audio
      id="global-music-audio"
      preload="auto"
      className="hidden"
      onLoadedMetadata={(event) => setMusicPlayer({ duration: Number.isFinite(event.currentTarget.duration) ? event.currentTarget.duration : 0 })}
      onTimeUpdate={(event) => {
        const audio = event.currentTarget;
        const duration = Number.isFinite(audio.duration) ? audio.duration : musicPlayer.duration;
        setMusicPlayer({ duration, progress: duration > 0 ? (audio.currentTime / duration) * 100 : 0 });
      }}
      onEnded={(event) => {
        if (musicPlayer.repeat) {
          event.currentTarget.currentTime = 0;
          event.currentTarget.play().catch(() => setMusicPlayer({ playing: false }));
          setMusicPlayer({ playing: true, progress: 0 });
          return;
        }
        setMusicPlayer({ playing: false, progress: 100 });
      }}
      onError={() => setMusicPlayer({ playing: false })}
    />
  );
}

class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, { message: string | null }> {
  declare props: Readonly<{ children: React.ReactNode }>;

  state = { message: null };

  static getDerivedStateFromError(error: unknown) {
    return { message: error instanceof Error ? error.message : '未知界面错误' };
  }

  render() {
    if (this.state.message) {
      return (
        <div className="min-h-screen bg-[#101010] p-4 text-[#111]">
          <main className="mx-auto flex h-[844px] max-h-[calc(100dvh-32px)] w-[390px] max-w-full flex-col justify-center rounded-[34px] border-[8px] border-[#111] bg-[#fffaf0] p-6">
            <h1 className="text-2xl font-black">小手机界面崩了</h1>
            <p className="mt-3 rounded-2xl border-[3px] border-[#111] bg-white p-4 text-sm font-bold leading-relaxed">
              {this.state.message}
            </p>
            <button type="button" onClick={() => window.location.reload()} className="fetch-button mt-5">
              重新载入
            </button>
          </main>
        </div>
      );
    }

    return this.props.children;
  }
}

function Desktop() {
  const {
    theme,
    setScreen,
    imageBed,
    setImageBed,
    layoutPositions,
    setLayoutPosition,
    layoutMode,
    setLayoutMode,
    desktopPage,
    setDesktopPage,
    customWidgets,
    addCustomWidget,
    updateCustomWidget,
    removeCustomWidget,
  } = useAppStore();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [showWidgetPicker, setShowWidgetPicker] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const page = desktopPage;
  const now = new Date();
  const dateText = now.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric', weekday: 'long' });
  const themedPos = (id: string, fallback: { x: number; y: number }) =>
    theme === 'gothic' ? gothicDesktopPositions[id] || fallback : fallback;

  const uploadImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageBed(reader.result as string);
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <section className={cn('cream-screen relative h-full overflow-hidden px-5 pb-28 pt-10', editMode && 'select-none')}>
      <div className="layout-controls">
        <button onClick={() => setEditMode(!editMode)} className={cn('layout-toggle', editMode && 'active')}>
          {editMode ? '完成' : '编辑布局'}
        </button>
        {editMode && (
          <>
            <button onClick={() => setLayoutMode(layoutMode === 'snap' ? 'free' : 'snap')} className="layout-toggle">
              {layoutMode === 'snap' ? '自动对齐' : '自由移动'}
            </button>
            <button onClick={() => setShowWidgetPicker(true)} className="layout-toggle">
              <Plus className="h-3.5 w-3.5" /> 添加组件
            </button>
          </>
        )}
      </div>

      <div ref={canvasRef} className={cn('desktop-canvas', layoutMode === 'snap' && editMode && 'snap-grid')}>
        {page === 0 && (
          <>
            <Draggable id="image-bed" defaultPos={themedPos('image-bed', { x: 188, y: 24 })} editMode={editMode} layoutMode={layoutMode} canvasRef={canvasRef} positions={layoutPositions} setPosition={setLayoutPosition}>
              <button onClick={() => !editMode && imageInputRef.current?.click()} className="image-bed">
                {imageBed ? <img src={imageBed} className="h-full w-full object-cover" /> : <><ImageIcon className="mb-2 h-10 w-10" /><span>图床</span></>}
              </button>
            </Draggable>
            <input ref={imageInputRef} type="file" accept="image/*" onChange={uploadImage} className="hidden" />

            <Draggable id="time-card" defaultPos={themedPos('time-card', { x: 20, y: 242 })} editMode={editMode} layoutMode={layoutMode} canvasRef={canvasRef} positions={layoutPositions} setPosition={setLayoutPosition}>
              <div className="time-card">
                <div className="min-w-0">
                  <div className="time-text">{now.toLocaleTimeString('zh-CN', { hour12: false })}</div>
                  <div className="date-text">{dateText}</div>
                </div>
                <button onClick={() => !editMode && setShowGuide(!showGuide)} className="guide-mark" aria-label="教程">
                  42
                  <Sparkles className="absolute -right-2 -top-2 h-5 w-5 fill-[#f9e58f] text-[#111]" />
                </button>
              </div>
            </Draggable>
          </>
        )}

        {pageApps.filter((app) => app.page === page).map((app) => (
          <Draggable key={app.id} id={app.id} defaultPos={themedPos(app.id, { x: app.x, y: app.y })} editMode={editMode} layoutMode={layoutMode} canvasRef={canvasRef} positions={layoutPositions} setPosition={setLayoutPosition}>
            <AppIcon {...app} onClick={() => !editMode && setScreen(app.screen)} />
          </Draggable>
        ))}

        {customWidgets.filter((widget) => widget.page === page).map((widget) => (
          <Draggable key={widget.id} id={`widget-${widget.id}`} defaultPos={{ x: widget.x, y: widget.y }} editMode={editMode} layoutMode={layoutMode} canvasRef={canvasRef} positions={layoutPositions} setPosition={setLayoutPosition}>
            <CustomWidgetView widget={widget} editMode={editMode} updateWidget={updateCustomWidget} removeWidget={removeCustomWidget} />
          </Draggable>
        ))}
      </div>

      <div className="page-dots">
        <button onClick={() => setDesktopPage(0)} className={cn(page === 0 && 'active')} />
        <button onClick={() => setDesktopPage(1)} className={cn(page === 1 && 'active')} />
      </div>

      {showGuide && (
        <div className="guide-modal">
          <div className="guide-panel">
            <button onClick={() => setShowGuide(false)} className="widget-delete guide-close">
              ×
            </button>
            <h2>小手机教程</h2>
            <p>通讯录负责导入和编辑酒馆卡，保存后会回到通讯录列表。微信里包含朋友圈和视频通话。</p>
            <p>点“编辑布局”后可以拖动 app、图床、时间和小组件。布局模式可以在自动对齐和自由移动之间切换。</p>
            <p>点“添加组件”会打开选择面板，可以添加便签、照片或状态组件。组件在编辑模式下可以改字、传照片、删除。</p>
          </div>
        </div>
      )}

      {showWidgetPicker && (
        <div className="guide-modal">
          <div className="guide-panel compact">
            <button onClick={() => setShowWidgetPicker(false)} className="widget-delete guide-close">
              ×
            </button>
            <h2>添加小组件</h2>
            <div className="widget-picker">
              <button onClick={() => { addCustomWidget(page, 'note'); setShowWidgetPicker(false); }} className="feature-tile">便签</button>
              <button onClick={() => { addCustomWidget(page, 'photo'); setShowWidgetPicker(false); }} className="feature-tile">照片</button>
              <button onClick={() => { addCustomWidget(page, 'status'); setShowWidgetPicker(false); }} className="feature-tile">状态</button>
            </div>
          </div>
        </div>
      )}

      <div className="dock">
        {dockApps.map((app) => (
          <button key={app.label} onClick={() => setScreen(app.screen)} className="flex flex-col items-center gap-1">
            <span className={cn('dock-icon', app.color)}>
              {React.cloneElement(app.icon as React.ReactElement<{ className?: string }>, { className: 'h-6 w-6' })}
            </span>
            <span className="text-[11px] font-black">{app.label}</span>
          </button>
        ))}
      </div>
    </section>
  );
}

function Draggable({
  id,
  defaultPos,
  editMode,
  layoutMode,
  canvasRef,
  positions,
  setPosition,
  children,
}: {
  key?: React.Key;
  id: string;
  defaultPos: { x: number; y: number };
  editMode: boolean;
  layoutMode: LayoutMode;
  canvasRef: React.RefObject<HTMLDivElement | null>;
  positions: Record<string, { x: number; y: number }>;
  setPosition: (id: string, position: { x: number; y: number }) => void;
  children: React.ReactNode;
}) {
  const position = positions[id] || defaultPos;

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!editMode) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const startX = event.clientX - rect.left - position.x;
    const startY = event.clientY - rect.top - position.y;
    const target = event.currentTarget;
    target.setPointerCapture(event.pointerId);

    const move = (moveEvent: PointerEvent) => {
      const rawX = moveEvent.clientX - rect.left - startX;
      const rawY = moveEvent.clientY - rect.top - startY;
      const snappedX = layoutMode === 'snap' ? Math.round(rawX / 16) * 16 : rawX;
      const snappedY = layoutMode === 'snap' ? Math.round(rawY / 16) * 16 : rawY;
      const nextX = Math.max(0, Math.min(rect.width - target.offsetWidth, snappedX));
      const nextY = Math.max(0, Math.min(rect.height - target.offsetHeight, snappedY));
      setPosition(id, { x: nextX, y: nextY });
    };

    const stop = () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', stop);
    };

    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', stop);
  };

  return (
    <div className={cn('draggable-item', editMode && 'editing')} style={{ left: position.x, top: position.y }} onPointerDown={startDrag}>
      {children}
    </div>
  );
}

function CustomWidgetView({
  widget,
  editMode,
  updateWidget,
  removeWidget,
}: {
  widget: CustomWidget;
  editMode: boolean;
  updateWidget: (id: string, updates: Partial<CustomWidget>) => void;
  removeWidget: (id: string) => void;
}) {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const uploadWidgetImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => updateWidget(widget.id, { image: reader.result as string });
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className={cn('custom-widget', `widget-${widget.type}`)}>
      {editMode && (
        <button
          className="widget-delete"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            removeWidget(widget.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      {editMode ? (
        <>
          <input
            value={widget.title}
            onPointerDown={(event) => event.stopPropagation()}
            onChange={(event) => updateWidget(widget.id, { title: event.target.value })}
            className="widget-input font-black"
          />
          {widget.type === 'photo' && (
            <>
              <button
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  photoInputRef.current?.click();
                }}
                className="widget-photo-button"
              >
                {widget.image ? <img src={widget.image} className="h-full w-full object-cover" /> : '上传照片'}
              </button>
              <input ref={photoInputRef} type="file" accept="image/*" onChange={uploadWidgetImage} className="hidden" />
            </>
          )}
          <textarea
            value={widget.content}
            onPointerDown={(event) => event.stopPropagation()}
            onChange={(event) => updateWidget(widget.id, { content: event.target.value })}
            className="widget-input mt-2 min-h-12 resize-none text-sm"
          />
        </>
      ) : (
        <>
          {widget.type === 'photo' && widget.image && <img src={widget.image} className="mb-2 h-20 w-full rounded-xl border-2 border-[#111] object-cover" />}
          <p className="font-black">{widget.title}</p>
          <p className="mt-1 text-sm font-bold opacity-70">{widget.type === 'photo' && !widget.content ? '编辑布局后可上传照片/填描述' : widget.content}</p>
        </>
      )}
    </div>
  );
}

function AppIcon({ label, icon, color, onClick }: { key?: React.Key; label: string; icon: React.ReactNode; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="app-button">
      <span className={cn('app-icon', color)}>{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-7 w-7' })}</span>
      <span className="app-label">{label}</span>
    </button>
  );
}

function Header({
  title,
  subtitle,
  tabs,
  onSave,
  onBack,
  saveLabel = '保存',
}: {
  title: string;
  subtitle?: string;
  tabs?: React.ReactNode;
  onSave?: () => void;
  onBack?: () => void;
  saveLabel?: string;
}) {
  const { goBack } = useAppStore();
  return (
    <header className="sticky top-0 z-30 bg-[var(--phone-bg)] px-4 pb-4 pt-6">
      <div className="grid grid-cols-[48px_1fr_56px] items-center">
        <button onClick={onBack || goBack} className="circle-button">
          <ChevronLeft className="h-7 w-7" />
        </button>
        <div className="min-w-0 text-center">
          <h1 className="truncate text-2xl font-black">{title}</h1>
          {subtitle && <p className="truncate text-xs font-bold opacity-60">{subtitle}</p>}
        </div>
        {onSave ? <button onClick={onSave} className="save-button">{saveLabel}</button> : <span />}
      </div>
      {tabs && <div className="no-scrollbar mt-5 flex gap-2 overflow-x-auto">{tabs}</div>}
    </header>
  );
}

function FeatureScreen({ screen }: { screen: Screen }) {
  if (screen === 'wechat') return <WeChatApp />;
  if (screen === 'qq') return <QQScreen />;
  if (screen === 'phone') return <PhoneScreen />;
  if (screen === 'video') return <VideoCallScreen />;
  if (screen === 'diary') return <DiaryScreen />;
  if (screen === 'calendar') return <CalendarScreen />;
  if (screen === 'gallery') return <GalleryScreen />;
  if (screen === 'peek') return <PeekScreen />;
  if (screen === 'settings') return <SettingsScreen />;
  if (screen === 'themes') return <ThemesScreen />;
  if (screen === 'presets') return <PresetsScreen />;
  if (screen === 'logs') return <LogsScreen />;
  if (screen === 'ai-context') return <AIContextScreen />;
  if (screen === 'import' || screen === 'contacts') return <ContactsScreen />;
  if (screen === 'memo') return <MemoScreen />;
  if (screen === 'browser') return <BrowserScreen />;
  if (screen === 'bilibili') return <BilibiliScreen />;
  if (screen === 'xiaohongshu') return <XiaohongshuApp />;
  if (screen === 'music') return <MusicScreen />;
  if (screen === 'theater') return <TheaterScreen />;

  const copy: Record<string, [string, string, string[]]> = {
    gallery: ['相册 / 图床', '上传图片，给 char 看，也能换壁纸。', ['图床点击上传照片', '相册分类：自拍、截图、风景、隐藏相册', '后续接图片理解，让 char 点评生活']],
    calendar: ['日历', '纪念日、约会、事件提醒。', ['日程安排', '生日/纪念日', '触发剧情事件']],
    moments: ['朋友圈', '动态、评论、可见范围。', ['char 发动态', 'NPC 评论区', '仅你可见 / 不让你看见']],
    xiaohongshu: ['小红书', '图文笔记和生活感。', ['穿搭/探店/心情帖子', '收藏夹', '评论互动']],
    bilibili: ['B站', '视频、弹幕、评论区。', ['刷到的视频', 'char 投稿', '弹幕吐槽']],
    theater: ['小剧场', '输入主题生成角色剧情。', ['日常/暧昧/吵架/梦境', '可保存到日记', '可变成聊天事件']],
    music: ['音乐', '一起听歌和共同歌单。', ['播放页', '共同听过的歌', '歌单心情']],
    browser: ['浏览器', '搜索记录和浏览历史。', ['搜索历史', '浏览记录', '隐藏标签页']],
  };
  const [title, subtitle, bullets] = copy[screen] || ['功能', '先占位，后面继续填。', []];

  return (
    <section className="h-full overflow-y-auto pb-8">
      <Header title={title} subtitle={subtitle} />
      <Panel>
        {bullets.map((item) => (
          <Row key={item} icon={<Sparkles />} title={item} desc="保留入口和数据结构，下一步接 AI 生成逻辑。" />
        ))}
      </Panel>
    </section>
  );
}

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

function Pill({ icon, label, active, onClick }: { key?: React.Key; icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn('pill', active && 'active')}>
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-4 w-4' })}
      {label}
    </button>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <label className="mb-5 block last:mb-0">
      <span className="mb-2 flex items-center gap-2 text-lg font-black">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5' })}
        {label}
      </span>
      {children}
    </label>
  );
}

function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('hand-panel mx-4 mt-4 p-5', className)}>{children}</div>;
}

function Row({ icon, title, desc }: { key?: React.Key; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex gap-3 border-b-[2px] border-[#111]/15 py-3 last:border-b-0">
      <div className="app-chip">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5' })}
      </div>
      <div className="min-w-0">
        <p className="text-lg font-black">{title}</p>
        <p className="line-clamp-2 text-sm font-bold opacity-60">{desc}</p>
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm font-black opacity-55">{text}</p>;
}

function EmptyScreen({ title }: { title: string }) {
  return (
    <section className="h-full overflow-y-auto pb-8">
      <Header title={title} />
      <Empty text="返回桌面重新选择。" />
    </section>
  );
}

function Avatar({ character, large }: { character?: Character; large?: boolean }) {
  const size = large ? 'h-24 w-24' : 'h-12 w-12';
  return (
    <div className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-2xl border-[3px] border-[#111] bg-white', size)}>
      {character?.avatar ? <img src={character.avatar} className="h-full w-full object-cover" /> : <CircleUserRound className="h-1/2 w-1/2 opacity-60" />}
    </div>
  );
}

function CallButton({ icon, label, danger, onClick }: { icon: React.ReactNode; label: string; danger?: boolean; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn('call-button', danger ? 'bg-[#ff7b7b]' : 'bg-white')}>
      {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-5 w-5' })}
      {label}
    </button>
  );
}


