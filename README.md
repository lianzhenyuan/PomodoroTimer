# 番茄钟 (Pomodoro Timer)

基于 React + Vite 构建的桌面番茄钟应用，通过 Claude Code 辅助完成开发。

## 技术栈

- **React 19** — UI 框架
- **Vite 8** — 构建工具
- **Web Audio API** — 计时结束提示音
- **Notification API** — 桌面通知
- **SVG** — 环形进度条

## 实现过程

### 1. 项目初始化

使用 Vite 模板脚手架创建 React 项目：

```bash
npm create vite@latest . -- --template react
npm install
```

### 2. 核心组件设计

在 `src/App.jsx` 中实现单一组件架构，所有逻辑集中在一个组件内：

- **三种计时模式**：专注工作 (25min)、短休息 (5min)、长休息 (15min)
- **模式切换**：每完成 4 个番茄自动进入长休息，其余进入短休息；计时结束自动切换阶段
- **倒计时逻辑**：`setInterval` 驱动每秒 tick，`useRef` 持有音频上下文
- **提示音**：使用 Web Audio API 合成旋律音阶，无需外部音频文件
- **桌面通知**：计时结束时调用 Notification API 弹出系统通知

### 3. UI 样式

- **环形进度条**：SVG circle 配合 `stroke-dashoffset` 动态计算进度
- **模式标签切换**：分段控件风格的按钮组
- **深色模式**：通过 `prefers-color-scheme` 媒体查询自动适配
- **CSS 变量**：统一管理配色，方便主题定制

### 4. 配色方案

采用番茄主题色系：

| 变量 | 浅色模式 | 深色模式 | 用途 |
|------|---------|---------|------|
| `--bg` | `#faf9ff` | `#1a1a2e` | 主背景 |
| `--bg-muted` | `#eeecf4` | `#24244a` | 次要背景 |
| `--accent` | `#e85d4a` | `#e85d4a` | 强调色（番茄红） |

## 功能清单

- 专注工作 / 短休息 / 长休息三种模式
- SVG 环形进度条实时展示剩余时间
- 开始/暂停、重置、跳过操作
- 计时结束自动切换阶段
- 桌面系统通知
- Web Audio API 提示音
- 自动跟随系统深色/浅色模式
- 标签页标题实时显示倒计时

## 项目结构

```
.
├── public/
│   └── favicon.svg        # 番茄图标
├── src/
│   ├── App.jsx             # 主组件（计时逻辑 + UI）
│   ├── App.css             # 组件样式
│   ├── main.jsx            # 入口文件
│   └── index.css           # 全局样式 + CSS 变量
├── index.html
├── package.json
└── vite.config.js
```

## 本地运行

```bash
npm install
npm run dev
```

浏览器打开 `http://localhost:5173` 即可使用。
