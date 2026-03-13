// agent.js - Agent 工作流
// PCS 意图检测 + 确认卡片

/**
 * 检测消息是否包含 PCS 操作意图
 * @param {string} message - 用户消息文本
 * @returns {{matched: boolean, type: string|null, params: object|null}}
 */
function detectPCSIntent(message) {
  if (!message || typeof message !== 'string') {
    return { matched: false, type: null, params: null };
  }

  var lowerMsg = message.toLowerCase();
  var scenarioKeys = Object.keys(PCS_SCENARIOS);

  for (var i = 0; i < scenarioKeys.length; i++) {
    var type = scenarioKeys[i];
    var scenario = PCS_SCENARIOS[type];

    for (var j = 0; j < scenario.keywords.length; j++) {
      if (lowerMsg.indexOf(scenario.keywords[j].toLowerCase()) !== -1) {
        // 匹配成功，提取参数
        var params = {
          name: scenario.name,
          currentValue: scenario.currentValue,
          targetValue: scenario.targetValue,
          unit: scenario.unit
        };

        // 对于数值类操作，尝试从消息中提取用户指定的目标值
        if (type === 'import_limit' || type === 'export_limit') {
          var numberMatch = message.match(/(\d+)\s*(A|kW|kw|a)?/);
          if (numberMatch) {
            params.targetValue = parseInt(numberMatch[1], 10);
          } else {
            // 检测到意图但缺少具体数值参数，返回 params: null 触发追问
            return { matched: true, type: type, params: null };
          }
        }

        return { matched: true, type: type, params: params };
      }
    }
  }

  return { matched: false, type: null, params: null };
}


/**
 * 创建确认卡片
 * @param {string} operationType - 操作类型
 * @param {object} params - 操作参数 {name, currentValue, targetValue, unit}
 * @param {Function} onConfirm - 确认回调
 * @param {Function} onCancel - 取消回调
 * @returns {HTMLElement}
 */
function createConfirmationCard(operationType, params, onConfirm, onCancel) {
  var card = document.createElement('div');
  card.className = 'confirmation-card';

  var currentDisplay = String(params.currentValue) + (params.unit ? ' ' + params.unit : '');
  var targetDisplay = String(params.targetValue) + (params.unit ? ' ' + params.unit : '');

  var isGridRelated = (operationType === 'grid_charge' || operationType === 'energy_output' || operationType === 'import_limit' || operationType === 'export_limit');

  card.innerHTML =
    '<div class="confirmation-card-header' + (isGridRelated ? ' clickable' : '') + '"' +
    (isGridRelated ? ' data-open-grid-settings="true"' : '') +
    '>⚡ ' + params.name +
    (isGridRelated ? '<span class="confirmation-card-header-arrow">›</span>' : '') +
    '</div>' +
    '<div class="confirmation-card-body">' +
    '<div class="confirmation-card-compare">' +
    '<span class="confirmation-card-value current">' + currentDisplay + '</span>' +
    '<span class="confirmation-card-arrow">→</span>' +
    '<span class="confirmation-card-value target">' + targetDisplay + '</span>' +
    '</div>' +
    '</div>' +
    '<div class="confirmation-card-actions">' +
    '<button class="confirmation-card-btn cancel">取消</button>' +
    '<button class="confirmation-card-btn confirm">确认执行</button>' +
    '</div>';

  var confirmBtn = card.querySelector('.confirmation-card-btn.confirm');
  var cancelBtn = card.querySelector('.confirmation-card-btn.cancel');
  var headerEl = card.querySelector('.confirmation-card-header');

  // 如果是电网相关操作，header 可点击打开设置面板
  if (headerEl && headerEl.dataset.openGridSettings === 'true') {
    headerEl.addEventListener('click', function () {
      if (typeof openGridSettingsPanel === 'function') {
        openGridSettingsPanel();
      }
    });
  }

  confirmBtn.addEventListener('click', function () {
    // 替换按钮区域为执行进度
    var actionsEl = card.querySelector('.confirmation-card-actions');
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
      if (typeof onConfirm === 'function') onConfirm();
    }, 1500);
  });

  cancelBtn.addEventListener('click', function () {
    // 替换卡片内容为取消消息
    card.innerHTML =
      '<div style="padding:12px 16px;text-align:center;color:#888;font-size:13px;">' +
      '操作已取消' +
      '</div>';
    if (typeof onCancel === 'function') onCancel();
  });

  return card;
}

/**
 * 生成缺少参数时的追问消息
 * @param {string} operationType - 操作类型
 * @returns {string} 追问消息文本
 */
function generateFollowUpQuestion(operationType) {
  var scenario = PCS_SCENARIOS[operationType];
  if (!scenario) return '请提供更多操作参数信息。';

  var questions = {
    grid_charge: '请问您想将电网输入模式切换为哪种？可选：Grid + Solar 或 Solar Only。',
    import_limit: '请问您想将取电限制调整到多少安培（A）？当前值为 ' + scenario.currentValue + ' A。',
    energy_output: '请问您想将能量输出策略切换为哪种？可选：Self-consumption 或 Max Export。',
    export_limit: '请问您想将馈网限制调整到多少千瓦（kW）？当前值为 ' + scenario.currentValue + ' kW。'
  };

  return questions[operationType] || '请提供更多操作参数信息。';
}

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { detectPCSIntent, createConfirmationCard, generateFollowUpQuestion };
}
