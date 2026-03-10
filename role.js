// role.js - 角色选择器
// 横向可滑动 Tab 栏

/**
 * 初始化角色选择器
 * @param {HTMLElement} container - 挂载容器 (e.g. #roleBar)
 * @param {Function} onRoleChange - 角色切换回调 (roleId: string) => void
 */
function initRoleSelector(container, onRoleChange) {
  if (!container) return;

  // ROLES 来自 mockdata.js（浏览器全局 / Node require）
  var roles = (typeof ROLES !== 'undefined') ? ROLES : [];

  // 清空容器，重新渲染 Tab
  container.innerHTML = '';

  var defaultRoleId = 'general';

  roles.forEach(function (role) {
    var btn = document.createElement('button');
    btn.className = 'role-chip' + (role.id === defaultRoleId ? ' active' : '');
    btn.setAttribute('data-role', role.id);
    btn.textContent = role.icon + ' ' + role.name;
    container.appendChild(btn);
  });

  // 事件委托：点击 Tab 切换选中
  container.addEventListener('click', function (e) {
    var chip = e.target.closest('.role-chip');
    if (!chip) return;

    var roleId = chip.getAttribute('data-role');

    // 高亮选中，取消其他
    var chips = container.querySelectorAll('.role-chip');
    chips.forEach(function (c) { c.classList.remove('active'); });
    chip.classList.add('active');

    // 非默认角色 → Header 显示角色名称标签
    _updateRoleLabel(roleId, roles);

    // 回调通知
    if (typeof onRoleChange === 'function') {
      onRoleChange(roleId);
    }
  });

  // 初始化时确保默认角色不显示标签
  _updateRoleLabel(defaultRoleId, roles);
}

/**
 * 更新 Header 区域的角色名称标签
 * 非默认角色选中时显示，默认角色选中时隐藏
 * @param {string} roleId - 当前角色 ID
 * @param {Array} roles - 角色配置数组
 */
function _updateRoleLabel(roleId, roles) {
  var label = document.getElementById('roleLabel');
  if (!label) return;

  if (roleId === 'general') {
    label.classList.remove('visible');
    label.textContent = '';
  } else {
    var role = roles.find(function (r) { return r.id === roleId; });
    if (role) {
      label.textContent = role.name;
      label.classList.add('visible');
    }
  }
}

/**
 * 更新建议问题列表
 * 角色切换时从 ROLES 配置中获取对应 suggestions 并渲染到 DOM
 * @param {string} roleId - 当前角色 ID
 * @param {Function} [onSuggestionClick] - 点击建议问题回调 (question: string) => void
 */
function updateSuggestions(roleId, onSuggestionClick) {
  var roles = (typeof ROLES !== 'undefined') ? ROLES : [];
  var container = document.getElementById('suggestions');
  if (!container) return;

  var role = roles.find(function (r) { return r.id === roleId; });
  var suggestions = role ? role.suggestions : [];

  container.innerHTML = '';

  suggestions.forEach(function (text) {
    var btn = document.createElement('button');
    btn.className = 'suggestion-btn';
    btn.textContent = text;
    btn.addEventListener('click', function () {
      if (typeof onSuggestionClick === 'function') {
        onSuggestionClick(text);
      }
    });
    container.appendChild(btn);
  });
}

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initRoleSelector, _updateRoleLabel, updateSuggestions };
}
