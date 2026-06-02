# 🌟 MDX Dictionary Server & Word Kanban System

[![Build and Release Standalone EXE](https://github.com/YOUR_USERNAME/mdx-server/actions/workflows/build.yml/badge.svg)](https://github.com/YOUR_USERNAME/mdx-server/actions/workflows/build.yml)
[![Version](https://img.shields.io/badge/version-v1.0.0-blue.svg)](https://github.com/YOUR_USERNAME/mdx-server)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

**MDX Dictionary Server & Word Kanban** 是一个面向个人英语学习者的现代全栈字典查询与生词管理系统。它不仅能读取并解析本地流行的 `.mdx` / `.mdd` 词典数据、提供标准 HTTP 查词接口，还内置了极具品质感的磨砂玻璃风（Glassmorphism）生词看板、Anki 闪卡复习模块与云端发音系统，是您沉浸式查词与科学记忆的终极辅助工具。

---

## ✨ 重磅升级特性

* 🎨 **极致美学与双主题**：引入优雅的毛玻璃与微光投射设计，全自动支持**暗黑/明亮主题自适应切换**，文本高对比度优化，配有可折叠的轻量侧边栏。
* 📋 **单词生词看板**：根据 Anki 掌握度分栏管理生词（*待学习 New / 学习中 Learning / 已掌握 Mastered*），支持**卡片鼠标拖动物理排序与阶段同步**，并在卡片上显示精准到分钟的记忆到期倒计时。
* ⚡ **分栏即时查词与左右键切换**：在看板点击卡片可直接右侧滑出释义详情，无需切回查词主页；支持键盘**左右方向键（`←` / `→`）**在当前列物理排序中快速跳转并更新释义。
* 🃏 **3D 记忆闪卡复习系统**：
  * 支持一键开启全屏背单词，利用改良的 **SM-2 遗忘间隔算法** 进行精细化复习排队。
  * 配合平滑的 3D 卡片翻转动效，支持快捷键 `Space` 翻转释义，数字键 `1-5` 分别提交掌握度评分 (*Again / Hard / Good / Easy / Perfect*)，流畅如丝。
* 🗣 **微软 Natural TTS 与悬浮划词发音**：
  * **微软云端自然人声**：内置 Andrew, Ava, Andrew 等 13 种高质量云端人声，支持中英文双语智能识别、语速线性缩放。
  * **划词悬浮发泡**：在释义中选中任意文本，即刻自动弹出悬浮毛玻璃菜单，支持**一键朗读发音**与**一键收录生词**。
  * **本地优雅降级与 LRU 缓存**：断网或 API 请求失败时秒级平滑降级至系统 TTS 发音；内置最大容量 80 的语音 LRU 缓存，节流且发音零延迟。
* 🔍 **安全与大小写自动容错**：
  * SQL 语句全面参数绑定，拦截特殊符号带来的注入崩溃（如 `don't` 中单引号查词）。
  * 具备原型提取（lemma）与精确匹配失效退化能力：自动匹配忽略大小写的拼写，避免词典词头大小写差异导致查空。
* 🔗 **iframe 内深度拦截**：支持在释义 iframe 内双击自动单词检索、链接重定向拦截（直接由父窗口接管查询避免状态丢失），并实现 `/` 键全局查词聚焦。
* 📂 **生词文本一键流式导入/导出**：完美支持标准 `.txt` 文件（一行一词）进行无限制批量过滤去重导入与打包导出。
* 📥 **高品质系统托盘控制**：在无窗口后台运行时，会在 Windows 右下角注册精美的**系统托盘图标**，支持右键快捷菜单：显示词典名称、一键“打开查词网页”以及安全“退出服务器”并完美清理所有后台端口监听。无界面或缺少 UI 依赖时，系统将智能优雅退化为终端运行模式。

---

## 🚀 快速开始

### 1. 准备本地词典
请在您的项目根目录下，新建名为 `mdx` 的文件夹。将您拥有的 `.mdx` 文件（必选）及对应的图片音视频资源 `.mdd` 文件（可选）放入其中：
```text
mdx-server/
├── mdx/
│   ├── Oxford_Advanced_Learner_Dictionary.mdx
│   └── Oxford_Advanced_Learner_Dictionary.mdd  (可选)
```

### 2. 本地直接运行 Python
1. 请确保您的电脑上已安装 Python 3 环境。
2. 安装环境所需的 Python 标准库或依赖（如需开启托盘支持，需额外安装托盘库）：
   ```bash
   pip install pystray pillow
   ```
3. 双击 `run.bat` 或在终端运行：
   ```bash
   python mdx_server.py
   ```
4. 控制台显示 `resouce path : .../mdx` 并提示服务已启动后，使用浏览器打开以下本地网址即可：
   ```text
   http://localhost:8000/
   ```

---

## 📦 本地打包为单 EXE 指南

若您希望将其打包为**单个 Windows 独立可执行程序（.exe）**，方便自己双击使用或分享给他人，可按以下步骤操作：

1. **安装打包工具及托盘依赖**：
   ```powershell
   pip install pyinstaller pystray pillow
   ```
2. **一键打包**：
   在项目根目录下，执行以下打包命令：
   ```powershell
   pyinstaller -F -w --name="MDX_Dict_Server" --add-data "index.html;." --add-data "index.css;." --add-data "index.js;." mdx_server.py
   ```
   * *注：此命令不仅会将 Python 服务打包，还会直接把前端界面（`index.html`、`index.css`、`index.js`）以静态资源形式注入 EXE 内部，免去您额外携带界面文件的烦恼。*
3. **如何运行**：
   打包完成后，在根目录的 `dist/` 文件夹下即可找到 `MDX_Dict_Server.exe`。将其拷贝出来，并在它同级目录下创建 `mdx` 文件夹（放入词典）即可直接双击运行！

---

## 🤖 GitHub Actions 在线自动编译与发布

本项目已集成极佳的 **DevOps 持续集成流水线**。您不需要在本地进行任何打包，只需将项目推送至您自己的 GitHub 仓库，并通过 Actions 自动生成 EXE 并释放 Release 供下载：

### 如何触发在线打包？
1. 将本项目提交并推送至您个人的 GitHub 仓库。
2. 只要您在本地或 GitHub 给代码打上一个版本 tag 并推送，就会自动触发工作流。例如：
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions 在线虚拟机（Windows 最新环境）会自动拉取代码、配置 Python、编译打包，并**在您的 GitHub 仓库 Release 页面发布一个新版本，将生成的单文件 `MDX_Dict_Server.exe` 挂载在 Release 附件下**！
4. 编译工作流文件详见 [.github/workflows/build.yml](.github/workflows/build.yml)。

---

## ❓ 常见问题 FAQ

### 1. `words.db` 文件可以删除吗？
* **答案**：**可以删除**，但删除前请知悉后果。
* **说明**：`words.db` 是本地生词本的 SQLite 数据库文件，内部存放着您的生词名单、掌握状态、SRS 计划、评分时间等核心背词数据。
  * 如果您想**清空所有的生词及背词历史，从零开始**，可以直接将其删除。程序会在下次启动时自动建立空的数据库文件。
  * 如果您需要**保留数据或更换电脑**，请千万**不要删除**此文件。您只需将 `words.db` 拷贝移动至新程序所在的同级目录下，即可无缝继续您的复习进度。

### 2. 为什么双击打开打包后的 EXE 时提示找不到词典？
* **说明**：打包为单 EXE 后，程序内部的网页静态资源已嵌入 EXE 运行，但由于本地词典文件体积通常可达数 GB，不能、也不宜打包进 EXE。您必须保证在 EXE 的同级目录下存在一个 `mdx` 文件夹，且该文件夹内至少有一个有效的 `.mdx` 格式字典文件。

---

## 📄 开源许可

本项目遵循 [MIT](LICENSE) 开源许可协议。核心词典读取及查询基于 [mdict-query](https://github.com/mmjang/mdict-query) 库进行修改和适配。
