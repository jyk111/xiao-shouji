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
import type { DiaryEntry } from '../../store';
import { useAppStore } from '../../store';

function formatDateLabel(time: number) {
  const date = new Date(time);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function getDiarySummary(entry: DiaryEntry) {
  return entry.content.replace(/\s+/g, ' ').slice(0, 62) || '还没有正文';
}

export function PeekScreen() {
  const { characters, diaries, memos, calendarEvents, galleryPhotos } = useAppStore();
  const character = characters[0];
  const latestCharDiary = diaries.find((entry) => entry.owner === 'char') || diaries[0];
  const peekCalendarEvents = calendarEvents
    .filter((event) => event.owner !== 'user')
    .filter((event) => !character || !event.characterId || event.characterId === character.id)
    .slice(0, 2);
  const diaryDesc = latestCharDiary
    ? `${latestCharDiary.title}：${getDiarySummary(latestCharDiary)}`
    : '还没有日记';
  const calendarDesc = peekCalendarEvents.length > 0
    ? peekCalendarEvents.map((event) => `${formatDateLabel(event.startAt)} ${event.title}`).join('；')
    : '还没有可查看日程';
  const readablePhotos = galleryPhotos
    .filter((photo) => photo.readableByChar && !photo.hidden)
    .filter((photo) => !character || !photo.characterId || photo.characterId === character.id)
    .slice(0, 2);
  const photoDesc = readablePhotos.length > 0
    ? readablePhotos.map((photo) => `${photo.title}：${photo.description || photo.tags.join('、') || '还没有描述'}`).join('；')
    : '还没有可读取照片';
  const readableMemos = memos
    .filter((memo) => memo.readableByChar && !memo.locked)
    .filter((memo) => !character || !memo.characterId || memo.characterId === character.id)
    .slice(0, 2);
  const memoDesc = readableMemos.length > 0
    ? readableMemos.map((memo) => `${memo.title}：${memo.content.slice(0, 42) || memo.tags.join('、')}`).join('；')
    : '还没有可读取备忘录';
  return (
    <section className="h-full overflow-y-auto pb-8">
      <Header title="查手机" subtitle="偷看 char 的手机内容" />
      <Panel>
        <Row icon={<MessageCircle />} title="聊天记录" desc={character ? `查看 ${character.name} 的微信/QQ 对话` : '导入角色后显示'} />
        <Row icon={<BookOpen />} title="日记" desc={diaryDesc} />
        <Row icon={<CalendarDays />} title="日历" desc={calendarDesc} />
        <Row icon={<ImageIcon />} title="相册" desc={photoDesc} />
        <Row icon={<FileText />} title="备忘录" desc={memoDesc} />
        <Row icon={<Search />} title="搜索记录" desc="后续生成 char 搜过什么、看过什么网页。" />
        <Row icon={<ImageIcon />} title="隐藏相册" desc="后续接图片上传和角色点评。" />
      </Panel>
    </section>
  );
}
