import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Load ROLES into global scope (role.js expects it)
const mockdata = require('../mockdata.js');
global.ROLES = mockdata.ROLES;

const { initRoleSelector, updateSuggestions } = require('../role.js');

describe('initRoleSelector', () => {
  let container;
  let roleLabel;

  beforeEach(() => {
    // Set up DOM: container for role tabs + header role label
    container = document.createElement('div');
    container.id = 'roleBar';
    document.body.appendChild(container);

    roleLabel = document.createElement('span');
    roleLabel.id = 'roleLabel';
    document.body.appendChild(roleLabel);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders 4 role tabs', () => {
    initRoleSelector(container, () => {});
    const chips = container.querySelectorAll('.role-chip');
    expect(chips.length).toBe(4);
  });

  it('renders correct role names with icons', () => {
    initRoleSelector(container, () => {});
    const chips = container.querySelectorAll('.role-chip');
    expect(chips[0].textContent).toContain('🤖');
    expect(chips[0].textContent).toContain('通用智能助手');
    expect(chips[1].textContent).toContain('⚙️');
    expect(chips[1].textContent).toContain('设备管理助手');
    expect(chips[2].textContent).toContain('⚡');
    expect(chips[2].textContent).toContain('能源分析专家');
    expect(chips[3].textContent).toContain('🛠️');
    expect(chips[3].textContent).toContain('售后协同助手');
  });

  it('defaults to "通用智能助手" selected', () => {
    initRoleSelector(container, () => {});
    const chips = container.querySelectorAll('.role-chip');
    expect(chips[0].classList.contains('active')).toBe(true);
    expect(chips[0].getAttribute('data-role')).toBe('general');
    // Others should not be active
    expect(chips[1].classList.contains('active')).toBe(false);
    expect(chips[2].classList.contains('active')).toBe(false);
    expect(chips[3].classList.contains('active')).toBe(false);
  });

  it('does not show role label for default role on init', () => {
    initRoleSelector(container, () => {});
    expect(roleLabel.classList.contains('visible')).toBe(false);
  });

  it('clicking a tab highlights it and deselects others', () => {
    initRoleSelector(container, () => {});
    const chips = container.querySelectorAll('.role-chip');

    // Click "设备管理助手"
    chips[1].click();
    expect(chips[1].classList.contains('active')).toBe(true);
    expect(chips[0].classList.contains('active')).toBe(false);
    expect(chips[2].classList.contains('active')).toBe(false);
    expect(chips[3].classList.contains('active')).toBe(false);
  });

  it('calls onRoleChange callback with roleId on click', () => {
    const callback = vi.fn();
    initRoleSelector(container, callback);
    const chips = container.querySelectorAll('.role-chip');

    chips[2].click(); // energy
    expect(callback).toHaveBeenCalledWith('energy');

    chips[3].click(); // service
    expect(callback).toHaveBeenCalledWith('service');
  });

  it('shows role label in header for non-default role', () => {
    initRoleSelector(container, () => {});
    const chips = container.querySelectorAll('.role-chip');

    // Click "能源分析专家"
    chips[2].click();
    expect(roleLabel.classList.contains('visible')).toBe(true);
    expect(roleLabel.textContent).toBe('能源分析专家');
  });

  it('hides role label when switching back to default role', () => {
    initRoleSelector(container, () => {});
    const chips = container.querySelectorAll('.role-chip');

    // Switch to non-default
    chips[1].click();
    expect(roleLabel.classList.contains('visible')).toBe(true);

    // Switch back to default
    chips[0].click();
    expect(roleLabel.classList.contains('visible')).toBe(false);
    expect(roleLabel.textContent).toBe('');
  });

  it('does nothing if container is null', () => {
    expect(() => initRoleSelector(null, () => {})).not.toThrow();
  });

  it('each tab has correct data-role attribute', () => {
    initRoleSelector(container, () => {});
    const chips = container.querySelectorAll('.role-chip');
    expect(chips[0].getAttribute('data-role')).toBe('general');
    expect(chips[1].getAttribute('data-role')).toBe('device');
    expect(chips[2].getAttribute('data-role')).toBe('energy');
    expect(chips[3].getAttribute('data-role')).toBe('service');
  });

  it('clicking non-chip area does not trigger callback', () => {
    const callback = vi.fn();
    initRoleSelector(container, callback);
    // Click the container itself, not a chip
    container.click();
    expect(callback).not.toHaveBeenCalled();
  });
});

describe('updateSuggestions', () => {
  let suggestionsContainer;

  beforeEach(() => {
    suggestionsContainer = document.createElement('div');
    suggestionsContainer.id = 'suggestions';
    document.body.appendChild(suggestionsContainer);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('renders suggestion buttons for "general" role', () => {
    updateSuggestions('general');
    const btns = suggestionsContainer.querySelectorAll('.suggestion-btn');
    expect(btns.length).toBe(4);
    expect(btns[0].textContent).toBe('FranklinWH 产品有哪些？');
    expect(btns[1].textContent).toBe('如何安装 aPower 电池？');
    expect(btns[2].textContent).toBe('系统支持哪些通信协议？');
    expect(btns[3].textContent).toBe('如何查看实时发电数据？');
  });

  it('renders device management suggestions for "device" role', () => {
    updateSuggestions('device');
    const btns = suggestionsContainer.querySelectorAll('.suggestion-btn');
    expect(btns.length).toBe(4);
    expect(btns[0].textContent).toBe('aPower 电池参数是什么？');
    expect(btns[1].textContent).toBe('如何重启 aGate 网关？');
    expect(btns[2].textContent).toBe('设备固件如何升级？');
    expect(btns[3].textContent).toBe('PCS 电网输入如何配置？');
  });

  it('renders energy analysis suggestions for "energy" role', () => {
    updateSuggestions('energy');
    const btns = suggestionsContainer.querySelectorAll('.suggestion-btn');
    expect(btns.length).toBe(4);
    expect(btns[0].textContent).toBe('今日发电量是多少？');
    expect(btns[1].textContent).toBe('电池充放电效率如何？');
    expect(btns[2].textContent).toBe('如何优化自用电比例？');
    expect(btns[3].textContent).toBe('峰谷电价策略怎么设置？');
  });

  it('renders after-sales suggestions for "service" role', () => {
    updateSuggestions('service');
    const btns = suggestionsContainer.querySelectorAll('.suggestion-btn');
    expect(btns.length).toBe(4);
    expect(btns[0].textContent).toBe('保修政策是什么？');
    expect(btns[1].textContent).toBe('如何提交售后工单？');
    expect(btns[2].textContent).toBe('安装商认证流程是什么？');
    expect(btns[3].textContent).toBe('常见故障代码有哪些？');
  });

  it('updates suggestions when switching roles', () => {
    updateSuggestions('general');
    let btns = suggestionsContainer.querySelectorAll('.suggestion-btn');
    expect(btns[0].textContent).toBe('FranklinWH 产品有哪些？');

    updateSuggestions('device');
    btns = suggestionsContainer.querySelectorAll('.suggestion-btn');
    expect(btns[0].textContent).toBe('aPower 电池参数是什么？');
  });

  it('clears previous suggestions before rendering new ones', () => {
    updateSuggestions('general');
    updateSuggestions('energy');
    const btns = suggestionsContainer.querySelectorAll('.suggestion-btn');
    // Should only have 4 buttons (energy), not 8
    expect(btns.length).toBe(4);
  });

  it('calls onSuggestionClick callback when a suggestion is clicked', () => {
    const callback = vi.fn();
    updateSuggestions('general', callback);
    const btns = suggestionsContainer.querySelectorAll('.suggestion-btn');
    btns[0].click();
    expect(callback).toHaveBeenCalledWith('FranklinWH 产品有哪些？');
  });

  it('renders empty container for unknown roleId', () => {
    updateSuggestions('unknown');
    const btns = suggestionsContainer.querySelectorAll('.suggestion-btn');
    expect(btns.length).toBe(0);
  });

  it('does nothing if suggestions container is missing', () => {
    document.body.innerHTML = ''; // remove #suggestions
    expect(() => updateSuggestions('general')).not.toThrow();
  });
});
