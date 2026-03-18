// compliance.js - aGate 能源管理与合规专家
// Commission 流程门控 + 业务规则引擎 (Rule 1-6)

var _commissionStep = 4;

var _deviceContext = {
  region: 'north_america',
  hasITC: false,
  hasSGIP: false,
  isNEM3: false,
  isVPP: false,
  hasSplitCT: false,
  bbContractPower: 0,
  peakDemandLimit: 0
};

function setCommissionStep(step) { _commissionStep = step; }
function getCommissionStep() { return _commissionStep; }

function setDeviceContext(ctx) {
  if (!ctx || typeof ctx !== 'object') return;
  var keys = Object.keys(ctx);
  for (var i = 0; i < keys.length; i++) {
    if (_deviceContext.hasOwnProperty(keys[i])) {
      _deviceContext[keys[i]] = ctx[keys[i]];
    }
  }
}

function getDeviceContext() { return Object.assign({}, _deviceContext); }

function checkCommissionGuard() {
  var step = _commissionStep;
  var msgs = {
    1: '检测到您的网络设置尚未完成，请先完成【网络设置】后再进行参数配置。',
    2: '检测到您的设备尚未完成配对，请先完成【设备配对】后再进行参数配置。',
    3: '检测到您的位置尚未填写，请先完成【位置填写】后再进行参数配置。'
  };
  if (step >= 1 && step <= 3) return { blocked: true, message: msgs[step] };
  return { blocked: false, message: null };
}

function detectComplianceIntent(message) {
  if (!message || typeof message !== 'string') return { intent: null, params: {} };
  var intents = {
    itc_sgip: { keywords: ['退税', 'SGIP', 'sgip', 'ITC', 'itc', '保证绿电'], params: { policy: 'itc_sgip' } },
    vpp_join: { keywords: ['参加VPP', 'VPP', 'vpp', 'LEAP项目', 'leap', '虚拟电厂', 'BB项目', 'bb项目'], params: { program: 'vpp' } },
    peak_demand: { keywords: ['需量电价', '需量套餐', 'peak demand', '需量'], params: { type: 'peak_demand' } },
    export_mode: { keywords: ['馈网模式', '馈网', '馈电模式', 'export mode', '光伏馈网', '仅光伏馈网', 'full_export', 'no_export', 'only_solar', '只想让光伏馈网', '只让光伏馈网', '仅光伏', '只想光伏馈网'], params: { type: 'export_mode' } },
    grid_import: { keywords: ['电网充电', '电网买电', 'grid import', '电网输入', '允许充电', '不允许充电'], params: { type: 'grid_import' } },
    nem3: { keywords: ['NEM 3.0', 'nem 3.0', 'NEM3', 'nem3', 'NEM 3', 'nem 3'], params: { policy: 'nem3' } }
  };
  var keys = Object.keys(intents);
  for (var i = 0; i < keys.length; i++) {
    var config = intents[keys[i]];
    for (var j = 0; j < config.keywords.length; j++) {
      if (message.indexOf(config.keywords[j]) !== -1) return { intent: keys[i], params: config.params };
    }
  }
  return { intent: null, params: {} };
}

function runBusinessRules(message, proposedSettings) {
  var results = [];
  var ctx = _deviceContext;
  var settings = proposedSettings || {};

  // Rule-1: ITC/SGIP
  var r1 = false;
  if (message) { ['退税', 'SGIP', 'sgip', 'ITC', 'itc', '保证绿电'].forEach(function(k) { if (message.indexOf(k) !== -1) r1 = true; }); }
  if (r1 || ctx.hasITC || ctx.hasSGIP) {
    results.push({ ruleId: 'Rule-1', triggered: true, action: 'force_grid_charging_false', warning: null,
      command: { parameter: 'grid_charging', value: false, business_rule_id: 'Rule-1', reasoning: '好的，为了确保您符合 ITC 和 SGIP 的联合退税要求，我已关闭电网充电即电网充电模式设为"仅限光伏"。' } });
  } else {
    results.push({ ruleId: 'Rule-1', triggered: false, action: null, warning: null, command: null });
  }

  // Rule-2: VPP
  var r2 = false;
  if (message) { ['参加VPP', 'VPP', 'vpp', 'LEAP项目', 'leap', '虚拟电厂', 'BB项目', 'bb项目'].forEach(function(k) { if (message.indexOf(k) !== -1) r2 = true; }); }
  if (r2 || ctx.isVPP) {
    var em = settings.energy_export_mode || 'only_solar';
    if (em === 'only_solar') {
      results.push({ ruleId: 'Rule-2', triggered: true, action: 'guide_full_export',
        warning: '您已参与 VPP (BB项目)，当前馈网模式为"仅光伏"，必须切换为"光伏+电池 (full_export)"才能满足合约要求。',
        command: { parameter: 'energy_export_mode', value: 'full_export', business_rule_id: 'Rule-2', reasoning: '用户参与VPP(BB项目)，必须选择 full_export 馈网模式。' } });
    } else {
      results.push({ ruleId: 'Rule-2', triggered: true, action: null, warning: null, command: null });
    }
  } else {
    results.push({ ruleId: 'Rule-2', triggered: false, action: null, warning: null, command: null });
  }

  // Rule-3: Peak Demand
  if (ctx.peakDemandLimit > 0 && settings.grid_import_limit && ctx.peakDemandLimit > settings.grid_import_limit) {
    results.push({ ruleId: 'Rule-3', triggered: true, action: 'error_peak_demand_overflow',
      warning: '需量电价上限功率 (' + ctx.peakDemandLimit + ' kW) 超过了电网取电限制 (' + settings.grid_import_limit + ' kW)，请调高电网取电限制。', command: null });
  } else {
    results.push({ ruleId: 'Rule-3', triggered: false, action: null, warning: null, command: null });
  }

  // Rule-4: BB contract
  if (ctx.isVPP && ctx.bbContractPower > 0 && settings.grid_export_limit && ctx.bbContractPower > settings.grid_export_limit) {
    results.push({ ruleId: 'Rule-4', triggered: true, action: 'error_bb_contract_overflow',
      warning: 'BB 合约放电功率 (' + ctx.bbContractPower + ' kW) 超过了电网馈网限制 (' + settings.grid_export_limit + ' kW)，请调高馈网限制。', command: null });
  } else {
    results.push({ ruleId: 'Rule-4', triggered: false, action: null, warning: null, command: null });
  }

  // Rule-5: NEM 3.0
  var isNEM3 = ctx.isNEM3;
  if (message) { ['NEM 3.0', 'nem 3.0', 'NEM3', 'nem3'].forEach(function(k) { if (message.indexOf(k) !== -1) isNEM3 = true; }); }
  var wantOnlySolar = false;
  if (message) { ['仅光伏馈网', '只想让光伏馈网', '只让光伏馈网', '仅光伏', '只想光伏馈网', 'only_solar'].forEach(function(k) { if (message.indexOf(k) !== -1) wantOnlySolar = true; }); }
  if (settings.energy_export_mode === 'only_solar') wantOnlySolar = true;
  if (isNEM3 && wantOnlySolar) {
    results.push({ ruleId: 'Rule-5', triggered: true, action: 'warn_nem3_revenue_loss',
      warning: '⚠️ 收益提醒：检测到您是 NEM 3.0 协议用户。若选择"仅光伏馈网"，电池多余电量将无法在傍晚高价时段获利，会延长您的回本周期。建议您考虑开启"光伏+电池馈网"模式。',
      command: { parameter: 'energy_export_mode', value: 'only_solar', business_rule_id: 'Rule-5', reasoning: '好的，已为您将馈网模式设为"仅光伏"。' } });
  } else {
    results.push({ ruleId: 'Rule-5', triggered: false, action: null, warning: null, command: null });
  }

  // Rule-6: Split CT
  if (ctx.hasSplitCT) {
    if (settings.energy_export_mode === 'no_export') {
      results.push({ ruleId: 'Rule-6', triggered: true, action: 'block_no_export', warning: '安装了光伏侧 Split CT，禁止选择 no_export 馈网模式，且不得限制馈网功率。', command: null });
    } else if (settings.grid_export_limit && settings.grid_export_limit > 0) {
      results.push({ ruleId: 'Rule-6', triggered: true, action: 'block_export_limit', warning: '安装了光伏侧 Split CT，不得限制馈网功率。请移除馈网功率限制。', command: null });
    } else {
      results.push({ ruleId: 'Rule-6', triggered: false, action: null, warning: null, command: null });
    }
  } else {
    results.push({ ruleId: 'Rule-6', triggered: false, action: null, warning: null, command: null });
  }

  return results;
}

function processComplianceRequest(message, proposedSettings) {
  var guard = checkCommissionGuard();
  if (guard.blocked) {
    return { statusCheck: { step: _commissionStep, result: 'blocked', reason: guard.message }, businessReport: '前置流程未就绪，拦截逻辑执行。', actionPayload: null, finalResponse: guard.message };
  }

  var intentResult = detectComplianceIntent(message);
  var ruleResults = runBusinessRules(message, proposedSettings || {});
  var triggeredRules = ruleResults.filter(function(r) { return r.triggered; });

  var commands = [], warnings = [];
  for (var i = 0; i < triggeredRules.length; i++) {
    if (triggeredRules[i].command) commands.push(triggeredRules[i].command);
    if (triggeredRules[i].warning) warnings.push(triggeredRules[i].warning);
  }

  var reportParts = [];
  if (triggeredRules.length === 0) { reportParts.push('未命中任何业务约束规则。'); }
  else { triggeredRules.forEach(function(r) { reportParts.push('命中 ' + r.ruleId + ' (' + (r.action || '无强制动作') + ')'); }); }

  var finalResponse = '';
  if (commands.length > 0) finalResponse = commands.map(function(c) { return c.reasoning; }).join(' ');
  if (warnings.length > 0) finalResponse += (finalResponse ? '\n\n' : '') + warnings.join('\n');
  if (!finalResponse && intentResult.intent) finalResponse = '已识别到您的意图：' + intentResult.intent + '，当前配置符合业务规则。';
  if (!finalResponse) finalResponse = '对不起，我不具备这方面的能力。';

  return {
    statusCheck: { step: _commissionStep, result: 'passed', reason: null },
    businessReport: reportParts.join('；'),
    actionPayload: commands.length > 0 ? { commands: commands } : null,
    finalResponse: finalResponse,
    warnings: warnings,
    intent: intentResult.intent
  };
}

function isComplianceQuery(message) {
  if (!message || typeof message !== 'string') return false;
  return detectComplianceIntent(message).intent !== null;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setCommissionStep, getCommissionStep, setDeviceContext, getDeviceContext, checkCommissionGuard, detectComplianceIntent, runBusinessRules, processComplianceRequest, isComplianceQuery };
}
