# 项目进度跟踪 (progress.md)

## 已完成
- **高颜值系统托盘图标支持 (Headless System Tray Icon)**：
  - 在 [mdx_server.py](file:///D:/Users/A/Desktop/mdx-server-master/mdx_server.py) 中，使用 `pystray` 与 `pillow` 库为无控制台窗口运行（`-w` 参数打包）实现了一个高品质系统托盘图标。
  - 托盘图标采用透明背景的靛蓝色渐变书本设计。
  - 支持右键菜单操作：显示当前加载的词典、一键“打开查词网页”以及安全“退出服务器”并彻底销毁后台 HTTP 监听线程。
  - 引入了无桌面/无库环境的 `ImportError` 优雅退化技术，如果未安装依赖，则自动转为控制台挂起模式，确保了跨平台最大兼容性。
- **单文件 EXE 打包路径兼容支持 (PyInstaller Path Compatibility)**：
  - 重构了 [mdx_server.py](file:///D:/Users/A/Desktop/mdx-server-master/mdx_server.py) 中的静态资源和词典目录查找逻辑，支持使用 PyInstaller 的 `--add-data` 打包方式。当被打包成单文件 EXE 后，能够自动通过 `sys._MEIPASS` 动态释放和读取打包进 EXE 内部的 `index.html`、`index.css` 和 `index.js` 静态界面，同时保留在外部同级 `mdx` 目录中定位词典的功能，实现纯单文件分发。
- **修复看板卡片压缩折叠问题 (Fix Kanban Card Collapsing)**：
  - 在 [index.css](file:///D:/Users/A/Desktop/mdx-server-master/index.css) 中对 `.kanban-card`、`.card-avatar` 和 `.card-delete` 应用了 `flex-shrink: 0;`。当看板某一列的卡片数量过多时，防止 Flexbox 容器为了容纳全部子项而等比例压缩卡片的高度导致卡片折叠、字画重叠，从而能够保留正常尺寸并优雅地触发列内滚动条。
- **看板查词兼顾与快捷导航 (Kanban Unified Query & Navigation)**：
  - 重构了全局 `queryWord` 查词入口，当处于“单词看板”视图时，查词不再强制跳转到“查词”视图，而是直接利用看板的右侧详情抽屉展示，完美兼顾了单词看板和查词功能。
  - 在详情抽屉头部加入了“上一个”和“下一个”单词卡片切换按钮（`kanbanPrevBtn` / `kanbanNextBtn`），使用户在阅读完当前释义后可以直接点击按看板物理排列顺序导航到下一个词，不需要再去网格重新寻找。
  - 扩展了全局和 iframe 内部的 `keydown` 监听，在非输入框聚焦时，支持直接通过键盘**左右方向键（ArrowLeft / ArrowRight）**来上下切换看板单词释义，操作效率大幅跃升。
  - 针对词典释义中点击超链接进行跳转的场景，在 iframe 加载完成后为子文档绑定了 `click` 事件代理拦截器。在点击本地查词链接（相对路径）时阻止默认的行为，重定向提取出目标词并执行 `queryWord`，避免了跳转后因父窗口状态（评分标题、历史记录、待评分单词）脱节导致的打分错位。
  - 兼容外部未知生词，在 `updateKanbanReviewPanel` 找不到该词时，显示为“未加入”高亮标签，允许直接评分将其直接收录进生词本。
- **分栏工作台与看板即时查词 (Kanban Split Workspace Layout & Instant Detail Panel)**：
  - 重构了生词看板的查词行为。在看板主页面内包裹了 `.kanban-layout-wrapper` 并新增了 `.kanban-detail-panel` 侧滑释义详情面板，完全取代了先前“点击看板卡片强制切回查词 Search 视图”的低效折返跳流程。
  - 详情抽屉采用优雅的毛玻璃风格，默认隐藏，当在看板点击单词卡片时，看板整体自动弹性压缩，右侧同步滑出释义详情，多卡片连续点击时直接在详情内平滑刷新。
  - 在详情抽屉头部内置了专属的 Anki 掌握度评分胶囊面板（`#kanbanWordReview`），点击打分后直接完成看板数据的后台入库更新，并实时在顶部同步高亮渲染状态标签，使背诵、看释义、 Anki 掌握度评分、拖动卡片完全集中在同一看板看板工作区内，高效沉浸。
  - 为屏幕低于 `1000px` 的多终端和紧凑布局实现了智能自适应降级：详情面板自动转为悬浮覆盖抽屉，优先保全 New 与 Learning 等看板拖放交互列的展示。
- **大小写容错与 SQL 注入拦截 (Case-insensitive Query & Param Binding)**：
  - 重构了底层的 [mdict_query.py](file:///D:/Users/A/Desktop/mdx-server-master/mdict_query.py) 模块中的 `mdx_lookup` 和 `mdd_lookup` 数据库查询方式，全面将原本拼接 SQL 字符串的写法改造成安全的参数绑定占位符（`?`），规避了因特殊符号（如单双引号）引发的 SQL 解析崩溃。
  - 引入了精确匹配失效自动退化查询机制：优先搜索精确对应的词头；如果检索为空，则利用 `COLLATE NOCASE` 附加条件做忽略大小写变体再次查询，一举解决了词典中大小写不同（如 `Apple` 与 `apple`）时查空释义的疑难问题。
- **闪卡复习单词自动发音 (Flashcard Auto Pronounce)**：
  - 在设置抽屉面板的发音配置中追加了 `闪卡复习自动发音` 偏好开关 (chkAutoPronounceOnFlashcard)。
  - 当在闪卡复习模块加载及切换下一张卡片时（`loadCard(index)`），如果该开关启用，系统会在卡片呈现正面词汇时自动触发 TTS 朗读发音，辅助单词记忆并提升复习连贯性。
- **单词释义界面内快捷键失效修复 (Iframe Focus Shortcut)**：
  - 解决了聚焦到词典释义页面（即 `<iframe>` 内部）时父窗口快捷键 `/` 不起作用的问题。通过在 iframe 加载完成后，向子文档绑定 `keydown` 事件拦截器，按下 `/` 时自动重夺父窗口焦点并瞬间定位至查词输入框。
  - 闪卡复习背面的释义 iframe 同样挂载了此项键盘事件绑定，保障背单词打分与查词跳转的无缝联动。
- **双击单词查词 (Double-click lookup)**：
  - 在设置抽屉面板中，新增“双击单词查词”功能开关与 `chkDblClickQuery` 选择按钮，状态同样利用 `localStorage` 自动持久化保存。
  - 在 iframe 绑定逻辑中增加了 `dblclick` 监听器。开启时，在词典释义中双击任意文本会自动获取选择词汇，过滤前后的标点与特殊符号，并在全局直接拉取该词查询释义，无需手动复制粘贴。
- **划词发音与悬浮发音框 (Selection Pronounce & Speech Bubble)**：
  - 实现了划词文本发音的独立交互组件。当用户在词典释义（主查词 iframe 或闪卡复习背面 iframe）中选中任意文本时，选区正上方会自动淡入滑出一个优雅毛玻璃风格的悬浮气泡框。
  - 气泡框集成了**播放发音**与**一键加入生词本**（全栈逻辑关联）功能，且支持对划词文本的长词自动截断与预览显示。
  - 支持中英文混合状态下的智能语言检测。如检测出中文字符则自动匹配中文发音人，否则使用英文发音人进行播放。
- **发音与云端/本地 TTS 设置模块**：
  - 在“系统设置”侧滑抽屉中新增了独立板块，集成了强大的发音偏好配置：
    - **划词发音悬浮框开关** (chkSelectionPronounce)
    - **划词自动发音开关** (chkAutoPronounceOnSelect)
    - **查词自动发音开关** (chkAutoPronounceOnQuery)
    - **发音引擎切换** (selTtsEngine)：支持云端 Natural TTS (微软云端人声，支持 Andrew/Ava/Xiaoxiao/Yunxi 等 13 种中英文精细人声) 与本地内置 Speech Synthesis (读取本机的发音引擎，支持系统安装的各种人声)。
    - **英文/中文发音人单独配置**：云端模式下可分别选定中英文首选人声，本地模式下动态读取系统的 voice 资源生成菜单。
    - **语速调节滑块** (rngTtsRate)：支持 0.5x 到 2.0x 语速线性缩放。
    - **一键发音测试** (btnTestTts)：方便用户调试当前选定的发音引擎、音色和语速。
- **发音优雅降级与本地 LRU 缓存**：
  - 移植并优化了 `sidepanel.js` 中的 TTS 云端请求。请求 `https://tts.webextools.com/tts` 获取云端发音音频并转换成 BlobURL 播放。
  - 如果用户的设备无网络或云端请求异常，会自动且平滑地降级回本地系统的 Speech Synthesis 执行播放，体验毫无断裂感。
  - 设计了容量上限为 80 组的 LRU 语音缓存机制（`naturalSpeechAudioCache`），在语速、人声、内容完全匹配时免去重复网络请求，省流并瞬间播放。
- **前端代码模块化分离 (HTML/CSS/JS)**：
  - 将原先拥挤的 `index.html` 模块化解耦，把全部 CSS 样式和 JS 交互逻辑完美抽离到独立的 [index.css](file:///D:/Users/A/Desktop/mdx-server-master/index.css) 和 [index.js](file:///D:/Users/A/Desktop/mdx-server-master/index.js) 中，让代码结构极为干净。
  - 在后端 [mdx_server.py](file:///D:/Users/A/Desktop/mdx-server-master/mdx_server.py) 中，扩展了根路径静态路由托管，支持自动检测、匹配 MIME 类型并以 UTF-8 编码响应 `/index.css` 和 `/index.js`，保证功能完美映射。
- **全局无限制查词快捷键**：
  - 解除了原先 “闪卡复习模式下屏蔽快捷键” 的限制。支持在系统任意视图（看板、闪卡开始、复习测试）下随时按下 `/` 键，触发自动回到搜索视图，并瞬间将输入焦点及文本选择聚焦在顶部查词输入框。
- **顶部页眉空间整合（高度高度节省）**：
  - 彻底移除了原有 iframe 顶部的 `iframe-toolbar`，节省了 60px 的屏幕纵向高度，让释义呈现页面大面积扩展。
  - 将单词标题、NEW/LEARNING 状态标签、加入生词本按钮、Again/Hard/Good/Easy/Perfect 评分胶囊按钮全部移到与顶部查词框**同一行**中，实现极致紧凑的视觉逻辑。
  - 在页眉右侧引入了 `#iframeActions`，集成了网页重新载入（刷新）、新窗口打开（新标签页）与关闭功能，仅在查词视图且有内容时才自适应滑出。
- **右上角控制项与设置侧滑抽屉**：
  - 将主题切换（月亮/太阳）以及系统设置（齿轮）按钮移动至顶部页眉的最右侧，界面更具对称美感。
  - 删除了原本堆叠在左侧边栏底部的“导入”、“导出”、“设置”等控制底栏，仅保留历史与导航，让侧边栏折叠后视觉上空无一物、极致轻量。
  - 将生词本导入（TXT格式）与导出的交互按钮全部迁入系统设置面板中.
  - 重构了设置面板，使之从从前的“底部抽屉”修改为“右侧滑出抽屉” (slide from right)，配合微观磨砂投射，视觉极具品质感。
- **浅色模式文字对比度修复**：
  - 在 [index.css](file:///D:/Users/A/Desktop/mdx-server-master/index.css) 中引入了一套完整的基于 CSS 变量自适应的主题架构，彻底替换了滚动条、主标题、版本徽章、导航激活状态、历史记录、卡片背景及边框、进度格点、头部状态栏、打分胶囊以及设置面板中的硬编码白颜色 `#fff` 及浅白渐变。
  - 重构了主题切换脚本，将 `isDark` 包装进自适应的 `applyTheme(dark)` 状态管理函数中，实现切换时全部 30+ 组视觉变量的完全应用与还原，并在 `localStorage` 中进行持久化，保证用户刷新页面后主题配置不丢失。
  - **修复主题切换按钮失效问题**：解决了在页面加载初始化时，由于 `themeToggle` 变量在 `applyTheme` 调用之后才被声明（`const` TDZ 暂时性死区），导致的 `ReferenceError` 页面 JS 崩溃问题。已调整声明顺序，使主题能完美切换与初始化。
- **侧边栏阴影优化与折叠功能**：
  - 去除了浅色/深色主题下的侧边栏投影，统一使用极简 1px border 分离，大幅度美化了侧边栏的视觉效果。
  - 实现了侧边栏自适应折叠逻辑，点击折叠按钮后宽度收缩至 `72px` 并自动隐藏所有文字、历史列表和配置面板，仅保留图标显示；状态记录持久化保存在 `localStorage` 中。
- **新建查词界面**：创建了 [index.html](file:///D:/Users/A/Desktop/mdx-server-master/index.html)，包含输入框、用 `<iframe>` 构成的结果展示框架、localStorage 历史记录管理器以及主题切换。整体采用 Glassmorphism 毛玻璃和深色/浅色极简美学设计，并铺满整个页面。
- **配置路由拦截**：在 [mdx_server.py](file:///D:/Users/A/Desktop/mdx-server-master/mdx_server.py) 中拦截对根路径 `/` 和 `/index.html` 的请求，直接读取并返回根目录下的 `index.html` 文件。
- **修复资源路径解析**：重构了 [mdx_server.py](file:///D:/Users/A/Desktop/mdx-server-master/mdx_server.py) 和 [mdx_util.py](file:///D:/Users/A/Desktop/mdx-server-master/mdx_util.py) 中的 `base_path` 逻辑，修复了在开发环境下直接运行 python 时，因为 `sys.executable` 导致 `base_path` 指向 python 安装路径而非项目根目录，从而无法访问 `mdx` 静态资源的缺陷。
- **修复服务器内部错误**：移存在 `application` 路由中对 `__file__` 的直接引用（其在 WSGI 多线程/打包环境中可能会抛出 NameError 异常），统一使用 `base_path` 确定路径；并在路由分发块中添加了 `try-except` 机制，直接输出详细异常，提高服务的健壮性与易调试性。
- **单词管理与看板管理**：设计并实现了完整的生词本看板（新词 New / 学习中 Learning / 已掌握 Mastered），支持卡片在看板列之间拖拽同步状态。
- **精准到分钟的间隔重复算法 (SRS)**：后端接入 SQLite 并实现了改良版 SM-2 算法，支持 1 分钟、5 分钟、15 分钟等精细度复习倒计时并在前端动态渲染。
- **查词与评分面板联动**：在查词主页 [index.html](file:///D:/Users/A/Desktop/mdx-server-master/index.html) 的 iframe 头部整合了生词状态 Badge 与 “Again/Hard/Good/Easy/Perfect” 评分面板，支持一键加入生词本和即时打分。
- **前端 UI 视觉与动效大修**：重构了 [index.html](file:///D:/Users/A/Desktop/mdx-server-master/index.html) 的 CSS/HTML。引入了顶部渐变星云（Ambient Glow）、侧边栏激活指示条、看板列的呼吸状态指示灯、磨砂高悬浮卡片、首字母徽章和熟练度进度小槽。评分按钮升级为具有微光投射的胶囊形。
- **系统设置项与 localStorage 联动**：引入了 “查词自动入生词本开关” 和 “删除免确认开关” 设置，数据使用 localStorage 自动持久化并在页面加载时完整还原。
- **生词本导入导出**：实现前端一键流式导出生词本（TXT 文本，一行一个词），且支持读取本地文本文件批量过滤并上传后台完成高效插入。
- **“背单词” 3D 闪卡复习系统**：
  - 新增全屏闪卡模式，具备 Start（配置）、Play（复习中）、Result（完成总结）三大交互区块；
  - 完美实现 Space (空格键) 3D 翻转卡片拉取 MDX iframe 释义，键盘 `1-5` 数字键进行 Anki-like 掌握度评分；
  - 卡片翻转时伴随平滑微观阴影透射，打分后触发平滑切出的 slide-out 动效并紧接着 slide-in 载入下一词，体验极为流畅。

## 架构字典
- [mdx_server.py](file:///D:/Users/A/Desktop/mdx-server-master/mdx_server.py): 服务入口，提供 WSGI HTTP 服务器，路由解析静态资源、词典查询请求与 `/api/words` 生词与复习接口。支持对 `/index.css` 和 `/index.js` 的直接读取与 MIME 挂接渲染。
- [db.py](file:///D:/Users/A/Desktop/mdx-server-master/db.py): 本地 SQLite 数据库管理器，提供表初始化、单词增删改查、看板状态修改以及 SM-2 记忆算法。
- [mdx_util.py](file:///D:/Users/A/Desktop/mdx-server-master/mdx_util.py): 词典查询与渲染工具，处理 MDX 文本释义 and MDD 媒体资源的读取。
- [file_util.py](file:///D:/Users/A/Desktop/mdx-server-master/file_util.py): 文件 system 辅助工具，提供读取文本、二进制、获取后缀、获取目录下所有文件等基本方法。
- [lemma.py](file:///D:/Users/A/Desktop/mdx-server-master/lemma.py): 英语词汇原型提取工具，用于查词失败时的退化处理。
- [index.html](file:///D:/Users/A/Desktop/mdx-server-master/index.html): 查词主界面（包含新发音设置面板及气泡框，以及看板内的详情滑出面板），外链 `/index.css` 样式与 `/index.js` 动作脚本。
- [index.css](file:///D:/Users/A/Desktop/mdx-server-master/index.css): 页面全部样式表，包含 Glassmorphism UI 体系、发音气泡框浮动动画样式、看板分栏及响应式详情面板样式。
- [index.js](file:///D:/Users/A/Desktop/mdx-server-master/index.js): 前端全部交互逻辑，控制 DOM 构建、云端微软语音的网络流拉取与本地优雅降级发音控制、划词弹窗计算、看板详情抽屉滑出和独立评分。

## 函数字典目录
### [db.py](file:///D:/Users/A/Desktop/mdx-server-master/db.py)
- `get_conn()`: 获取 SQLite 数据库连接，并将 row_factory 设置为 Row。
- `init_db()`: 初始化数据库，创建 `words` 表。
- `add_or_update_word(word, status)`: 添加或手动更新单词看板状态，并重新计算或重置对应复习间隔。
- `delete_word(word)`: 从生词本删除单词。
- `get_all_words()`: 获取生词本所有单词。
- `review_word(word, score)`: 提交单词复习反馈（1-5分），基于 SM-2 计算新的复习时间戳。
- `import_words(words_list)`: 高效批量导入单词，使用 executemany 配合事务操作（INSERT OR IGNORE）。

### [mdx_server.py](file:///D:/Users/A/Desktop/mdx-server-master/mdx_server.py)
- `get_url_map()`: 获取 `mdx` 目录下所有可供映射的静态资源路径字典。
- `application(environ, start_response)`: WSGI 请求处理入口，新增静态资源托管分流，以及生词读写、打分、删除接口。
- `loop()`: 启动 WSGI 服务器的循环函数。
- `setup_tray(dict_name)`: 在主线程中初始化并启动系统托盘图标，提供右键展示当前词典、网页查词快捷入口以及退出选项。如果系统缺少 UI 库依赖则优雅降级为终端控制台挂起模式。

### [mdict_query.py (IndexBuilder 类)](file:///D:/Users/A/Desktop/mdx-server-master/mdict_query.py)
- `mdx_lookup(keyword)`: 在 sqlite3 构建 of MDX_INDEX 表中检索释义。更新为参数绑定占位符，且在精确匹配查空时，退化为 `COLLATE NOCASE` 忽略大小写再次查询，提高查词健壮性。
- `mdd_lookup(keyword)`: 在 MDX_INDEX 表中检索媒体数据。同样追加了参数绑定与忽略大小写的二级备用匹配。

### [index.js (前端主要 JS 函数)](file:///D:/Users/A/Desktop/mdx-server-master/index.js)
- `initSettings()`: 从 localStorage 读取自动入词本、免确认删除、双击查词、划词发音、自动发音（查词/划词/闪卡复习）、发音音色配置、语速等设置并配置表单交互状态。
- `saveSettings()`: 将当前的全部发音、查词入生词本偏好等缓存存入 localStorage 存档。
- `populateTtsVoices()`: 静态载入微软云端人声菜单，并向 window 发音设备绑定 voice 变更监听。
- `populateLocalVoices()`: 读取本地系统的 Synthesis 可用声音列表，动态挂载至本地声音角色下拉框中。
- `toggleVoiceSettingsVisibility()`: 根据当前发音引擎（云端/本地）决定发音人设置区块的显隐。
- `detectLanguage(text)`: 自动识别划词文本语言，支持智能中英文分类判断。
- `speakTextHandler(text)`: 发音调度总入口，优先选用云端 Natural 方式，在发生异常时平滑降级至本地语音。
- `fetchNaturalSpeechAudio(text, voice, rate)`: 将文本请求传入 WebExTools TTS 发音 API 并创建 BlobURL，附带 LRU 高速缓存机制。
- `speakLocalText(text, lang, rate)`: 使用 window.speechSynthesis 模块驱动底层硬件发音。
- `showSpeechBubble(text, x, y)`: 计算划词选择选区（Range）的居中点，将其转换成父窗口坐标，淡入拉出悬浮发音气泡框。
- `hideSpeechBubble()`: 闭合正在呈现的划词气泡。
- `handleIframeMousedown(e)`: 捕获 iframe 内点击，随时关闭发音气泡框。
- `handleIframeMouseup(e, iframe)`: 捕获 iframe 内划词变化，延时拉取 Range 选区进行弹窗判定。
- `showReviewArea(area)`: 在“开始配置(start)”、“测试卡片(play)”、“完成总结(result)”三个子界面间流畅切换，并根据复习状态联动隐藏/显示全局页眉。
- `flipCurrentCard()`: 翻转 3D 卡片为背面（加载 MDX 释义网页的 iframe）并唤出评分胶囊。
- `loadCard(index)`: 根据复习队列加载相应单词及它的 MDX 释义到卡片中。如果设置中开启了 `autoPronounceOnFlashcard` 开关，在卡片加载正面时会自动发出该词发音。
- `gradeCard(score)`: 对当前闪卡提交打分并执行带有 slide-out / slide-in 过渡动效的切词渲染。
- `applyTheme(dark)`: 应用指定主题模式（true 为暗色，false 为亮色），全局切换 30 多个自适应 CSS 变量并持久化保存。
- `setSidebarCollapsed(collapsed)`: 控制侧边栏的折叠与展开样式转换，并将配置持久化记录至 localStorage 中。
- `switchView(view)`: 切换视图面板，并控制顶部页眉操作栏 `#iframeActions` 的显隐。
- `queryWord(word)`: 执行查词操作，加载 iframe 释义，如果处于看板模式则定向在右侧详情抽屉加载，避免视图跳转。
- `bindIframeEvents(iframe)`: 对指定的 iframe (释义或闪卡背面) 加载并绑定按键拦截、双击查词、划词发音以及超链接拦截代理。
- `handleIframeKeydown(e)`: 捕获并拦截 iframe 内部按下的快捷键，映射至父窗口的快捷处理、闪卡打分及看板切换。
- `handleIframeDblClick(e)`: 捕获并拦截 iframe 内部的双击行为，提取选定单词原形并执行直接查词。
- `showKanbanWordDetail(word)`: 点击看板卡片后调用，加载卡片单词的 MDX 释义到看板内专属的侧滑详情面板中，不发生主视图跳转。
- `updateKanbanReviewPanel(word)`: 配合侧滑详情展示，动态在该面板顶部同步渲染单词的掌握阶段状态（支持未加入状态），高亮 Anki 打分区域。
- `navigateKanbanWord(direction)`: 看板详情开启时，根据当前看板卡片的物理顺序上下切换并查询单词释义。
- `handleIframeClickProxy(e)`: iframe 内超链接点击代理拦截，捕获 MDX 内置查词跳转链接并由父页面接管查询，避免状态脱节。

## 错误/交互日志
- **.venv python 路径缺失 pip**：由于 `.venv` 未初始化完整，执行 `& .venv/Scripts/python -m pip list` 报错 `No module named pip`。已改为使用系统 `python` 运行及验证。
- **静态资源路径定位错误**：运行 `python mdx_server.py --help` 时，发现打印出的 `resource_path` 指向了系统 Python 安装目录下的 `C:/Users/A/AppData/Local/Programs/Python/Python312/mdx`。已修正 base_path 定位。
- **服务异常：访问根路径发生服务器内部错误 (A server error occurred)**：WSGI 拦截返回 index.html 时未做异常防空，已重构 base_path 加载并加装 try-except Traceback 保护。
- **grep 命令执行失败**：在 Windows 环境中运行 `grep_search` 时，底层通过外部 grep 执行出错 `executable file not found in %PATH%`。随后改为使用 `view_file` 定位行号。
- **FontAwesome 资源链接标签截断导致 CSS 失效**：之前重构时 FontAwesome 标签截断导致后续整个 `<style>` 标签无法解析，已将其还原为 `all.min.css` 标签，使样式恢复正常。
- **闪卡视图 DOM 及交互逻辑截断丢失**：在之前的自动替换中，发现 index.html 的 JS 部分被严重截断，丢失了全部闪卡复习操作与设置面板持久化等逻辑。已通过定位受损的 DOM / 标签并重构补全。
- **白色/浅色主题文字对比度缺陷与主题状态丢失**：用户切换至浅色主题后，由于大量文字和面板元素（如 logo 文本、历史记录、卡片文字等）硬编码了白颜色，导致部分内容完全不可见。且在由浅色切回深色时因部分变量未被重置导致界面错乱，且无 localStorage 记忆。已全面重构 CSS / JS 自适应变量体系解决。
- **主题切换按钮失效 (ReferenceError)**：因为在 DOMContentLoaded 时 load-time 触发 `applyTheme(isDark)`，但 `themeToggle` 按钮在之后才被 `const themeToggle` 初始化，导致了 `Cannot access 'themeToggle' before initialization` 的 TDZ 报错，造成 JS 引擎中断。已将 `themeToggle` and `isDark` 声明前移至 `applyTheme(isDark)` 调用之前解决。
- **Python Unicode 转义报错 (SyntaxError)**：在使用 python 命令覆盖写入 progress.md 时，由于文本中包含 `C:\Users\A\AppData` 等 Windows 路径中的 `\U` 字符被 Python 转义解释器捕获报错。已改用 `/` 路径格式 and 转移符号避开解决。
- **lemma.py 文件编译发生语法错误 (SyntaxError)**：在执行 py_compile 命令验证代码编译时，发现 `lemma.py` 使用了 Python 2.x 的 `print "..."` 语法，导致 Python 3.x 抛出缺少括号错误。由于该文件为系统自带的兼容处理脚本且在此之前已能跑通主业务，本次主要在 HTML/CSS/JS 前端层面实现发音，因此不对该旧代码执行修正。
- **单引号/大写查词失败引发服务端 SQL 故障与查空问题**：用户反馈部分带单引号（如 don't）的词输入后导致 SQL 语句发生 SyntaxError 语法解析异常而崩溃。且大写词汇在小写词典里直接返回查不到。已通过改为参数化绑定与 `COLLATE NOCASE` 大小写折叠完美解决。
- **grep_search 外部命令缺失报错**：在 Windows 运行 `grep_search` 时遇到 `exec: "grep": executable file not found in %PATH%` 报错。已改用 `python` 单行脚本检索行号与位置，避免了外部依赖。
- **GitHub Actions v3 废弃警告导致构建失败**：GitHub 官方因安全策略逐步停用 v3 版本的 artifact 上传 API，导致流程无法跑通。已将 workflow 依赖项全面迭代升级：checkout -> v4，setup-python -> v5，upload-artifact -> v4，gh-release -> v2，保证工作流在最新标准下顺利执行。


## 关联映射
- `发音气泡及 TTS 设置 -> index.html (追加发音设置项与划词悬浮 DOM 元素)`
- `发音样式扩展 -> index.css (追加毛玻璃自适应划词悬浮发音气泡框的排版与动画)`
- `TTS 发音核心与设置绑定 -> index.js (加入 API 请求、LRU 缓存机制、本地优雅降级、划词 Range 计算与气泡展示等全部发音与设置联动逻辑)`
- `查词自动发音 -> index.js (在 resultIframe.load 事件中加入 autoPronounceOnQuery 状态自动发音调用)`
- `闪卡复习自动发音 -> index.html (加入开关复选框), index.js (loadCard 时触发 speakTextHandler)`
- `大小写及特殊字符安全查词 -> mdict_query.py (使用参数占位符并以 COLLATE NOCASE 做二级容错查找)`
- `看板即时查词分栏 -> index.html (插入 kanban-layout-wrapper 及 kanbanDetailPanel), index.css (编写 split-mode 卡片伸缩与抽屉滑出响应式样式), index.js (卡片 click 事件映射重构, 抽屉内 data-kanban-score 评分监听绑定与 switchView 切换修补)`
- `看板查词拦截与跳转控制 -> index.js (重构 queryWord 重定向、引入 handleIframeClickProxy 点击拦截代理与 navigateKanbanWord 快捷导航, 并在 input 回车、历史点击和全局/iframe keydown 监听中绑定)`
- `导航 UI -> index.html (在 panel-title-row 添加左右方向 icon 按钮), index.css (编写磨砂自适应 .kanban-nav-btn 样式)`
- `看板防折叠样式配置 -> index.css (对 .kanban-card, .card-avatar, .card-delete 加上 flex-shrink: 0 从而防压缩折叠)`
- `单文件打包路径优化 -> mdx_server.py (兼容 sys._MEIPASS 以支持静态资源与外部词典路径隔离定位)`
- `系统托盘控制 -> mdx_server.py (加入 setup_tray 托盘图标及右键菜单实现), build.yml (升级依赖包 pip install pystray pillow)`

## 待办/规划中 (Todo List)
- [ ] **看板性能与虚拟滚动优化**：当看板内单词卡片数量达到成百上千量级时，优化 DOM 渲染性能，考虑引入虚拟列表 (Virtual List) 或按需懒加载机制以确保滚动流畅。
- [ ] **看板与闪卡历史统计图表**：引入轻量图表或数据栏，展示每日复习单词的熟悉度百分比分布与总词数变化曲线。
- [ ] **精细化查词缓存**：在前端增加离线词汇模糊匹配与词形原型跳转逻辑优化。
