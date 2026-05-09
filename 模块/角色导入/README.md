# 角色导入

当前真实代码入口：

- 全局通讯录导入：`src/App.tsx` 的 `ContactsScreen`
- 微信通讯录导入：`src/App.tsx` 的 `WeChatContacts`
- 解析器：`src/lib/charaParser.ts` 的 `parseCharacterCard`

相关状态：

- `src/store.ts`：`characters`、`addCharacter`、`updateCharacter`
- `src/lib/utils.ts`：`createId`

维护备注：

- 不要直接调用 `crypto.randomUUID`。
- 导入失败先查 `parseCharacterCard` 和浏览器兼容 API。
