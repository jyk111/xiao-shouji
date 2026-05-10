import { Bot, UserPlus } from 'lucide-react';
import React from 'react';

import { useAppStore } from '../../../store';
import { Header, Panel, Empty, Avatar } from '../../shared/AppPrimitives';
import { describeChatMessage } from '../../shared/aiText';

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
