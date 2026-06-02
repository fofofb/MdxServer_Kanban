document.addEventListener('DOMContentLoaded', () => {
            const searchInput = document.getElementById('searchInput');
            const searchBtn = document.getElementById('searchBtn');
            const historyList = document.getElementById('historyList');
            const clearHistoryBtn = document.getElementById('clearHistoryBtn');
            const welcomeScreen = document.getElementById('welcomeScreen');
            const iframeContainer = document.getElementById('iframeContainer');
            const resultIframe = document.getElementById('resultIframe');
            const currentWordDisplay = document.getElementById('currentWordDisplay');
            const loaderOverlay = document.getElementById('loaderOverlay');
            
            const refreshBtn = document.getElementById('refreshBtn');
            const newTabBtn = document.getElementById('newTabBtn');
            const closeBtn = document.getElementById('closeBtn');
            const iframeActions = document.getElementById('iframeActions');

            // 导航及核心区域
            const navSearch = document.getElementById('navSearch');
            const navKanban = document.getElementById('navKanban');
            const navFlashcard = document.getElementById('navFlashcard');
            
            const globalHeader = document.getElementById('globalHeader');
            const historyContainer = document.getElementById('historyContainer');
            const kanbanContainer = document.getElementById('kanbanContainer');
            const flashcardContainer = document.getElementById('flashcardContainer');
            
            // 设置及导入导出元素
            const settingsDrawer = document.getElementById('settingsDrawer');
            const btnSettings = document.getElementById('btnSettings');
            const closeSettingsBtn = document.getElementById('closeSettingsBtn');
            const chkAutoAdd = document.getElementById('chkAutoAdd');
            const chkDeleteConfirm = document.getElementById('chkDeleteConfirm');
            const chkDblClickQuery = document.getElementById('chkDblClickQuery');
            
            // 新增发音与 TTS 设置相关 DOM
            const chkSelectionPronounce = document.getElementById('chkSelectionPronounce');
            const chkAutoPronounceOnSelect = document.getElementById('chkAutoPronounceOnSelect');
            const chkAutoPronounceOnQuery = document.getElementById('chkAutoPronounceOnQuery');
            const chkAutoPronounceOnFlashcard = document.getElementById('chkAutoPronounceOnFlashcard');
            const selTtsEngine = document.getElementById('selTtsEngine');
            const naturalVoiceSettings = document.getElementById('naturalVoiceSettings');
            const localVoiceSettings = document.getElementById('localVoiceSettings');
            const selVoiceEn = document.getElementById('selVoiceEn');
            const selVoiceZh = document.getElementById('selVoiceZh');
            const selLocalVoice = document.getElementById('selLocalVoice');
            const rngTtsRate = document.getElementById('rngTtsRate');
            const lblTtsRate = document.getElementById('lblTtsRate');
            const btnTestTts = document.getElementById('btnTestTts');

            // 发音气泡 DOM
            const speechBubble = document.getElementById('speechBubble');
            const bubblePlayBtn = document.getElementById('bubblePlayBtn');
            const bubbleAddWordBtn = document.getElementById('bubbleAddWordBtn');
            const bubbleTextPreview = document.getElementById('bubbleTextPreview');
            
            // 看板详情抽屉/面板 DOM
            const kanbanDetailPanel = document.getElementById('kanbanDetailPanel');
            const kanbanDetailWord = document.getElementById('kanbanDetailWord');
            const closeKanbanDetailBtn = document.getElementById('closeKanbanDetailBtn');
            const kanbanDetailIframe = document.getElementById('kanbanDetailIframe');
            const kanbanWordReview = document.getElementById('kanbanWordReview');
            const kanbanPrevBtn = document.getElementById('kanbanPrevBtn');
            const kanbanNextBtn = document.getElementById('kanbanNextBtn');
            
            const btnImport = document.getElementById('btnImport');
            const btnExport = document.getElementById('btnExport');
            const fileImporter = document.getElementById('fileImporter');

            // 评分与释义面板
            const wordReviewPanel = document.getElementById('wordReviewPanel');
            const addWordBtn = document.getElementById('addWordBtn');
            const scoreSection = document.getElementById('scoreSection');
            const wordStatusBadge = document.getElementById('wordStatusBadge');
            const nextReviewDisplay = document.getElementById('nextReviewDisplay');

            // 闪卡容器内区域与组件
            const flashcardStartArea = document.getElementById('flashcardStartArea');
            const flashcardPlayArea = document.getElementById('flashcardPlayArea');
            const flashcardResultArea = document.getElementById('flashcardResultArea');
            
            const btnStartReview = document.getElementById('btnStartReview');
            const btnExitReview = document.getElementById('btnExitReview');
            const btnFinishReview = document.getElementById('btnFinishReview');
            
            const selCardScope = document.getElementById('selCardScope');
            const selCardCount = document.getElementById('selCardCount');
            const chkCardShuffle = document.getElementById('chkCardShuffle');
            
            const lblProgress = document.getElementById('lblProgress');
            const progressFill = document.getElementById('progressFill');
            
            const flipCardWrapper = document.getElementById('flipCardWrapper');
            const flipCard = document.getElementById('flipCard');
            const frontWordText = document.getElementById('frontWordText');
            const backIframe = document.getElementById('backIframe');
            const playScorePanel = document.getElementById('playScorePanel');
            const lblResultDesc = document.getElementById('lblResultDesc');

            let currentWord = '';
            let wordsData = []; // 存储后端生词数据
            
            // 闪卡复习状态
            let reviewQueue = [];
            let currentIndex = 0;
            let isFlipped = false;

            // 闪卡区域切换
            function showReviewArea(area) {
                flashcardStartArea.style.display = 'none';
                flashcardPlayArea.style.display = 'none';
                flashcardResultArea.style.display = 'none';
                
                if (area === 'start') {
                    flashcardStartArea.style.display = 'flex';
                    globalHeader.style.display = 'flex';
                } else if (area === 'play') {
                    flashcardPlayArea.style.display = 'flex';
                    globalHeader.style.display = 'none';
                } else if (area === 'result') {
                    flashcardResultArea.style.display = 'flex';
                    globalHeader.style.display = 'flex';
                }
            }

            // 翻转当前卡片
            function flipCurrentCard() {
                if (isFlipped) return;
                isFlipped = true;
                flipCard.classList.add('flipped');
                playScorePanel.style.display = 'flex';
            }

            // 加载闪卡单词
            function loadCard(index) {
                if (index >= reviewQueue.length) {
                    showReviewArea('result');
                    lblResultDesc.textContent = `恭喜！您已顺利完成本次 ${reviewQueue.length} 个单词的闪卡复习。`;
                    return;
                }
                
                isFlipped = false;
                flipCard.classList.remove('flipped');
                playScorePanel.style.display = 'none';
                
                const item = reviewQueue[index];
                frontWordText.textContent = item.word;
                backIframe.src = '/' + encodeURIComponent(item.word);
                
                // 如果开启了闪卡自动发音
                if (settings.autoPronounceOnFlashcard) {
                    speakTextHandler(item.word);
                }
                
                lblProgress.textContent = `${index + 1} / ${reviewQueue.length}`;
                progressFill.style.width = `${((index + 1) / reviewQueue.length) * 100}%`;
            }

            // 开启闪卡会话
            function startCardSession() {
                showReviewArea('play');
                loadCard(currentIndex);
            }

            // 打分切卡
            async function gradeCard(score) {
                if (!isFlipped) return;
                const word = reviewQueue[currentIndex].word;
                
                // 提交到后端
                await reviewWordInDB(word, score);
                
                // 播放切出动画
                flipCardWrapper.classList.add('slide-out');
                
                setTimeout(() => {
                    currentIndex++;
                    loadCard(currentIndex);
                    flipCardWrapper.classList.remove('slide-out');
                    flipCardWrapper.classList.add('slide-in');
                    
                    setTimeout(() => {
                        flipCardWrapper.classList.remove('slide-in');
                    }, 350);
                }, 350);
            }

            // 绑定闪卡开始复习按钮
            btnStartReview.addEventListener('click', () => {
                const scope = selCardScope.value;
                const limitVal = selCardCount.value;
                const shuffle = chkCardShuffle.checked;
                
                let list = [];
                const now = Math.floor(Date.now() / 1000);
                
                if (scope === 'due') {
                    // status === 'new' 或者到期时间 <= now 
                    list = wordsData.filter(w => w.status === 'new' || w.next_review <= now);
                } else {
                    list = [...wordsData];
                }
                
                if (list.length === 0) {
                    alert("当前没有满足条件的单词供复习！");
                    return;
                }
                
                if (shuffle) {
                    for (let i = list.length - 1; i > 0; i--) {
                        const j = Math.floor(Math.random() * (i + 1));
                        [list[i], list[j]] = [list[j], list[i]];
                    }
                }
                
                if (limitVal !== 'all') {
                    const count = parseInt(limitVal);
                    list = list.slice(0, count);
                }
                
                reviewQueue = list;
                currentIndex = 0;
                startCardSession();
            });

            // 退出复习
            btnExitReview.addEventListener('click', () => {
                showReviewArea('start');
            });

            // 结束复习返回看板
            btnFinishReview.addEventListener('click', () => {
                switchView('kanban');
            });

            // 闪卡正面点击翻卡
            flipCard.addEventListener('click', () => {
                if (!isFlipped) {
                    flipCurrentCard();
                }
            });

            // 闪卡控制台打分按钮绑定
            playScorePanel.querySelectorAll('.btn-score').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const score = parseInt(btn.getAttribute('data-score'));
                    gradeCard(score);
                });
            });
            
            // ==========================================================================
            // 发音与 TTS 云端/本地配置
            // ==========================================================================
            const NATURAL_TTS_ENDPOINT = "https://tts.webextools.com/tts";
            const NATURAL_TTS_CACHE_LIMIT = 80;
            const naturalSpeechAudioCache = new Map();

            // 微软云端 Natural TTS 常用角色
            const NATURAL_TTS_VOICES = {
                en: "en-US-AndrewNeural",
                "zh-CN": "zh-CN-XiaoxiaoNeural"
            };

            const NATURAL_TTS_VOICE_OPTIONS = {
                en: [
                    ["en-US-AndrewNeural", "Andrew (云端男声)"],
                    ["en-US-AvaNeural", "Ava (云端女声)"],
                    ["en-US-EmmaNeural", "Emma (云端女声)"],
                    ["en-US-BrianNeural", "Brian (云端男声)"],
                    ["en-US-JennyNeural", "Jenny (云端女声)"],
                    ["en-GB-RyanNeural", "Ryan (英音男声)"],
                    ["en-GB-SoniaNeural", "Sonia (英音女声)"]
                ],
                "zh-CN": [
                    ["zh-CN-XiaoxiaoNeural", "Xiaoxiao (云端女声)"],
                    ["zh-CN-YunxiNeural", "Yunxi (云端男声)"],
                    ["zh-CN-YunjianNeural", "Yunjian (云端男声)"],
                    ["zh-CN-XiaoyiNeural", "Xiaoyi (云端女声)"],
                    ["zh-TW-HsiaoChenNeural", "HsiaoChen (闽南女声)"],
                    ["zh-TW-YunJheNeural", "YunJhe (闽南男声)"]
                ]
            };

            let currentNaturalAudio = null;
            let currentPlaybackAudio = null;
            let currentPlaybackFinish = null;
            let currentUtteranceFinish = null;
            let speechPlaybackId = 0;

            // 填充发音人下拉列表
            function populateTtsVoices() {
                selVoiceEn.innerHTML = NATURAL_TTS_VOICE_OPTIONS.en.map(
                    v => `<option value="${v[0]}">${v[1]}</option>`
                ).join('');
                
                selVoiceZh.innerHTML = NATURAL_TTS_VOICE_OPTIONS["zh-CN"].map(
                    v => `<option value="${v[0]}">${v[1]}</option>`
                ).join('');

                populateLocalVoices();
                if ("speechSynthesis" in window) {
                    window.speechSynthesis.onvoiceschanged = populateLocalVoices;
                }
            }

            function populateLocalVoices() {
                if (!("speechSynthesis" in window)) return;
                const voices = window.speechSynthesis.getVoices();
                if (voices.length === 0) return;
                
                selLocalVoice.innerHTML = voices.map(v => 
                    `<option value="${v.voiceURI}">${v.name} (${v.lang})</option>`
                ).join('');

                if (settings.localVoiceURI) {
                    selLocalVoice.value = settings.localVoiceURI;
                }
            }

            function toggleVoiceSettingsVisibility() {
                const engine = selTtsEngine.value;
                if (engine === 'natural') {
                    naturalVoiceSettings.style.display = 'block';
                    localVoiceSettings.style.display = 'none';
                } else {
                    naturalVoiceSettings.style.display = 'none';
                    localVoiceSettings.style.display = 'block';
                }
            }

            // 系统设置缓存
            let settings = {
                autoAdd: false,
                skipDeleteConfirm: false,
                dblClickQuery: true,
                selectionPronounce: true,
                autoPronounceOnSelect: false,
                autoPronounceOnQuery: false,
                autoPronounceOnFlashcard: false,
                ttsEngine: 'natural',
                naturalVoiceEn: 'en-US-AndrewNeural',
                naturalVoiceZh: 'zh-CN-XiaoxiaoNeural',
                localVoiceURI: '',
                ttsRate: 1.0
            };

            // 从 localStorage 初始化设置
            function initSettings() {
                const stored = localStorage.getItem('mdx_sys_settings');
                if (stored) {
                    try {
                        const parsed = JSON.parse(stored);
                        settings = { ...settings, ...parsed };
                    } catch (e) {
                        console.error(e);
                    }
                }
                
                chkAutoAdd.checked = settings.autoAdd;
                chkDeleteConfirm.checked = settings.skipDeleteConfirm;
                chkDblClickQuery.checked = settings.dblClickQuery;
                chkSelectionPronounce.checked = settings.selectionPronounce !== false;
                chkAutoPronounceOnSelect.checked = !!settings.autoPronounceOnSelect;
                chkAutoPronounceOnQuery.checked = !!settings.autoPronounceOnQuery;
                chkAutoPronounceOnFlashcard.checked = !!settings.autoPronounceOnFlashcard;
                
                populateTtsVoices();

                selTtsEngine.value = settings.ttsEngine || 'natural';
                selVoiceEn.value = settings.naturalVoiceEn || 'en-US-AndrewNeural';
                selVoiceZh.value = settings.naturalVoiceZh || 'zh-CN-XiaoxiaoNeural';
                rngTtsRate.value = settings.ttsRate !== undefined ? settings.ttsRate : 1.0;
                lblTtsRate.textContent = `${parseFloat(rngTtsRate.value).toFixed(1)}x`;

                toggleVoiceSettingsVisibility();
            }

            function saveSettings() {
                settings.autoAdd = chkAutoAdd.checked;
                settings.skipDeleteConfirm = chkDeleteConfirm.checked;
                settings.dblClickQuery = chkDblClickQuery.checked;
                settings.selectionPronounce = chkSelectionPronounce.checked;
                settings.autoPronounceOnSelect = chkAutoPronounceOnSelect.checked;
                settings.autoPronounceOnQuery = chkAutoPronounceOnQuery.checked;
                settings.autoPronounceOnFlashcard = chkAutoPronounceOnFlashcard.checked;
                settings.ttsEngine = selTtsEngine.value;
                settings.naturalVoiceEn = selVoiceEn.value;
                settings.naturalVoiceZh = selVoiceZh.value;
                settings.localVoiceURI = selLocalVoice.value;
                settings.ttsRate = parseFloat(rngTtsRate.value);

                localStorage.setItem('mdx_sys_settings', JSON.stringify(settings));
            }

            chkAutoAdd.addEventListener('change', saveSettings);
            chkDeleteConfirm.addEventListener('change', saveSettings);
            chkDblClickQuery.addEventListener('change', saveSettings);
            chkSelectionPronounce.addEventListener('change', saveSettings);
            chkAutoPronounceOnSelect.addEventListener('change', saveSettings);
            chkAutoPronounceOnQuery.addEventListener('change', saveSettings);
            chkAutoPronounceOnFlashcard.addEventListener('change', saveSettings);
            
            selTtsEngine.addEventListener('change', () => {
                toggleVoiceSettingsVisibility();
                saveSettings();
            });
            selVoiceEn.addEventListener('change', saveSettings);
            selVoiceZh.addEventListener('change', saveSettings);
            selLocalVoice.addEventListener('change', saveSettings);
            rngTtsRate.addEventListener('input', () => {
                lblTtsRate.textContent = `${parseFloat(rngTtsRate.value).toFixed(1)}x`;
                saveSettings();
            });

            btnTestTts.addEventListener('click', () => {
                const testText = "Hello! Welcome to MDX dict server. 你好，欢迎使用云端语音测试。";
                speakTextHandler(testText);
            });

            // ==========================================================================
            // 发音与 TTS 核心播放引擎
            // ==========================================================================
            function detectLanguage(text) {
                // 检测是否含有中文
                if (/[\u4e00-\u9fa5]/.test(text)) {
                    return "zh-CN";
                }
                // 默认判为英文
                return "en-US";
            }

            function getNaturalVoice(lang) {
                if (lang.startsWith("zh")) {
                    return settings.naturalVoiceZh || NATURAL_TTS_VOICES["zh-CN"];
                }
                return settings.naturalVoiceEn || NATURAL_TTS_VOICES.en;
            }

            function createNaturalSpeechCacheKey(text, voice, rate) {
                return JSON.stringify({
                    text: String(text || "").trim(),
                    voice,
                    rate: rate || "+0%",
                    pitch: "+0Hz",
                    volume: "+0%"
                });
            }

            function trimNaturalSpeechAudioCache() {
                while (naturalSpeechAudioCache.size > NATURAL_TTS_CACHE_LIMIT) {
                    const [oldestKey, oldestAudioUrl] = naturalSpeechAudioCache.entries().next().value;
                    URL.revokeObjectURL(oldestAudioUrl);
                    naturalSpeechAudioCache.delete(oldestKey);
                }
            }

            function stopCurrentSpeech() {
                const finishInterruptedPlayback = currentPlaybackFinish;
                const finishInterruptedUtterance = currentUtteranceFinish;
                currentPlaybackFinish = null;
                currentUtteranceFinish = null;

                if ("speechSynthesis" in window) {
                    window.speechSynthesis.cancel();
                }

                if (currentPlaybackAudio) {
                    try {
                        currentPlaybackAudio.pause();
                        currentPlaybackAudio.removeAttribute("src");
                        currentPlaybackAudio.load();
                    } catch (e) {}
                    currentPlaybackAudio = null;
                }

                if (currentNaturalAudio && currentNaturalAudio !== currentPlaybackAudio) {
                    try {
                        currentNaturalAudio.pause();
                        currentNaturalAudio.removeAttribute("src");
                        currentNaturalAudio.load();
                    } catch (e) {}
                }

                currentNaturalAudio = null;
                speechPlaybackId += 1;

                if (finishInterruptedPlayback) {
                    finishInterruptedPlayback();
                }

                if (finishInterruptedUtterance) {
                    finishInterruptedUtterance();
                }
            }

            function startSpeechPlayback() {
                stopCurrentSpeech();
                speechPlaybackId += 1;
                return speechPlaybackId;
            }

            function playAudio(audio, playbackId = speechPlaybackId) {
                currentPlaybackAudio = audio;
                return new Promise((resolve) => {
                    const finish = () => {
                        if (currentPlaybackFinish === finish) {
                            currentPlaybackFinish = null;
                        }
                        if (currentPlaybackAudio === audio) {
                            currentPlaybackAudio = null;
                        }
                        if (currentNaturalAudio === audio) {
                            currentNaturalAudio = null;
                        }
                        if (speechPlaybackId === playbackId) {
                            speechPlaybackId += 1;
                        }
                        resolve();
                    };
                    currentPlaybackFinish = finish;
                    audio.addEventListener("ended", finish, { once: true });
                    audio.addEventListener("error", finish, { once: true });
                    const playResult = audio.play();

                    if (playResult?.catch) {
                        playResult.catch(finish);
                    }
                });
            }

            async function fetchNaturalSpeechAudio(text, voice, rateValue) {
                let apiRate = "+0%";
                if (rateValue !== 1.0) {
                    const pct = Math.round((rateValue - 1.0) * 100);
                    apiRate = pct >= 0 ? `+${pct}%` : `${pct}%`;
                }

                const cacheKey = createNaturalSpeechCacheKey(text, voice, apiRate);
                const cachedAudioUrl = naturalSpeechAudioCache.get(cacheKey);

                if (cachedAudioUrl) {
                    naturalSpeechAudioCache.delete(cacheKey);
                    naturalSpeechAudioCache.set(cacheKey, cachedAudioUrl);
                    return cachedAudioUrl;
                }

                const response = await fetch(NATURAL_TTS_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        text,
                        voice,
                        rate: apiRate,
                        pitch: "+0Hz",
                        volume: "+0%"
                    })
                });

                if (!response.ok) {
                    throw new Error("Natural speech request failed.");
                }

                const audioBuffer = await response.arrayBuffer();

                if (!audioBuffer.byteLength) {
                    throw new Error("Natural speech response was empty.");
                }

                const audioUrl = URL.createObjectURL(new Blob([audioBuffer], { type: "audio/mpeg" }));
                naturalSpeechAudioCache.set(cacheKey, audioUrl);
                trimNaturalSpeechAudioCache();

                return audioUrl;
            }

            function speakLocalText(text, lang = "en-US", rate = 1.0) {
                const spokenText = String(text || "").trim();
                if (!spokenText || !("speechSynthesis" in window)) {
                    return Promise.resolve();
                }

                const playbackId = startSpeechPlayback();
                const utterance = new SpeechSynthesisUtterance(spokenText);
                utterance.lang = lang;
                utterance.rate = rate;

                if (settings.localVoiceURI) {
                    const voices = window.speechSynthesis.getVoices();
                    const voice = voices.find(v => v.voiceURI === settings.localVoiceURI);
                    if (voice) {
                        utterance.voice = voice;
                        utterance.lang = voice.lang;
                    }
                } else {
                    const voice = findPreferredVoice(lang);
                    if (voice) {
                        utterance.voice = voice;
                        utterance.lang = voice.lang;
                    }
                }

                return new Promise((resolve) => {
                    const finish = () => {
                        if (currentUtteranceFinish === finish) {
                            currentUtteranceFinish = null;
                        }
                        if (speechPlaybackId === playbackId) {
                            speechPlaybackId += 1;
                        }
                        resolve();
                    };
                    currentUtteranceFinish = finish;
                    utterance.addEventListener("end", finish, { once: true });
                    utterance.addEventListener("error", finish, { once: true });
                    window.speechSynthesis.speak(utterance);
                });
            }

            function findPreferredVoice(lang) {
                if (!("speechSynthesis" in window)) return null;
                const voices = window.speechSynthesis.getVoices();
                const language = lang.toLowerCase();
                const exactVoices = voices.filter((voice) => voice.lang.toLowerCase() === language);
                const languageVoices = exactVoices.length
                    ? exactVoices
                    : voices.filter((voice) => voice.lang.toLowerCase().startsWith(language.split("-")[0]));

                return languageVoices.find((voice) => /microsoft/i.test(voice.name))
                    || languageVoices.find((voice) => voice.default)
                    || languageVoices[0]
                    || null;
            }

            // 外部发音触发统一入口
            async function speakTextHandler(text) {
                const spokenText = String(text || "").trim();
                if (!spokenText) return;

                const lang = detectLanguage(spokenText);
                const rateValue = parseFloat(settings.ttsRate || 1.0);

                if (settings.ttsEngine === "natural") {
                    const voice = getNaturalVoice(lang);
                    try {
                        const playbackId = startSpeechPlayback();
                        const audioUrl = await fetchNaturalSpeechAudio(spokenText, voice, rateValue);
                        if (speechPlaybackId !== playbackId) {
                            return;
                        }
                        currentNaturalAudio = new Audio(audioUrl);
                        await playAudio(currentNaturalAudio);
                    } catch (error) {
                        console.warn("Natural TTS failed, falling back to local speech synthesis.", error);
                        await speakLocalText(spokenText, lang, rateValue);
                    }
                } else {
                    await speakLocalText(spokenText, lang, rateValue);
                }
            }

            // ==========================================================================
            // 发音悬浮气泡框逻辑
            // ==========================================================================
            let speechBubbleText = "";

            function showSpeechBubble(text, x, y) {
                if (!settings.selectionPronounce) return;
                
                speechBubbleText = text;
                bubbleTextPreview.textContent = text;
                
                speechBubble.style.left = `${x}px`;
                speechBubble.style.top = `${y}px`;
                speechBubble.style.display = 'flex';
                
                // 强制回流以让 transition 动画生效
                speechBubble.offsetHeight;
                speechBubble.classList.add('show');
                
                // 如果启用了划词自动发音
                if (settings.autoPronounceOnSelect) {
                    speakTextHandler(text);
                }
            }

            function hideSpeechBubble() {
                if (speechBubble && speechBubble.classList.contains('show')) {
                    speechBubble.classList.remove('show');
                    setTimeout(() => {
                        if (!speechBubble.classList.contains('show')) {
                            speechBubble.style.display = 'none';
                        }
                    }, 200);
                }
            }

            // 监听主文档的点击以隐藏气泡
            document.addEventListener('mousedown', (e) => {
                if (speechBubble && !speechBubble.contains(e.target)) {
                    hideSpeechBubble();
                }
            });

            bubblePlayBtn.addEventListener('click', () => {
                if (speechBubbleText) {
                    speakTextHandler(speechBubbleText);
                }
            });

            bubbleAddWordBtn.addEventListener('click', () => {
                if (speechBubbleText) {
                    const word = speechBubbleText.trim();
                    // 英文单词一般不超过50个字符且含字母
                    if (word.length > 0 && word.length < 50) {
                        addWordToDB(word, 'new');
                        hideSpeechBubble();
                    } else {
                        alert("划词文本过长，不适合作为生词加入生词本。");
                    }
                }
            });

            // 打开/关闭设置抽屉
            btnSettings.addEventListener('click', () => {
                settingsDrawer.classList.add('open');
            });
            closeSettingsBtn.addEventListener('click', () => {
                settingsDrawer.classList.remove('open');
            });

            // 导入导出处理
            btnExport.addEventListener('click', () => {
                if (wordsData.length === 0) {
                    alert("当前生词本没有任何单词可供导出！");
                    return;
                }
                const text = wordsData.map(w => w.word).join('\n');
                const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'mdx_words_export.txt';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            });

            btnImport.addEventListener('click', () => {
                fileImporter.click();
            });

            fileImporter.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = async (evt) => {
                    const text = evt.target.result;
                    // 一行一个单词，过滤非空行，且去除首尾空白
                    const list = text.split('\n')
                                     .map(w => w.trim())
                                     .filter(w => w.length > 0 && /^[a-zA-Z\s'-]+$/.test(w));
                    
                    if (list.length === 0) {
                        alert("未从导入文件中解析出有效的英文单词列表！");
                        return;
                    }
                    
                    try {
                        const res = await fetch('/api/words/import', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ words: list })
                        });
                        const json = await res.json();
                        if (json.success) {
                            alert(`生词批量导入成功！共导入 ${list.length} 个单词。`);
                            await fetchWords();
                        } else {
                            alert("导入失败: " + json.error);
                        }
                    } catch (err) {
                        console.error(err);
                        alert("导入失败，网络错误");
                    }
                    // 重置 input
                    fileImporter.value = '';
                };
                reader.readAsText(file);
            });

            // 从 localStorage 初始化历史记录
            let queryHistory = JSON.parse(localStorage.getItem('mdx_query_history')) || [];

            // 渲染历史列表
            function renderHistory() {
                historyList.innerHTML = '';
                
                if (queryHistory.length === 0) {
                    historyList.innerHTML = `
                        <div class="empty-history">
                            <i class="fa-solid fa-clock-rotate-left"></i>
                            <span>无查询历史</span>
                        </div>
                    `;
                    return;
                }

                queryHistory.forEach((word) => {
                    const li = document.createElement('li');
                    li.className = 'history-item';
                    li.setAttribute('data-word', word);
                    
                    const span = document.createElement('span');
                    span.className = 'history-word';
                    span.textContent = word;
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'history-delete-btn';
                    deleteBtn.innerHTML = '<i class="fa-solid fa-trash-can"></i>';
                    deleteBtn.title = '删除此条记录';
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation(); // 阻止触发查词
                        removeHistoryItem(word);
                    });

                    li.appendChild(span);
                    li.appendChild(deleteBtn);
                    
                    // 点击历史记录进行查词
                    li.addEventListener('click', () => {
                        searchInput.value = word;
                        queryWord(word);
                    });

                    historyList.appendChild(li);
                });
            }

            // 添加历史记录
            function addHistoryItem(word) {
                if (!word || word.trim() === '') return;
                word = word.trim();
                
                // 去重并放最前
                queryHistory = queryHistory.filter(item => item.toLowerCase() !== word.toLowerCase());
                queryHistory.unshift(word);
                
                // 限制最多20条
                if (queryHistory.length > 20) {
                    queryHistory = queryHistory.slice(0, 20);
                }
                
                localStorage.setItem('mdx_query_history', JSON.stringify(queryHistory));
                renderHistory();
            }

            // 删除单条历史
            function removeHistoryItem(word) {
                queryHistory = queryHistory.filter(item => item.toLowerCase() !== word.toLowerCase());
                localStorage.setItem('mdx_query_history', JSON.stringify(queryHistory));
                renderHistory();
            }

            // 清空历史记录
            clearHistoryBtn.addEventListener('click', () => {
                if (confirm('确定要清空所有查询历史记录吗？')) {
                    queryHistory = [];
                    localStorage.removeItem('mdx_query_history');
                    renderHistory();
                }
            });

            // 获取全部生词数据
            async function fetchWords() {
                try {
                    const res = await fetch('/api/words');
                    const json = await res.json();
                    if (json.success) {
                        wordsData = json.data;
                        renderKanban();
                        if (currentWord) {
                            updateReviewPanel(currentWord);
                        }
                    }
                } catch (e) {
                    console.error("Fetch words error:", e);
                }
            }

            // 更新释义栏的评分/状态面板
            function updateReviewPanel(word) {
                if (!word) {
                    wordReviewPanel.style.display = 'none';
                    return;
                }
                wordReviewPanel.style.display = 'flex';
                
                const found = wordsData.find(w => w.word.toLowerCase() === word.toLowerCase());
                if (found) {
                    // 已在生词本中
                    addWordBtn.style.display = 'none';
                    scoreSection.style.display = 'flex';
                    
                    // 显示状态标签
                    wordStatusBadge.style.display = 'inline-block';
                    wordStatusBadge.textContent = found.status.toUpperCase();
                    wordStatusBadge.className = 'word-badge badge-' + found.status;
                    
                    // 显示下次复习时间
                    if (found.status === 'new') {
                        nextReviewDisplay.textContent = '待学习';
                        nextReviewDisplay.style.color = 'var(--text-secondary)';
                    } else {
                        const now = Math.floor(Date.now() / 1000);
                        const diff = found.next_review - now;
                        if (diff <= 0) {
                            nextReviewDisplay.textContent = '已到期复习';
                            nextReviewDisplay.style.color = '#f87171';
                            nextReviewDisplay.classList.add('timer-due');
                        } else {
                            nextReviewDisplay.classList.remove('timer-due');
                            nextReviewDisplay.style.color = 'var(--text-secondary)';
                            if (diff < 60) {
                                nextReviewDisplay.textContent = '刚刚';
                            } else if (diff < 3600) {
                                nextReviewDisplay.textContent = Math.ceil(diff / 60) + ' 分钟后复习';
                            } else if (diff < 86400) {
                                nextReviewDisplay.textContent = Math.ceil(diff / 3600) + ' 小时后复习';
                            } else {
                                nextReviewDisplay.textContent = Math.ceil(diff / 86400) + ' 天后复习';
                            }
                        }
                    }
                } else {
                    // 不在生词本中
                    addWordBtn.style.display = 'block';
                    scoreSection.style.display = 'none';
                    wordStatusBadge.style.display = 'none';
                }
            }

            // 添加单词
            async function addWordToDB(word, status = 'new') {
                if (!word) return;
                try {
                    const res = await fetch('/api/words', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ word, status })
                    });
                    const json = await res.json();
                    if (json.success) {
                        await fetchWords();
                    }
                } catch (e) {
                    console.error("Add word error:", e);
                }
            }

            // 复习打分
            async function reviewWordInDB(word, score) {
                if (!word) return;
                try {
                    const res = await fetch('/api/words/review', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ word, score })
                    });
                    const json = await res.json();
                    if (json.success) {
                        await fetchWords();
                    }
                } catch (e) {
                    console.error("Review word error:", e);
                }
            }

            // 删除单词
            async function deleteWordInDB(word) {
                if (!word) return;
                
                // chkDeleteConfirm 开启则免弹窗确认
                if (!settings.skipDeleteConfirm) {
                    if (!confirm(`确定要从生词本中删除 "${word}" 吗？`)) {
                        return;
                    }
                }
                
                try {
                    const res = await fetch('/api/words/delete', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ word })
                    });
                    const json = await res.json();
                    if (json.success) {
                        // 如果当前详情面板恰好是该单词，顺便关闭详情面板
                        if (currentKanbanWord && currentKanbanWord.toLowerCase() === word.toLowerCase()) {
                            kanbanDetailPanel.classList.remove('open');
                            kanbanDetailIframe.src = 'about:blank';
                            currentKanbanWord = '';
                        }
                        await fetchWords();
                    }
                } catch (e) {
                    console.error("Delete word error:", e);
                }
            }

            // ==========================================================================
            // 看板单词详情抽屉面板交互逻辑
            // ==========================================================================
            let currentKanbanWord = '';

            function showKanbanWordDetail(word) {
                if (!word) return;
                currentKanbanWord = word;
                kanbanDetailWord.textContent = word;
                kanbanDetailIframe.src = '/' + encodeURIComponent(word);
                
                // 打开详情分栏面板
                kanbanDetailPanel.classList.add('open');
                
                // 更新顶部小评分面板的信息
                updateKanbanReviewPanel(word);
            }

            function updateKanbanReviewPanel(word) {
                const found = wordsData.find(w => w.word.toLowerCase() === word.toLowerCase());
                const reviewTitle = kanbanWordReview.querySelector('.review-title');
                if (reviewTitle) {
                    if (found) {
                        let badgeClass = 'badge-new';
                        if (found.status === 'learning') {
                            badgeClass = 'badge-learning';
                        } else if (found.status === 'mastered') {
                            badgeClass = 'badge-mastered';
                        }
                        reviewTitle.innerHTML = `<span class="word-badge ${badgeClass}" style="display: inline-block;">${found.status.toUpperCase()}</span> 掌握度评分:`;
                    } else {
                        reviewTitle.innerHTML = `<span class="word-badge" style="display: inline-block; background: var(--text-secondary); color: var(--bg-primary); padding: 2px 6px; border-radius: 4px; font-weight: bold; font-size: 10px;">未加入</span> 掌握度评分:`;
                    }
                }
            }

            // 关闭详情面板
            closeKanbanDetailBtn.addEventListener('click', () => {
                kanbanDetailPanel.classList.remove('open');
                kanbanDetailIframe.src = 'about:blank';
                currentKanbanWord = '';
            });

            // 看板单词导航（上一个/下一个）
            function navigateKanbanWord(direction) {
                const cards = Array.from(document.querySelectorAll('.kanban-board .kanban-card'));
                if (cards.length === 0) return;
                
                let currentIndex = cards.findIndex(card => {
                    const cardWord = card.getAttribute('data-word');
                    return cardWord && cardWord.toLowerCase() === currentKanbanWord.toLowerCase();
                });
                
                let targetIndex = 0;
                if (currentIndex !== -1) {
                    targetIndex = currentIndex + direction;
                    if (targetIndex < 0) {
                        targetIndex = cards.length - 1;
                    } else if (targetIndex >= cards.length) {
                        targetIndex = 0;
                    }
                } else {
                    targetIndex = 0;
                }
                
                const targetWord = cards[targetIndex].getAttribute('data-word');
                showKanbanWordDetail(targetWord);
            }

            kanbanPrevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigateKanbanWord(-1);
            });

            kanbanNextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                navigateKanbanWord(1);
            });

            // 专门绑定看板打分按钮事件，避免与全局查词打分混淆
            document.querySelectorAll('[data-kanban-score="true"]').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const score = btn.getAttribute('data-score');
                    if (currentKanbanWord && score) {
                        await reviewWordInDB(currentKanbanWord, parseInt(score));
                        updateKanbanReviewPanel(currentKanbanWord);
                    }
                });
            });

            // 监听看板详情 iframe 加载完成事件，绑定划词发音、双击及自动发音
            kanbanDetailIframe.addEventListener('load', () => {
                try {
                    bindIframeEvents(kanbanDetailIframe);
                    // 查词自动播放发音
                    if (settings.autoPronounceOnQuery && currentKanbanWord) {
                        speakTextHandler(currentKanbanWord);
                    }
                } catch (e) {
                    console.error("Failed to bind kanban detail iframe events:", e);
                }
            });

            // 渲染看板视图
            function renderKanban() {
                const listNew = document.getElementById('listNew');
                const listLearning = document.getElementById('listLearning');
                const listMastered = document.getElementById('listMastered');
                
                listNew.innerHTML = '';
                listLearning.innerHTML = '';
                listMastered.innerHTML = '';
                
                let newCount = 0;
                let learningCount = 0;
                let masteredCount = 0;
                
                const now = Math.floor(Date.now() / 1000);
                
                wordsData.forEach(item => {
                    const card = document.createElement('div');
                    card.className = 'kanban-card';
                    card.setAttribute('draggable', 'true');
                    card.setAttribute('data-word', item.word);
                    
                    // 点击卡片直接在侧滑面板展示释义，不进行页面跳转
                    card.addEventListener('click', () => {
                        showKanbanWordDetail(item.word);
                    });
                    
                    // 拖拽事件绑定
                    card.addEventListener('dragstart', (e) => {
                        card.classList.add('dragging');
                        e.dataTransfer.setData('text/plain', item.word);
                    });
                    card.addEventListener('dragend', () => {
                        card.classList.remove('dragging');
                    });
                    
                    // 卡片主内容
                    const cardMain = document.createElement('div');
                    cardMain.className = 'card-main';
                    
                    // 首字母头像
                    const avatar = document.createElement('div');
                    avatar.className = 'card-avatar';
                    avatar.textContent = item.word.charAt(0);
                    
                    const infoDiv = document.createElement('div');
                    infoDiv.className = 'card-info';
                    
                    const wordSpan = document.createElement('span');
                    wordSpan.className = 'card-word';
                    wordSpan.textContent = item.word;
                    
                    // 熟练度指示格 (5个dot，通过repetition决定)
                    const progressBar = document.createElement('div');
                    progressBar.className = 'card-progress-bar';
                    
                    // repetition 越多点亮的 dot 越多，最高5个
                    const reps = Math.min(5, item.repetition || 0);
                    for (let i = 0; i < 5; i++) {
                        const dot = document.createElement('span');
                        dot.className = 'progress-dot' + (i < reps ? ' active' : '');
                        progressBar.appendChild(dot);
                    }
                    
                    infoDiv.appendChild(wordSpan);
                    infoDiv.appendChild(progressBar);
                    
                    cardMain.appendChild(avatar);
                    cardMain.appendChild(infoDiv);
                    
                    // 底部元数据
                    const metaDiv = document.createElement('div');
                    metaDiv.className = 'card-meta';
                    
                    const timerDiv = document.createElement('div');
                    timerDiv.className = 'card-timer';
                    
                    if (item.status === 'new') {
                        timerDiv.innerHTML = '<i class="fa-regular fa-clock"></i> <span>待学习</span>';
                    } else {
                        const diff = item.next_review - now;
                        if (diff <= 0) {
                            timerDiv.innerHTML = '<i class="fa-solid fa-triangle-exclamation timer-due"></i> <span class="timer-due">已到期</span>';
                        } else {
                            let text = '';
                            if (diff < 60) {
                                text = '1 分钟内';
                            } else if (diff < 3600) {
                                text = Math.ceil(diff / 60) + ' 分钟后';
                            } else if (diff < 86400) {
                                text = Math.ceil(diff / 3600) + ' 小时后';
                            } else {
                                text = Math.ceil(diff / 86400) + ' 天后';
                            }
                            timerDiv.innerHTML = `<i class="fa-regular fa-clock"></i> <span>${text}</span>`;
                        }
                    }
                    
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'card-delete';
                    deleteBtn.innerHTML = '<i class="fa-regular fa-trash-can"></i>';
                    deleteBtn.title = '从生词本中删除';
                    deleteBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteWordInDB(item.word);
                    });
                    
                    metaDiv.appendChild(timerDiv);
                    metaDiv.appendChild(deleteBtn);
                    
                    card.appendChild(cardMain);
                    card.appendChild(metaDiv);
                    
                    if (item.status === 'new') {
                        listNew.appendChild(card);
                        newCount++;
                    } else if (item.status === 'learning') {
                        listLearning.appendChild(card);
                        learningCount++;
                    } else {
                        listMastered.appendChild(card);
                        masteredCount++;
                    }
                });
                
                document.getElementById('countNew').textContent = newCount;
                document.getElementById('countLearning').textContent = learningCount;
                document.getElementById('countMastered').textContent = masteredCount;
            }

            // 视图切换控制
            function switchView(view) {
                // 切换视图时关闭看板释义详情面板
                if (view !== 'kanban') {
                    if (kanbanDetailPanel) {
                        kanbanDetailPanel.classList.remove('open');
                        kanbanDetailIframe.src = 'about:blank';
                    }
                    currentKanbanWord = '';
                }

                // 重置所有激活状态
                navSearch.classList.remove('active');
                navKanban.classList.remove('active');
                navFlashcard.classList.remove('active');
                
                kanbanContainer.style.display = 'none';
                flashcardContainer.style.display = 'none';
                welcomeScreen.style.display = 'none';
                iframeContainer.style.display = 'none';
                
                // 默认显示头部和历史
                globalHeader.style.display = 'flex';
                historyContainer.style.display = 'flex';

                if (view === 'search') {
                    navSearch.classList.add('active');
                    if (currentWord) {
                        iframeContainer.style.display = 'flex';
                        iframeActions.style.display = 'flex';
                    } else {
                        welcomeScreen.style.display = 'flex';
                        iframeActions.style.display = 'none';
                    }
                } else {
                    iframeActions.style.display = 'none';
                    if (view === 'kanban') {
                        navKanban.classList.add('active');
                        kanbanContainer.style.display = 'flex';
                        fetchWords();
                    } else if (view === 'flashcard') {
                        navFlashcard.classList.add('active');
                        flashcardContainer.style.display = 'flex';
                        
                        // 为了专心复习，在闪卡模式下完全隐藏左侧历史项，只显示侧边栏的大Tab
                        historyContainer.style.display = 'none';
                        
                        // 默认显示Start配置页
                        showReviewArea('start');
                        fetchWords();
                    }
                }
            }

            navSearch.addEventListener('click', () => switchView('search'));
            navKanban.addEventListener('click', () => switchView('kanban'));
            navFlashcard.addEventListener('click', () => switchView('flashcard'));

            // 执行查词
            function queryWord(word) {
                if (!word || word.trim() === '') return;
                word = word.trim();

                // 如果当前正处于“单词看板”视图，我们不要切换到查词（search）视图，而是直接利用看板的详情侧滑抽屉展示释义！
                if (kanbanContainer.style.display === 'flex') {
                    showKanbanWordDetail(word);
                    // 同样要添加到历史记录
                    addHistoryItem(word);
                    return;
                }

                currentWord = word;

                // 如果处于闪卡模式下，查词自动切换为查词主页
                if (flashcardContainer.style.display === 'flex') {
                    switchView('search');
                }

                // 界面切换
                welcomeScreen.style.display = 'none';
                iframeContainer.style.display = 'flex';
                currentWordDisplay.textContent = word;
                iframeActions.style.display = 'flex';
                
                // 显示加载动画
                loaderOverlay.style.display = 'flex';
                
                // 设置 iframe 源，进行查询
                resultIframe.src = '/' + encodeURIComponent(word);
                
                // chkAutoAdd 开启时，若单词不在生词本，自动添加
                const found = wordsData.find(w => w.word.toLowerCase() === word.toLowerCase());
                if (settings.autoAdd && !found) {
                    addWordToDB(word, 'new');
                } else {
                    updateReviewPanel(word);
                }

                // 添加到历史记录
                addHistoryItem(word);
            }

            // 绑定 iframe 内部的事件（包含快捷键与双击取词查询与划词发音）
            function bindIframeEvents(iframe) {
                if (!iframe || !iframe.contentWindow) return;
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    if (!iframeDoc) return;

                    // 1. 快捷键监听
                    iframeDoc.removeEventListener('keydown', handleIframeKeydown);
                    iframeDoc.addEventListener('keydown', handleIframeKeydown);

                    // 2. 双击查词监听
                    iframeDoc.removeEventListener('dblclick', handleIframeDblClick);
                    iframeDoc.addEventListener('dblclick', handleIframeDblClick);

                    // 3. 划词发音点击与鼠标移动监听
                    iframeDoc.removeEventListener('mousedown', handleIframeMousedown);
                    iframeDoc.addEventListener('mousedown', handleIframeMousedown);

                    // 为避免 listener 重复，先清除由于 wrap 产生匿名函数的 listener，可以在 iframe 加载时重新绑定
                    // 清除 mouseup 最稳妥的方式是把事件挂在带有标志的变量上，或者直接直接覆盖
                    iframeDoc.onmouseup = (e) => handleIframeMouseup(e, iframe);

                    // 4. 超链接拦截代理
                    iframeDoc.removeEventListener('click', handleIframeClickProxy);
                    iframeDoc.addEventListener('click', handleIframeClickProxy);
                } catch (err) {
                    console.error("Error binding iframe events:", err);
                }
            }

            // iframe 内超链接点击拦截代理函数
            function handleIframeClickProxy(e) {
                const anchor = e.target.closest('a');
                if (anchor) {
                    const href = anchor.getAttribute('href');
                    if (href) {
                        // 排除外部链接、JavaScript 伪协议、锚点以及音视频媒体文件
                        if (href.startsWith('http://') || 
                            href.startsWith('https://') || 
                            href.startsWith('javascript:') || 
                            href.startsWith('#') ||
                            href.endsWith('.mp3') ||
                            href.endsWith('.wav') ||
                            href.endsWith('.ogg') ||
                            href.endsWith('.spx')) {
                            return; // 保持原本默认行为，不进行拦截
                        }
                        
                        // 拦截本地查词相对跳转
                        e.preventDefault();
                        
                        let targetWord = href;
                        if (targetWord.startsWith('/')) {
                            targetWord = targetWord.substring(1);
                        }
                        targetWord = decodeURIComponent(targetWord).trim();
                        
                        if (targetWord) {
                            queryWord(targetWord);
                            searchInput.value = targetWord;
                        }
                    }
                }
            }

            function handleIframeMousedown(e) {
                hideSpeechBubble();
            }

            function handleIframeMouseup(e, iframe) {
                if (!settings.selectionPronounce) return;
                
                setTimeout(() => {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        const selection = iframeDoc.getSelection();
                        if (!selection) return;
                        
                        const text = selection.toString().trim();
                        if (text.length > 0 && text.length < 200) {
                            const range = selection.getRangeAt(0);
                            const rect = range.getBoundingClientRect();
                            const iframeRect = iframe.getBoundingClientRect();
                            
                            const x = rect.left + iframeRect.left + (rect.width / 2) + window.scrollX;
                            const y = rect.top + iframeRect.top + window.scrollY;
                            
                            showSpeechBubble(text, x, y - 8);
                        }
                    } catch (err) {
                        console.error("Failed to parse iframe selection:", err);
                    }
                }, 50);
            }

            function handleIframeKeydown(e) {
                // 看板详情打开时，左右方向键切换单词
                if (kanbanContainer.style.display === 'flex' && kanbanDetailPanel.classList.contains('open')) {
                    if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        navigateKanbanWord(-1);
                        return;
                    }
                    if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        navigateKanbanWord(1);
                        return;
                    }
                }

                // 闪卡进行中测试键盘控制
                if (flashcardContainer.style.display === 'flex' && flashcardPlayArea.style.display === 'flex') {
                    if (e.key === ' ' || e.code === 'Space') {
                        e.preventDefault();
                        if (!isFlipped) {
                            flipCurrentCard();
                        }
                        return;
                    }
                    if (isFlipped && ['1', '2', '3', '4', '5'].includes(e.key)) {
                        e.preventDefault();
                        gradeCard(parseInt(e.key));
                        return;
                    }
                }

                // 按 "/" 键在任何界面（包括 iframe 内部）聚焦查词输入框
                if (e.key === '/' && document.activeElement !== searchInput) {
                    e.preventDefault();
                    if (flashcardContainer.style.display === 'flex' && flashcardPlayArea.style.display === 'flex') {
                        showReviewArea('start');
                    }
                    switchView('search');
                    window.focus();
                    searchInput.focus();
                    searchInput.select();
                }
            }

            function handleIframeDblClick(e) {
                if (!settings.dblClickQuery) return;
                
                let selectedText = "";
                const iframeDoc = e.currentTarget;
                const iframeWin = iframeDoc.defaultView || iframeDoc.parentWindow;
                
                if (iframeWin && iframeWin.getSelection) {
                    selectedText = iframeWin.getSelection().toString();
                } else if (iframeDoc.selection) {
                    selectedText = iframeDoc.selection.createRange().text;
                }

                selectedText = selectedText.trim();
                // 清理非字母数字前缀后缀
                selectedText = selectedText.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '');
                
                if (selectedText.length > 0 && selectedText.length < 50) {
                    if (flashcardContainer.style.display === 'flex' && flashcardPlayArea.style.display === 'flex') return;
                    
                    queryWord(selectedText);
                    searchInput.value = selectedText;
                }
            }

            // iframe 加载完成事件
            resultIframe.addEventListener('load', () => {
                loaderOverlay.style.display = 'none';
                try {
                    bindIframeEvents(resultIframe);
                    
                    // 查词自动播放发音
                    if (settings.autoPronounceOnQuery && currentWord) {
                        speakTextHandler(currentWord);
                    }
                } catch (e) {
                    console.error("Failed to bind iframe events:", e);
                }
            });

            // 闪卡背面 iframe 加载完成事件
            backIframe.addEventListener('load', () => {
                try {
                    bindIframeEvents(backIframe);
                } catch (e) {
                    console.error("Failed to bind back iframe events:", e);
                }
            });

            // 回车查词
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    queryWord(searchInput.value);
                }
            });

            // 点击查询按钮查词
            searchBtn.addEventListener('click', () => {
                queryWord(searchInput.value);
            });

            // 快捷键监听
            document.addEventListener('keydown', (e) => {
                // 看板详情打开时，左右方向键切换单词 (非输入框聚焦时)
                if (kanbanContainer.style.display === 'flex' && 
                    kanbanDetailPanel.classList.contains('open') && 
                    document.activeElement !== searchInput) {
                    if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        navigateKanbanWord(-1);
                        return;
                    }
                    if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        navigateKanbanWord(1);
                        return;
                    }
                }

                // 闪卡进行中测试键盘控制
                if (flashcardContainer.style.display === 'flex' && flashcardPlayArea.style.display === 'flex') {
                    // 空格翻牌
                    if (e.key === ' ' || e.code === 'Space') {
                        e.preventDefault();
                        if (!isFlipped) {
                            flipCurrentCard();
                        }
                        return;
                    }
                    // 数字键 1-5 评分
                    if (isFlipped && ['1', '2', '3', '4', '5'].includes(e.key)) {
                        e.preventDefault();
                        gradeCard(parseInt(e.key));
                        return;
                    }
                }

                // 按 "/" 键在任何界面聚焦查词输入框
                if (e.key === '/' && document.activeElement !== searchInput) {
                    e.preventDefault();
                    if (flashcardContainer.style.display === 'flex' && flashcardPlayArea.style.display === 'flex') {
                        showReviewArea('start');
                    }
                    switchView('search');
                    searchInput.focus();
                    searchInput.select();
                }
            });

            // 刷新按钮
            refreshBtn.addEventListener('click', () => {
                if (currentWord) {
                    loaderOverlay.style.display = 'flex';
                    resultIframe.src = '/' + encodeURIComponent(currentWord);
                }
            });

            // 新窗口打开按钮
            newTabBtn.addEventListener('click', () => {
                if (currentWord) {
                    window.open('/' + encodeURIComponent(currentWord), '_blank');
                }
            });

            // 关闭按钮，回到欢迎页面
            closeBtn.addEventListener('click', () => {
                welcomeScreen.style.display = 'flex';
                iframeContainer.style.display = 'none';
                resultIframe.src = 'about:blank';
                currentWord = '';
                searchInput.value = '';
                updateReviewPanel('');
                iframeActions.style.display = 'none';
            });

            // 主题应用与持久化函数
            function applyTheme(dark) {
                isDark = dark;
                localStorage.setItem('mdx_theme', isDark ? 'dark' : 'light');
                
                if (isDark) {
                    document.documentElement.style.setProperty('--bg-gradient', 'radial-gradient(circle at 50% -20%, rgba(99, 102, 241, 0.15) 0%, rgba(2, 6, 23, 0) 50%), #020617');
                    document.documentElement.style.setProperty('--sidebar-bg', 'rgba(8, 12, 28, 0.7)');
                    document.documentElement.style.setProperty('--text-primary', '#f8fafc');
                    document.documentElement.style.setProperty('--text-secondary', '#94a3b8');
                    document.documentElement.style.setProperty('--sidebar-border', 'rgba(255, 255, 255, 0.05)');
                    document.documentElement.style.setProperty('--input-bg', 'rgba(5, 8, 22, 0.6)');
                    document.documentElement.style.setProperty('--input-border', 'rgba(255, 255, 255, 0.08)');
                    document.documentElement.style.setProperty('--history-item-hover', 'rgba(255, 255, 255, 0.04)');
                    document.documentElement.style.setProperty('--card-bg', 'rgba(15, 23, 42, 0.35)');
                    document.documentElement.style.setProperty('--card-border', 'rgba(255, 255, 255, 0.06)');
                    document.documentElement.style.setProperty('--card-hover-bg', 'rgba(255, 255, 255, 0.05)');
                    
                    document.documentElement.style.setProperty('--logo-text-gradient', 'linear-gradient(to right, #ffffff, #cbd5e1)');
                    document.documentElement.style.setProperty('--title-gradient', 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)');
                    document.documentElement.style.setProperty('--version-badge-color', '#a5b4fc');
                    document.documentElement.style.setProperty('--version-badge-bg', 'rgba(99, 102, 241, 0.12)');
                    document.documentElement.style.setProperty('--version-badge-border', 'rgba(99, 102, 241, 0.2)');
                    document.documentElement.style.setProperty('--nav-active-color', '#ffffff');
                    document.documentElement.style.setProperty('--nav-active-bg', 'rgba(99, 102, 241, 0.08)');
                    document.documentElement.style.setProperty('--card-avatar-bg', 'rgba(255, 255, 255, 0.03)');
                    document.documentElement.style.setProperty('--card-avatar-border', 'rgba(255, 255, 255, 0.05)');
                    document.documentElement.style.setProperty('--card-avatar-color', '#a5b4fc');
                    document.documentElement.style.setProperty('--column-bg', 'rgba(10, 15, 30, 0.45)');
                    document.documentElement.style.setProperty('--column-border', 'rgba(255, 255, 255, 0.04)');
                    document.documentElement.style.setProperty('--column-count-bg', 'rgba(255, 255, 255, 0.06)');
                    document.documentElement.style.setProperty('--column-count-border', 'rgba(255, 255, 255, 0.04)');
                    document.documentElement.style.setProperty('--progress-dot-bg', 'rgba(255, 255, 255, 0.08)');
                    document.documentElement.style.setProperty('--toolbar-bg', 'rgba(8, 12, 28, 0.85)');
                    document.documentElement.style.setProperty('--btn-bg', 'rgba(255, 255, 255, 0.04)');
                    document.documentElement.style.setProperty('--btn-border', 'rgba(255, 255, 255, 0.04)');
                    document.documentElement.style.setProperty('--review-panel-bg', 'rgba(255, 255, 255, 0.02)');
                    document.documentElement.style.setProperty('--review-panel-border', 'rgba(255, 255, 255, 0.06)');
                    document.documentElement.style.setProperty('--main-bg', 'rgba(2, 6, 23, 0.4)');
                    document.documentElement.style.setProperty('--loader-bg', 'rgba(2, 6, 23, 0.7)');
                    document.documentElement.style.setProperty('--drawer-bg', 'rgba(10, 15, 30, 0.9)');
                    document.documentElement.style.setProperty('--select-option-bg', '#0f172a');
                    document.documentElement.style.setProperty('--scrollbar-thumb', 'rgba(255, 255, 255, 0.12)');
                    document.documentElement.style.setProperty('--scrollbar-thumb-hover', 'rgba(255, 255, 255, 0.25)');
                    document.documentElement.style.setProperty('--track-bg', 'rgba(255, 255, 255, 0.05)');
                    document.documentElement.style.setProperty('--slider-bg', 'rgba(255, 255, 255, 0.1)');
                    document.documentElement.style.setProperty('--slider-border', 'rgba(255, 255, 255, 0.05)');
                    
                    document.documentElement.style.setProperty('--score-1-color', '#fca5a5');
                    document.documentElement.style.setProperty('--score-1-bg', 'rgba(239, 68, 68, 0.15)');
                    document.documentElement.style.setProperty('--score-2-color', '#fdbb2d');
                    document.documentElement.style.setProperty('--score-2-bg', 'rgba(249, 115, 22, 0.15)');
                    document.documentElement.style.setProperty('--score-3-color', '#fef08a');
                    document.documentElement.style.setProperty('--score-3-bg', 'rgba(234, 179, 8, 0.15)');
                    document.documentElement.style.setProperty('--score-4-color', '#93c5fd');
                    document.documentElement.style.setProperty('--score-4-bg', 'rgba(59, 130, 246, 0.15)');
                    document.documentElement.style.setProperty('--score-5-color', '#a7f3d0');
                    document.documentElement.style.setProperty('--score-5-bg', 'rgba(16, 185, 129, 0.15)');

                    document.documentElement.style.setProperty('--badge-new-color', '#c7d2fe');
                    document.documentElement.style.setProperty('--badge-new-bg', 'rgba(99, 102, 241, 0.1)');
                    document.documentElement.style.setProperty('--badge-new-border', 'rgba(99, 102, 241, 0.2)');
                    document.documentElement.style.setProperty('--badge-learning-color', '#fde047');
                    document.documentElement.style.setProperty('--badge-learning-bg', 'rgba(245, 158, 11, 0.1)');
                    document.documentElement.style.setProperty('--badge-learning-border', 'rgba(245, 158, 11, 0.2)');
                    document.documentElement.style.setProperty('--badge-mastered-color', '#a7f3d0');
                    document.documentElement.style.setProperty('--badge-mastered-bg', 'rgba(16, 185, 129, 0.1)');
                    document.documentElement.style.setProperty('--badge-mastered-border', 'rgba(16, 185, 129, 0.2)');
                    
                    document.documentElement.style.setProperty('--sidebar-shadow', 'none');
                    themeToggle.innerHTML = '<i class="fa-solid fa-moon"></i>';
                } else {
                    // 高级浅色主题
                    document.documentElement.style.setProperty('--bg-gradient', 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)');
                    document.documentElement.style.setProperty('--sidebar-bg', 'rgba(255, 255, 255, 0.7)');
                    document.documentElement.style.setProperty('--text-primary', '#0f172a');
                    document.documentElement.style.setProperty('--text-secondary', '#475569');
                    document.documentElement.style.setProperty('--sidebar-border', 'rgba(0, 0, 0, 0.08)');
                    document.documentElement.style.setProperty('--input-bg', 'rgba(255, 255, 255, 0.8)');
                    document.documentElement.style.setProperty('--input-border', 'rgba(0, 0, 0, 0.1)');
                    document.documentElement.style.setProperty('--history-item-hover', 'rgba(0, 0, 0, 0.04)');
                    document.documentElement.style.setProperty('--card-bg', 'rgba(255, 255, 255, 0.85)');
                    document.documentElement.style.setProperty('--card-border', 'rgba(0, 0, 0, 0.05)');
                    document.documentElement.style.setProperty('--card-hover-bg', 'rgba(255, 255, 255, 0.98)');
                    
                    document.documentElement.style.setProperty('--logo-text-gradient', 'linear-gradient(to right, #0f172a, #334155)');
                    document.documentElement.style.setProperty('--title-gradient', 'linear-gradient(135deg, #0f172a 0%, #334155 100%)');
                    document.documentElement.style.setProperty('--version-badge-color', '#4f46e5');
                    document.documentElement.style.setProperty('--version-badge-bg', 'rgba(99, 102, 241, 0.08)');
                    document.documentElement.style.setProperty('--version-badge-border', 'rgba(99, 102, 241, 0.15)');
                    document.documentElement.style.setProperty('--nav-active-color', '#4f46e5');
                    document.documentElement.style.setProperty('--nav-active-bg', 'rgba(99, 102, 241, 0.12)');
                    document.documentElement.style.setProperty('--card-avatar-bg', 'rgba(0, 0, 0, 0.03)');
                    document.documentElement.style.setProperty('--card-avatar-border', 'rgba(0, 0, 0, 0.05)');
                    document.documentElement.style.setProperty('--card-avatar-color', '#4f46e5');
                    document.documentElement.style.setProperty('--column-bg', 'rgba(255, 255, 255, 0.45)');
                    document.documentElement.style.setProperty('--column-border', 'rgba(0, 0, 0, 0.05)');
                    document.documentElement.style.setProperty('--column-count-bg', 'rgba(0, 0, 0, 0.04)');
                    document.documentElement.style.setProperty('--column-count-border', 'rgba(0, 0, 0, 0.04)');
                    document.documentElement.style.setProperty('--progress-dot-bg', 'rgba(0, 0, 0, 0.08)');
                    document.documentElement.style.setProperty('--toolbar-bg', 'rgba(255, 255, 255, 0.85)');
                    document.documentElement.style.setProperty('--btn-bg', 'rgba(0, 0, 0, 0.04)');
                    document.documentElement.style.setProperty('--btn-border', 'rgba(0, 0, 0, 0.04)');
                    document.documentElement.style.setProperty('--review-panel-bg', 'rgba(0, 0, 0, 0.02)');
                    document.documentElement.style.setProperty('--review-panel-border', 'rgba(0, 0, 0, 0.05)');
                    document.documentElement.style.setProperty('--main-bg', 'rgba(255, 255, 255, 0.4)');
                    document.documentElement.style.setProperty('--loader-bg', 'rgba(255, 255, 255, 0.7)');
                    document.documentElement.style.setProperty('--drawer-bg', 'rgba(255, 255, 255, 0.95)');
                    document.documentElement.style.setProperty('--select-option-bg', '#ffffff');
                    document.documentElement.style.setProperty('--scrollbar-thumb', 'rgba(0, 0, 0, 0.15)');
                    document.documentElement.style.setProperty('--scrollbar-thumb-hover', 'rgba(0, 0, 0, 0.3)');
                    document.documentElement.style.setProperty('--track-bg', 'rgba(0, 0, 0, 0.05)');
                    document.documentElement.style.setProperty('--slider-bg', 'rgba(0, 0, 0, 0.08)');
                    document.documentElement.style.setProperty('--slider-border', 'rgba(0, 0, 0, 0.05)');
                    
                    document.documentElement.style.setProperty('--score-1-color', '#b91c1c');
                    document.documentElement.style.setProperty('--score-1-bg', 'rgba(239, 68, 68, 0.12)');
                    document.documentElement.style.setProperty('--score-2-color', '#c2410c');
                    document.documentElement.style.setProperty('--score-2-bg', 'rgba(249, 115, 22, 0.12)');
                    document.documentElement.style.setProperty('--score-3-color', '#a16207');
                    document.documentElement.style.setProperty('--score-3-bg', 'rgba(234, 179, 8, 0.12)');
                    document.documentElement.style.setProperty('--score-4-color', '#1d4ed8');
                    document.documentElement.style.setProperty('--score-4-bg', 'rgba(59, 130, 246, 0.12)');
                    document.documentElement.style.setProperty('--score-5-color', '#047857');
                    document.documentElement.style.setProperty('--score-5-bg', 'rgba(16, 185, 129, 0.12)');

                    document.documentElement.style.setProperty('--badge-new-color', '#4f46e5');
                    document.documentElement.style.setProperty('--badge-new-bg', 'rgba(99, 102, 241, 0.08)');
                    document.documentElement.style.setProperty('--badge-new-border', 'rgba(99, 102, 241, 0.15)');
                    document.documentElement.style.setProperty('--badge-learning-color', '#b45309');
                    document.documentElement.style.setProperty('--badge-learning-bg', 'rgba(245, 158, 11, 0.08)');
                    document.documentElement.style.setProperty('--badge-learning-border', 'rgba(245, 158, 11, 0.15)');
                    document.documentElement.style.setProperty('--badge-mastered-color', '#047857');
                    document.documentElement.style.setProperty('--badge-mastered-bg', 'rgba(16, 185, 129, 0.08)');
                    document.documentElement.style.setProperty('--badge-mastered-border', 'rgba(16, 185, 129, 0.15)');
                    
                    document.documentElement.style.setProperty('--sidebar-shadow', 'none');
                    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
                }
            }

            // 从 localStorage 初始化并应用主题
            const themeToggle = document.getElementById('themeToggle');
            let isDark = localStorage.getItem('mdx_theme') !== 'light';
            applyTheme(isDark);

            themeToggle.addEventListener('click', () => {
                applyTheme(!isDark);
            });

            // 绑定拖放事件
            document.querySelectorAll('.card-list').forEach(list => {
                list.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    list.classList.add('drag-over');
                });
                list.addEventListener('dragleave', () => {
                    list.classList.remove('drag-over');
                });
                list.addEventListener('drop', async (e) => {
                    e.preventDefault();
                    list.classList.remove('drag-over');
                    const word = e.dataTransfer.getData('text/plain');
                    const newStatus = list.parentElement.getAttribute('data-status');
                    if (word && newStatus) {
                        const found = wordsData.find(w => w.word.toLowerCase() === word.toLowerCase());
                        if (found && found.status !== newStatus) {
                            found.status = newStatus;
                            renderKanban();
                            await addWordToDB(word, newStatus);
                        }
                    }
                });
            });

            // 加入生词本按钮事件
            addWordBtn.addEventListener('click', () => {
                if (currentWord) {
                    addWordToDB(currentWord, 'new');
                }
            });

            // 打分按钮事件
            document.querySelectorAll('.btn-score').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const score = btn.getAttribute('data-score');
                    // 仅当并非背单词闪卡控制台触发且并非看板触发时执行
                    if (currentWord && score && !btn.hasAttribute('data-play-score') && !btn.hasAttribute('data-kanban-score')) {
                        reviewWordInDB(currentWord, parseInt(score));
                    }
                });
            });

            // 侧边栏折叠/展开逻辑
            const sidebar = document.querySelector('.sidebar');
            const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
            
            function setSidebarCollapsed(collapsed) {
                if (collapsed) {
                    sidebar.classList.add('collapsed');
                    localStorage.setItem('mdx_sidebar_collapsed', 'true');
                } else {
                    sidebar.classList.remove('collapsed');
                    localStorage.setItem('mdx_sidebar_collapsed', 'false');
                }
            }
            
            // 初始化侧边栏状态
            const isSidebarCollapsed = localStorage.getItem('mdx_sidebar_collapsed') === 'true';
            setSidebarCollapsed(isSidebarCollapsed);
            
            sidebarToggleBtn.addEventListener('click', () => {
                const collapsed = sidebar.classList.contains('collapsed');
                setSidebarCollapsed(!collapsed);
            });

            // 首次初始化
            initSettings();
            fetchWords();
            renderHistory();
            
            // 定时刷新界面上的复习到期倒计时
            setInterval(() => {
                if (kanbanContainer.style.display === 'flex') {
                    renderKanban();
                }
                if (iframeContainer.style.display === 'flex' && currentWord) {
                    updateReviewPanel(currentWord);
                }
            }, 30000);
            
            // 自动聚焦输入框
            searchInput.focus();
        });