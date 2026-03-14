import { describe, it, expect, beforeEach } from 'vitest';

// Load PCS_SCENARIOS into global scope (agent.js expects it)
const mockdata = require('../mockdata.js');
global.PCS_SCENARIOS = mockdata.PCS_SCENARIOS;

const { detectPCSIntent, createConfirmationCard, generateFollowUpQuestion } = require('../agent.js');

describe('detectPCSIntent', () => {
  it('returns matched:false for empty/null input', () => {
    expect(detectPCSIntent('')).toEqual({ matched: false, type: null, params: null });
    expect(detectPCSIntent(null)).toEqual({ matched: false, type: null, params: null });
    expect(detectPCSIntent(undefined)).toEqual({ matched: false, type: null, params: null });
  });

  it('detects grid_charge intent', () => {
    var result = detectPCSIntent('帮我配置电网充电模式');
    expect(result.matched).toBe(true);
    expect(result.type).toBe('grid_charge');
    expect(result.params).not.toBeNull();
    expect(result.params.name).toBe('电网输入切换');
  });

  it('detects import_limit intent with value', () => {
    var result = detectPCSIntent('调整取电限制到 50A');
    expect(result.matched).toBe(true);
    expect(result.type).toBe('import_limit');
    expect(result.params.targetValue).toBe(50);
  });

  it('returns params:null for import_limit without value', () => {
    var result = detectPCSIntent('调整取电限制');
    expect(result.matched).toBe(true);
    expect(result.type).toBe('import_limit');
    expect(result.params).toBeNull();
  });

  it('detects energy_output intent', () => {
    var result = detectPCSIntent('切换输出策略');
    expect(result.matched).toBe(true);
    expect(result.type).toBe('energy_output');
  });

  it('detects export_limit intent with value', () => {
    var result = detectPCSIntent('设置馈网限制为 10kW');
    expect(result.matched).toBe(true);
    expect(result.type).toBe('export_limit');
    expect(result.params.targetValue).toBe(10);
  });

  it('returns matched:false for unrelated messages', () => {
    var result = detectPCSIntent('今天天气怎么样');
    expect(result.matched).toBe(false);
    expect(result.type).toBeNull();
    expect(result.params).toBeNull();
  });

  it('takes first match on multiple intents', () => {
    // PCS_SCENARIOS keys order: grid_charge, import_limit, energy_output, export_limit
    var result = detectPCSIntent('电网充电 取电限制');
    expect(result.matched).toBe(true);
    expect(result.type).toBe('grid_charge');
  });
});

describe('createConfirmationCard', () => {
  // 电网相关操作：使用缩略预览图样式
  it('renders grid preview card for grid-related types', () => {
    var card = createConfirmationCard('grid_charge', {
      name: '电网输入切换',
      currentValue: 'Solar Only',
      targetValue: 'Grid + Solar',
      unit: ''
    }, function () { }, function () { });

    expect(card).toBeInstanceOf(HTMLElement);
    expect(card.className).toBe('grid-settings-entry-card');
    expect(card.textContent).toContain('电网输入和输出');
    expect(card.querySelector('.grid-preview')).not.toBeNull();
  });

  it('grid card has confirm and cancel buttons', () => {
    var card = createConfirmationCard('import_limit', {
      name: '取电限制调整',
      currentValue: 30,
      targetValue: 50,
      unit: 'A'
    }, function () { }, function () { });

    var confirmBtn = card.querySelector('.grid-settings-entry-btn.confirm');
    var cancelBtn = card.querySelector('.grid-settings-entry-btn.cancel');
    expect(confirmBtn).not.toBeNull();
    expect(cancelBtn).not.toBeNull();
    expect(confirmBtn.textContent).toBe('确认执行');
    expect(cancelBtn.textContent).toBe('取消');
  });

  it('grid card shows cancelled message on cancel click', () => {
    var cancelled = false;
    var card = createConfirmationCard('grid_charge', {
      name: '电网输入切换',
      currentValue: 'Solar Only',
      targetValue: 'Grid + Solar',
      unit: ''
    }, function () { }, function () { cancelled = true; });

    card.querySelector('.grid-settings-entry-btn.cancel').click();
    expect(card.textContent).toContain('操作已取消');
    expect(cancelled).toBe(true);
  });

  // 非电网操作：使用原有确认卡片样式
  it('renders classic confirmation card for non-grid types', () => {
    // 使用一个非电网类型来测试原有样式
    global.PCS_SCENARIOS['test_non_grid'] = { keywords: ['test'], name: 'Test', currentValue: 10, targetValue: 20, unit: 'W' };
    var card = createConfirmationCard('test_non_grid', {
      name: 'Test操作',
      currentValue: 10,
      targetValue: 20,
      unit: 'W'
    }, function () { }, function () { });

    expect(card.className).toBe('confirmation-card');
    expect(card.textContent).toContain('10 W');
    expect(card.textContent).toContain('20 W');
    expect(card.querySelector('.confirmation-card-btn.confirm')).not.toBeNull();
    expect(card.querySelector('.confirmation-card-btn.cancel')).not.toBeNull();
    delete global.PCS_SCENARIOS['test_non_grid'];
  });
});

describe('generateFollowUpQuestion', () => {
  it('returns follow-up for import_limit', () => {
    var q = generateFollowUpQuestion('import_limit');
    expect(q).toContain('安培');
    expect(q).toContain('30');
  });

  it('returns follow-up for export_limit', () => {
    var q = generateFollowUpQuestion('export_limit');
    expect(q).toContain('千瓦');
  });

  it('returns generic message for unknown type', () => {
    var q = generateFollowUpQuestion('unknown_type');
    expect(q).toContain('参数');
  });
});
