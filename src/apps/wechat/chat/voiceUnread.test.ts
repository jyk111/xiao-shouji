import assert from 'node:assert/strict';
import { useAppStore, type ChatMessage } from '../../../store';
import { isUnreadVoiceMessage, markVoiceMessagePlayed } from './voiceUnread';

const assistantVoice: ChatMessage = {
  id: 'voice-1',
  role: 'model',
  content: '刚刚说的这一句',
  timestamp: 1710000000000,
  kind: 'voice',
  duration: 4,
  transcript: '刚刚说的这一句',
};

assert.equal(isUnreadVoiceMessage(assistantVoice), true);
assert.equal(isUnreadVoiceMessage({ ...assistantVoice, role: 'user' }), false);
assert.equal(isUnreadVoiceMessage({ ...assistantVoice, voicePlayedAt: 1710000003000 }), false);
assert.equal(markVoiceMessagePlayed(assistantVoice, 1710000005000).voicePlayedAt, 1710000005000);
assert.equal(markVoiceMessagePlayed({ ...assistantVoice, role: 'user' }, 1710000005000).voicePlayedAt, undefined);

useAppStore.setState({
  chatSessions: {
    'wechat:char-1': {
      id: 'session-1',
      characterId: 'char-1',
      channel: 'wechat',
      messages: [assistantVoice],
      lastUpdated: 1710000000000,
    },
  },
} as Partial<ReturnType<typeof useAppStore.getState>>);

useAppStore.getState().markVoiceMessagePlayed('char-1', 'wechat', 'voice-1', 1710000006000);
const storedMessage = useAppStore.getState().chatSessions['wechat:char-1'].messages[0];

assert.equal(storedMessage.voicePlayedAt, 1710000006000);
assert.equal(isUnreadVoiceMessage(storedMessage), false);

console.log('wechat voice unread logic ok');
