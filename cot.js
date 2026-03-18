// cot.js - CoT 推理面板
// Chain-of-Thought 推理过程可视化（按意图类型分类）

/**
 * 意图类型配置：四种意图 × 推理步骤
 */
var INTENT_TYPES = {
  query: {
    label: '⊙ 数据查询',
    color: '#f97316',
    bgColor: '#fff7ed',
    steps: [
      { label: '识别查询目标...' },
      { label: '调用设备数据接口...' },
      { label: '格式化返回数据...' }
    ]
  },
  setting: {
    label: '✧ 参数设置',
    color: '#22c55e',
    bgColor: '#f0fdf4',
    steps: [
      { label: '解析目标参数...' },
      { label: '检查业务约束...' },
      { label: '确认无冲突生成指令...' },
      { label: '下发参数...' }
    ]
  },
  navigation: {
    label: 'A 页面跳转',
    color: '#ef4444',
    bgColor: '#fef2f2',
    steps: [
      { label: '识别目标页面...' },
      { label: '匹配路由...' },
      { label: '执行跳转...' }
    ]
  },
  knowledge: {
    label: '目 知识库检索',
    color: '#eab308',
    bgColor: '#fefce8',
    steps: [
      { label: '提取关键词...' },
      { label: '检索知识库...' },
      { label: '评估相关性归纳结果...' },
      { label: '组织输出文案...' }
    ]
  }
};

/**
 * 根据用户消息自动分类意图类型
 * @param {string} message - 用户消息文本
 * @param {string} [hintIntent] - 外部提示的意图类型（如合规引擎已识别）
 * @returns {string} - 意图类型 key: 'query' | 'setting' | 'navigation' | 'knowledge'
 */
function classifyIntent(message, hintIntent) {
  if (hintIntent && INTENT_TYPES[hintIntent]) return hintIntent;
  if (!message || typeof message !== 'string') return 'knowledge';

  // setting: 合规/电网设置/参数调整类
  var settingKw = ['设置', '配置', '调整', '切换', '修改', '更改', '开启', '关闭',
    '退税', 'ITC', 'itc', 'SGIP', 'sgip', '电网充电', '馈网', '取电限制',
    '不允许', '允许充电', 'grid charge', 'import limit', 'export limit',
    '输出策略', 'VPP', 'vpp', 'NEM', 'nem', '需量'];
  for (var i = 0; i < settingKw.length; i++) {
    if (message.indexOf(settingKw[i]) !== -1) return 'setting';
  }

  // navigation: 页面跳转类
  var navKw = ['打开', '跳转', '进入', '去到', '导航', '页面', '查看页面', '返回'];
  for (var j = 0; j < navKw.length; j++) {
    if (message.indexOf(navKw[j]) !== -1) return 'navigation';
  }

  // query: 数据查询类
  var queryKw = ['多少', '查询', '数据', '发电量', '用电量', '效率', '电量', '容量',
    '参数', '状态', '温度', '功率', '电压', '电流', '频率'];
  for (var k = 0; k < queryKw.length; k++) {
    if (message.indexOf(queryKw[k]) !== -1) return 'query';
  }

  // 默认: knowledge
  return 'knowledge';
}

/**
 * 创建并插入 CoT 推理面板到消息列表（意图类型可视化版本）
 * @param {HTMLElement} container - 消息容器
 * @param {Array<{label: string, detail: string}>} steps - 推理步骤（可选，传入则覆盖意图默认步骤）
 * @param {Function} onComplete - 动画完成回调
 * @param {Object} [options] - 扩展选项
 * @param {string} [options.intentType] - 意图类型 key
 * @param {string} [options.userQuery] - 用户原始查询文本
 * @param {string} [options.paramDetail] - setting 意图最后一步的参数详情（如 "grid_charging = false"）
 * @returns {HTMLElement} - CoT 面板 DOM 元素
 */
function createCoTPanel(container, steps, onComplete, options) {
  var opts = options || {};
  var intentType = opts.intentType || 'knowledge';
  var intentConfig = INTENT_TYPES[intentType] || INTENT_TYPES.knowledge;
  var userQuery = opts.userQuery || '';
  var paramDetail = opts.paramDetail || '';

  // 使用意图默认步骤，除非外部传入了自定义步骤
  var actualSteps = intentConfig.steps.slice();
  // 如果是 setting 意图且有参数详情，替换最后一步
  if (intentType === 'setting' && paramDetail && actualSteps.length > 0) {
    actualSteps[actualSteps.length - 1] = { label: '下发参数...' };
  }

  // 创建面板容器
  var panel = document.createElement('div');
  panel.className = 'cot-panel';

  // 创建标题栏
  var header = document.createElement('div');
  header.className = 'cot-panel-header';
  header.innerHTML = '<span class="cot-arrow">▶</span><span class="cot-panel-title">AI 智能助手正在思考你的需求...</span>';

  // 创建面板体
  var body = document.createElement('div');
  body.className = 'cot-panel-body';

  // 意图标签 badge
  var badge = document.createElement('div');
  badge.className = 'cot-intent-badge';
  badge.style.background = intentConfig.bgColor;
  badge.style.color = intentConfig.color;
  badge.style.borderColor = intentConfig.color;
  badge.textContent = intentConfig.label;
  body.appendChild(badge);

  // 用户查询文本框
  if (userQuery) {
    var queryBox = document.createElement('div');
    queryBox.className = 'cot-user-query';
    queryBox.textContent = userQuery;
    body.appendChild(queryBox);
  }

  // 步骤容器
  var stepsContainer = document.createElement('div');
  stepsContainer.className = 'cot-panel-steps';

  var stepElements = [];
  for (var i = 0; i < actualSteps.length; i++) {
    var stepItem = document.createElement('div');
    stepItem.className = 'cot-step-item';

    var icon = document.createElement('div');
    icon.className = 'cot-step-icon pending';
    icon.innerHTML = '<span style="font-size:10px;color:#999;">○</span>';

    var text = document.createElement('span');
    text.className = 'cot-step-text';
    text.textContent = '';

    stepItem.appendChild(icon);
    stepItem.appendChild(text);
    stepsContainer.appendChild(stepItem);
    stepElements.push({ item: stepItem, icon: icon, text: text, label: actualSteps[i].label });
  }

  body.appendChild(stepsContainer);
  panel.appendChild(header);
  panel.appendChild(body);

  // 点击标题切换展开/折叠
  header.addEventListener('click', function () {
    if (panel.classList.contains('expanded')) {
      panel.classList.remove('expanded');
    } else {
      panel.classList.add('expanded');
    }
  });

  // 插入到容器
  if (container) {
    container.appendChild(panel);
  }

  // 流式动画：逐步显示每个步骤
  var stepDelay = 600;
  var charDelay = 25;

  function animateStep(index) {
    if (index >= stepElements.length) {
      // 所有步骤完成，更新标题
      var titleEl = header.querySelector('.cot-panel-title');
      if (titleEl) {
        titleEl.textContent = '思考完成';
      }
      if (typeof onComplete === 'function') {
        onComplete();
      }
      return;
    }

    var step = stepElements[index];

    // 设置当前步骤为进行中
    step.icon.className = 'cot-step-icon running';
    step.icon.innerHTML = '<div class="cot-spinner"></div>';
    step.text.style.fontWeight = '600';
    step.text.style.color = '#333';

    // 流式显示文字
    var label = step.label;
    var charIndex = 0;
    step.text.textContent = '';

    var typeInterval = setInterval(function () {
      if (charIndex < label.length) {
        step.text.textContent += label[charIndex];
        charIndex++;
      } else {
        clearInterval(typeInterval);
        // 标记完成
        step.icon.className = 'cot-step-icon done';
        step.icon.innerHTML = '<span style="font-size:12px;">✓</span>';
        step.text.style.fontWeight = '';
        step.text.style.color = '';

        // 延迟后进入下一步
        setTimeout(function () {
          animateStep(index + 1);
        }, stepDelay);
      }
    }, charDelay);
  }

  // 启动动画
  setTimeout(function () {
    animateStep(0);
  }, 300);

  return panel;
}

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INTENT_TYPES, classifyIntent, createCoTPanel };
}
