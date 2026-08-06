# MarkHub · 书签导航

将浏览器书签转换为精美导航页的开源工具。把杂乱的书签栏变成一目了然的视觉化门户。

![Tech](https://img.shields.io/badge/React-18-blue) ![Tech](https://img.shields.io/badge/TypeScript-5-blue) ![Tech](https://img.shields.io/badge/Vite-5-purple) ![Tech](https://img.shields.io/badge/TailwindCSS-3-cyan)

## 功能特性

- **多级分类侧边栏** — 自动解析书签层级结构，在左侧生成可折叠的多级目录树，每个分类显示书签数量。
- **站内搜索** — 按书签标题、网址、域名或所在分类实时过滤，支持 ⌘/Ctrl + K 快捷键聚焦。
- **站外搜索** — 一键切换到 Google / Bing / 百度进行全网搜索。
- **一键置顶** — 滚动后右下角浮现回到顶部按钮，平滑滚动回页面顶部。
- **白天 / 黑夜模式** — 主题随系统偏好初始化，手动切换后记忆偏好，全局平滑过渡。
- **数据导入** — 支持拖拽或选择浏览器导出的书签 HTML 文件，自动解析完整文件夹层级，可替换或追加合并。
- **数据导出** — 可导出为标准书签 HTML（可重新导入任何浏览器）或 JSON 备份文件。
- **响应式设计** — 从手机到宽屏桌面均自适应，移动端侧边栏以抽屉形式展开。

## 技术栈

| 技术 | 用途 |
|------|------|
| React 18 + TypeScript | UI 框架与类型安全 |
| Vite 5 | 构建工具与开发服务器 |
| Tailwind CSS 3 | 原子化样式与主题系统 |
| Lucide React | 图标库 |
| localStorage | 本地数据持久化 |

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 类型检查
npm run typecheck

# 代码规范检查
npm run lint

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 如何导入书签

1. 在 Chrome / Edge 中打开 `chrome://bookmarks`
2. 点击右上角「⋮」→ **导出书签**，保存为 HTML 文件
3. 在 MarkHub 中点击右上角「导入 / 导出」
4. 拖入或选择该 HTML 文件，预览解析结果后确认导入
5. 选择「替换现有」覆盖当前数据，或「追加合并」添加到现有书签中

Firefox 用户：书签管理器 → 导入和备份 → 导出书签到 HTML

## 项目结构

```
src/
├── components/
│   ├── Sidebar.tsx        # 多级分类目录树
│   ├── BookmarkCard.tsx   # 书签卡片
│   ├── SearchBar.tsx      # 站内/站外搜索
│   ├── ThemeToggle.tsx    # 白天/黑夜切换
│   ├── BackToTop.tsx      # 一键置顶按钮
│   └── DataModal.tsx      # 导入/导出弹窗
├── utils/
│   ├── bookmarkParser.ts  # 书签 HTML 解析与序列化
│   ├── favicon.ts         # 网站图标获取与兜底
│   ├── storage.ts         # 本地存储读写
│   └── seedData.ts        # 初始示例数据
├── types.ts               # 类型定义
├── App.tsx                # 主应用
└── index.css              # 全局样式
```

## 部署

项目包含 GitHub Actions 工作流（`.github/workflows/deploy.yml`），在每次推送到 `main` 分支时自动执行：

1. `npm install` — 安装依赖
2. `npm run build` — 生产构建
3. 将 `dist/` 目录部署到 `gh-pages` 分支

部署后启用 GitHub Pages：仓库 **Settings → Pages → Source** 选择 `gh-pages` 分支即可访问。

## License

MIT
