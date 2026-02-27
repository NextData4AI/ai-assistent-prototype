// ========== Storage ==========
const SESSIONS_KEY = 'franklinwh_sessions';

function loadSessions() {
  try { return JSON.parse(localStorage.getItem(SESSIONS_KEY)) || []; }
  catch { return []; }
}
function saveSessions(sessions) {
  localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
}
function getSession(id) {
  return loadSessions().find(s => s.id === id);
}
function updateSession(id, msgs) {
  const sessions = loadSessions();
  const s = sessions.find(s => s.id === id);
  if (s) {
    s.messages = msgs;
    s.updatedAt = Date.now();
    const first = msgs.find(m => m.role === 'user');
    if (first) s.title = first.text.slice(0, 50);
    saveSessions(sessions);
  }
}
function createSession() {
  const sessions = loadSessions();
  const s = { id: 'chat_' + Date.now(), title: 'New Chat', messages: [], createdAt: Date.now(), updatedAt: Date.now() };
  sessions.unshift(s);
  saveSessions(sessions);
  return s;
}
function deleteSession(id) {
  saveSessions(loadSessions().filter(s => s.id !== id));
}

// ========== DOM ==========
const sidebarToggleBtn = document.getElementById('sidebarToggleBtn');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const sidebarDrawer = document.getElementById('sidebarDrawer');
const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
const sidebarNewChat = document.getElementById('sidebarNewChat');
const sidebarSettings = document.getElementById('sidebarSettings');
const sidebarConversations = document.getElementById('sidebarConversations');
const sidebarSearch = document.getElementById('sidebarSearch');
const headerNewChatBtn = document.getElementById('headerNewChatBtn');
const chatArea = document.getElementById('chatArea');
const messagesEl = document.getElementById('messages');
const messageInput = document.getElementById('messageInput');
const micBtn = document.getElementById('micBtn');
const suggestionsEl = document.getElementById('suggestions');

let currentSessionId = null;

// ========== Session Switching ==========
function showChat(sessionId) {
  currentSessionId = sessionId;
  messagesEl.innerHTML = '';
  const session = getSession(sessionId);
  if (!session) return;
  session.messages.forEach(({ role, text }) => {
    const msg = document.createElement('div');
    msg.className = 'message ' + role;
    msg.textContent = text;
    messagesEl.appendChild(msg);
  });
  scrollToBottom();
  closeSidebar();
}

function startNewChat() {
  const s = createSession();
  showChat(s.id);
}

// ========== Sidebar (slides from right) ==========
function openSidebar() {
  sidebarDrawer.classList.add('active');
  sidebarOverlay.classList.add('active');
  renderSidebarConversations();
}
function closeSidebar() {
  sidebarDrawer.classList.remove('active');
  sidebarOverlay.classList.remove('active');
  sidebarSearch.value = '';
}

sidebarToggleBtn.addEventListener('click', openSidebar);
sidebarOverlay.addEventListener('click', closeSidebar);
sidebarCloseBtn.addEventListener('click', closeSidebar);
sidebarNewChat.addEventListener('click', startNewChat);
headerNewChatBtn.addEventListener('click', startNewChat);
sidebarSettings.addEventListener('click', () => {
  closeSidebar();
  addBotMessage('Settings page is under development.');
});

sidebarSearch.addEventListener('input', () => renderSidebarConversations(sidebarSearch.value.trim().toLowerCase()));

function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

function renderSidebarConversations(filter = '') {
  let sessions = loadSessions().sort((a, b) => b.updatedAt - a.updatedAt);
  if (filter) sessions = sessions.filter(s => s.title.toLowerCase().includes(filter));
  sidebarConversations.innerHTML = '';
  sessions.forEach(s => {
    const item = document.createElement('div');
    item.className = 'sidebar-conv-item' + (s.id === currentSessionId ? ' active-session' : '');
    item.dataset.id = s.id;
    item.innerHTML = `
      <span class="sidebar-conv-title">${escapeHtml(s.title)}</span>
      <button class="sidebar-conv-delete" data-delete="${s.id}" aria-label="删除">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
      </button>`;
    sidebarConversations.appendChild(item);
  });
}

sidebarConversations.addEventListener('click', (e) => {
  const delBtn = e.target.closest('.sidebar-conv-delete');
  if (delBtn) {
    e.stopPropagation();
    const id = delBtn.dataset.delete;
    deleteSession(id);
    if (id === currentSessionId) { startNewChat(); }
    else { renderSidebarConversations(sidebarSearch.value.trim().toLowerCase()); }
    return;
  }
  const item = e.target.closest('.sidebar-conv-item');
  if (item) showChat(item.dataset.id);
});

// ========== Chat ==========
const botResponses = [
  "Thanks for your message! Let me look into that for you.",
  "That's a great question. FranklinWH offers a range of energy solutions.",
  "I'd be happy to help with that. Could you provide more details?",
  "Let me check on that for you. One moment please.",
  "Great question! Our team is always here to assist you.",
  "I understand your concern. Here's what I can tell you...",
  "Thanks for reaching out! Is there anything specific you'd like to know?"
];

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
  scrollToBottom();
}

function addBotMessage(text) {
  const typing = document.createElement('div');
  typing.className = 'typing-indicator';
  typing.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
  messagesEl.appendChild(typing);
  scrollToBottom();
  setTimeout(() => {
    typing.remove();
    const msg = document.createElement('div');
    msg.className = 'message bot';
    msg.textContent = text;
    messagesEl.appendChild(msg);
    const session = getSession(currentSessionId);
    if (session) {
      session.messages.push({ role: 'bot', text, time: Date.now() });
      updateSession(currentSessionId, session.messages);
    }
    scrollToBottom();
  }, 800 + Math.random() * 600);
}

function scrollToBottom() { chatArea.scrollTop = chatArea.scrollHeight; }

function sendMessage(text) {
  const content = text || messageInput.value.trim();
  if (!content) return;
  addUserMessage(content);
  messageInput.value = '';
  addBotMessage(botResponses[Math.floor(Math.random() * botResponses.length)]);
}

messageInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); sendMessage(); } });
suggestionsEl.addEventListener('click', (e) => { const chip = e.target.closest('.suggestion-chip'); if (chip) sendMessage(chip.dataset.q); });

// Mic button
let isRecording = false;
micBtn.addEventListener('click', () => {
  isRecording = !isRecording;
  micBtn.classList.toggle('recording', isRecording);
  if (isRecording) {
    setTimeout(() => { if (isRecording) { isRecording = false; micBtn.classList.remove('recording'); addBotMessage("Voice input is not available in this prototype."); } }, 3000);
  }
});

// ========== Init ==========
startNewChat();
