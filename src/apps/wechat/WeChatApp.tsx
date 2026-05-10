import { Compass, MessageCircle, CircleUserRound, Users } from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '../../lib/utils';
import { useAppStore } from '../../store';
import { WeChatChats } from './chats/WeChatChats';
import { WeChatContacts } from './contacts/WeChatContacts';
import { WeChatDiscover } from './discover/WeChatDiscover';
import { WeChatMe } from './me/WeChatMe';

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
