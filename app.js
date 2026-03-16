// ========== Storage ==========
const SESSIONS_KEY = 'franklinwh_sessions';
function loadSessions() { try { return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || []; } catch { return []; } }
function saveSessions(s) { localStorage.setItem(SESSIONS_KEY, JSON.stringify(s)); }
function getSession(id) { return loadSessions().find(s => s.id === id); }
function updateSession(id, msgs, roleId) {
  const sessions = loadSessions(); const s = sessions.find(s => s.id === id);
  if (s) {
    s.messages = msgs; s.updatedAt = Date.now();
    if (roleId !== undefined) s.roleId = roleId;
    const f = msgs.find(m => m.role === 'user'); if (f) s.title = f.text.slice(0, 50);
    saveSessions(sessions);
  }
}
function createSession() {
  const sessions = loadSessions();
  const s = { id: 'chat_' + Date.now(), title: 'New Chat', messages: [], roleId: 'general', createdAt: Date.now(), updatedAt: Date.now() };
  sessions.unshift(s); saveSessions(sessions); return s;
}
function deleteSession(id) { saveSessions(loadSessions().filter(s => s.id !== id)); }

// ========== DOM ==========
const $ = id => document.getElementById(id);
const sidebarToggleBtn = $('sidebarToggleBtn'), sidebarOverlay = $('sidebarOverlay');
const sidebarDrawer = $('sidebarDrawer'), sidebarCloseBtn = $('sidebarCloseBtn');
const sidebarNewChat = $('sidebarNewChat'), sidebarSettings = $('sidebarSettings');
const sidebarConversations = $('sidebarConversations'), sidebarSearch = $('sidebarSearch');
const headerNewChatBtn = $('headerNewChatBtn');
const chatArea = $('chatArea'), messagesEl = $('messages');
const messageInput = $('messageInput'), micBtn = $('micBtn');
const roleBar = $('roleBar');
const danmakuBar = $('danmakuBar');
const contextRecommender = $('contextRecommender');

let currentSessionId = null;
let currentRole = 'general';

// ========== Scroll Anchoring ==========
let _autoScroll = true;

chatArea.addEventListener('scroll', function () {
  // If user is near the bottom (within 50px), enable auto-scroll
  const atBottom = chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight < 50;
  _autoScroll = atBottom;
});

function scrollToBottom() {
  if (_autoScroll) {
    chatArea.scrollTop = chatArea.scrollHeight;
  }
}

// ========== Module Integration: Role Selector ==========
initRoleSelector(roleBar, function (roleId) {
  currentRole = roleId;
  // Update session roleId
  const session = getSession(currentSessionId);
  if (session) updateSession(currentSessionId, session.messages, roleId);
  // Update suggestions for new role
  updateSuggestions(roleId, sendMessage);
  // 角色切换时也触发左下角推荐条
  triggerRecommendation(roleId);
});

// ========== Module Integration: Danmaku ==========
function _initDanmakuIfEmpty() {
  const session = getSession(currentSessionId);
  if (!session || session.messages.length === 0) {
    initDanmaku(danmakuBar, function (question) {
      sendMessage(question);
    });
  }
}

// ========== Module Integration: Context Recommender ==========
initContextRecommender(contextRecommender, function (question) {
  sendMessage(question);
});

// ========== Module Integration: Input → hide danmaku ==========
messageInput.addEventListener('input', function () {
  if (messageInput.value.trim().length > 0) {
    hideDanmaku();
  }
});

// ========== Sidebar ==========
function openSidebar() { sidebarDrawer.classList.add('active'); sidebarOverlay.classList.add('active'); renderSidebarConversations(); }
function closeSidebar() { sidebarDrawer.classList.remove('active'); sidebarOverlay.classList.remove('active'); sidebarSearch.value = ''; }
sidebarToggleBtn.addEventListener('click', openSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
sidebarCloseBtn.addEventListener('click', closeSidebar);
sidebarNewChat.addEventListener('click', () => startNewChat());
headerNewChatBtn.addEventListener('click', () => startNewChat());
sidebarSettings.addEventListener('click', () => { closeSidebar(); sendMessage('设置'); });
sidebarSearch.addEventListener('input', () => renderSidebarConversations(sidebarSearch.value.trim().toLowerCase()));

function escapeHtmlApp(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

function renderSidebarConversations(filter = '') {
  let sessions = loadSessions().sort((a, b) => b.updatedAt - a.updatedAt);
  if (filter) sessions = sessions.filter(s => s.title.toLowerCase().includes(filter));
  sidebarConversations.innerHTML = '';
  sessions.forEach(s => {
    const item = document.createElement('div');
    item.className = 'sidebar-conv-item' + (s.id === currentSessionId ? ' active-session' : '');
    item.dataset.id = s.id;
    item.innerHTML = `<span class="sidebar-conv-title">${escapeHtmlApp(s.title)}</span>
      <button class="sidebar-conv-delete" data-delete="${s.id}" aria-label="删除">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>`;
    sidebarConversations.appendChild(item);
  });
}
sidebarConversations.addEventListener('click', (e) => {
  const del = e.target.closest('.sidebar-conv-delete');
  if (del) { e.stopPropagation(); deleteSession(del.dataset.delete); if (del.dataset.delete === currentSessionId) startNewChat(); else renderSidebarConversations(); return; }
  const item = e.target.closest('.sidebar-conv-item');
  if (item) showChat(item.dataset.id);
});

// ========== Chat Core ==========
function showChat(sessionId) {
  currentSessionId = sessionId;
  messagesEl.innerHTML = '';
  const session = getSession(sessionId);
  if (!session) return;

  // Restore roleId from session
  if (session.roleId) {
    currentRole = session.roleId;
  }

  // Render persisted messages
  session.messages.forEach(m => {
    if (m.html) {
      const div = document.createElement('div');
      div.className = 'message bot';
      div.innerHTML = m.html;
      messagesEl.appendChild(div);
      _bindImageClicks(div);
    } else {
      const div = document.createElement('div');
      div.className = 'message ' + m.role;
      div.textContent = m.text;
      messagesEl.appendChild(div);
    }
  });

  _autoScroll = true;
  scrollToBottom();
  closeSidebar();

  // Show danmaku if session is empty
  if (session.messages.length === 0) {
    _initDanmakuIfEmpty();
  }
}

function startNewChat() {
  const s = createSession();
  currentRole = 'general';
  showChat(s.id);
  // 主页不显示建议按钮，直接在左下角推荐条显示
  triggerRecommendation('general');
}

// ========== User Message ==========
function addUserMessage(text) {
  const msg = document.createElement('div');
  msg.className = 'message user';
  msg.textContent = text;
  messagesEl.appendChild(msg);
  const session = getSession(currentSessionId);
  if (session) {
    session.messages.push({ role: 'user', text, time: Date.now() });
    updateSession(currentSessionId, session.messages);
  }
  _autoScroll = true;
  scrollToBottom();
}

// ========== Bot Message Persistence ==========
function persistBotMessage(html, type) {
  const session = getSession(currentSessionId);
  if (session) {
    session.messages.push({ role: 'bot', html, type: type || 'markdown', time: Date.now() });
    updateSession(currentSessionId, session.messages);
  }
}

// ========== Image Click Binding ==========
function _bindImageClicks(container) {
  const images = container.querySelectorAll('.md-image-block img');
  images.forEach(function (img) {
    img.style.cursor = 'pointer';
    img.addEventListener('click', function (e) {
      e.stopPropagation();
      if (typeof openImageViewer === 'function') {
        openImageViewer(img.src);
      }
    });
  });
}

// ========== New Message Flow (Task 12.1) ==========
// Flow: user sends → hide danmaku → getMockReply → CoT panel → renderMarkdown → PCS check → persist

function sendMessage(text) {
  const content = text || messageInput.value.trim();
  if (!content) return;

  // 1. Add user message
  addUserMessage(content);
  messageInput.value = '';

  // 2. Hide danmaku if visible
  hideDanmaku();

  // 3. Hide context recommender (will reappear after bot reply)
  hideSuggestions();

  // 4. 优先检测电网设置精确控制意图（优先级高于 isGridSettingsQuery 和 detectPCSIntent）
  if (typeof detectGridSettings === 'function') {
    var gridResult = detectGridSettings(content);
    if (gridResult.matched) {
      // 预填控件值
      if (typeof prefillGridSettings === 'function') {
        prefillGridSettings(gridResult.settings);
      }
      // 渲染提示消息 + Confirmation_Card
      var tipMsg = document.createElement('div');
      tipMsg.className = 'message bot';
      var tipContent = document.createElement('div');
      tipContent.className = 'md-content';
      tipContent.textContent = '已为您预填电网设置，请确认或修改后执行';
      tipMsg.appendChild(tipContent);

      // 追加 Confirmation_Card（电网设置缩略预览样式）
      if (typeof createConfirmationCard === 'function') {
        var gridCard = createConfirmationCard(
          'grid_charge',
          { name: '电网输入和输出设置', currentValue: '', targetValue: '', unit: '' },
          function () {
            // onConfirm
            persistBotMessage(tipMsg.innerHTML, 'grid_settings_entry');
            _autoScroll = true;
            scrollToBottom();
          },
          function () {
            // onCancel
            persistBotMessage(tipMsg.innerHTML, 'grid_settings_entry');
            _autoScroll = true;
            scrollToBottom();
          }
        );
        tipMsg.appendChild(gridCard);
      }

      messagesEl.appendChild(tipMsg);
      persistBotMessage(tipMsg.innerHTML, 'grid_settings_entry');
      _autoScroll = true;
      scrollToBottom();
      showSuggestions(currentRole);
      return;
    }
  }

  // 4b. 检测是否是电网设置查询，如果是则弹出设置面板
  if (typeof isGridSettingsQuery === 'function' && isGridSettingsQuery(content)) {
    // 延迟一下让用户看到消息发送
    setTimeout(function () {
      if (typeof openGridSettingsPanel === 'function') {
        openGridSettingsPanel();
      }
    }, 300);
  }

  // 5. Get mock reply
  const reply = getMockReply(content, currentRole);

  // 6. Create bot message container
  const botMsg = document.createElement('div');
  botMsg.className = 'message bot';
  messagesEl.appendChild(botMsg);

  // 7. If reply has cotSteps → show CoT panel first, then render content
  if (reply.cotSteps && reply.cotSteps.length > 0) {
    createCoTPanel(botMsg, reply.cotSteps, function () {
      // CoT animation complete → render content
      _renderBotContent(botMsg, reply, content);
    });
    _autoScroll = true;
    scrollToBottom();
  } else {
    // No CoT steps → render content directly
    _renderBotContent(botMsg, reply, content);
  }
}

/**
 * Render bot reply content after CoT completes (or immediately if no CoT)
 */
function _renderBotContent(botMsg, reply, userText) {
  // Handle no_match type
  if (reply.type === 'no_match') {
    const noMatchDiv = document.createElement('div');
    noMatchDiv.className = 'no-match-hint';
    noMatchDiv.textContent = '未在官方手册找到相关信息';
    botMsg.appendChild(noMatchDiv);
    persistBotMessage(botMsg.innerHTML, 'text');
    _autoScroll = true;
    scrollToBottom();
    // 回答完后刷新推荐问题
    showSuggestions(currentRole);
    scrollToBottom();
    return;
  }

  // Render markdown content
  const contentDiv = document.createElement('div');
  contentDiv.className = 'md-content';
  contentDiv.innerHTML = renderMarkdown(reply.content);
  botMsg.appendChild(contentDiv);

  // Bind image clicks
  _bindImageClicks(contentDiv);

  _autoScroll = true;
  scrollToBottom();

  // Check PCS intent
  const pcsResult = detectPCSIntent(userText);

  // 特殊处理：如果是电网设置相关查询，显示设置面板入口卡片
  if (typeof isGridSettingsQuery === 'function' && isGridSettingsQuery(userText)) {
    const settingsCard = document.createElement('div');
    settingsCard.className = 'grid-settings-entry-card';
    settingsCard.innerHTML =
      '<div class="grid-settings-entry-content">' +
      '<div class="grid-settings-entry-header">⚡ 电网输入和输出设置</div>' +
      '<div class="grid-settings-entry-arrow">›</div>' +
      '</div>' +
      '<div class="grid-settings-entry-actions">' +
      '<button class="grid-settings-entry-btn cancel">取消</button>' +
      '<button class="grid-settings-entry-btn confirm">确认执行</button>' +
      '</div>';

    const contentArea = settingsCard.querySelector('.grid-settings-entry-content');
    const confirmBtn = settingsCard.querySelector('.grid-settings-entry-btn.confirm');
    const cancelBtn = settingsCard.querySelector('.grid-settings-entry-btn.cancel');

    // 点击内容区域打开设置面板
    contentArea.addEventListener('click', function () {
      if (typeof openGridSettingsPanel === 'function') {
        openGridSettingsPanel();
      }
    });

    // 确认按钮
    confirmBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      // 替换按钮区域为执行进度
      const actionsEl = settingsCard.querySelector('.grid-settings-entry-actions');
      actionsEl.innerHTML =
        '<div style="width:100%;text-align:center;padding:8px 0;">' +
        '<div class="cot-spinner" style="margin:0 auto;"></div>' +
        '<div style="font-size:12px;color:#888;margin-top:6px;">正在执行...</div>' +
        '</div>';

      // 模拟执行延迟后显示成功
      setTimeout(function () {
        actionsEl.innerHTML =
          '<div style="width:100%;text-align:center;padding:10px 0;color:#34a853;font-size:14px;">' +
          '✅ 执行成功' +
          '</div>';
        persistBotMessage(botMsg.innerHTML, 'grid_settings_entry');
        _autoScroll = true;
        scrollToBottom();
      }, 1500);
    });

    // 取消按钮
    cancelBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      // 替换卡片内容为取消消息
      settingsCard.innerHTML =
        '<div style="padding:12px 16px;text-align:center;color:#888;font-size:13px;">' +
        '操作已取消' +
        '</div>';
      persistBotMessage(botMsg.innerHTML, 'grid_settings_entry');
      _autoScroll = true;
      scrollToBottom();
    });

    botMsg.appendChild(settingsCard);
    persistBotMessage(botMsg.innerHTML, 'grid_settings_entry');
    _autoScroll = true;
    scrollToBottom();

    // 显示电网设置相关的推荐问题
    if (typeof showCustomSuggestions === 'function') {
      const gridQuestions = [
        '什么情况允许电网输入，什么情况不允许？',
        '设置了允许电网输入，最大允许充电功率应该是多少？',
        '允许电网充电后，aPower或者光伏还能给电网馈电吗？',
        'aPower最大馈网功率是多少？'
      ];
      showCustomSuggestions(gridQuestions);
    }
  } else if (pcsResult.matched) {
    if (pcsResult.params === null) {
      // Missing params → show follow-up question
      const followUpDiv = document.createElement('div');
      followUpDiv.className = 'md-content';
      followUpDiv.innerHTML = renderMarkdown(generateFollowUpQuestion(pcsResult.type));
      botMsg.appendChild(followUpDiv);
    } else {
      // Show confirmation card
      const card = createConfirmationCard(
        pcsResult.type,
        pcsResult.params,
        function () {
          // onConfirm - persist updated state
          persistBotMessage(botMsg.innerHTML, 'pcs_result');
          _autoScroll = true;
          scrollToBottom();
        },
        function () {
          // onCancel - persist cancelled state
          persistBotMessage(botMsg.innerHTML, 'pcs_result');
          _autoScroll = true;
          scrollToBottom();
        }
      );
      botMsg.appendChild(card);
    }
    _autoScroll = true;
    scrollToBottom();
  }

  // Persist bot message
  persistBotMessage(botMsg.innerHTML, reply.type === 'text' ? 'text' : 'markdown');

  // 回答完后刷新推荐问题（电网设置场景已经显示了自定义推荐，不需要再刷新）
  if (!(typeof isGridSettingsQuery === 'function' && isGridSettingsQuery(userText))) {
    showSuggestions(currentRole);
  }
  scrollToBottom();
}

// ========== Input Events ==========
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
});

// Mic
let isRecording = false;
micBtn.addEventListener('click', () => {
  isRecording = !isRecording;
  micBtn.classList.toggle('recording', isRecording);
  if (isRecording) setTimeout(() => { if (isRecording) { isRecording = false; micBtn.classList.remove('recording'); } }, 3000);
});

// ========== Init ==========
startNewChat();
