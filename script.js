const body = document.body;
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const terminalPanel = document.querySelector('[data-terminal-panel]');
const terminalOpeners = document.querySelectorAll('[data-terminal-open]');
const terminalClosers = document.querySelectorAll('[data-terminal-close]');
const demoScreen = document.querySelector('#demo-screen');
const demoButton = document.querySelector('[data-demo-toggle]');
const demoStatus = document.querySelector('#demo-status');
const themeMenu = document.querySelector('.theme-menu');
const themeToggle = document.querySelector('[data-theme-toggle]');
const adminPanel = document.querySelector('[data-admin-panel]');

const defaultProjects = [
  { title: '《回声之下》', type: '主线项目', lede: '一个关于声音、记忆和「再往前走一步」的 2D 探索游戏。', description: '你醒在一座已经沉入海底的城市。没有地图，只有远处传来的回声。每一次回声，都会改变你眼前的世界。', state: '进行中', progress: 18, tech: 'GODOT / 2D / PC', date: '2025 — NOW', download: '', cover: { title: 'ECHO', subtitle: 'BELOW', meta: "34° 12' N\nUNKNOWN DEPTH", build: 'BUILD 014', color: '#e9b7a1', accent: '#ff795d', highlight: '#d3f45a' }, logs: [] },
  { title: '纸上迷宫', type: '实验 · 玩法原型', lede: '把草稿本上的迷宫，变成一个会呼吸的地方。', description: '从草稿本开始的迷宫实验。', state: '已暂停', progress: 42, tech: 'GODOT / 2D', date: '2025', download: '', cover: { title: 'PAPER', subtitle: 'MAZE', meta: 'SKETCHBOOK 07\nUNFINISHED PATH', build: 'BUILD 003', color: '#d9cbef', accent: '#7863aa', highlight: '#d3f45a' }, logs: [] },
  { title: '月面气象站', type: '学习 · 3D 场景', lede: '第一次用 Blender 做的完整小场景。', description: '一个关于月面天气和孤独值班的安静场景。', state: '进行中', progress: 65, tech: 'BLENDER / 3D', date: '2025', download: '', cover: { title: 'LUNAR', subtitle: 'STATION', meta: 'MOON SURFACE\nNIGHT SHIFT 01', build: 'BUILD 009', color: '#a9c9c7', accent: '#f3a86b', highlight: '#d3f45a' }, logs: [] }
  ,{ title: '橡木', type: '实验 · 环境原型', lede: '一棵橡树，一块会慢慢记住季节的地方。', description: '以橡木的年轮和枝叶变化为线索，探索时间、记忆与空间关系的小型环境实验。', state: '计划中', progress: 8, tech: 'GODOT / 2D / ATMOSPHERE', date: '2026 — NOW', download: '', cover: { title: 'OAK', subtitle: 'MEMORY', meta: 'NORTH GROVE\nSEASON 01', build: 'BUILD 001', color: '#c7b38f', accent: '#6f7e4d', highlight: '#d3f45a' }, logs: [] }
];
const defaultLogs = [
  { date: '2025.08.18', type: '设计笔记', title: '为什么我想做一个没有地图的探索游戏？', body: '我一直很喜欢在游戏里迷路。\n\n不是因为我不想知道目的地，而是因为不知道下一步要去哪时，周围的一切都会变得更有意思。一个不起眼的门、一段奇怪的声音、墙角一小块颜色，都可能变成线索。\n\n所以《回声之下》没有传统意义上的地图。玩家要用听到的声音、记住的方向，以及自己对这座城市的理解，慢慢拼出一条路。\n\n我希望它像一次真正的散步：偶尔停下来，偶尔走错，但最后会发现，走过的弯路也属于这个故事。' },
  { date: '2025.07.29', type: '开发记录', title: '让海水真的动起来：我的第一次 Shader 尝试', body: '今天终于让海水动起来了。虽然它现在更像一块被风吹皱的果冻，但至少它不再是一张蓝色的图片。\n\n我先尝试了网上看到的复杂做法，结果屏幕变成了彩色噪点。后来我把问题拆成很小的部分：让每个像素根据时间稍微偏移，再给它加上一点深浅变化。\n\n最开心的不是效果有多好，而是我第一次看懂了“看起来很神奇”的东西是怎么一步步被做出来的。' },
  { date: '2025.07.06', type: '生活切片', title: '暑假第一周，我画了 47 张没用的地图', body: '暑假第一周，我画了 47 张地图，最后一张也没有放进游戏。\n\n有的太大，有的没有重点，有的看起来像一块烤糊的吐司。虽然它们最后都被我放进了“废案”文件夹，但画地图的过程让我知道了这座城市应该是什么样子。\n\n有时候，没用的东西也不是完全没用。它们只是还没有找到合适的故事。' }
];

let projects = readStored('azuride-projects', defaultProjects);
let mainProjectIndex = Number(localStorage.getItem('azuride-main-project'));
if (!Number.isInteger(mainProjectIndex) || mainProjectIndex < 0 || mainProjectIndex >= projects.length) mainProjectIndex = 0;
const legacyLogs = readStored('azuride-logs', defaultLogs);

projects = projects.map((project, index) => ({ ...defaultProjects[index % defaultProjects.length], ...project, cover: { ...defaultProjects[index % defaultProjects.length].cover, ...(project.cover || {}) }, logs: Array.isArray(project.logs) ? project.logs : [] }));
if (legacyLogs.length && !projects.some((project) => project.logs.length)) {
  projects[0].logs = legacyLogs.map((log, index) => ({ ...log, updatedAt: log.updatedAt || Date.parse(log.date.replaceAll('.', '-')) || index }));
}
projects = projects.map((project) => ({ ...project, logs: project.logs.map((log, index) => ({ ...log, private: Boolean(log.private), updatedAt: log.updatedAt || Date.parse(String(log.date || '').replaceAll('.', '-')) || index })) }));

function normalizeProjects(value) {
  if (!Array.isArray(value) || !value.length) return structuredClone(defaultProjects);
  return value.map((project, index) => ({ ...defaultProjects[index % defaultProjects.length], ...project, cover: { ...defaultProjects[index % defaultProjects.length].cover, ...(project.cover || {}) }, logs: Array.isArray(project.logs) ? project.logs : [] }))
    .map((project) => ({ ...project, logs: project.logs.map((log, index) => ({ ...log, private: Boolean(log.private), updatedAt: log.updatedAt || Date.parse(String(log.date || '').replaceAll('.', '-')) || index })) }));
}

function ensureOakProject() {
  if (!projects.some((project) => project.title === '橡木')) projects.push(structuredClone(defaultProjects[3]));
}

async function loadSharedContent() {
  try {
    const response = await fetch('/api/content', { cache: 'no-store' });
    if (!response.ok) throw new Error(`content ${response.status}`);
    const shared = await response.json();
    if (Array.isArray(shared.projects) && shared.projects.length) {
      projects = normalizeProjects(shared.projects);
      mainProjectIndex = Number.isInteger(shared.mainProjectIndex) ? shared.mainProjectIndex : 0;
      if (mainProjectIndex < 0 || mainProjectIndex >= projects.length) mainProjectIndex = 0;
    }
  } catch (error) {
    console.warn('Shared content unavailable; using local defaults.', error);
  }
  ensureOakProject();
  renderProjects();
  renderLogs();
}

function readStored(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) || structuredClone(fallback); } catch { return structuredClone(fallback); }
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
}

function normalizeDownloadUrl(value) {
  const url = String(value || '').trim();
  return /^(https?:\/\/|\/|\.\/)/i.test(url) ? url : '';
}

function normalizeColor(value, fallback) {
  return /^#[0-9a-f]{6}$/i.test(String(value || '')) ? value : fallback;
}

function recentLogs() {
  return projects.flatMap((project, projectIndex) => (project.logs || []).map((log, logIndex) => ({ ...log, projectTitle: project.title, projectIndex, logIndex })))
    .filter((log) => !log.private)
    .sort((a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0));
}

function publicProjectLogs(projectIndex) {
  return (projects[projectIndex]?.logs || []).filter((log) => !log.private).sort((a, b) => (Number(b.updatedAt) || 0) - (Number(a.updatedAt) || 0));
}

function renderProjects() {
  const featured = projects[mainProjectIndex] || projects[0] || defaultProjects[0];
  const featuredProject = document.querySelector('#featured-project');
  if (featuredProject) {
    featuredProject.querySelector('.tag').textContent = featured.type;
    featuredProject.querySelector('.project-topline .mono').textContent = featured.date;
    featuredProject.querySelector('h3').textContent = featured.title;
    featuredProject.querySelector('.project-lede').textContent = featured.lede;
    featuredProject.querySelector('.project-info > p:not(.project-lede)').textContent = featured.description;
    featuredProject.querySelector('.progress-label strong').textContent = `${featured.progress}%`;
    featuredProject.querySelector('.progress-track span').style.width = `${featured.progress}%`;
    featuredProject.querySelector('.project-footer .mono').textContent = featured.tech;
    featuredProject.querySelector('[data-art-title-line]').textContent = featured.cover.title || featured.title;
    featuredProject.querySelector('[data-art-subtitle-line]').textContent = featured.cover.subtitle || 'GAME';
    featuredProject.querySelector('[data-art-meta]').innerHTML = escapeHtml(featured.cover.meta || '').replaceAll('\n', '<br />');
    featuredProject.querySelector('[data-art-build]').textContent = featured.cover.build || 'BUILD 001';
    featuredProject.querySelector('.project-art').style.setProperty('--cover-color', normalizeColor(featured.cover.color, '#e9b7a1'));
    featuredProject.querySelector('.project-art').style.setProperty('--cover-accent', normalizeColor(featured.cover.accent, '#ff795d'));
    featuredProject.querySelector('.project-art').style.setProperty('--cover-highlight', normalizeColor(featured.cover.highlight, '#d3f45a'));
    featuredProject.querySelector('.project-art').setAttribute('aria-label', `${featured.title} 标题画面`);
    const featuredDownload = featuredProject.querySelector('[data-featured-download]');
    setDownloadLink(featuredDownload, normalizeDownloadUrl(featured.download));
    const featuredLogsButton = featuredProject.querySelector('[data-project-logs]');
    featuredLogsButton.textContent = `查看日志 · ${publicProjectLogs(mainProjectIndex).length}`;
    featuredLogsButton.onclick = () => openProjectLogs(mainProjectIndex);
  }
  const list = document.querySelector('#project-list');
  if (!list) return;
  list.innerHTML = projects.map((project, projectIndex) => ({ project, projectIndex })).filter(({ projectIndex }) => projectIndex !== mainProjectIndex).map(({ project, projectIndex }, index) => `
    <article class="small-project">
      <div class="small-project-index">${String(index + 3).padStart(2, '0')}</div>
      <div><p class="small-project-type">${escapeHtml(project.type)}</p><h3>${escapeHtml(project.title)}</h3></div>
      <p class="small-project-desc">${escapeHtml(project.lede)}</p>
      <span class="small-project-state ${project.state === '进行中' ? 'state-active' : ''}">${escapeHtml(project.state)}</span><a class="project-download ${normalizeDownloadUrl(project.download) ? '' : 'project-download-disabled'}" href="${normalizeDownloadUrl(project.download) ? escapeHtml(normalizeDownloadUrl(project.download)) : '#'}" ${normalizeDownloadUrl(project.download) ? 'target="_blank" rel="noreferrer"' : 'aria-disabled="true"'}>下载 ${normalizeDownloadUrl(project.download) ? '↗' : '待添加'}</a><button type="button" class="project-logs-trigger" data-project-logs="${projectIndex}">查看日志 · ${publicProjectLogs(projectIndex).length}</button>
    </article>`).join('');
  list.querySelectorAll('[data-project-logs]').forEach((button) => { button.onclick = () => openProjectLogs(Number(button.dataset.projectLogs)); });
}

function setDownloadLink(link, url) {
  if (!link) return;
  if (url) {
    link.href = url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.setAttribute('aria-disabled', 'false');
    link.classList.remove('project-download-disabled');
    link.innerHTML = '下载项目 <span aria-hidden="true">↗</span>';
  } else {
    link.href = '#';
    link.removeAttribute('target');
    link.removeAttribute('rel');
    link.setAttribute('aria-disabled', 'true');
    link.classList.add('project-download-disabled');
    link.innerHTML = '下载链接待添加 <span aria-hidden="true">↗</span>';
  }
}

function renderLogs() {
  const list = document.querySelector('#log-grid');
  if (!list) return;
  const latestLogs = recentLogs().slice(0, 3);
  list.innerHTML = latestLogs.map((log, index) => `
    <article class="log-entry"><time datetime="${escapeHtml(log.date.replaceAll('.', '-'))}">${escapeHtml(log.date)}</time><span class="log-type">${escapeHtml(log.type)} · ${escapeHtml(log.projectTitle)}</span><h3>${escapeHtml(log.title)}</h3><button class="log-read" type="button" data-read-log="${index}">阅读全文 <span>→</span></button></article>`).join('');
  list.querySelectorAll('[data-read-log]').forEach((button) => button.addEventListener('click', () => openReader(Number(button.dataset.readLog))));
}

const readerPanel = document.querySelector('[data-reader-panel]');
const readerTitle = document.querySelector('[data-reader-title]');
const readerDate = document.querySelector('[data-reader-date]');
const readerType = document.querySelector('[data-reader-type]');
const readerBody = document.querySelector('[data-reader-body]');
const readerProjectList = document.querySelector('[data-reader-project-list]');
const readerBack = document.querySelector('[data-reader-back]');
const readerKicker = document.querySelector('.reader-header .section-index');
let activeProjectLogIndex = null;
function showReaderArticle(log) {
  readerTitle.textContent = log.title;
  readerDate.textContent = log.date;
  readerType.textContent = log.type;
  readerBody.textContent = log.body || '这篇记录还没有正文。';
  readerProjectList.hidden = true;
  readerBody.hidden = false;
  readerBack.hidden = activeProjectLogIndex === null;
}
function openReader(index) {
  const log = recentLogs()[index];
  if (!log) return;
  activeProjectLogIndex = null;
  readerKicker.textContent = 'DEVLOG / FULL ENTRY';
  showReaderArticle(log);
  body.classList.add('reader-open');
  readerPanel?.setAttribute('aria-hidden', 'false');
}
function openProjectLogs(projectIndex) {
  const project = projects[projectIndex];
  if (!project) return;
  const publicLogs = publicProjectLogs(projectIndex);
  activeProjectLogIndex = projectIndex;
  readerKicker.textContent = 'PROJECT / ALL PUBLIC LOGS';
  readerTitle.textContent = project.title;
  readerDate.textContent = 'PROJECT LOGS';
  readerType.textContent = `${publicLogs.length} 篇公开日志`;
  readerBody.hidden = true;
  readerBack.hidden = true;
  readerProjectList.hidden = false;
  readerProjectList.innerHTML = publicLogs.length ? publicLogs.map((log, index) => `<button type="button" class="reader-log-item" data-project-log-read="${index}"><span>${escapeHtml(log.date)}</span><strong>${escapeHtml(log.title)}</strong><small>${escapeHtml(log.type)}</small><b>→</b></button>`).join('') : '<p class="reader-empty">这个项目还没有公开日志。</p>';
  readerProjectList.querySelectorAll('[data-project-log-read]').forEach((button) => button.addEventListener('click', () => { const log = publicLogs[Number(button.dataset.projectLogRead)]; showReaderArticle(log); }));
  body.classList.add('reader-open');
  readerPanel?.setAttribute('aria-hidden', 'false');
}
readerBack?.addEventListener('click', () => { if (activeProjectLogIndex !== null) openProjectLogs(activeProjectLogIndex); });
function closeReader() {
  body.classList.remove('reader-open');
  readerPanel?.setAttribute('aria-hidden', 'true');
  activeProjectLogIndex = null;
}
document.querySelectorAll('[data-reader-close]').forEach((button) => button.addEventListener('click', closeReader));

function closeMenu() {
  body.classList.remove('nav-open');
  menuToggle?.setAttribute('aria-expanded', 'false');
}
menuToggle?.addEventListener('click', () => { const isOpen = body.classList.toggle('nav-open'); menuToggle.setAttribute('aria-expanded', String(isOpen)); });
mainNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

function toggleTerminal(isOpen) {
  body.classList.toggle('terminal-open', isOpen);
  terminalPanel?.setAttribute('aria-hidden', String(!isOpen));
}
terminalOpeners.forEach((button) => button.addEventListener('click', () => toggleTerminal(true)));
terminalClosers.forEach((button) => button.addEventListener('click', () => toggleTerminal(false)));

themeToggle?.addEventListener('click', () => {
  const isOpen = body.classList.toggle('theme-open');
  themeToggle.setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('[data-theme-choice]').forEach((button) => button.addEventListener('click', () => {
  const theme = button.dataset.themeChoice;
  body.dataset.theme = theme === 'original' ? '' : theme;
  localStorage.setItem('azuride-theme', theme);
  body.classList.remove('theme-open');
  themeToggle?.setAttribute('aria-expanded', 'false');
}));
const savedTheme = localStorage.getItem('azuride-theme');
if (savedTheme && savedTheme !== 'original') body.dataset.theme = savedTheme;

demoButton?.addEventListener('click', () => {
  const isRunning = demoScreen.classList.toggle('demo-running');
  demoButton.setAttribute('aria-label', isRunning ? '停止游戏预览' : '启动游戏预览');
  demoButton.querySelector('span').textContent = isRunning ? '■' : '▶';
  demoStatus.textContent = isRunning ? '试玩运行中 / 找到一条回声' : '概念验证中 / 版本 0.1.4';
});

const copyButton = document.querySelector('[data-copy-email]');
const copyFeedback = document.querySelector('.copy-feedback');
copyButton?.addEventListener('click', async () => {
  const email = copyButton.dataset.copyEmail;
  try { await navigator.clipboard.writeText(email); copyFeedback.textContent = '已复制邮箱地址'; } catch { copyFeedback.textContent = email; }
  window.setTimeout(() => { copyFeedback.textContent = ''; }, 2500);
});

function toggleAdmin(isOpen) {
  body.classList.toggle('admin-open', isOpen);
  adminPanel?.setAttribute('aria-hidden', String(!isOpen));
}
document.querySelectorAll('[data-admin-open]').forEach((button) => button.addEventListener('click', () => { toggleAdmin(true); refreshAdminState(); }));
document.querySelectorAll('[data-admin-close]').forEach((button) => button.addEventListener('click', () => toggleAdmin(false)));

const adminPinInput = document.querySelector('[data-admin-pin]');
const adminFeedback = document.querySelector('[data-admin-feedback]');
const adminLock = document.querySelector('[data-admin-lock]');
const adminEditor = document.querySelector('[data-admin-editor]');
const adminUnlock = document.querySelector('[data-admin-unlock]');
let creatorToken = sessionStorage.getItem('azuride-creator-token') || '';
let creatorUnlocked = Boolean(creatorToken);

function refreshAdminState() {
  document.querySelector('[data-lock-title]').textContent = '输入创作者 PIN';
  document.querySelector('[data-lock-hint]').textContent = '使用管理员密码登录后，保存的内容会同步给所有访客。';
  adminUnlock.textContent = '解锁编辑器';
  adminLock.hidden = creatorUnlocked;
  adminEditor.hidden = !creatorUnlocked;
  if (creatorUnlocked) renderAdminEditor();
}

function hashPin(value) {
  const rotateRight = (word, amount) => (word >>> amount) | (word << (32 - amount));
  const maxWord = 2 ** 32;
  const words = [];
  const hash = [];
  const constants = [];
  const composite = {};
  let primeCounter = 0;

  for (let candidate = 2; primeCounter < 64; candidate += 1) {
    if (composite[candidate]) continue;
    for (let multiple = candidate * candidate; multiple < 313; multiple += candidate) composite[multiple] = true;
    hash[primeCounter] = (candidate ** 0.5 * maxWord) | 0;
    constants[primeCounter] = (candidate ** (1 / 3) * maxWord) | 0;
    primeCounter += 1;
  }

  const bytes = new TextEncoder().encode(value);
  for (const byte of bytes) words.push(byte);
  words.push(0x80);
  while ((words.length % 64) !== 56) words.push(0);
  const bitLength = bytes.length * 8;
  for (let shift = 56; shift >= 0; shift -= 8) words.push(shift >= 32 ? 0 : (bitLength >>> shift) & 0xff);

  for (let offset = 0; offset < words.length; offset += 64) {
    const schedule = [];
    for (let index = 0; index < 16; index += 1) {
      const start = offset + index * 4;
      schedule[index] = (words[start] << 24) | (words[start + 1] << 16) | (words[start + 2] << 8) | words[start + 3];
    }
    for (let index = 16; index < 64; index += 1) {
      const a = schedule[index - 15];
      const b = schedule[index - 2];
      const sigma0 = rotateRight(a, 7) ^ rotateRight(a, 18) ^ (a >>> 3);
      const sigma1 = rotateRight(b, 17) ^ rotateRight(b, 19) ^ (b >>> 10);
      schedule[index] = (schedule[index - 16] + sigma0 + schedule[index - 7] + sigma1) | 0;
    }

    const state = hash.slice(0, 8);
    for (let index = 0; index < 64; index += 1) {
      const sum1 = rotateRight(state[4], 6) ^ rotateRight(state[4], 11) ^ rotateRight(state[4], 25);
      const choice = (state[4] & state[5]) ^ (~state[4] & state[6]);
      const temp1 = (state[7] + sum1 + choice + constants[index] + schedule[index]) | 0;
      const sum0 = rotateRight(state[0], 2) ^ rotateRight(state[0], 13) ^ rotateRight(state[0], 22);
      const majority = (state[0] & state[1]) ^ (state[0] & state[2]) ^ (state[1] & state[2]);
      const temp2 = (sum0 + majority) | 0;
      state.unshift((temp1 + temp2) | 0);
      state[4] = (state[4] + temp1) | 0;
      state.pop();
    }
    for (let index = 0; index < 8; index += 1) hash[index] = (hash[index] + state[index]) | 0;
  }

  return hash.slice(0, 8).map((word) => (word >>> 0).toString(16).padStart(8, '0')).join('');
}

async function unlockAdmin() {
  const pin = adminPinInput.value.trim();
  if (pin.length < 4) { adminFeedback.textContent = 'PIN 至少需要 4 位'; return; }
  adminUnlock.disabled = true;
  adminFeedback.textContent = '正在验证…';
  try {
    const response = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pin }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || !result.token) throw new Error(result.error || '登录失败');
    creatorToken = result.token;
    creatorUnlocked = true;
    sessionStorage.setItem('azuride-creator-token', creatorToken);
    adminPinInput.value = '';
    adminFeedback.textContent = '';
    refreshAdminState();
  } catch (error) {
    creatorUnlocked = false;
    creatorToken = '';
    sessionStorage.removeItem('azuride-creator-token');
    adminFeedback.textContent = error.message === '登录失败' ? 'PIN 不正确' : '服务器认证不可用';
  } finally {
    adminUnlock.disabled = false;
  }
}
adminUnlock?.addEventListener('click', unlockAdmin);
adminPinInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter') unlockAdmin(); });

function inputField(label, key, value, type = 'text', scope = 'project') {
  return `<label>${label}<input type="${type}" data-key="${key}" data-scope="${scope}" value="${escapeHtml(value)}" /></label>`;
}
function textAreaField(label, key, value, scope = 'cover') {
  return `<label>${label}<textarea data-key="${key}" data-scope="${scope}" rows="2">${escapeHtml(value || '')}</textarea></label>`;
}
function logEditorMarkup(log, logIndex) {
  return `<div class="project-log-card" data-project-log-index="${logIndex}"><div class="editor-card-top"><strong>存档 ${String(logIndex + 1).padStart(2, '0')}</strong><button type="button" data-remove-project-log="${logIndex}" aria-label="删除项目日志">删除</button></div><div class="editor-row">${inputField('日期', 'date', log.date, 'text', 'log')}${inputField('分类', 'type', log.type, 'text', 'log')}</div>${inputField('标题', 'title', log.title, 'text', 'log')}<label>正文<textarea data-key="body" data-scope="log" rows="9" placeholder="可以写很长的文章，段落之间留空行">${escapeHtml(log.body || '')}</textarea></label><label class="private-toggle"><input type="checkbox" data-key="private" data-scope="log" ${log.private ? 'checked' : ''} /> 设为私密日志</label></div>`;
}
function renderAdminEditor() {
  const projectList = document.querySelector('[data-project-editor-list]');
  projectList.innerHTML = projects.map((project, index) => `<div class="editor-card" data-project-index="${index}"><div class="editor-card-top"><strong>${index === mainProjectIndex ? '主线项目' : `项目 ${String(index + 1).padStart(2, '0')}`}</strong><span class="editor-card-actions"><button type="button" class="set-main-project ${index === mainProjectIndex ? 'is-main' : ''}" data-set-main-project="${index}">${index === mainProjectIndex ? '当前主线' : '设为主线'}</button><button type="button" data-remove-project="${index}" aria-label="删除项目">删除</button></span></div>${inputField('标题', 'title', project.title)}${inputField('分类', 'type', project.type)}${inputField('一句话介绍', 'lede', project.lede)}${inputField('详细描述', 'description', project.description)}<div class="editor-row">${inputField('状态', 'state', project.state)}${inputField('进度 %', 'progress', project.progress, 'number')}</div>${inputField('技术栈', 'tech', project.tech)}${inputField('日期', 'date', project.date)}${inputField('下载链接', 'download', project.download || '', 'url')}<div class="cover-editor"><div class="project-log-heading"><span>标题画面设置</span><span>MAIN SCREEN</span></div><div class="editor-row">${inputField('英文标题', 'title', project.cover.title, 'text', 'cover')}${inputField('英文副标题', 'subtitle', project.cover.subtitle, 'text', 'cover')}</div>${textAreaField('坐标文案（可换行）', 'meta', project.cover.meta)}${inputField('Build 文案', 'build', project.cover.build, 'text', 'cover')}<div class="editor-row">${inputField('背景色', 'color', project.cover.color, 'color', 'cover')}${inputField('强调色', 'accent', project.cover.accent, 'color', 'cover')}</div>${inputField('高亮色', 'highlight', project.cover.highlight, 'color', 'cover')}</div><div class="project-log-editor"><div class="project-log-heading"><span>项目日志 · ${project.logs.length} 篇</span><button type="button" data-add-project-log="${index}">＋ 新增日志</button></div>${project.logs.map(logEditorMarkup).join('')}</div></div>`).join('');
  projectList.querySelectorAll('[data-remove-project]').forEach((button) => button.addEventListener('click', () => { if (projects.length > 1) { projects.splice(Number(button.dataset.removeProject), 1); renderAdminEditor(); } }));
  projectList.querySelectorAll('[data-set-main-project]').forEach((button) => button.addEventListener('click', () => { mainProjectIndex = Number(button.dataset.setMainProject); localStorage.setItem('azuride-main-project', String(mainProjectIndex)); renderProjects(); renderAdminEditor(); adminFeedback.textContent = '主线项目和标题画面已切换'; }));
  projectList.querySelectorAll('[data-add-project-log]').forEach((button) => button.addEventListener('click', () => { const project = projects[Number(button.dataset.addProjectLog)]; project.logs.push({ date: new Date().toISOString().slice(0, 10).replaceAll('-', '.'), type: '开发记录', title: '新的开发日志', body: '', private: false, updatedAt: Date.now() }); renderAdminEditor(); }));
  projectList.querySelectorAll('[data-remove-project-log]').forEach((button) => button.addEventListener('click', () => { const projectCard = button.closest('[data-project-index]'); const project = projects[Number(projectCard.dataset.projectIndex)]; project.logs.splice(Number(button.dataset.removeProjectLog), 1); renderAdminEditor(); }));
}
document.querySelector('[data-add-project]')?.addEventListener('click', () => { projects.push({ title: '新项目', type: '实验 · 新想法', lede: '写一句关于这个项目的话。', description: '补充更多项目描述。', state: '进行中', progress: 0, tech: 'GODOT / 2D', date: '2025 — NOW', download: '', cover: { title: 'NEW', subtitle: 'WORLD', meta: 'UNKNOWN COORDINATES\nFIRST BUILD', build: 'BUILD 001', color: '#d9cbef', accent: '#ff795d', highlight: '#d3f45a' }, logs: [] }); renderAdminEditor(); });
function collectEditorValues() {
  document.querySelectorAll('[data-project-index]').forEach((card) => {
    const project = projects[Number(card.dataset.projectIndex)];
    card.querySelectorAll('[data-scope="project"]').forEach((input) => { project[input.dataset.key] = input.type === 'number' ? Math.min(100, Math.max(0, Number(input.value) || 0)) : input.value; });
    card.querySelectorAll('[data-scope="cover"]').forEach((input) => { project.cover[input.dataset.key] = input.value; });
    card.querySelectorAll('[data-project-log-index]').forEach((logCard) => { const log = project.logs[Number(logCard.dataset.projectLogIndex)]; const before = JSON.stringify(log); logCard.querySelectorAll('[data-scope="log"]').forEach((input) => { log[input.dataset.key] = input.type === 'checkbox' ? input.checked : input.value; }); if (before !== JSON.stringify(log)) log.updatedAt = Date.now(); });
  });
}
document.querySelector('[data-admin-save]')?.addEventListener('click', async () => {
  collectEditorValues();
  const saveButton = document.querySelector('[data-admin-save]');
  saveButton.disabled = true;
  adminFeedback.textContent = '正在发布…';
  try {
    const response = await fetch('/api/content', { method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${creatorToken}` }, body: JSON.stringify({ projects, mainProjectIndex }) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || '保存失败');
    localStorage.setItem('azuride-projects', JSON.stringify(projects));
    localStorage.setItem('azuride-main-project', String(mainProjectIndex));
    localStorage.removeItem('azuride-logs');
    renderProjects();
    renderLogs();
    adminFeedback.textContent = '内容已发布，所有访客现在都能看到';
    window.setTimeout(() => { adminFeedback.textContent = ''; }, 3200);
  } catch (error) {
    adminFeedback.textContent = error.message === '未授权' ? '登录已过期，请重新登录' : '发布失败，请稍后重试';
    if (error.message === '未授权') { creatorUnlocked = false; creatorToken = ''; sessionStorage.removeItem('azuride-creator-token'); refreshAdminState(); }
  } finally {
    saveButton.disabled = false;
  }
});
document.querySelector('[data-admin-reset]')?.addEventListener('click', () => { projects = structuredClone(defaultProjects); projects[0].logs = structuredClone(defaultLogs); mainProjectIndex = 0; localStorage.removeItem('azuride-projects'); localStorage.removeItem('azuride-logs'); localStorage.removeItem('azuride-main-project'); renderProjects(); renderLogs(); renderAdminEditor(); });

document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { toggleTerminal(false); toggleAdmin(false); closeReader(); closeMenu(); body.classList.remove('theme-open'); } });
renderProjects();
renderLogs();
refreshAdminState();
loadSharedContent();
