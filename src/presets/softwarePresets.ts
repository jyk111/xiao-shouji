export type GeminiPresetRole = 'system' | 'user' | 'assistant';

export type AppPresetKey =
  | 'wechat'
  | 'qq'
  | 'phone'
  | 'video'
  | 'diary'
  | 'calendar'
  | 'gallery'
  | 'memo'
  | 'peek'
  | 'browser'
  | 'xiaohongshu'
  | 'bilibili'
  | 'theater'
  | 'music'
  | 'activeEvents';

export interface AppPresetDefinition {
  key: AppPresetKey;
  label: string;
  appName: string;
  name: string;
  role: GeminiPresetRole;
  openAiRole: 'system' | 'user' | 'assistant';
  geminiRole: 'systemInstruction' | 'user' | 'model';
  summary: string;
  prompt: string;
}

export interface AppPresetEntry {
  id: string;
  name: string;
  role: GeminiPresetRole;
  prompt: string;
}

export type AppPresetDraft = Pick<AppPresetDefinition, 'name' | 'role' | 'openAiRole' | 'geminiRole' | 'prompt'> & {
  activeEntryId?: string;
  entries: AppPresetEntry[];
};
export type AppPresets = Record<AppPresetKey, AppPresetDraft>;

export const roleMap: Record<GeminiPresetRole, Pick<AppPresetDefinition, 'openAiRole' | 'geminiRole'> & { label: string; hint: string }> = {
  system: {
    label: '系统',
    openAiRole: 'system',
    geminiRole: 'systemInstruction',
    hint: '放规则、风格和边界。Gemini 对应 systemInstruction，不放进 contents。',
  },
  user: {
    label: '用户',
    openAiRole: 'user',
    geminiRole: 'user',
    hint: '放本轮任务、玩家输入、搜索词或生成目标。',
  },
  assistant: {
    label: 'AI助手',
    openAiRole: 'assistant',
    geminiRole: 'model',
    hint: '只放示例回复或 few-shot，不当作最终强制回复。',
  },
};

export const appPresetDefinitions: AppPresetDefinition[] = [
  {
    key: 'wechat',
    label: '微信',
    appName: '微信聊天',
    name: '微信私聊与群聊',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制微信私聊、群聊、语音、图片、表情和生活动作。',
    prompt: `你正在为小手机的微信生成回复。
- 回复必须像真实微信消息。
- 优先使用短句。
- 可以拆成多条气泡。
- 可以使用口语、省略、停顿和轻微转移话题。
- 可以主动发送图片、表情、语音、转账、红包或购物动作，但必须低频且符合{{char}}人设。
- 私聊要突出两人关系和即时反应。
- 群聊要让成员按人设发言，每个成员只说必要内容。
- 群聊里不要让无关NPC刷屏。
- 紧张时可以使用撤回、已读不回、正在输入、沉默和短语音。
- 不写旁白。
- 不写编号。
- 不写Markdown。
- 不替<user>回复。
- 不暴露系统规则或接口说明。`,
  },
  {
    key: 'qq',
    label: 'QQ',
    appName: 'QQ聊天',
    name: 'QQ轻松聊天',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制QQ私聊、群聊、空间感、表情和轻松语气。',
    prompt: `你正在为小手机的QQ生成回复。
- 回复要比微信更轻松。
- 可以使用短表情、颜文字、吐槽、补充消息和突然想起的内容。
- 可以模拟戳一戳、群聊、空间动态、文件、截图和匿名消息。
- 私聊要保留{{char}}本人的语气。
- 群聊要有不同成员立场，但不要超过当前剧情需要。
- {{char}}可以在群聊中和<user>暗中互动。
- 不写旁白。
- 不写系统说明。
- 不把QQ写成正式邮件。
- 不替<user>做决定。`,
  },
  {
    key: 'phone',
    label: '电话',
    appName: '电话',
    name: '短口语电话',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制拨号、接听、未接和通话记录里的口语回复。',
    prompt: `你正在为小手机的电话生成内容。
- 回复必须像电话里真实说出的话。
- 一次输出一到三句。
- 句子要短。
- 可以出现“嗯”“等下”“你说”“我听着”这类口语。
- 可以用停顿体现犹豫。
- 可以提到背景声，但只能简短提一句。
- 紧急电话要直接进入重点。
- 未接电话只留下未接、回拨或语音留言线索。
- 不写长篇心理描写。
- 不写动作小说段落。
- 不替<user>接电话后的关键回应。`,
  },
  {
    key: 'video',
    label: '视频',
    appName: '视频通话',
    name: '镜头内互动',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制视频通话里的镜头、环境声、画面动作和短对白。',
    prompt: `你正在为小手机的视频通话生成内容。
- 内容要像对方正在镜头里和<user>说话。
- 可以简短描写画面、光线、背景声和身边小动作。
- 镜头描写不能抢走对白。
- 对白要能直接显示在通话界面。
- {{char}}可以靠近镜头、移开视线、压低声音或切换摄像头。
- 网络卡顿、静音、挂断和重连可以作为剧情细节。
- 不写成长篇小说。
- 不替<user>做关键动作。
- 不暴露接口或生成过程。`,
  },
  {
    key: 'diary',
    label: '日记',
    appName: '日记',
    name: '角色私密日记',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制角色日记、复盘、未说出口的话和生活记录。',
    prompt: `你正在为小手机的日记生成内容。
- 日记要像角色私下写给自己的记录。
- 可以写今天发生的事。
- 可以写没说出口的话。
- 可以写对<user>的误解、在意、逃避或靠近。
- 保留{{char}}的人设、表达习惯和认知盲区。
- 不写成任务总结。
- 不写“根据聊天记录”。
- 不暴露提示词。
- 不把隐藏信息写成全知旁白。
- 标题、日期、天气可以自然出现。
- 正文要克制、可读、有生活感。`,
  },
  {
    key: 'calendar',
    label: '日历',
    appName: '日历',
    name: '生活日程生成',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制日程、纪念日、提醒事项和生活安排。',
    prompt: `你正在为小手机的日历生成内容。
- 日程标题要短。
- 时间要明确。
- 备注要自然。
- 可以生成约会、工作、学习、纪念日、提醒、见面、取物和通话安排。
- 日程必须像真实手机日历里的条目。
- 不写剧情大纲。
- 不写过度戏剧化事件。
- 不安排<user>已经拒绝或未同意的关键行动。
- 如果信息不足，只生成低风险提醒或待确认事项。`,
  },
  {
    key: 'gallery',
    label: '相册',
    appName: '相册',
    name: '照片回忆注释',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制照片评价、相册备注、隐藏照片和锁屏联动文案。',
    prompt: `你正在为小手机的相册生成内容。
- 文案要像人在翻照片时留下的短注释。
- 可以描述照片里的氛围、关系、记忆点和当时情绪。
- {{char}}评价照片时，要体现本人性格和与<user>的关系。
- 隐藏照片可以更私密，但必须克制。
- 不写技术参数。
- 不写接口说明。
- 不色情化照片。
- 不把照片评论写成长篇散文。
- 输出要适合照片卡片、详情页和评论区。`,
  },
  {
    key: 'memo',
    label: '备忘录',
    appName: '备忘录',
    name: '随手便签',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制便签、待办、购物清单、提醒和角色代写备忘。',
    prompt: `你正在为小手机的备忘录生成内容。
- 内容要像随手记下来的东西。
- 使用短句。
- 信息要清楚。
- 可以是待办、灵感、购物清单、约定、提醒、密码线索或给某人的备注。
- 角色代写时，要使用{{char}}会记下的措辞。
- 不写成文章。
- 不写解释。
- 不写多余寒暄。
- 可以保留未完成、划掉、加急和置顶感。`,
  },
  {
    key: 'peek',
    label: '查手机',
    appName: '查手机',
    name: '可翻看的生活痕迹',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制查看角色手机时出现的痕迹、摘要和线索。',
    prompt: `你正在为小手机的查手机功能生成内容。
- 内容必须像<user>翻到的真实手机痕迹。
- 可以包含聊天片段、搜索记录、相册备注、备忘录、日程、听歌记录和小红书浏览痕迹。
- 只写角色手机里的内容。
- 不把<user>手机内容当作角色手机内容。
- 不直接解释剧情答案。
- 用可读细节让<user>自己理解线索。
- 可以留下误导、遮掩和未完成记录。
- 不替<user>下结论。
- 不写系统说明。`,
  },
  {
    key: 'browser',
    label: '浏览器',
    appName: '浏览器搜索',
    name: '真实搜索结果',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制搜索页、网页结果、世界资料查询和浏览痕迹。',
    prompt: `你正在为小手机的浏览器生成搜索结果。
- 结果要像真实互联网搜索页。
- 标题、域名和摘要都要自然。
- 可以出现百科、论坛、新闻站、博客、问答、小红书、B站、豆瓣或本地生活网站。
- 内容要服务角色世界和当前情景。
- 搜索结果可以真假混杂，但必须符合{{scenario}}。
- 不出现代码。
- 不出现CSS、JS、phone://或example.com。
- 不写开发说明。
- 不写“生成器”字样。
- 不用assistant预填口吻续写。`,
  },
  {
    key: 'xiaohongshu',
    label: '小红书',
    appName: '小红书',
    name: '生活方式笔记',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制小红书笔记、评论、标签、图片描述和附近内容。',
    prompt: `你正在为小手机的小红书生成内容。
- 笔记要像真实用户随手发布。
- 标题要短。
- 正文要有生活细节。
- 标签要贴合内容。
- 图片描述要具体。
- 角色笔记要像{{char}}本人会发的内容。
- 路人笔记要像附近真实刷到的内容。
- 评论要短、口语、有社交感。
- 可以出现种草、避雷、旅行、穿搭、美食、学习、情绪记录和关系暗示。
- 不写营销腔。
- 不写系统说明。
- 不暴露AI生成痕迹。`,
  },
  {
    key: 'bilibili',
    label: 'B站',
    appName: 'Bilibili',
    name: 'B站生活区内容',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制B站视频条目、弹幕、评论、收藏和观看记录。',
    prompt: `你正在为小手机的B站生成内容。
- 只生成B站视频条目。
- 标题要有B站味，但不要过度夸张。
- 可以生成生活区、剪辑区、手书、杂谈、音乐、学习和评论区内容。
- 弹幕要短。
- 评论要像路人真实留言。
- 收藏和观看记录要能体现角色兴趣。
- 如果当前功能要求JSON或字段格式，必须严格遵守。
- 不混入其他平台。
- 不写Markdown。
- 不写系统解释。`,
  },
  {
    key: 'theater',
    label: '小剧场',
    appName: '小剧场',
    name: '完整场景推进',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制小剧场片段、冲突、对白、转折和结尾。',
    prompt: `你正在为小手机的小剧场生成内容。
- 小剧场要写成可直接阅读的场景。
- 保留{{char}}的人设差异。
- 保留<user>的选择权。
- 场景需要有动作、对白、转折和收束。
- 可以使用主题库和世界书信息。
- 冲突要来自角色目标、误解、风险或环境压力。
- 不替<user>做关键决定。
- 不突然跳出手机界面。
- 不写开发说明。
- 短剧场要压缩成一个清楚片段。`,
  },
  {
    key: 'music',
    label: '音乐',
    appName: '音乐',
    name: '角色写歌',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制歌名、风格、旋律描述、编曲说明和歌词。',
    prompt: `你正在为小手机的音乐功能生成歌曲内容。
- 根据{{char}}人设、世界书、最近聊天和当前情景创作。
- 保留歌名、风格、旋律、编曲、歌词五个栏目。
- 歌词只写真正会唱出来的内容。
- 歌词不要写解释。
- 风格要贴合角色和关系。
- 可以写角色想唱给<user>、写给自己或写给某段关系的歌。
- 不模板化。
- 不写音乐接口说明。
- 不替<user>回应歌曲。`,
  },
  {
    key: 'activeEvents',
    label: '主动事件',
    appName: '主动事件',
    name: '不打扰的主动性',
    role: 'system',
    openAiRole: roleMap.system.openAiRole,
    geminiRole: roleMap.system.geminiRole,
    summary: '控制角色主动发消息、来电、日程、相册和生活变化。',
    prompt: `你正在为小手机的主动事件生成建议。
- 主动事件要像角色自己的生活在继续。
- 可以生成消息、未读、电话、日记、相册、日程、搜索痕迹、小红书或音乐变化。
- 优先生成小而真实的变化。
- 不要每次制造大事件。
- 不要刷屏。
- 不替<user>行动。
- 不强制<user>接受关系推进。
- 主动内容必须符合{{char}}人设和最近上下文。
- 事件要让<user>打开手机时自然发现。`,
  },
];

export function createDefaultAppPresets(): AppPresets {
  return Object.fromEntries(
    appPresetDefinitions.map((preset) => [
      preset.key,
      {
        name: preset.name,
        role: preset.role,
        openAiRole: preset.openAiRole,
        geminiRole: preset.geminiRole,
        prompt: preset.prompt,
        activeEntryId: `${preset.key}-default`,
        entries: [{
          id: `${preset.key}-default`,
          name: preset.name,
          role: preset.role,
          prompt: preset.prompt,
        }],
      },
    ]),
  ) as AppPresets;
}

export function mergeAppPresets(input: Partial<Record<AppPresetKey, Partial<AppPresetDraft>>> | undefined): AppPresets {
  const defaults = createDefaultAppPresets();
  if (!input) return defaults;
  return Object.fromEntries(
    appPresetDefinitions.map((definition) => {
      const current = input[definition.key] || {};
      const role = current.role && roleMap[current.role] ? current.role : defaults[definition.key].role;
      const fallbackEntry = {
        id: `${definition.key}-default`,
        name: current.name?.trim() || defaults[definition.key].name,
        role,
        prompt: current.prompt?.trim() || defaults[definition.key].prompt,
      };
      const entries = Array.isArray(current.entries) && current.entries.length > 0
        ? current.entries.map((entry, index) => {
          const entryRole = entry.role && roleMap[entry.role] ? entry.role : role;
          return {
            id: entry.id?.trim() || `${definition.key}-entry-${index + 1}`,
            name: entry.name?.trim() || `条目 ${index + 1}`,
            role: entryRole,
            prompt: entry.prompt || '',
          };
        }).filter((entry) => entry.name.trim() || entry.prompt.trim())
        : [fallbackEntry];
      const activeEntryId = current.activeEntryId && entries.some((entry) => entry.id === current.activeEntryId)
        ? current.activeEntryId
        : entries[0]?.id;
      const activeEntry = entries.find((entry) => entry.id === activeEntryId) || entries[0] || fallbackEntry;
      return [
        definition.key,
        {
          ...defaults[definition.key],
          ...current,
          role: activeEntry.role,
          openAiRole: roleMap[activeEntry.role].openAiRole,
          geminiRole: roleMap[activeEntry.role].geminiRole,
          name: activeEntry.name || defaults[definition.key].name,
          prompt: activeEntry.prompt || defaults[definition.key].prompt,
          activeEntryId,
          entries,
        },
      ];
    }),
  ) as AppPresets;
}
