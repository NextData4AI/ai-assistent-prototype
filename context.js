// context.js - 左下角推荐问题
// 始终显示当前角色的推荐问题，无延迟、无自动隐藏

var _ctxState = {
  container: null,
  listEl: null,
  onSelect: null,
  currentRoleId: null
};

/**
 * 初始化推荐问题区域
 * @param {HTMLElement} container - 挂载容器
 * @param {Function} onSelect - 点击推荐问题回调 (question: string) => void
 */
function initContextRecommender(container, onSelect) {
  if (!container) return;

  _ctxState.container = container;
  _ctxState.onSelect = onSelect || function() {};
  _ctxState.listEl = container.querySelector('.context-recommender-list') ||
    container.querySelector('#contextRecommenderList');
}

/**
 * 显示当前角色的推荐问题（立即显示，无延迟）
 * @param {string} roleId - 当前角色 ID
 */
function showSuggestions(roleId) {
  _ctxState.currentRoleId = roleId || 'general';

  if (!_ctxState.container || !_ctxState.listEl) return;

  var suggestions = _getSuggestionsForRole(_ctxState.currentRoleId);
  if (suggestions.length === 0) return;

  _ctxState.listEl.innerHTML = '';

  for (var i = 0; i < suggestions.length; i++) {
    var item = document.createElement('div');
    item.className = 'context-recommender-item';
    item.textContent = suggestions[i];
    item.setAttribute('data-question', suggestions[i]);
    (function(question) {
      item.addEventListener('click', function() {
        if (_ctxState.onSelect) {
          _ctxState.onSelect(question);
        }
      });
    })(suggestions[i]);
    _ctxState.listEl.appendChild(item);
  }

  _ctxState.container.classList.add('visible');
}

/**
 * 隐藏推荐问题区域（用户点击推荐问题或发送消息时调用）
 */
function hideSuggestions() {
  if (!_ctxState.container) return;
  _ctxState.container.classList.remove('visible');
  if (_ctxState.listEl) {
    _ctxState.listEl.innerHTML = '';
  }
}


/**
 * 隐藏推荐问题区域（用户点击推荐问题或发送消息时调用）
 */
function hideSuggestions() {
  if (!_ctxState.container) return;
  _ctxState.container.classList.remove('visible');
  if (_ctxState.listEl) {
    _ctxState.listEl.innerHTML = '';
  }
}

/**
 * 获取当前角色的推荐问题（最多取全部 suggestions）
 * @param {string} roleId
 * @returns {string[]}
 */
function _getSuggestionsForRole(roleId) {
  var roles = (typeof ROLES !== 'undefined') ? ROLES : [];
  var role = null;

  for (var i = 0; i < roles.length; i++) {
    if (roles[i].id === roleId) {
      role = roles[i];
      break;
    }
  }

  if (!role || !role.suggestions || role.suggestions.length === 0) {
    return [];
  }

  return role.suggestions;
}

/**
 * 销毁推荐器
 */
function destroyContextRecommender() {
  if (_ctxState.listEl) {
    _ctxState.listEl.innerHTML = '';
  }
  if (_ctxState.container) {
    _ctxState.container.classList.remove('visible');
  }
  _ctxState.container = null;
  _ctxState.listEl = null;
  _ctxState.onSelect = null;
  _ctxState.currentRoleId = null;
}

// 保留旧函数名兼容，直接调用 showSuggestions
function triggerRecommendation(roleId) {
  showSuggestions(roleId);
}

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initContextRecommender: initContextRecommender,
    showSuggestions: showSuggestions,
    hideSuggestions: hideSuggestions,
    triggerRecommendation: triggerRecommendation,
    destroyContextRecommender: destroyContextRecommender,
    _ctxState: _ctxState,
    _getSuggestionsForRole: _getSuggestionsForRole
  };
}
