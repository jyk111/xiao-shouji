# 主题

当前真实代码入口在 `src/App.tsx` 和 `src/index.css`：

- 主题选择页：`ThemesScreen`
- 主题选项：`themeOptions`
- 主题状态：`useAppStore.theme`
- 主题变量与覆盖：`.theme-pastel`、`.theme-gothic`

相关状态：

- `src/store.ts`：`theme`、`setTheme`
- `src/index.css`：全局变量、手机壳、微信主题覆盖

维护备注：

- 模块接主题变量时，只改必要 CSS，不改主题系统行为。
