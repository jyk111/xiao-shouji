import type { ChatMessage } from '../../../store';

type VoiceReadCandidate = Pick<ChatMessage, 'kind' | 'role' | 'voicePlayedAt'>;

export function isUnreadVoiceMessage(message: VoiceReadCandidate) {
  return message.kind === 'voice' && message.role === 'model' && !message.voicePlayedAt;
}

export function markVoiceMessagePlayed<T extends VoiceReadCandidate>(message: T, playedAt = Date.now()): T {
  if (!isUnreadVoiceMessage(message)) return message;
  return { ...message, voicePlayedAt: playedAt };
}
