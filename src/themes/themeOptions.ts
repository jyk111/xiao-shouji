export type ThemeType = 'pastel' | 'gothic' | 'guofeng' | 'celtic-paladin';

export const themeOptions: Array<{ id: ThemeType; name: string; desc: string }> = [
  { id: 'pastel', name: '奶油手绘', desc: '粗描边、浅色块、正常手机桌面。' },
  { id: 'gothic', name: 'P5R 红黑', desc: '黑白高对比、鲜红斜切、利落手机桌面。' },
  { id: 'guofeng', name: '古风手札', desc: '宣纸米白、墨色文字、朱砂点印、黛青淡纹；像古籍手札里的现代小手机。' },
  { id: 'celtic-paladin', name: '凯尔特西幻', desc: '羊皮纸底、银蓝符文、深林绿和细金属边；像西幻手札里的现代手机。' },
];
