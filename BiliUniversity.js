// ==UserScript==
// @name        BiliUniversity-B站专注增强脚本大学生版
// @namespace    http://tampermonkey.net/
// @version      3.5.6
// @description  使用deepseek写的一个脚本，希望能帮到你
// @author       customized
// @match        https://*.bilibili.com/*
// @exclude      https://message.bilibili.com/*
// @exclude      https://account.bilibili.com/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @run-at       document-start
// @noframes
// ==/UserScript==

(function() {
    'use strict';

    // ==================== 默认配置 ====================
    const DEFAULT_WHITELIST_TAGS = [
        '高等数学', '高数', '微积分', '线性代数', '概率论', '数理统计', '统计学',
        '大学物理', '物理', '化学', '有机化学',
        '英语', '大学英语', '四六级', '四级', '六级', '雅思', '托福', 'GRE', '考研英语',
        '考研', '政治', '数学', '专业课', '真题',
        '编程', 'C语言', 'Python', 'Java', '算法', '数据结构', '计算机网络',
        '操作系统', '数据库', '人工智能', '机器学习', '深度学习',
        'R语言', '数据分析', '数据科学', 'MATLAB', 'Stata', 'SPSS', '计量经济学',
        'arcgis', 'qgis', 'gis', '地理信息系统', '遥感', '测绘', '空间分析',
        '地图学', '测绘工程', '空间数据库', 'postgis', 'geopandas', 'arcpy',
        'envi', 'erdas', '摄影测量', 'gnss', 'gps', '地图', '制图',
        'sql', 'mysql', 'postgresql', 'sqlite', '数据库设计',
        '公开课', '讲座', '纪录片', '历史', '文学', '哲学', '经济学', '心理学',
        '论文', '文献', '科研', '学术', 'tutorial', 'lecture',
        '期末考试', '复习', '备考', '习题', '网课', '自学',
        '知识', '教程', '入门', '基础', '提高', '精讲', '解析', '总结',
        '打卡', '学习', '笔记', '心得', '方法', '技巧', '考试', '考点',
        '题型', '刷题', '模拟', '真题', '讲解', '示范', '操作', '实验',
        '课设', '毕业设计', '毕业论文', '答辩', '实习', '求职', '笔试', '面试',
        '读书', '阅读', '听书', '思维导图', '速记', '单词', '语法', '写作',
        '口语', '听力', '阅读', '翻译', '完形', '作文', '范文'
    ];

    const DEFAULT_BLACKLIST_TAGS = [
        '搞笑', '吐槽', '娱乐', '恶搞', '配音', '鬼畜', '高能', '翻唱', '舞蹈',
        '生活', '日常', 'vlog', 'volg', '记录', '情侣', '测评', '萌宠',
        '游戏', '手游', '端游', '单机', '王者荣耀', '原神', '吃鸡', '英雄联盟',
        '开箱', '购物', '好物', '穿搭', '美妆', '美食', '探店', '时尚',
        '广告', '推广', '商业', '带货',
        '高途', '研途考研', '考研规划', '考研培训', '学历提升',
        '犯罪', '纪实', '案件', '凶杀', '刑事', '悬疑', '探案',
        '罪案', '大案', '命案', '奇案', '破案', '法医', '失踪',
        '绑架', '谋杀', '刑侦', '缉毒', '扫黑', '黑帮',
        '男神', '女神', '星座', '塔罗', 'ASMR', '助眠', '综艺', '八卦',
        '动画片', '动画', '番剧'
    ];

    const PROMOTION_KEYWORDS = [
        '看这个就够了', '立即体验', '一键三连', '求关注',
        '拼团', '优惠', '低价', '福利', '薅羊毛',
        '提分', '保过', '速成', '秒杀', '秘籍', '逆袭',
        '点击领取', '免费领', '限时', '已上岸师姐',
        '大三考研要认清形势', '看课刷题包考不上的',
        '包考不上', '下坡路提醒', '认清形势',
        '震惊', '居然', '竟然', '再不学就晚了', '别学了',
        '高途', '研途考研', '考研规划师', '免费考研指导'
    ];

    const DEFAULT_HIT_RATIO = 0.5; // 默认 50%

    const SEARCH_NOISE_SELECTORS = [
        '.search-panel', '.search-panel-popover',
        '.trendings-double', '.trending',
        '.bili-header__banner',
        '.bili-header__channel', '.header-channel-fixed',
        '.bili-feed4-layout',
        '.palette-button-wrap', '.adblock-tips',
        '.left-entry', '.entry-item', '.header-entry-mini',
        '.right-entry', '.red-dot', '.bili-header__channel .red-dot'
    ];

    const INTERFERENCE_SELECTORS = [
        '.bili-header__bar', '#bili-header', '.bili-header',
        '#reco_list', '.rec_list',
        '.video-page-card-small',
        '#commentapp', '#comment', '.comment-container', '.reply-list',
        '.slide_ad', '.ad-floor-cover', '.pop-live-small-mode',
        '.bpx-player-dm-switch', '.bpx-player-dm-btn',
        '.video-page-special', '.video-page-operator-card',
        '.live-room-card', '.game-card',
        '.video-pod__recommend .rec_card'
    ];

    const AD_CARD_SELECTORS = [
        '.recommend-list-container .video-card-common .ad-tag',
        '.bili-video-card__info--ad',
        '.ad-icon', '.promotion-icon', '.rocket-icon',
        'img[src*="rocket"]', 'svg[data-icon="rocket"]',
        'a[href*="cm.bilibili.com"]', 'a[href*="promote"]', 'a[href*="ad/"]',
        '.video-share-reward', '.v-popover.ad-popup'
    ];

    const LEARNING_PATH_ALLOW = ['/video/', '/list/'];

    const SECTION_CONTAINER_SELECTORS = [
        '.base-video-sections',
        '.video-sections',
        '.video-sections-content',
        '[class*="video-sections"]'
    ];

    let whitelistTags = GM_getValue('studyWhitelistTags', DEFAULT_WHITELIST_TAGS);
    let blacklistTags = GM_getValue('studyBlacklistTags', DEFAULT_BLACKLIST_TAGS);
    let manualBvidBlacklist = GM_getValue('manualBvidBlacklist', []);
    let manualBvidWhitelist = GM_getValue('manualBvidWhitelist', []);
    let hitRatioThreshold = GM_getValue('hitRatioThreshold', DEFAULT_HIT_RATIO);

    function saveWhitelistTags(list) { GM_setValue('studyWhitelistTags', list); whitelistTags = list; }
    function saveBlacklistTags(list) { GM_setValue('studyBlacklistTags', list); blacklistTags = list; }
    function saveManualBvidBlacklist(list) { GM_setValue('manualBvidBlacklist', list); manualBvidBlacklist = list; }
    function saveManualBvidWhitelist(list) { GM_setValue('manualBvidWhitelist', list); manualBvidWhitelist = list; }
    function saveHitRatio(ratio) { GM_setValue('hitRatioThreshold', ratio); hitRatioThreshold = ratio; }

    // ==================== 菜单 ====================
    function showToast(msg, dur=3000) {
        const d = document.createElement('div');
        d.textContent = msg;
        d.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);padding:10px 20px;background:rgba(0,0,0,0.7);color:#fff;border-radius:6px;z-index:999999;font-size:16px;';
        document.body.appendChild(d);
        setTimeout(() => { d.style.opacity='0'; setTimeout(()=>d.remove(),300); }, dur);
    }

    function configureWhitelist() {
        const d = document.createElement('div');
        d.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,0.3);z-index:100000;width:420px;';
        d.innerHTML = `<h3>编辑学习标签白名单</h3><textarea id="wl" style="width:100%;height:200px">${whitelistTags.join('\n')}</textarea><div style="text-align:right;margin-top:12px;"><button id="saveWl" style="background:#4CAF50;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">保存并刷新</button><button id="cancelWl" style="background:#f44336;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;margin-left:8px;">取消</button></div>`;
        document.body.appendChild(d);
        document.getElementById('saveWl').onclick = () => {
            const arr = document.getElementById('wl').value.split('\n').map(s=>s.trim()).filter(s=>s.length>0);
            saveWhitelistTags(arr);
            d.remove();
            showToast('白名单已保存', 1500);
            setTimeout(() => location.reload(), 600);
        };
        document.getElementById('cancelWl').onclick = () => d.remove();
    }

    function configureBlacklist() {
        const d = document.createElement('div');
        d.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:#fff;padding:20px;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,0.3);z-index:100000;width:420px;';
        d.innerHTML = `<h3>编辑营销标签黑名单</h3><textarea id="bl" style="width:100%;height:200px">${blacklistTags.join('\n')}</textarea><div style="text-align:right;margin-top:12px;"><button id="saveBl" style="background:#4CAF50;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">保存并刷新</button><button id="cancelBl" style="background:#f44336;color:#fff;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;margin-left:8px;">取消</button></div>`;
        document.body.appendChild(d);
        document.getElementById('saveBl').onclick = () => {
            const arr = document.getElementById('bl').value.split('\n').map(s=>s.trim()).filter(s=>s.length>0);
            saveBlacklistTags(arr);
            d.remove();
            showToast('黑名单已保存', 1500);
            setTimeout(() => location.reload(), 600);
        };
        document.getElementById('cancelBl').onclick = () => d.remove();
    }

    function setHitRatioThreshold() {
        const current = Math.round(hitRatioThreshold * 100);
        const input = prompt(`请输入白名单命中率阈值（30-100之间的整数，当前为 ${current}%）`, current);
        if (input === null) return;
        const num = parseInt(input, 10);
        if (isNaN(num) || num < 30 || num > 100) {
            showToast('请输入30-100之间的整数', 2000);
            return;
        }
        saveHitRatio(num / 100);
        showToast(`命中率阈值已设置为 ${num}%`, 2000);
        processPage(); // 立即重新评估当前页面
    }

    function addCurrentBVToBlacklist() {
        const bvid = extractBvid(location.href);
        if (!bvid) { showToast('当前页面不是视频页'); return; }
        if (manualBvidBlacklist.includes(bvid)) { showToast('该BV已在黑名单中'); return; }
        const newList = [...manualBvidBlacklist, bvid];
        saveManualBvidBlacklist(newList);
        showToast(`已将 ${bvid} 加入黑名单`, 2000);
        applyOverlay();
    }

    function addCurrentBVToWhitelist() {
        const bvid = extractBvid(location.href);
        if (!bvid) { showToast('当前页面不是视频页'); return; }
        if (manualBvidWhitelist.includes(bvid)) { showToast('该BV已在白名单中'); return; }

        const tokens = getTagTokens();
        if (tokens.length === 0) {
            showToast('暂无标签，请稍后重试', 2000);
            return;
        }
        // 黑名单检测仍保留，符合你的要求
        for (const token of tokens) {
            if (blacklistTags.some(b => token.includes(b))) {
                showToast('该视频含有黑名单标签，无法加入学习白名单', 2500);
                return;
            }
        }

        const newList = [...manualBvidWhitelist, bvid];
        saveManualBvidWhitelist(newList);
        showToast(`已将 ${bvid} 加入学习白名单`, 2000);
        processPage();
    }

    GM_registerMenuCommand('编辑学习标签白名单', configureWhitelist);
    GM_registerMenuCommand('编辑营销标签黑名单', configureBlacklist);
    GM_registerMenuCommand('设置白名单命中率阈值', setHitRatioThreshold);
    GM_registerMenuCommand('添加当前BV到推广黑名单', addCurrentBVToBlacklist);
    GM_registerMenuCommand('添加当前BV到学习白名单', addCurrentBVToWhitelist);

    // ==================== CSS硬屏蔽 ====================
    function injectBlockCSS() {
        const style = document.createElement('style');
        style.id = 'bili-focus-block-style';
        const danmakuRule = `
            .bpx-player-dm-wrap, .bpx-player-dm-wrap *,
            .bilibili-player-dm, .bilibili-player-dm *,
            [class*="danmaku"], [id*="danmaku"],
            .player-danmaku, .player-danmaku * {
                display: none !important;
                opacity: 0 !important;
                pointer-events: none !important;
                visibility: hidden !important;
                height: 0 !important; width: 0 !important;
                overflow: hidden !important;
            }
        `;
        const noiseRule = SEARCH_NOISE_SELECTORS.map(s => `${s} { display: none !important; }`).join('\n');
        const sectionProtect = SECTION_CONTAINER_SELECTORS.map(s => `${s}, ${s} *`).join(',\n') + ` {
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            pointer-events: auto !important;
            position: relative !important;
        }`;
        style.textContent = danmakuRule + '\n' + noiseRule + '\n' + sectionProtect;
        document.head.appendChild(style);
    }

    // ==================== 弹幕Canvas移除 ====================
    function blockDanmakuCanvas() {
        new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) {
                        if (node.classList && (
                            node.classList.contains('bpx-player-dm-canvas') ||
                            (node.tagName === 'CANVAS' && node.parentElement?.classList.contains('bpx-player-dm-wrap'))
                        )) node.remove();
                        if (node.querySelectorAll) {
                            node.querySelectorAll('.bpx-player-dm-canvas, .bilibili-player-dm canvas').forEach(c => c.remove());
                        }
                    }
                });
            });
        }).observe(document.documentElement, { childList: true, subtree: true });
    }

    // ==================== 广告卡片清除 ====================
    function hideAdCards() {
        AD_CARD_SELECTORS.forEach(sel => {
            try { document.querySelectorAll(sel).forEach(el => el.remove()); } catch(e) {}
        });
    }

    function startAdCardRemover() {
        hideAdCards();
        new MutationObserver(hideAdCards).observe(document.documentElement, { childList: true, subtree: true });
    }

    // ==================== 视频暂停 ====================
    function pauseAllVideos() {
        document.querySelectorAll('video').forEach(v => {
            try { if (!v.paused) v.pause(); } catch(e) {}
        });
    }

    // ==================== 遮罩层 ====================
    function applyOverlay() {
        if (document.getElementById('study-overlay')) return;
        pauseAllVideos();
        new MutationObserver(() => pauseAllVideos()).observe(document.documentElement, { childList: true, subtree: true });
        const overlay = document.createElement('div');
        overlay.id = 'study-overlay';
        overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;z-index:99999;display:flex;align-items:center;justify-content:center;cursor:pointer;';
        overlay.innerHTML = '<div style="color:#fff;font-size:26px;text-align:center;">🚫 该视频非学习内容<br><small style="font-size:16px;opacity:0.8;">点击任意位置返回搜索页</small></div>';
        overlay.addEventListener('click', () => location.href = 'https://search.bilibili.com/');
        document.body.appendChild(overlay);
    }

    // ==================== 搜索框干扰清除 ====================
    function clearPlaceholder() {
        const input = document.querySelector('input.nav-search-input');
        if (input) {
            input.placeholder = '搜索你感兴趣的内容';
            input.title = '';
        }
    }

    function forceHideSearchNoise() {
        SEARCH_NOISE_SELECTORS.forEach(sel => {
            try {
                document.querySelectorAll(sel).forEach(el => {
                    el.style.setProperty('display', 'none', 'important');
                });
            } catch(e) {}
        });
        clearPlaceholder();
    }

    function startSearchNoiseBlocker() {
        for (let i = 1; i <= 6; i++) {
            setTimeout(forceHideSearchNoise, 300 * i);
        }
        document.addEventListener('click', function(e) {
            if (e.target.closest('.nav-search-content, .center-search-container, .nav-search-input')) {
                setTimeout(forceHideSearchNoise, 50);
            }
        }, true);
        new MutationObserver(() => forceHideSearchNoise()).observe(document.documentElement, { childList: true, subtree: true });
    }

    // ==================== 首页清爽极简 ====================
    function applyHomepageMinimal() {
        const hideSelectors = [
            '.bili-feed4-layout', '.header-channel-fixed', '.bili-header__channel',
            '.bili-header__banner', '.left-entry', '.palette-button-wrap', '.adblock-tips',
            '.trendings-double', '.trending'
        ];
        hideSelectors.forEach(sel => {
            const el = document.querySelector(sel);
            if (el) el.style.setProperty('display', 'none', 'important');
        });

        const bar = document.querySelector('.bili-header__bar');
        if (bar) {
            bar.style.backgroundColor = '#f4f5f7';
            bar.style.justifyContent = 'center';
            bar.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)';
        }
        const searchContainer = document.querySelector('.center-search-container');
        if (searchContainer) {
            searchContainer.style.position = 'absolute';
            searchContainer.style.top = '200px';
            searchContainer.style.width = '560px';
            searchContainer.style.left = '50%';
            searchContainer.style.marginLeft = '-280px';
            searchContainer.style.zIndex = '10';
            const input = searchContainer.querySelector('input');
            if (input) {
                input.style.borderRadius = '24px';
                input.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            }
        }
        if (!document.getElementById('home-minimal-title')) {
            const title = document.createElement('h1');
            title.id = 'home-minimal-title';
            title.innerText = '今天要学点什么？';
            title.style.cssText = 'text-align:center; margin-top:130px; font-size:26px; color:#444; font-weight:400; letter-spacing:1px;';
            const container = document.querySelector('.bili-header__bar');
            if (container) container.insertAdjacentElement('afterend', title);
        }
    }

    // ==================== 标签提取（DOM优先，避免标题污染） ====================
    function getRawTags() {
        const tagElements = document.querySelectorAll('.video-tag .tag-link, .tag-area .tag-link, .video-tag-container .tag-link, .tag-list .tag-link');
        if (tagElements.length > 0) {
            const tags = [];
            tagElements.forEach(el => {
                const text = el.textContent.trim().toLowerCase();
                if (text && text.length > 0 && text.length < 50) tags.push(text);
            });
            if (tags.length > 0) return tags;
        }

        try {
            if (window.__INITIAL_STATE__?.videoData?.tags) {
                return window.__INITIAL_STATE__.videoData.tags.map(t => t.tag_name.toLowerCase());
            }
        } catch(e) {}

        const meta = document.querySelector('meta[name="keywords"]');
        if (meta?.content) {
            const rawTags = meta.content.split(',').map(t => t.trim().toLowerCase());
            return rawTags.filter(tag => {
                if (tag.length > 40) return false;
                if (tag.includes('：') && tag.length > 15) return false;
                if (tag.includes('《')) return false;
                return true;
            });
        }

        return [];
    }

    function tokenizeTag(tag) {
        const parts = tag.split(/[\s,，、；;]+/).filter(s => s.length > 0);
        if (parts.length > 1 || parts[0] !== tag) {
            parts.push(tag);
        }
        return parts;
    }

    function getTagTokens() {
        const rawTags = getRawTags();
        const tokens = [];
        rawTags.forEach(tag => {
            const parts = tokenizeTag(tag);
            parts.forEach(p => {
                if (!tokens.includes(p)) tokens.push(p);
            });
        });
        return tokens;
    }

    function getTitle() {
        const el = document.querySelector('meta[property="og:title"]') || document.querySelector('title');
        return (el?.content || el?.textContent || '').toLowerCase();
    }

    function extractBvid(url) {
        const m = url.match(/\/video\/(BV[a-zA-Z0-9]+)/);
        return m ? m[1] : null;
    }

    // ==================== 判断逻辑（黑名单绝对优先） ====================
    function getBlockReason(title, tokens, bvid) {
        // 1. 推广标题拦截
        const promoHit = PROMOTION_KEYWORDS.find(k => title.includes(k));
        if (promoHit) return `标题包含推广词：${promoHit}`;

        // 2. 黑名单一票否决（最高优先级）
        const blackHit = tokens.find(token => blacklistTags.some(b => token.includes(b)));
        if (blackHit) return `标签命中黑名单：${blackHit}`;

        // 3. 手动白名单BV直接放行（但必须已经通过黑名单检测）
        if (bvid && manualBvidWhitelist.includes(bvid)) return '';

        // 4. 无标签
        if (tokens.length === 0) return '无标签信息';

        // 5. 白名单命中率检查（用户可调阈值）
        let hitCount = 0;
        for (const token of tokens) {
            if (whitelistTags.some(w => token.includes(w))) {
                hitCount++;
            }
        }
        const ratio = hitCount / tokens.length;
        if (ratio < hitRatioThreshold) {
            return `白名单命中率仅${(ratio*100).toFixed(0)}%（需≥${(hitRatioThreshold*100).toFixed(0)}%）`;
        }
        return '';
    }

    function isStudyVideo(title, tokens, bvid) {
        return getBlockReason(title, tokens, bvid) === '';
    }

    // ==================== 选集保护 ====================
    function getSectionContainers() {
        const all = [];
        SECTION_CONTAINER_SELECTORS.forEach(sel => {
            try { document.querySelectorAll(sel).forEach(n => all.push(n)); } catch(e) {}
        });
        return all;
    }

    function isInsideSection(el) {
        const sections = getSectionContainers();
        for (const s of sections) {
            if (s && s.contains(el)) return true;
        }
        return false;
    }

    function resetSectionStyles() {
        const sections = getSectionContainers();
        sections.forEach(section => {
            if (!section) return;
            section.style.setProperty('display', 'block', 'important');
            section.style.setProperty('visibility', 'visible', 'important');
            section.style.setProperty('opacity', '1', 'important');
            section.style.setProperty('pointer-events', 'auto', 'important');
            section.querySelectorAll('*').forEach(child => {
                child.style.setProperty('pointer-events', 'auto', 'important');
                child.style.setProperty('opacity', '1', 'important');
            });
        });
    }

    function hideInterferences() {
        resetSectionStyles();
        INTERFERENCE_SELECTORS.forEach(sel => {
            try {
                document.querySelectorAll(sel).forEach(el => {
                    if (isInsideSection(el)) return;
                    el.style.setProperty('display', 'none', 'important');
                });
            } catch(e) {}
        });
    }

    let studyInterval = null;
    function startStudyModeObserver() {
        hideInterferences();
        if (studyInterval) clearInterval(studyInterval);
        studyInterval = setInterval(hideInterferences, 2000);
        window.addEventListener('beforeunload', () => clearInterval(studyInterval));
        new MutationObserver(hideInterferences).observe(document.documentElement, { childList: true, subtree: true });
    }

    // ==================== 页面路由 ====================
    function processPage() {
        const url = location.href;
        const urlArr = url.split('/');
        const host = urlArr[2];
        const path = '/' + urlArr.slice(3).join('/');

        forceHideSearchNoise();

        if (host === 'message.bilibili.com' || host === 'account.bilibili.com') return;
        if (host === 'search.bilibili.com') return;

        if (host === 'www.bilibili.com' && (path === '/' || path === '/index.html' || path === '')) {
            applyHomepageMinimal();
            return;
        }

        if (host === 'space.bilibili.com') return;

        const isLearningPath = LEARNING_PATH_ALLOW.some(p => path.startsWith(p));
        if (isLearningPath) {
            if (path.startsWith('/video/') || path.startsWith('/list/')) {
                const bvid = extractBvid(url);
                if (bvid && manualBvidBlacklist.includes(bvid)) {
                    applyOverlay();
                    return;
                }
                let attempts = 0;
                const judge = () => {
                    const title = getTitle();
                    const tokens = getTagTokens();
                    if ((tokens.length > 0 || title) || attempts >= 10) {
                        if (tokens.length > 0 && isStudyVideo(title, tokens, bvid)) {
                            hideInterferences();
                            startStudyModeObserver();
                        } else {
                            const reason = getBlockReason(title, tokens, bvid);
                            showToast('🚫 ' + (reason || '非学习内容'), 2500);
                            applyOverlay();
                        }
                        return;
                    }
                    attempts++;
                    setTimeout(judge, 400);
                };
                judge();
            }
            return;
        }

        location.href = 'https://search.bilibili.com/';
    }

    // ==================== SPA路由劫持 ====================
    function hookSPA() {
        const origPush = history.pushState;
        history.pushState = function(...args) {
            origPush.apply(this, args);
            processPage();
        };
        const origReplace = history.replaceState;
        history.replaceState = function(...args) {
            origReplace.apply(this, args);
            processPage();
        };
        window.addEventListener('popstate', processPage);
    }

    // ==================== 启动 ====================
    if (window.top === window.self) {
        injectBlockCSS();
        blockDanmakuCanvas();
        startSearchNoiseBlocker();
        hookSPA();
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                startAdCardRemover();
                processPage();
            });
        } else {
            startAdCardRemover();
            processPage();
        }
    }
})();