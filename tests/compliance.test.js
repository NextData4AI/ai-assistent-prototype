// tests/compliance.test.js
import { describe, it, expect, beforeEach } from 'vitest';

const {
  setCommissionStep,
  getCommissionStep,
  setDeviceContext,
  getDeviceContext,
  checkCommissionGuard,
  detectComplianceIntent,
  runBusinessRules,
  processComplianceRequest,
  isComplianceQuery
} = require('../compliance.js');

beforeEach(() => {
  setCommissionStep(4);
  setDeviceContext({
    region: 'north_america',
    hasITC: false,
    hasSGIP: false,
    isNEM3: false,
    isVPP: false,
    hasSplitCT: false,
    bbContractPower: 0,
    peakDemandLimit: 0
  });
});

describe('Commission 流程门控 (checkCommissionGuard)', () => {
  it('step 1: 网络设置未完成 → 拦截', () => {
    setCommissionStep(1);
    var result = checkCommissionGuard();
    expect(result.blocked).toBe(true);
    expect(result.message).toContain('网络设置');
  });

  it('step 2: 设备配对未完成 → 拦截', () => {
    setCommissionStep(2);
    var result = checkCommissionGuard();
    expect(result.blocked).toBe(true);
    expect(result.message).toContain('设备');
  });

  it('step 3: 位置填写未完成 → 拦截', () => {
    setCommissionStep(3);
    var result = checkCommissionGuard();
    expect(result.blocked).toBe(true);
    expect(result.message).toContain('位置');
  });

  it('step 4: 前置流程已就绪 → 通过', () => {
    setCommissionStep(4);
    var result = checkCommissionGuard();
    expect(result.blocked).toBe(false);
    expect(result.message).toBeNull();
  });

  it('step 5: 高于4也通过', () => {
    setCommissionStep(5);
    expect(checkCommissionGuard().blocked).toBe(false);
  });
});

describe('detectComplianceIntent', () => {
  it('识别 ITC/SGIP 退税意图', () => {
    expect(detectComplianceIntent('我想申请 ITC 和 SGIP 退税').intent).toBe('itc_sgip');
    expect(detectComplianceIntent('保证绿电').intent).toBe('itc_sgip');
  });

  it('识别 VPP 意图', () => {
    expect(detectComplianceIntent('我要参加VPP').intent).toBe('vpp_join');
    expect(detectComplianceIntent('虚拟电厂项目').intent).toBe('vpp_join');
  });

  it('识别 NEM 3.0 意图', () => {
    expect(detectComplianceIntent('我是 NEM 3.0 用户').intent).toBe('nem3');
  });

  it('识别馈网模式意图', () => {
    expect(detectComplianceIntent('切换馈网模式').intent).toBe('export_mode');
  });

  it('无关消息返回 null', () => {
    expect(detectComplianceIntent('帮我放个音乐').intent).toBeNull();
    expect(detectComplianceIntent('').intent).toBeNull();
    expect(detectComplianceIntent(null).intent).toBeNull();
  });
});

describe('runBusinessRules', () => {
  describe('Rule-1: ITC/SGIP 政策冲突', () => {
    it('消息包含"退税"时强制 grid_charging = false', () => {
      var results = runBusinessRules('我想申请退税', {});
      var rule1 = results.find(r => r.ruleId === 'Rule-1');
      expect(rule1.triggered).toBe(true);
      expect(rule1.command.parameter).toBe('grid_charging');
      expect(rule1.command.value).toBe(false);
    });

    it('设备上下文 hasITC=true 时触发', () => {
      setDeviceContext({ hasITC: true });
      var rule1 = runBusinessRules('帮我设置', {}).find(r => r.ruleId === 'Rule-1');
      expect(rule1.triggered).toBe(true);
    });

    it('无关消息不触发', () => {
      var rule1 = runBusinessRules('你好', {}).find(r => r.ruleId === 'Rule-1');
      expect(rule1.triggered).toBe(false);
    });
  });

  describe('Rule-2: VPP 馈网模式引导', () => {
    it('VPP + only_solar → 引导 full_export', () => {
      var rule2 = runBusinessRules('参加VPP', { energy_export_mode: 'only_solar' }).find(r => r.ruleId === 'Rule-2');
      expect(rule2.triggered).toBe(true);
      expect(rule2.command.value).toBe('full_export');
    });

    it('VPP + full_export → 无需引导', () => {
      var rule2 = runBusinessRules('参加VPP', { energy_export_mode: 'full_export' }).find(r => r.ruleId === 'Rule-2');
      expect(rule2.triggered).toBe(true);
      expect(rule2.command).toBeNull();
    });
  });

  describe('Rule-3: Peak Demand 溢出校验', () => {
    it('需量上限 > grid_import_limit → 报错', () => {
      setDeviceContext({ peakDemandLimit: 50 });
      var rule3 = runBusinessRules('', { grid_import_limit: 30 }).find(r => r.ruleId === 'Rule-3');
      expect(rule3.triggered).toBe(true);
      expect(rule3.warning).toContain('50');
    });

    it('需量上限 <= grid_import_limit → 不触发', () => {
      setDeviceContext({ peakDemandLimit: 20 });
      var rule3 = runBusinessRules('', { grid_import_limit: 30 }).find(r => r.ruleId === 'Rule-3');
      expect(rule3.triggered).toBe(false);
    });
  });

  describe('Rule-4: BB 合约限值冲突', () => {
    it('BB 合约功率 > grid_export_limit → 报错', () => {
      setDeviceContext({ isVPP: true, bbContractPower: 15 });
      var rule4 = runBusinessRules('', { grid_export_limit: 10 }).find(r => r.ruleId === 'Rule-4');
      expect(rule4.triggered).toBe(true);
    });

    it('BB 合约功率 <= grid_export_limit → 不触发', () => {
      setDeviceContext({ isVPP: true, bbContractPower: 5 });
      var rule4 = runBusinessRules('', { grid_export_limit: 10 }).find(r => r.ruleId === 'Rule-4');
      expect(rule4.triggered).toBe(false);
    });
  });

  describe('Rule-5: NEM 3.0 收益预警', () => {
    it('NEM 3.0 + only_solar → 收益预警', () => {
      var rule5 = runBusinessRules('我是 NEM 3.0 用户', { energy_export_mode: 'only_solar' }).find(r => r.ruleId === 'Rule-5');
      expect(rule5.triggered).toBe(true);
      expect(rule5.warning).toContain('收益提醒');
    });

    it('NEM 3.0 + full_export → 不触发', () => {
      var rule5 = runBusinessRules('我是 NEM 3.0 用户', { energy_export_mode: 'full_export' }).find(r => r.ruleId === 'Rule-5');
      expect(rule5.triggered).toBe(false);
    });
  });

  describe('Rule-6: Split CT 硬件限制', () => {
    it('有 Split CT + no_export → 禁止', () => {
      setDeviceContext({ hasSplitCT: true });
      var rule6 = runBusinessRules('', { energy_export_mode: 'no_export' }).find(r => r.ruleId === 'Rule-6');
      expect(rule6.triggered).toBe(true);
      expect(rule6.warning).toContain('Split CT');
    });

    it('无 Split CT → 不触发', () => {
      var rule6 = runBusinessRules('', { energy_export_mode: 'no_export' }).find(r => r.ruleId === 'Rule-6');
      expect(rule6.triggered).toBe(false);
    });
  });

  it('返回 6 条规则结果', () => {
    var results = runBusinessRules('', {});
    expect(results.length).toBe(6);
  });
});

describe('processComplianceRequest', () => {
  it('ITC/SGIP 退税 (step=4) → Rule-1 命中，关闭电网充电', () => {
    var result = processComplianceRequest('我想申请 ITC 和 SGIP 退税，帮我设置一下。', {});
    expect(result.statusCheck.result).toBe('passed');
    expect(result.actionPayload.commands[0].parameter).toBe('grid_charging');
    expect(result.actionPayload.commands[0].value).toBe(false);
    expect(result.finalResponse).toContain('仅限光伏');
  });

  it('ITC/SGIP 退税 (step=3) → 拦截', () => {
    setCommissionStep(3);
    var result = processComplianceRequest('我想申请 ITC 和 SGIP 退税，帮我设置一下。', {});
    expect(result.statusCheck.result).toBe('blocked');
    expect(result.actionPayload).toBeNull();
    expect(result.finalResponse).toContain('位置');
  });

  it('NEM 3.0 + only_solar → Rule-5 收益预警', () => {
    var result = processComplianceRequest('我是 NEM 3.0 用户，我只想让光伏馈网。', { energy_export_mode: 'only_solar' });
    expect(result.businessReport).toContain('Rule-5');
  });

  it('VPP + only_solar → Rule-2 引导', () => {
    var result = processComplianceRequest('我要参加VPP', { energy_export_mode: 'only_solar' });
    expect(result.actionPayload.commands[0].value).toBe('full_export');
  });

  it('无关意图 → 能力不足提示', () => {
    var result = processComplianceRequest('帮我放个音乐。', {});
    expect(result.finalResponse).toContain('不具备');
  });
});

// ============================================================
// Few-Shot QA 场景验证
// ============================================================
describe('Few-Shot QA 场景', () => {
  it('QA1: "帮我放个音乐" → "对不起，我不具备这方面的能力"', () => {
    // compliance 引擎不识别此意图
    expect(isComplianceQuery('帮我放个音乐。')).toBe(false);
    // processComplianceRequest 返回能力不足
    var result = processComplianceRequest('帮我放个音乐。', {});
    expect(result.finalResponse).toBe('对不起，我不具备这方面的能力。');
    expect(result.actionPayload).toBeNull();
  });

  it('QA2: "我想申请 ITC 和 SGIP 退税，帮我设置一下" → 关闭电网充电 + 仅限光伏', () => {
    setCommissionStep(4);
    var result = processComplianceRequest('我想申请 ITC 和 SGIP 退税，帮我设置一下。', {});
    expect(result.statusCheck.step).toBe(4);
    expect(result.statusCheck.result).toBe('passed');
    expect(result.businessReport).toContain('Rule-1');
    expect(result.actionPayload).not.toBeNull();
    expect(result.actionPayload.commands[0].parameter).toBe('grid_charging');
    expect(result.actionPayload.commands[0].value).toBe(false);
    expect(result.actionPayload.commands[0].business_rule_id).toBe('Rule-1');
    expect(result.finalResponse).toContain('关闭电网充电');
    expect(result.finalResponse).toContain('仅限光伏');
  });
});

describe('isComplianceQuery', () => {
  it('合规相关消息返回 true', () => {
    expect(isComplianceQuery('我想申请 SGIP 退税')).toBe(true);
    expect(isComplianceQuery('参加VPP')).toBe(true);
  });

  it('无关消息返回 false', () => {
    expect(isComplianceQuery('你好')).toBe(false);
    expect(isComplianceQuery(null)).toBe(false);
  });
});
