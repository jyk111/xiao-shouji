import {
  Bot,
  Camera,
  ChevronLeft,
  CircleUserRound,
  Compass,
  Copy,
  Gift,
  Image as ImageIcon,
  ImagePlus,
  MessageCircle,
  Mic,
  MoreHorizontal,
  Phone,
  Plus,
  Quote,
  RefreshCw,
  Search,
  Send,
  ShoppingBag,
  SmilePlus,
  Sparkles,
  Star,
  Trash2,
  Undo2,
  Users,
  UserPlus,
  Video,
  Volume2,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

import { cn, createId } from '../../lib/utils';
import { speakWithConfiguredTts } from '../../tts';
import type { Character, ChatMessage, Screen, StickerItem } from '../../store';
import { useAppStore } from '../../store';
import { Header, Panel, Empty, EmptyScreen, Avatar, CallButton } from '../shared/AppPrimitives';
import { delay, describeChatMessage, getCharacterPrompt, requestChatCompletion } from '../shared/aiText';
import { buildWeChatSystemPrompt, fallbackWeChatReply, parseWeChatReplyParts } from './ai/wechatAi';
import type { WeChatAiParsedPart } from './ai/wechatAiMessages';
import { WeChatChats } from './chats/WeChatChats';
import { WeChatContacts } from './contacts/WeChatContacts';
import { WeChatDiscover } from './discover/WeChatDiscover';
import { WeChatMe } from './me/WeChatMe';
import { formatMessageTime, WeChatAvatar } from './shared/WeChatShared';

function speak(text: string) {
  const { ttsConfig } = useAppStore.getState();
  speakWithConfiguredTts(text, ttsConfig);
}

type WeChatTab = 'chats' | 'contacts' | 'discover' | 'me';

export function WeChatApp() {
  const [tab, setTab] = useState<WeChatTab>('chats');
  const chatSessions = useAppStore((state) => state.chatSessions);
  const wechatPhotos = useAppStore((state) => state.wechatPhotos);
  const unreadCount = Object.values(chatSessions)
    .filter((session) => session.channel === 'wechat')
    .reduce((count, session) => count + (session.unread || 0), 0);

  return (
    <section className="wechat-shell flex h-full flex-col">
      <div className="min-h-0 flex-1 overflow-hidden">
        {tab === 'chats' && <WeChatChats onAddFriend={() => setTab('contacts')} />}
        {tab === 'contacts' && <WeChatContacts />}
        {tab === 'discover' && <WeChatDiscover />}
        {tab === 'me' && <WeChatMe />}
      </div>
      <nav className="wechat-tabs">
        <WeChatTabButton active={tab === 'chats'} icon={<MessageCircle />} label="微信" badge={unreadCount || undefined} onClick={() => setTab('chats')} />
        <WeChatTabButton active={tab === 'contacts'} icon={<Users />} label="通讯录" onClick={() => setTab('contacts')} />
        <WeChatTabButton active={tab === 'discover'} icon={<Compass />} label="发现" badge={wechatPhotos.length > 0 ? 'dot' : undefined} onClick={() => setTab('discover')} />
        <WeChatTabButton active={tab === 'me'} icon={<CircleUserRound />} label="我" onClick={() => setTab('me')} />
      </nav>
    </section>
  );
}

function WeChatTabButton({
  active,
  icon,
  label,
  badge,
  onClick,
}: {
  active: boolean;
  icon: React.ReactNode;
  label: string;
  badge?: number | 'dot';
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className={cn('wechat-tab-button', active && 'active')}>
      <span className="wechat-tab-icon">
        {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'h-6 w-6' })}
        {badge !== undefined && <span className={cn('wechat-tab-badge', badge === 'dot' && 'dot')}>{badge === 'dot' ? '' : badge}</span>}
      </span>
      <span>{label}</span>
    </button>
  );
}

export function ChatList({ channel }: { channel: 'wechat' | 'qq' }) {
  const { characters, chatSessions, openChat, setScreen } = useAppStore();
  const title = channel === 'wechat' ? '微信' : 'QQ';
  const sessions = Object.values(chatSessions).filter((session) => session.channel === channel);

  return (
    <section className="h-full overflow-y-auto pb-8">
      <Header title={title} subtitle={channel === 'wechat' ? '聊天、群聊、朋友圈、语音条、TTS' : '单聊、群聊、空间、戳一戳、语音'} />
      <Panel>
        <button onClick={() => setScreen('contacts')} className="fetch-button mb-4">
          <UserPlus className="h-5 w-5" />
          去通讯录导入酒馆卡
        </button>
        {characters.length === 0 && <Empty text="还没有角色。先导入 PNG/JSON 酒馆卡。" />}
        {characters.map((character) => {
          const session = sessions.find((item) => item.characterId === character.id);
          const lastMessage = session?.messages.at(-1);
          return (
            <button key={character.id} onClick={() => openChat(character.id, channel)} className="list-row">
              <Avatar character={character} />
              <div className="min-w-0 flex-1 text-left">
                <p className="truncate text-lg font-black">{character.name}</p>
                <p className="truncate text-sm opacity-65">{lastMessage ? describeChatMessage(lastMessage) : character.firstMessage || '点开建立聊天会话'}</p>
              </div>
            </button>
          );
        })}
      </Panel>
    </section>
  );
}

type PendingChatDraft = {
  content: string;
  replyTo?: string;
  kind: 'text' | 'voice' | 'image' | 'sticker';
};

export function ChatScreen() {
  const {
    activeChatId,
    activeChannel,
    characters,
    groupChats,
    chatSessions,
    addMessage,
    deleteMessage,
    toggleMessageFavorite,
    recallMessage,
    addPurchaseRecord,
    goBack,
    stickers,
    ttsEnabled,
    apiBaseUrl,
    apiKey,
    selectedModel,
    chatPresetPrompt,
    chatContextDepth,
    chatTemperature,
    chatMaxTokens,
    chatReplyStyle,
  } = useAppStore();
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [showPlusPanel, setShowPlusPanel] = useState(false);
  const [replyDraft, setReplyDraft] = useState<string | null>(null);
  const [lifeComposer, setLifeComposer] = useState<'transfer' | 'red-packet' | 'shopping' | null>(null);
  const [lifeDraft, setLifeDraft] = useState({ amount: '', note: '', itemName: '' });
  const [pendingUserDrafts, setPendingUserDrafts] = useState<PendingChatDraft[]>([]);
  const [failedDraft, setFailedDraft] = useState<{ drafts: PendingChatDraft[]; mode: 'text' | 'voice'; error?: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeToolMessageId, setActiveToolMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const directCharacter = characters.find((item) => item.id === activeChatId);
  const activeGroup = groupChats.find((item) => item.id === activeChatId);
  const groupMembers = activeGroup
    ? activeGroup.memberIds
        .map((id) => characters.find((item) => item.id === id))
        .filter((item): item is Character => Boolean(item))
    : [];
  const character = directCharacter || (activeGroup
    ? {
        id: activeGroup.id,
        name: activeGroup.name,
        avatar: '',
        description: `微信群聊，成员：${activeGroup.memberIds.map((id) => characters.find((item) => item.id === id)?.name).filter(Boolean).join('、')}`,
        personality: '群聊会自然地出现不同成员的短回复。',
        firstMessage: `${activeGroup.name} 已创建，可以开始聊天。`,
        systemPrompt: [
          `你正在模拟微信群聊「${activeGroup.name}」。`,
          '你要同时扮演群里的多个成员，不要只扮演一个人。',
          '每条回复用「成员名：消息内容」格式，像微信群里不同人轮流说话。',
          activeGroup.memberIds
            .map((id) => characters.find((item) => item.id === id))
            .filter((item): item is Character => Boolean(item))
            .map((item) => getCharacterPrompt(item))
            .join('\n\n---\n\n'),
        ].filter(Boolean).join('\n\n'),
      } satisfies Character
    : undefined);
  const session = activeChatId ? chatSessions[`${activeChannel}:${activeChatId}`] : undefined;
  const messages = session?.messages || [];
  const isWechat = activeChannel === 'wechat';
  const chatSubtitle = activeGroup ? `${groupMembers.length}个成员` : activeChannel === 'qq' ? 'QQ聊天' : '';

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, activeChatId]);

  if (!character || !activeChatId) return <EmptyScreen title="没有选中角色" />;

  const formatDrafts = (drafts: PendingChatDraft[]) =>
    drafts.map((draft, index) => {
      const prefix = drafts.length > 1 ? `第${index + 1}条：` : '';
      return `${prefix}${draft.replyTo ? `引用「${draft.replyTo}」回复：` : ''}${draft.content}`;
    }).join('\n');

  const pickStickerForMood = (mood?: string) => {
    if (stickers.length === 0) return undefined;
    const keyword = (mood || '').toLowerCase();
    return stickers.find((sticker) => sticker.label.toLowerCase().includes(keyword)) || stickers[0];
  };

  const buildLifeMessage = (part: WeChatAiParsedPart, speaker?: Character): ChatMessage => {
    const base = {
      id: createId('msg'),
      role: 'model' as const,
      timestamp: Date.now(),
      speakerId: activeGroup && speaker ? speaker.id : undefined,
    };
    if (part.kind === 'sticker') {
      const sticker = pickStickerForMood(part.mood || part.label);
      if (!sticker) {
        return {
          ...base,
          content: part.label || part.mood || '发你一个表情。',
          kind: 'text',
        };
      }
      return {
        ...base,
        content: sticker.url,
        kind: 'sticker',
        stickerLabel: sticker.label,
      };
    }
    if (part.kind === 'transfer') {
      return {
        ...base,
        content: part.note || '转账',
        kind: 'transfer',
        amount: part.amount,
        note: part.note,
        status: 'pending',
      };
    }
    if (part.kind === 'red-packet') {
      return {
        ...base,
        content: part.note || '恭喜发财，大吉大利',
        kind: 'red-packet',
        amount: part.amount,
        note: part.note || '恭喜发财，大吉大利',
        status: 'pending',
      };
    }
    if (part.kind === 'shopping') {
      return {
        ...base,
        content: part.note || part.itemName,
        kind: 'shopping',
        itemName: part.itemName,
        amount: part.amount,
        note: part.note,
      };
    }
    return {
      ...base,
      content: part.content,
      kind: 'text',
    };
  };

  const addAssistantReply = async (drafts: PendingChatDraft[], responseMode: 'text' | 'voice') => {
    const content = formatDrafts(drafts);
    setIsTyping(true);
    const styleInstruction =
      chatReplyStyle === 'single'
        ? '这次尽量只回复一条微信气泡。'
        : chatReplyStyle === 'burst'
          ? '这次允许像真人一样连发两到四条短微信气泡；每条气泡单独一行。'
          : '这次根据角色性格决定一条还是多条；如果拆成多条，每条气泡单独一行。';

    const spokenReplies: string[] = [];
    const requestOneReply = async (speaker: Character, memberInstruction = '') => {
      const reply = apiBaseUrl && selectedModel
        ? await requestChatCompletion({
          baseUrl: apiBaseUrl,
          apiKey,
          model: selectedModel,
          temperature: chatTemperature,
          maxTokens: chatMaxTokens,
          messages: [
            {
              role: 'system',
              content: buildWeChatSystemPrompt({
                characterPrompt: getCharacterPrompt(character),
                characterName: character.name,
                memberInstruction,
                chatPresetPrompt,
                styleInstruction,
              }),
            },
            ...messages.slice(-Math.max(4, chatContextDepth)).filter((message) => !message.recalled).map((message) => ({
              role: message.role === 'model' ? 'assistant' as const : 'user' as const,
              content: describeChatMessage(message, true, characters),
            })),
            { role: 'user', content },
          ],
        })
        : fallbackWeChatReply(content, responseMode, chatReplyStyle, speaker, memberInstruction);
      return parseWeChatReplyParts(reply, chatReplyStyle, speaker.name);
    };

    const speakers = activeGroup && groupMembers.length > 0 ? groupMembers : [character];
    for (let speakerIndex = 0; speakerIndex < speakers.length; speakerIndex += 1) {
      const speaker = speakers[speakerIndex];
      const memberInstruction = activeGroup
        ? [
            `现在只允许你扮演群成员「${speaker.name}」。`,
            getCharacterPrompt(speaker),
            `你是群聊「${activeGroup.name}」中的一个成员。轮到你发言，按你自己的人设回应用户刚才的消息。`,
          ].join('\n')
        : '';
      const parts = await requestOneReply(speaker, memberInstruction);
      for (let index = 0; index < parts.length; index += 1) {
        const part = parts[index];
        const speakable = part.kind === 'text' ? part.content : part.kind === 'sticker' ? '表情包' : describeChatMessage(buildLifeMessage(part, speaker));
        await delay(Math.min(1400, Math.max(420, speakable.length * 55)));
        const message = buildLifeMessage(part, speaker);
        if (part.kind === 'text' && responseMode === 'voice') {
          message.kind = 'voice';
          message.duration = Math.max(2, Math.ceil(message.content.length / 4));
          message.transcript = message.content;
        }
        message.timestamp = Date.now() + index + speakerIndex;
        addMessage(activeChatId, activeChannel, message);
        if (message.kind === 'shopping') {
          addPurchaseRecord({
            characterId: speaker.id,
            itemName: message.itemName || message.content,
            amount: message.amount || '',
            note: message.note || '微信聊天里提到的购物',
          });
        }
        if (message.kind === 'text' || message.kind === 'voice') spokenReplies.push(message.content);
      }
    }
    setIsTyping(false);
    if (ttsEnabled && responseMode === 'voice' && !activeGroup) speak(spokenReplies.join('\n'));
  };

  const send = async () => {
    const content = input.trim();
    if (sending) return;
    if (!content) {
      if (pendingUserDrafts.length === 0) return;
      const responseMode = pendingUserDrafts.some((draft) => draft.kind === 'voice') ? 'voice' : 'text';
      setSending(true);
      try {
        await addAssistantReply(pendingUserDrafts, responseMode);
        setPendingUserDrafts([]);
        setFailedDraft(null);
      } catch (error) {
        setFailedDraft({ drafts: pendingUserDrafts, mode: responseMode, error: error instanceof Error ? error.message : undefined });
      } finally {
        setIsTyping(false);
        setSending(false);
      }
      return;
    }
    const kind = mode === 'voice' ? 'voice' : 'text';
    const replyTo = replyDraft || undefined;
    addMessage(activeChatId, activeChannel, {
      id: createId('msg'),
      role: 'user',
      content,
      timestamp: Date.now(),
      kind,
      duration: Math.max(2, Math.ceil(content.length / 4)),
      transcript: kind === 'voice' ? content : undefined,
      replyTo,
    });
    setPendingUserDrafts((drafts) => [...drafts, { content, replyTo, kind }]);
    setInput('');
    setReplyDraft(null);
    setFailedDraft(null);
  };

  const retryFailed = async () => {
    if (!failedDraft || sending) return;
    setSending(true);
    try {
      await addAssistantReply(failedDraft.drafts, failedDraft.mode);
      setFailedDraft(null);
      setPendingUserDrafts([]);
    } catch (error) {
      setFailedDraft((current) => current ? { ...current, error: error instanceof Error ? error.message : undefined } : failedDraft);
    } finally {
      setIsTyping(false);
      setSending(false);
    }
  };

  const sendSticker = (sticker: StickerItem) => {
    const replyTo = replyDraft || undefined;
    addMessage(activeChatId, activeChannel, {
      id: createId('msg'),
      role: 'user',
      content: sticker.url,
      timestamp: Date.now(),
      kind: 'sticker',
      stickerLabel: sticker.label,
      replyTo,
    });
    setPendingUserDrafts((drafts) => [...drafts, { content: `表情包：${sticker.label}`, replyTo, kind: 'sticker' }]);
    setReplyDraft(null);
    setFailedDraft(null);
    setShowPlusPanel(false);
  };

  const addCallNote = (type: 'voice' | 'video') => {
    const label = type === 'voice' ? '发起语音通话' : '发起视频通话';
    addMessage(activeChatId, activeChannel, {
      id: createId('msg'),
      role: 'user',
      content: label,
      timestamp: Date.now(),
      kind: 'call-note',
    });
    setPendingUserDrafts((drafts) => [...drafts, { content: label, kind: 'text' }]);
    setShowPlusPanel(false);
  };

  const sendImage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || sending) return;
    const replyTo = replyDraft || undefined;
    const reader = new FileReader();
    reader.onload = async () => {
      const imageUrl = reader.result as string;
      const safeFileName = file.name.length > 42 ? `${file.name.slice(0, 22)}…${file.name.slice(-12)}` : file.name;
      addMessage(activeChatId, activeChannel, {
        id: createId('msg'),
        role: 'user',
        content: imageUrl,
        timestamp: Date.now(),
        kind: 'image',
        stickerLabel: safeFileName,
        replyTo,
      });
      setPendingUserDrafts((drafts) => [...drafts, { content: `图片：${safeFileName}`, replyTo, kind: 'image' }]);
      setReplyDraft(null);
      setFailedDraft(null);
      event.target.value = '';
    };
    reader.readAsDataURL(file);
  };

  const resetLifeDraft = () => {
    setLifeDraft({ amount: '', note: '', itemName: '' });
    setLifeComposer(null);
  };

  const sendLifeCard = () => {
    if (!lifeComposer) return;
    const amount = lifeDraft.amount.trim();
    const note = lifeDraft.note.trim();
    const itemName = lifeDraft.itemName.trim();
    if ((lifeComposer === 'transfer' || lifeComposer === 'red-packet') && !amount) return;
    if (lifeComposer === 'shopping' && !itemName) return;
    const replyTo = replyDraft || undefined;
    const message: ChatMessage = {
      id: createId('msg'),
      role: 'user',
      content: note || itemName || (lifeComposer === 'red-packet' ? '恭喜发财，大吉大利' : '转账'),
      timestamp: Date.now(),
      kind: lifeComposer,
      amount: amount || undefined,
      note: note || undefined,
      itemName: itemName || undefined,
      status: 'pending',
      replyTo,
    };
    addMessage(activeChatId, activeChannel, message);
    if (lifeComposer === 'shopping') {
      addPurchaseRecord({
        characterId: directCharacter?.id || groupMembers[0]?.id || '',
        itemName,
        amount,
        note,
      });
    }
    setPendingUserDrafts((drafts) => [...drafts, {
      content: describeChatMessage(message, true, characters),
      replyTo,
      kind: 'text',
    }]);
    setReplyDraft(null);
    setFailedDraft(null);
    resetLifeDraft();
    setShowPlusPanel(false);
  };

  return (
    <section className={cn('flex h-full flex-col', isWechat && 'wechat-chat-screen')}>
      <div className={cn('bg-[var(--phone-bg)] px-4 pb-4 pt-6', isWechat && 'wechat-chat-header')}>
        <div className="grid grid-cols-[46px_1fr_46px] items-center">
          <button onClick={goBack} className="circle-button small">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="min-w-0 text-center">
            <h2 className="truncate text-xl font-black">{character.name}</h2>
            {chatSubtitle && <p className="text-xs font-bold opacity-60">{chatSubtitle}</p>}
          </div>
          <button type="button" className="wechat-icon-button" aria-label="聊天信息">
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className={cn('flex-1 overflow-y-auto bg-[#efe9dd] px-4 py-4', isWechat && 'wechat-message-list')}>
        {messages.length === 0 && character.firstMessage && (
          <Bubble role="model" content={character.firstMessage} kind="text" channel={activeChannel} character={character} />
        )}
        {messages.map((message) => {
          const speaker = message.speakerId ? characters.find((item) => item.id === message.speakerId) : character;
          return (
            <Bubble
              key={message.id}
              role={message.role}
              content={message.content}
              kind={message.kind}
              duration={message.duration}
              transcript={message.transcript}
              stickerLabel={message.stickerLabel}
              favorite={message.favorite}
              replyTo={message.replyTo}
              amount={message.amount}
              note={message.note}
              itemName={message.itemName}
              status={message.status}
              timestamp={message.timestamp}
              showTools={activeToolMessageId === message.id}
              channel={activeChannel}
              character={speaker || character}
              onToggleTools={() => setActiveToolMessageId((id) => (id === message.id ? null : message.id))}
              onDelete={message.role === 'model' ? () => deleteMessage(activeChatId, activeChannel, message.id) : undefined}
              onToggleFavorite={() => toggleMessageFavorite(activeChatId, activeChannel, message.id)}
              onCopy={() => navigator.clipboard?.writeText(describeChatMessage(message))}
              onReply={() => setReplyDraft(describeChatMessage(message).slice(0, 60))}
              onRecall={message.role === 'user' ? () => recallMessage(activeChatId, activeChannel, message.id) : undefined}
            />
          );
        })}
        {isTyping && !activeGroup && (
          <div className="wechat-typing">
            <WeChatAvatar src={character.avatar} name={character.name} />
            <span>{character.name} 正在输入中</span>
            <i />
            <i />
            <i />
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={cn('border-t-[3px] border-[#111] bg-[var(--phone-bg)] p-3', isWechat && 'wechat-input-bar')}>
        {replyDraft && (
          <div className="wechat-reply-draft">
            <span>引用：{replyDraft}</span>
            <button type="button" onClick={() => setReplyDraft(null)}>取消</button>
          </div>
        )}
        {failedDraft && (
          <div className="wechat-failed-draft">
            <span>{failedDraft.drafts.length} 条消息还没等到回复，点重试再试一次。</span>
            <button type="button" onClick={retryFailed}>重试</button>
          </div>
        )}
        {showPlusPanel && (
          <div className="wechat-plus-panel">
            <button type="button" onClick={() => { setMode((current) => (current === 'voice' ? 'text' : 'voice')); setShowPlusPanel(false); }} className="wechat-plus-action">
              <Mic className="h-5 w-5" />
              <span>{mode === 'voice' ? '文字' : '语音条'}</span>
            </button>
            <button type="button" onClick={() => imageInputRef.current?.click()} className="wechat-plus-action">
              <ImagePlus className="h-5 w-5" />
              <span>图片</span>
            </button>
            <button type="button" onClick={() => addCallNote('voice')} className="wechat-plus-action">
              <Phone className="h-5 w-5" />
              <span>语音通话</span>
            </button>
            <button type="button" onClick={() => addCallNote('video')} className="wechat-plus-action">
              <Video className="h-5 w-5" />
              <span>视频通话</span>
            </button>
            <button type="button" onClick={() => setLifeComposer((current) => current === 'transfer' ? null : 'transfer')} className="wechat-plus-action">
              <RefreshCw className="h-5 w-5" />
              <span>转账</span>
            </button>
            <button type="button" onClick={() => setLifeComposer((current) => current === 'red-packet' ? null : 'red-packet')} className="wechat-plus-action">
              <Gift className="h-5 w-5" />
              <span>红包</span>
            </button>
            <button type="button" onClick={() => setLifeComposer((current) => current === 'shopping' ? null : 'shopping')} className="wechat-plus-action">
              <ShoppingBag className="h-5 w-5" />
              <span>购物</span>
            </button>
            {lifeComposer && (
              <div className="wechat-life-composer">
                <div className="grid grid-cols-2 gap-2">
                  {lifeComposer === 'shopping' && (
                    <input value={lifeDraft.itemName} onChange={(event) => setLifeDraft((draft) => ({ ...draft, itemName: event.target.value }))} placeholder="买了什么" />
                  )}
                  <input value={lifeDraft.amount} onChange={(event) => setLifeDraft((draft) => ({ ...draft, amount: event.target.value }))} placeholder={lifeComposer === 'red-packet' ? '红包金额' : '金额'} />
                  <input value={lifeDraft.note} onChange={(event) => setLifeDraft((draft) => ({ ...draft, note: event.target.value }))} placeholder="备注" />
                </div>
                <div className="mt-2 flex gap-2">
                  <button type="button" onClick={sendLifeCard}>发送</button>
                  <button type="button" onClick={resetLifeDraft}>取消</button>
                </div>
              </div>
            )}
            <p className="wechat-plus-label">
              <SmilePlus className="h-4 w-4" />
              表情包
            </p>
            <div className="wechat-sticker-tray">
              {stickers.map((sticker) => (
                <button key={sticker.id} onClick={() => sendSticker(sticker)} className="wechat-sticker-send-button" title={sticker.label}>
                  <img src={sticker.url} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="wechat-compose-row">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                send();
              }
            }}
            placeholder={mode === 'voice' ? '语音文字' : '说点什么...'}
            rows={1}
            className="hand-input wechat-chat-input min-h-11 flex-1 resize-none"
          />
          <input ref={imageInputRef} type="file" accept="image/*" onChange={sendImage} className="hidden" />
          <button onClick={() => setShowPlusPanel((visible) => !visible)} className={cn('circle-button small', showPlusPanel && 'bg-[#d9e8f6]')}>
            <Plus className="h-5 w-5" />
          </button>
          <button onClick={send} className="circle-button small bg-[#d9e8f6]">
            {sending ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </section>
  );
}

function Bubble({
  role,
  content,
  kind,
  duration,
  transcript,
  stickerLabel,
  favorite,
  replyTo,
  amount,
  note,
  itemName,
  status,
  timestamp,
  showTools,
  channel,
  character,
  onToggleTools,
  onDelete,
  onToggleFavorite,
  onCopy,
  onReply,
  onRecall,
}: {
  key?: React.Key;
  role: 'user' | 'model';
  content: string;
  kind: string;
  duration?: number;
  transcript?: string;
  stickerLabel?: string;
  favorite?: boolean;
  replyTo?: string;
  amount?: string;
  note?: string;
  itemName?: string;
  status?: 'pending' | 'accepted';
  timestamp?: number;
  showTools?: boolean;
  channel?: 'wechat' | 'qq';
  character?: Character;
  onToggleTools?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onCopy?: () => void;
  onReply?: () => void;
  onRecall?: () => void;
}) {
  const isUser = role === 'user';
  const isWechat = channel === 'wechat';
  const { userAvatar, userName } = useAppStore();
  const [showTranscript, setShowTranscript] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const longPressTimer = useRef<number | null>(null);
  const runTool = (event: React.MouseEvent<HTMLButtonElement>, action?: () => void) => {
    event.stopPropagation();
    action?.();
  };
  const messageTools = showTools ? (
    <div className={cn('wechat-message-tools', isUser ? 'justify-end' : 'justify-start')}>
      {onReply && (
        <button type="button" onClick={(event) => runTool(event, onReply)} className="quote" title="引用">
          <Quote className="h-3.5 w-3.5" />
          <span>引用</span>
        </button>
      )}
      {onToggleFavorite && (
        <button type="button" onClick={(event) => runTool(event, onToggleFavorite)} className={cn(favorite && 'active')} title={favorite ? '取消收藏' : '收藏'}>
          <Star className="h-3.5 w-3.5" />
          <span>{favorite ? '已收藏' : '收藏'}</span>
        </button>
      )}
      {onCopy && (
        <button type="button" onClick={(event) => runTool(event, onCopy)} title="复制">
          <Copy className="h-3.5 w-3.5" />
          <span>复制</span>
        </button>
      )}
      {onRecall && (
        <button type="button" onClick={(event) => runTool(event, onRecall)} className="recall" title="撤回">
          <Undo2 className="h-3.5 w-3.5" />
          <span>撤回</span>
        </button>
      )}
      {!isUser && onDelete && (
        <button type="button" onClick={(event) => runTool(event, onDelete)} title="删除">
          <Trash2 className="h-3.5 w-3.5" />
          <span>删除</span>
        </button>
      )}
    </div>
  ) : null;

  const clearLongPress = () => {
    if (longPressTimer.current) {
      window.clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const playVoice = () => {
    setIsPlaying(true);
    speak(content);
    window.setTimeout(() => setIsPlaying(false), Math.max(900, (duration || 3) * 1000));
  };

  const armMessageTools = () => {
    clearLongPress();
    longPressTimer.current = window.setTimeout(() => onToggleTools?.(), 360);
  };

  const messageEvents = {
    onClick: onToggleTools,
    onContextMenu: (event: React.MouseEvent) => {
      event.preventDefault();
      onToggleTools?.();
    },
    onPointerDown: armMessageTools,
    onPointerUp: clearLongPress,
    onPointerCancel: clearLongPress,
    onPointerLeave: clearLongPress,
  };

  const meta = timestamp ? <span className="wechat-message-time">{formatMessageTime(timestamp)}</span> : null;

  if (content === '' && kind === 'text') {
    return <p className="wechat-recalled-text">{isUser ? '你撤回了一条消息' : '对方撤回了一条消息'}</p>;
  }

  const replyLine = replyTo ? <p className="wechat-reply-line">引用：{replyTo}</p> : null;

  if (kind === 'call-note') {
    const isVideoCall = content.includes('视频');
    return (
      <div className="wechat-call-note">
        {isVideoCall ? <Video className="h-3.5 w-3.5" /> : <Phone className="h-3.5 w-3.5" />}
        <span>{content}</span>
        {meta}
      </div>
    );
  }

  if (kind === 'transfer' || kind === 'red-packet' || kind === 'shopping') {
    const isRedPacket = kind === 'red-packet';
    const isShopping = kind === 'shopping';
    const title = isShopping ? itemName || content || '购物记录' : isRedPacket ? note || content || '恭喜发财，大吉大利' : note || content || '转账';
    const amountText = amount ? `￥${amount}` : isRedPacket ? '红包' : '未填金额';
    return (
      <div className={cn('wechat-message mb-3 flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
        {isWechat && !isUser && <WeChatAvatar src={character?.avatar} name={character?.name || 'char'} />}
        <div className={cn('flex max-w-[78%] flex-col', isUser ? 'items-end' : 'items-start')}>
          {replyLine}
          <button type="button" className={cn('wechat-life-card', kind)} {...messageEvents}>
            <span className="wechat-life-icon">
              {isShopping ? <ShoppingBag className="h-5 w-5" /> : isRedPacket ? <Gift className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
            </span>
            <span className="min-w-0 flex-1">
              <strong>{title}</strong>
              <small>{isShopping ? (note || '生活购物') : status === 'accepted' ? '已收' : '待收'}</small>
            </span>
            <b>{amountText}</b>
          </button>
          {meta}
          {isWechat && messageTools}
        </div>
        {isWechat && isUser && <WeChatAvatar src={userAvatar} name={userName} />}
      </div>
    );
  }

  if (kind === 'sticker') {
    if (isWechat) {
      return (
        <div className={cn('wechat-message mb-3 flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
          {!isUser && <WeChatAvatar src={character?.avatar} name={character?.name || 'char'} />}
          <figure className="wechat-sticker-wrap" {...messageEvents}>
            {replyLine}
            <img src={content} className="wechat-sticker" alt={stickerLabel || '表情包'} />
            {meta}
            {messageTools}
          </figure>
          {isUser && <WeChatAvatar src={userAvatar} name={userName} />}
        </div>
      );
    }

    return (
      <div className={cn('mb-3 flex', isUser ? 'justify-end' : 'justify-start')}>
        <img src={content} className="max-h-36 max-w-36 rounded-2xl border-[3px] border-[#111] object-cover" />
      </div>
    );
  }
  if (kind === 'image') {
    if (isWechat) {
      return (
        <div className={cn('wechat-message mb-3 flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
          {!isUser && <WeChatAvatar src={character?.avatar} name={character?.name || 'char'} />}
          <figure className="wechat-image-wrap" {...messageEvents}>
            {replyLine}
            <img src={content} className="wechat-image-message" alt={stickerLabel || '聊天图片'} />
            {stickerLabel && <figcaption>{stickerLabel}</figcaption>}
            {meta}
            {messageTools}
          </figure>
          {isUser && <WeChatAvatar src={userAvatar} name={userName} />}
        </div>
      );
    }

    return (
      <div className={cn('mb-3 flex', isUser ? 'justify-end' : 'justify-start')}>
        <img src={content} className="max-h-56 max-w-56 rounded-2xl border-[3px] border-[#111] object-cover" />
      </div>
    );
  }
  if (kind === 'voice') {
    if (isWechat) {
      const voiceDuration = duration || 3;
      const width = Math.min(228, Math.max(112, 92 + voiceDuration * 9));
      const transcriptText = transcript || content;
      return (
        <div className={cn('wechat-message mb-3 flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
          {!isUser && <WeChatAvatar src={character?.avatar} name={character?.name || 'char'} />}
          <div className={cn('flex max-w-[78%] flex-col', isUser ? 'items-end' : 'items-start')}>
            {replyLine}
            <button
              onClick={playVoice}
              onContextMenu={(event) => {
                event.preventDefault();
                onToggleTools?.();
              }}
              onPointerDown={() => {
                armMessageTools();
              }}
              onPointerUp={clearLongPress}
              onPointerCancel={clearLongPress}
              onPointerLeave={clearLongPress}
              className={cn('wechat-voice-bubble', isPlaying && 'is-playing', isUser ? 'wechat-voice-user' : 'wechat-voice-model')}
              style={{ width }}
              title="点击播放，长按或右键查看转写"
            >
              <span className="wechat-voice-icon">
                <Volume2 className="h-4 w-4" />
              </span>
              <span className="wechat-voice-waves" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <span className="wechat-voice-duration">{voiceDuration}"</span>
            </button>
            <button type="button" onClick={() => setShowTranscript((visible) => !visible)} className="wechat-transcript-toggle">
              {showTranscript ? '收起转文字' : '转文字'}
            </button>
            {showTranscript && <p className="wechat-transcript">{transcriptText}</p>}
            {meta}
            {messageTools}
          </div>
          {isUser && <WeChatAvatar src={userAvatar} name={userName} />}
        </div>
      );
    }

    return (
      <div className={cn('mb-3 flex', isUser ? 'justify-end' : 'justify-start')}>
        <button onClick={playVoice} className={cn('hand-bubble flex min-w-32 items-center gap-2', isUser ? 'bg-[#d7efc7]' : 'bg-white')}>
          <Mic className="h-4 w-4" />
          <span>{duration || 3}"</span>
          <span className="text-xs opacity-65">点按播放</span>
        </button>
      </div>
    );
  }
  return (
    <div className={cn(isWechat ? 'wechat-message' : '', 'mb-3 flex gap-2', isUser ? 'justify-end' : 'justify-start')}>
      {isWechat && !isUser && <WeChatAvatar src={character?.avatar} name={character?.name || 'char'} />}
      <div className={cn('flex max-w-[78%] flex-col', isUser ? 'items-end' : 'items-start')}>
        {replyLine}
        <div className={cn(isWechat && 'wechat-text-wrap', 'hand-bubble whitespace-pre-wrap leading-relaxed', isUser ? 'bg-[#d7efc7]' : 'bg-white')} {...messageEvents}>{content}</div>
        {meta}
        {isWechat && messageTools}
      </div>
      {isWechat && isUser && <WeChatAvatar src={userAvatar} name={userName} />}
    </div>
  );
}

export function VideoCallScreen() {
  const [scene, setScene] = useState('画面里他坐在床边，房间只开了一盏小灯，镜头偶尔晃一下。');
  return (
    <section className="h-full overflow-y-auto pb-8">
      <Header title="视频通话" subtitle="描述画面，再用文字假装正在说话" />
      <div className="mx-4 mt-4 overflow-hidden rounded-[28px] border-[3px] border-[#111] bg-black shadow-[3px_3px_0_#111]">
        <div className="flex aspect-[9/13] items-center justify-center bg-gradient-to-br from-[#201b2f] via-[#313b4f] to-[#111] p-6 text-center text-white">
          <p className="text-lg font-bold leading-relaxed">{scene}</p>
        </div>
      </div>
      <Panel>
        <textarea value={scene} onChange={(event) => setScene(event.target.value)} className="hand-input min-h-24 w-full" />
        <div className="mt-4 grid grid-cols-4 gap-2">
          <CallButton icon={<Mic />} label="麦克" />
          <CallButton icon={<Camera />} label="镜头" />
          <CallButton icon={<Sparkles />} label="画面" />
          <CallButton icon={<Phone />} label="挂断" danger />
        </div>
      </Panel>
    </section>
  );
}
