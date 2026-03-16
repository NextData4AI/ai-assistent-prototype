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
  var isGridRelated = (operationType === 'grid_charge' || operationType === 'energy_output' || operationType === 'import_limit' || operationType === 'export_limit');

  // 电网相关操作：使用缩略预览图样式
  if (isGridRelated) {
    card.className = 'grid-settings-entry-card';
    card.innerHTML =
      '<div class="grid-settings-entry-content" role="button" tabindex="0">' +
      '<div class="grid-preview">' +
      '<div class="grid-preview-header">' +
      '<span class="grid-preview-back">‹</span>' +
      '<span class="grid-preview-title">电网输入和输出</span>' +
      '<span class="grid-preview-help">?</span>' +
      '</div>' +
      '<div class="grid-preview-body">' +
      '<div class="grid-preview-section">' +
      '<div class="grid-preview-label">电网输入</div>' +
      '<div class="grid-preview-field">' +
      '<span>允许电网充电</span>' +
      '<span class="grid-preview-dropdown-icon">›</span>' +
      '</div>' +
      '<div class="grid-preview-desc">aPower将会在允许时间段用电网充电，如果需要更改，请转到自定义调度。</div>' +
      '<div class="grid-preview-sub-label">电网取电限制</div>' +
      '<div class="grid-preview-field">' +
      '<span>不限制</span>' +
      '<span class="grid-preview-unit">kW</span>' +
      '</div>' +
      '<div class="grid-preview-hint">范围0.1~100000.0 kW，精确至0.1 kW</div>' +
      '</div>' +
      '<div class="grid-preview-section">' +
      '<div class="grid-preview-label">能量输出</div>' +
      '<div class="grid-preview-field">' +
      '<span>仅光伏（无储能输出）</span>' +
      '<span class="grid-preview-dropdown-icon">›</span>' +
      '</div>' +
      '<div class="grid-preview-desc">aPower无法给电网馈电</div>' +
      '<div class="grid-preview-sub-label">电网馈网限制</div>' +
      '<div class="grid-preview-field">' +
      '<span>不限制</span>' +
      '<span class="grid-preview-unit">kW</span>' +
      '</div>' +
      '<div class="grid-preview-hint">范围0.1~100000.0 kW，精确至0.1 kW</div>' +
      '</div>' +
      '<div class="grid-preview-warning">不允许aPower馈网可能会影响您的经济收益</div>' +
      '<div class="grid-preview-confirm-btn">确认</div>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '<div class="grid-settings-entry-actions">' +
      '<button class="grid-settings-entry-btn cancel">取消</button>' +
      '<button class="grid-settings-entry-btn confirm">确认执行</button>' +
      '</div>';

    var contentArea = card.querySelector('.grid-settings-entry-content');
    var gridConfirmBtn = card.querySelector('.grid-settings-entry-btn.confirm');
    var gridCancelBtn = card.querySelector('.grid-settings-entry-btn.cancel');

    contentArea.addEventListener('click', function () {
      if (typeof openGridSettingsPanel === 'function') {
        openGridSettingsPanel();
      }
    });

    gridConfirmBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      var actionsEl = card.querySelector('.grid-settings-entry-actions');
      actionsEl.innerHTML =
        '<div style="width:100%;text-align:center;padding:8px 0;">' +
        '<div class="cot-spinner" style="margin:0 auto;"></div>' +
        '<div style="font-size:12px;color:#888;margin-top:6px;">正在执行...</div>' +
        '</div>';
      setTimeout(function () {
        actionsEl.innerHTML =
          '<div style="width:100%;text-align:center;padding:10px 0;color:#34a853;font-size:14px;">' +
          '✅ 执行成功' +
          '</div>';
        if (typeof onConfirm === 'function') onConfirm();
      }, 1500);
    });

    gridCancelBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      card.innerHTML =
        '<div style="padding:12px 16px;text-align:center;color:#888;font-size:13px;">' +
        '操作已取消' +
        '</div>';
      if (typeof onCancel === 'function') onCancel();
    });

    return card;
  }

  // 非电网操作：使用原有确认卡片样式
  card.className = 'confirmation-card';

  var currentDisplay = String(params.currentValue) + (params.unit ? ' ' + params.unit : '');
  var targetDisplay = String(params.targetValue) + (params.unit ? ' ' + params.unit : '');

  card.innerHTML =
    '<div class="confirmation-card-header">⚡ ' + params.name + '</div>' +
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

  confirmBtn.addEventListener('click', function () {
    var actionsEl = card.querySelector('.confirmation-card-actions');
    actionsEl.innerHTML =
      '<div style="width:100%;text-align:center;padding:8px 0;">' +
      '<div class="cot-spinner" style="margin:0 auto;"></div>' +
      '<div style="font-size:12px;color:#888;margin-top:6px;">正在执行...</div>' +
      '</div>';
    setTimeout(function () {
      actionsEl.innerHTML =
        '<div style="width:100%;text-align:center;padding:10px 0;color:#34a853;font-size:14px;">' +
        '✅ 执行成功' +
        '</div>';
      if (typeof onConfirm === 'function') onConfirm();
    }, 1500);
  });

  cancelBtn.addEventListener('click', function () {
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

/**
 * 从自然语言消息中解析电网设置面板的目标值
 * @param {string} message - 用户消息文本
 * @returns {{matched: boolean, settings: GridSettingsValues|null}}
 */
function detectGridSettings(message) {
  if (!message || typeof message !== 'string') {
    return { matched: false, settings: null };
  }

  var settings = {};
  var keywords = (typeof GRID_SETTINGS_KEYWORDS !== 'undefined') ? GRID_SETTINGS_KEYWORDS : {};
  var keys = Object.keys(keywords);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var config = keywords[key];

    if (config.type === 'select') {
      // 下拉选择项：先匹配否定关键词再匹配肯定关键词
      var matched = false;
      for (var oi = 0; oi < config.options.length; oi++) {
        var option = config.options[oi];
        for (var ki = 0; ki < option.keywords.length; ki++) {
          if (message.indexOf(option.keywords[ki]) !== -1) {
            settings[config.field] = option.value;
            matched = true;
            break;
          }
        }
        if (matched) break;
      }
    } else if (config.type === 'number') {
      // 数值输入项：匹配关键词后提取附近数值
      for (var ni = 0; ni < config.keywords.length; ni++) {
        var kwIdx = message.indexOf(config.keywords[ni]);
        if (kwIdx !== -1) {
          // 在关键词之后的文本中提取数值
          var afterKeyword = message.substring(kwIdx + config.keywords[ni].length);
          var numMatch = afterKeyword.match(/(\d+(?:\.\d+)?)\s*(?:kW|kw)?/);
          if (numMatch) {
            settings[config.field] = parseFloat(numMatch[1]);
          }
          break;
        }
      }
    }
  }

  if (Object.keys(settings).length > 0) {
    return { matched: true, settings: settings };
  }

  return { matched: false, settings: null };
}

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { detectPCSIntent, createConfirmationCard, generateFollowUpQuestion, detectGridSettings };
}
