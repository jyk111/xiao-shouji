import {
  Bot,
  Check,
  CircleUserRound,
  FileText,
  Image as ImageIcon,
  KeyRound,
  Link,
  Mic,
  Palette,
  RefreshCw,
  Settings,
  Shield,
  Sparkles,
  Users,
  Volume2,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { cn } from '../../lib/utils';
import { useAppStore } from '../../store';
import { speakWithConfiguredTts, type TtsProvider } from '../../tts';
import { Header, Panel, Pill, Field } from '../shared/AppPrimitives';

type SettingsTab = 'model' | 'tts' | 'image' | 'community';

type VoicePreset = {
  id: string;
  label: string;
  provider: TtsProvider;
  voiceId: string;
  model?: string;
};

type ModelPreset = {
  id: string;
  label: string;
  provider: TtsProvider;
  model: string;
  baseUrl?: string;
};

const voicePresetStorageKey = 'xiaophone.tts.voicePresets';

const builtInModelPresets: ModelPreset[] = [
  { id: 'openai-gpt-4o-mini-tts', label: 'OpenAI gpt-4o-mini-tts', provider: 'openai', model: 'gpt-4o-mini-tts' },
  { id: 'openai-gpt-4o-mini-tts-2025-03-20', label: 'OpenAI 2025-03-20', provider: 'openai', model: 'gpt-4o-mini-tts-2025-03-20' },
  { id: 'gemini-2-5-flash-preview-tts', label: 'Gemini 2.5 Flash Preview', provider: 'gemini', model: 'gemini-2.5-flash-preview-tts' },
  { id: 'minimax-speech-28-hd', label: 'MiniMax speech-2.8-hd', provider: 'minimax', model: 'speech-2.8-hd', baseUrl: 'https://api.minimax.io/v1/t2a_v2' },
  { id: 'minimax-speech-28-turbo', label: 'MiniMax speech-2.8-turbo', provider: 'minimax', model: 'speech-2.8-turbo', baseUrl: 'https://api.minimax.io/v1/t2a_v2' },
  { id: 'minimax-speech-26-hd', label: 'MiniMax speech-2.6-hd', provider: 'minimax', model: 'speech-2.6-hd', baseUrl: 'https://api.minimax.io/v1/t2a_v2' },
  { id: 'minimax-speech-26-turbo', label: 'MiniMax speech-2.6-turbo', provider: 'minimax', model: 'speech-2.6-turbo', baseUrl: 'https://api.minimax.io/v1/t2a_v2' },
];

const builtInVoicePresets: VoicePreset[] = [
  { id: 'openai-alloy', label: 'OpenAI Alloy', provider: 'openai', voiceId: 'alloy', model: 'gpt-4o-mini-tts' },
  { id: 'openai-verse', label: 'OpenAI Verse', provider: 'openai', voiceId: 'verse', model: 'gpt-4o-mini-tts' },
  { id: 'gemini-kore', label: 'Gemini Kore', provider: 'gemini', voiceId: 'Kore', model: 'gemini-2.5-flash-preview-tts' },
  { id: 'gemini-puck', label: 'Gemini Puck', provider: 'gemini', voiceId: 'Puck', model: 'gemini-2.5-flash-preview-tts' },
  { id: 'minimax-girl', label: 'MiniMax 少女', provider: 'minimax', voiceId: 'female-shaonv', model: 'speech-2.8-hd' },
  { id: 'minimax-clear', label: 'MiniMax 清澈男声', provider: 'minimax', voiceId: 'male-qn-qingse', model: 'speech-2.8-hd' },
];

const providerDefaults: Record<TtsProvider, Partial<VoicePreset> & { baseUrl?: string }> = {
  browser: { voiceId: 'default' },
  local: { baseUrl: 'http://127.0.0.1:9880/tts', voiceId: 'default' },
  openai: { baseUrl: '', model: 'gpt-4o-mini-tts', voiceId: 'alloy' },
  gemini: { baseUrl: '', model: 'gemini-2.5-flash-preview-tts', voiceId: 'Kore' },
  minimax: { baseUrl: 'https://api.minimax.io/v1/t2a_v2', model: 'speech-2.8-hd', voiceId: 'female-shaonv' },
};

const defaultProviderBaseUrls = new Set(
  Object.values(providerDefaults)
    .map((item) => item.baseUrl)
    .filter((item): item is string => typeof item === 'string' && item.length > 0),
);

const officialProviderHosts: Partial<Record<TtsProvider, string[]>> = {
  openai: ['api.openai.com'],
  gemini: ['generativelanguage.googleapis.com'],
  minimax: ['api.minimax.io', 'api.minimaxi.com'],
};

function canCarryBaseUrl(provider: TtsProvider, baseUrl: string) {
  const trimmed = baseUrl.trim();
  if (!trimmed) return false;
  if (provider === 'local') return true;
  if (defaultProviderBaseUrls.has(trimmed)) return false;
  const officialHosts = officialProviderHosts[provider] || [];
  try {
    const host = new URL(trimmed).hostname.toLowerCase();
    return !officialHosts.some((officialHost) => host === officialHost || host.endsWith(`.${officialHost}`));
  } catch {
    return true;
  }
}

function getBaseUrlForProvider(provider: TtsProvider, currentBaseUrl: string) {
  if (provider === 'browser') return '';
  const defaults = providerDefaults[provider];
  return canCarryBaseUrl(provider, currentBaseUrl) ? currentBaseUrl : defaults.baseUrl || '';
}

function normalizeApiBaseUrl(url: string) {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  return trimmed.endsWith('/v1') ? trimmed : trimmed + '/v1';
}

async function fetchModelList(baseUrl: string, apiKey: string) {
  const endpoint = normalizeApiBaseUrl(baseUrl) + '/models';
  const response = await fetch(endpoint, {
    headers: apiKey ? { Authorization: 'Bearer ' + apiKey } : undefined,
  });
  if (!response.ok) throw new Error('Failed to fetch models: ' + response.status);
  const data = await response.json();
  return Array.isArray(data?.data) ? data.data.map((item: { id?: string }) => item.id).filter(Boolean) as string[] : [];
}

function readVoicePresets() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(voicePresetStorageKey) || '[]') as VoicePreset[];
    return Array.isArray(parsed) ? parsed.filter((item) => item.id && item.label && item.provider && item.voiceId) : [];
  } catch {
    return [];
  }
}

function getProviderPlaceholder(provider: TtsProvider) {
  if (provider === 'local') return '例如：http://127.0.0.1:9880/tts';
  if (provider === 'gemini') return '默认：Google Gemini v1beta，可留空';
  if (provider === 'minimax') return '默认：https://api.minimax.io/v1/t2a_v2，可留空';
  return '默认：https://api.openai.com/v1，可留空';
}

function getModelPlaceholder(provider: TtsProvider) {
  if (provider === 'gemini') return 'gemini-2.5-flash-preview-tts';
  if (provider === 'minimax') return 'speech-2.8-hd';
  return 'gpt-4o-mini-tts';
}

function getVoicePlaceholder(provider: TtsProvider) {
  if (provider === 'gemini') return 'Kore';
  if (provider === 'openai') return 'alloy';
  if (provider === 'minimax') return 'female-shaonv';
  return 'default';
}

export function SettingsScreen() {
  const {
    ttsEnabled,
    setTtsEnabled,
    ttsConfig,
    setTtsConfig,
    userName,
    setUserName,
    apiBaseUrl,
    apiKey,
    availableModels,
    selectedModel,
    setModelConfig,
    setAvailableModels,
    imageGenerationConfig,
    setImageGenerationConfig,
    communityVerificationConfig,
    setCommunityVerificationConfig,
    addAppLog,
  } = useAppStore();
  const [tab, setTab] = useState<SettingsTab>('model');
  const [modelStatus, setModelStatus] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [modelPulled, setModelPulled] = useState(false);
  const [ttsStatus, setTtsStatus] = useState('');
  const [isTestingTts, setIsTestingTts] = useState(false);
  const [customVoicePresets, setCustomVoicePresets] = useState<VoicePreset[]>([]);

  useEffect(() => {
    setCustomVoicePresets(readVoicePresets());
  }, []);

  const allVoicePresets = [...builtInVoicePresets, ...customVoicePresets];
  const modelPresets = builtInModelPresets.filter((preset) => preset.provider === ttsConfig.provider);

  const selectProvider = (provider: TtsProvider) => {
    const defaults = providerDefaults[provider];
    setTtsConfig({
      provider,
      baseUrl: getBaseUrlForProvider(provider, ttsConfig.baseUrl),
      model: defaults.model || ttsConfig.model,
      voiceId: defaults.voiceId || ttsConfig.voiceId,
    });
    setTtsStatus('');
  };

  const applyVoicePreset = (preset: VoicePreset) => {
    const defaults = providerDefaults[preset.provider];
    setTtsConfig({
      provider: preset.provider,
      baseUrl: getBaseUrlForProvider(preset.provider, ttsConfig.baseUrl),
      model: preset.model || defaults.model || ttsConfig.model,
      voiceId: preset.voiceId,
    });
    setTtsStatus(`已切到 ${preset.label}`);
  };

  const applyModelPreset = (preset: ModelPreset) => {
    setTtsConfig({
      provider: preset.provider,
      baseUrl: preset.baseUrl ?? getBaseUrlForProvider(preset.provider, ttsConfig.baseUrl),
      model: preset.model,
      voiceId: ttsConfig.provider === preset.provider ? ttsConfig.voiceId : providerDefaults[preset.provider].voiceId || ttsConfig.voiceId,
    });
    setTtsStatus(`已切到 ${preset.label}`);
  };

  const saveCurrentVoicePreset = () => {
    const voiceId = ttsConfig.voiceId.trim();
    if (!voiceId) {
      setTtsStatus('先填写一个音色 ID。');
      return;
    }
    const label = `${ttsConfig.provider} · ${voiceId}`;
    const nextPreset: VoicePreset = {
      id: `${ttsConfig.provider}-${voiceId}-${Date.now()}`,
      label,
      provider: ttsConfig.provider,
      voiceId,
      model: ttsConfig.model.trim() || providerDefaults[ttsConfig.provider].model,
    };
    const next = [...customVoicePresets.filter((item) => !(item.provider === nextPreset.provider && item.voiceId === nextPreset.voiceId)), nextPreset];
    setCustomVoicePresets(next);
    window.localStorage.setItem(voicePresetStorageKey, JSON.stringify(next));
    setTtsStatus(`已保存 ${label}`);
  };

  const pullModels = async () => {
    if (!apiBaseUrl.trim()) {
      setModelStatus('先填写接口地址');
      return;
    }
    setModelStatus('正在拉取模型...');
    setModelPulled(false);
    try {
      const models = await fetchModelList(apiBaseUrl, apiKey);
      setAvailableModels(models);
      setModelStatus(models.length > 0 ? `已拉取 ${models.length} 个模型` : '接口可访问，但没有返回模型列表');
      setModelPulled(true);
      addAppLog({ type: 'success', title: '成功获取模型列表', detail: models.join('\n') || '接口可访问，但没有返回模型列表' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '拉取失败';
      setModelStatus(message);
      addAppLog({ type: 'error', title: '拉取模型失败', detail: message });
    }
  };

  const previewTts = async () => {
    setTtsStatus('正在试听...');
    setIsTestingTts(true);
    try {
      await speakWithConfiguredTts('这是一条 TTS 试听语音。', ttsConfig);
      setTtsStatus('试听已发送');
      addAppLog({ type: 'tts', title: 'TTS 试听', detail: `${ttsConfig.provider} / ${ttsConfig.model || 'default'} / ${ttsConfig.voiceId || 'default'}` });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'TTS 试听失败';
      setTtsStatus(message);
      addAppLog({ type: 'error', title: 'TTS 试听失败', detail: message });
    } finally {
      setIsTestingTts(false);
    }
  };

  const saveSettings = () => {
    setSaveStatus('保存成功');
    window.setTimeout(() => setSaveStatus(''), 1800);
  };

  return (
    <section className="no-scrollbar flex h-full flex-col overflow-y-auto pb-4">
      <Header
        title="扩展设置"
        onSave={saveSettings}
        tabs={
          <>
            <Pill active={tab === 'model'} icon={<Settings />} label="文本大模型" onClick={() => setTab('model')} />
            <Pill active={tab === 'tts'} icon={<Mic />} label="TTS 语音" onClick={() => setTab('tts')} />
            <Pill active={tab === 'image'} icon={<Palette />} label="生图配置" onClick={() => setTab('image')} />
            <Pill active={tab === 'community'} icon={<Shield />} label="社区验证" onClick={() => setTab('community')} />
          </>
        }
      />
      {saveStatus ? (
        <div className="grid flex-1 place-items-center px-4">
          <div className="w-full rounded-[30px] border-[3px] border-[#111] bg-[#edf7ed] p-8 text-center shadow-[3px_4px_0_rgba(0,0,0,0.16)]">
            <Check className="mx-auto h-10 w-10" />
            <p className="mt-3 text-2xl font-black">保存成功</p>
          </div>
        </div>
      ) : (
        <>
          {tab === 'model' && (
            <>
              <Panel>
                <Field icon={<Link />} label="大模型接口地址">
                  <input value={apiBaseUrl} onChange={(event) => setModelConfig({ apiBaseUrl: event.target.value })} className="hand-input w-full" placeholder="例如：http://127.0.0.1:8000/v1" />
                </Field>
                <Field icon={<KeyRound />} label="API 密钥 / Token">
                  <input value={apiKey} onChange={(event) => setModelConfig({ apiKey: event.target.value })} className="hand-input w-full" type="password" placeholder="没有密钥可留空" />
                </Field>
                {availableModels.length > 0 && (
                  <Field icon={<Bot />} label="选择模型">
                    <select value={selectedModel} onChange={(event) => setModelConfig({ selectedModel: event.target.value })} className="hand-input w-full">
                      {availableModels.map((model) => <option key={model} value={model}>{model}</option>)}
                    </select>
                  </Field>
                )}
                <button onClick={pullModels} className={cn('fetch-button mt-2', modelPulled && 'bg-[#dceecd]')}>
                  {modelPulled ? <Check className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
                  {modelPulled ? '成功获取模型' : '点击拉取模型'}
                </button>
                {modelStatus && <p className="mt-3 text-sm font-black opacity-70">{modelStatus}</p>}
              </Panel>
              <div className="hand-note mx-4 mt-5 p-4">
                <div className="flex gap-3">
                  <Zap className="mt-1 h-6 w-6 shrink-0" />
                  <p className="text-sm font-black leading-relaxed">若使用本地网关（Oobabooga / OneAPI / vLLM），在此处填写对应地址。</p>
                </div>
              </div>
            </>
          )}

          {tab === 'tts' && (
            <Panel>
              <Field icon={<Mic />} label="TTS 提供商">
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => selectProvider('browser')} className={cn('pill w-full', ttsConfig.provider === 'browser' && 'active')}>浏览器免费</button>
                  <button onClick={() => selectProvider('local')} className={cn('pill w-full', ttsConfig.provider === 'local' && 'active')}>本地 HTTP</button>
                  <button onClick={() => selectProvider('openai')} className={cn('pill w-full', ttsConfig.provider === 'openai' && 'active')}>OpenAI</button>
                  <button onClick={() => selectProvider('gemini')} className={cn('pill w-full', ttsConfig.provider === 'gemini' && 'active')}>Gemini</button>
                  <button onClick={() => selectProvider('minimax')} className={cn('pill w-full', ttsConfig.provider === 'minimax' && 'active')}>MiniMax</button>
                </div>
              </Field>
              {ttsConfig.provider !== 'browser' && (
                <Field icon={<Link />} label="TTS 接口地址">
                  <input
                    value={ttsConfig.baseUrl}
                    onChange={(event) => setTtsConfig({ baseUrl: event.target.value })}
                    className="hand-input w-full"
                    placeholder={getProviderPlaceholder(ttsConfig.provider)}
                  />
                </Field>
              )}
              {(ttsConfig.provider === 'openai' || ttsConfig.provider === 'gemini' || ttsConfig.provider === 'minimax') && (
                <>
                  <Field icon={<KeyRound />} label="TTS API Key">
                    <input value={ttsConfig.apiKey} onChange={(event) => setTtsConfig({ apiKey: event.target.value })} className="hand-input w-full" type="password" placeholder="官方 API key" />
                  </Field>
                  <Field icon={<Bot />} label="TTS 模型">
                    <input
                      value={ttsConfig.model}
                      onChange={(event) => setTtsConfig({ model: event.target.value })}
                      className="hand-input w-full"
                      placeholder={getModelPlaceholder(ttsConfig.provider)}
                    />
                  </Field>
                  {modelPresets.length > 0 && (
                    <Field icon={<Bot />} label="模型预设">
                      <div className="grid grid-cols-2 gap-2">
                        {modelPresets.map((preset) => (
                          <button
                            key={preset.id}
                            type="button"
                            onClick={() => applyModelPreset(preset)}
                            className={cn('pill min-h-12 w-full justify-center text-xs', ttsConfig.model === preset.model && 'active')}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </Field>
                  )}
                </>
              )}
              <Field icon={<Volume2 />} label="音色 / Voice ID">
                <input
                  value={ttsConfig.voiceId}
                  onChange={(event) => setTtsConfig({ voiceId: event.target.value })}
                  className="hand-input w-full"
                  placeholder={getVoicePlaceholder(ttsConfig.provider)}
                />
              </Field>
              <Field icon={<Volume2 />} label="音色预设">
                <div className="grid grid-cols-2 gap-2">
                  {allVoicePresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyVoicePreset(preset)}
                      className={cn('pill min-h-12 w-full justify-center text-xs', ttsConfig.provider === preset.provider && ttsConfig.voiceId === preset.voiceId && 'active')}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={saveCurrentVoicePreset} className="fetch-button mt-3 bg-[#e7f4ff]">
                  保存当前音色为预设
                </button>
              </Field>
              <button onClick={() => setTtsEnabled(!ttsEnabled)} className="fetch-button mt-2">
                {ttsEnabled ? '关闭微信/电话 TTS' : '开启微信/电话 TTS'}
              </button>
              <button onClick={previewTts} disabled={isTestingTts} className="fetch-button mt-3 bg-[#fff0bd] disabled:opacity-60">
                {isTestingTts ? '正在试听...' : '试听 TTS'}
              </button>
              {ttsStatus && <p className="mt-3 text-sm font-black opacity-70">{ttsStatus}</p>}
              <p className="mt-3 text-xs font-black leading-5 opacity-60">
                TTS 会供微信语音条和电话通话使用；当前是全局音色，切换预设后两边都会跟着用。MiniMax 音乐生成是独立接口，先不要混进 TTS 试听。
              </p>
            </Panel>
          )}

          {tab === 'image' && (
            <Panel>
              <p className="mb-4 text-sm font-black leading-6 opacity-65">这里保存全局 NAI 生图配置，微信、小红书和主动事件需要图片时会读取这里。</p>
              <Field icon={<Palette />} label="生图接口地址">
                <input
                  value={imageGenerationConfig.baseUrl}
                  onChange={(event) => setImageGenerationConfig({ baseUrl: event.target.value })}
                  className="hand-input w-full"
                  placeholder="https://image.novelai.net/ai/generate-image"
                />
              </Field>
              <Field icon={<KeyRound />} label="NAI API Key">
                <input
                  value={imageGenerationConfig.apiKey}
                  onChange={(event) => setImageGenerationConfig({ apiKey: event.target.value })}
                  className="hand-input w-full"
                  type="password"
                  placeholder="只保存在本机浏览器里"
                />
              </Field>
              <Field icon={<Bot />} label="模型">
                <input
                  value={imageGenerationConfig.model}
                  onChange={(event) => setImageGenerationConfig({ model: event.target.value })}
                  className="hand-input w-full"
                  placeholder="nai-diffusion-3"
                />
              </Field>
              <Field icon={<ImageIcon />} label="默认尺寸">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    value={imageGenerationConfig.width}
                    onChange={(event) => setImageGenerationConfig({ width: Number(event.target.value) || 512 })}
                    className="hand-input min-w-0"
                    inputMode="numeric"
                    placeholder="宽"
                  />
                  <input
                    value={imageGenerationConfig.height}
                    onChange={(event) => setImageGenerationConfig({ height: Number(event.target.value) || 512 })}
                    className="hand-input min-w-0"
                    inputMode="numeric"
                    placeholder="高"
                  />
                </div>
              </Field>
              <div className="grid grid-cols-2 gap-2">
                <Field icon={<RefreshCw />} label="步数">
                  <input
                    value={imageGenerationConfig.steps}
                    onChange={(event) => setImageGenerationConfig({ steps: Number(event.target.value) || 18 })}
                    className="hand-input w-full"
                    inputMode="numeric"
                  />
                </Field>
                <Field icon={<Sparkles />} label="CFG">
                  <input
                    value={imageGenerationConfig.scale}
                    onChange={(event) => setImageGenerationConfig({ scale: Number(event.target.value) || 5 })}
                    className="hand-input w-full"
                    inputMode="decimal"
                  />
                </Field>
              </div>
              <Field icon={<Sparkles />} label="通用正向提示串">
                <textarea
                  value={imageGenerationConfig.promptPreset}
                  onChange={(event) => setImageGenerationConfig({ promptPreset: event.target.value })}
                  className="hand-input min-h-20 w-full resize-none"
                />
              </Field>
              <Field icon={<FileText />} label="反向提示">
                <textarea
                  value={imageGenerationConfig.negativePrompt}
                  onChange={(event) => setImageGenerationConfig({ negativePrompt: event.target.value })}
                  className="hand-input min-h-20 w-full resize-none"
                />
              </Field>
            </Panel>
          )}

          {tab === 'community' && (
            <Panel>
              <p className="mb-4 text-sm font-black leading-6 opacity-65">后门码不写入前端或 APK。这里仅填写独立后端服务地址，真正的 48 小时代码和固定维护码都在后端环境变量里。</p>
              <Field icon={<KeyRound />} label="后门服务地址">
                <input
                  value={communityVerificationConfig.backdoorApiUrl}
                  onChange={(event) => setCommunityVerificationConfig({ backdoorApiUrl: event.target.value.trim() })}
                  className="hand-input w-full"
                  placeholder="例如：https://your-domain.example"
                />
              </Field>
              <Field icon={<KeyRound />} label="Discord Client ID">
                <input
                  value={communityVerificationConfig.discordClientId}
                  onChange={(event) => setCommunityVerificationConfig({ discordClientId: event.target.value.trim() })}
                  className="hand-input w-full"
                />
              </Field>
              <Field icon={<Users />} label="Discord Guild ID">
                <textarea
                  value={communityVerificationConfig.discordGuildIds.join('\n')}
                  onChange={(event) => setCommunityVerificationConfig({ discordGuildIds: event.target.value.split(/[\n,，、]+/).map((item) => item.trim()).filter(Boolean) })}
                  className="hand-input min-h-20 w-full resize-none"
                />
              </Field>
              <Field icon={<Users />} label="需要的社区/身份组名称">
                <textarea
                  value={communityVerificationConfig.requiredGroups.join('\n')}
                  onChange={(event) => setCommunityVerificationConfig({ requiredGroups: event.target.value.split(/[\n,，、]+/).map((item) => item.trim()).filter(Boolean) })}
                  className="hand-input min-h-20 w-full resize-none"
                />
              </Field>
            </Panel>
          )}

          <Panel>
            <Field icon={<CircleUserRound />} label="你的名字">
              <input value={userName} onChange={(event) => setUserName(event.target.value)} className="hand-input w-full" />
            </Field>
          </Panel>
        </>
      )}
    </section>
  );
}
