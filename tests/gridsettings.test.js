// tests/gridsettings.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';

describe('Grid Settings Panel', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    // 创建一个简单的 DOM 环境
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div class="grid-settings-overlay" id="gridSettingsOverlay">
            <div class="grid-settings-panel" id="gridSettingsPanel">
              <button id="gridSettingsBack"></button>
              <button id="gridSettingsConfirm"></button>
            </div>
          </div>
        </body>
      </html>
    `);

    document = dom.window.document;
    window = dom.window;
    global.document = document;
    global.window = window;
  });

  describe('isGridSettingsQuery', () => {
    it('应该识别电网输入输出相关查询', () => {
      const { isGridSettingsQuery } = require('../gridsettings.js');

      expect(isGridSettingsQuery('怎么设置电网输入输出')).toBe(true);
      expect(isGridSettingsQuery('电网输入和输出')).toBe(true);
      expect(isGridSettingsQuery('如何设置电网')).toBe(true);
      expect(isGridSettingsQuery('电网设置')).toBe(true);
    });

    it('应该不识别无关查询', () => {
      const { isGridSettingsQuery } = require('../gridsettings.js');

      expect(isGridSettingsQuery('你好')).toBe(false);
      expect(isGridSettingsQuery('电池容量')).toBe(false);
      expect(isGridSettingsQuery('保修政策')).toBe(false);
    });

    it('应该处理空输入', () => {
      const { isGridSettingsQuery } = require('../gridsettings.js');

      expect(isGridSettingsQuery('')).toBe(false);
      expect(isGridSettingsQuery(null)).toBe(false);
      expect(isGridSettingsQuery(undefined)).toBe(false);
    });
  });

  describe('openGridSettingsPanel', () => {
    it('应该打开设置面板', () => {
      const { openGridSettingsPanel } = require('../gridsettings.js');
      const overlay = document.getElementById('gridSettingsOverlay');

      openGridSettingsPanel();

      expect(overlay.classList.contains('active')).toBe(true);
    });
  });
});

describe('确认卡片集成', () => {
  it('电网相关的确认卡片header应该可以点击打开设置面板', () => {
    const { openGridSettingsPanel } = require('../gridsettings.js');

    // 模拟创建一个确认卡片
    const card = document.createElement('div');
    card.className = 'confirmation-card';
    card.innerHTML = '<div class="confirmation-card-header clickable" data-open-grid-settings="true">⚡ 电网输入切换<span class="confirmation-card-header-arrow">›</span></div>';
    document.body.appendChild(card);

    const header = card.querySelector('.confirmation-card-header');
    const overlay = document.getElementById('gridSettingsOverlay');

    // 绑定点击事件
    header.addEventListener('click', function () {
      openGridSettingsPanel();
    });

    // 模拟点击
    header.click();

    expect(overlay.classList.contains('active')).toBe(true);
  });
});

describe('电网设置入口卡片', () => {
  it('应该识别更多电网相关关键词', () => {
    const { isGridSettingsQuery } = require('../gridsettings.js');

    expect(isGridSettingsQuery('电网充电')).toBe(true);
    expect(isGridSettingsQuery('电网馈网')).toBe(true);
    expect(isGridSettingsQuery('电网配置')).toBe(true);
  });

  it('入口卡片内容区域应该可以点击打开设置面板', () => {
    const { openGridSettingsPanel } = require('../gridsettings.js');

    // 模拟创建入口卡片（新结构）
    const entryCard = document.createElement('div');
    entryCard.className = 'grid-settings-entry-card';
    entryCard.innerHTML =
      '<div class="grid-settings-entry-content">' +
      '<div class="grid-settings-entry-header">⚡ 电网输入和输出设置</div>' +
      '<div class="grid-settings-entry-arrow">›</div>' +
      '</div>' +
      '<div class="grid-settings-entry-actions">' +
      '<button class="grid-settings-entry-btn cancel">取消</button>' +
      '<button class="grid-settings-entry-btn confirm">确认执行</button>' +
      '</div>';
    document.body.appendChild(entryCard);

    const contentArea = entryCard.querySelector('.grid-settings-entry-content');
    const overlay = document.getElementById('gridSettingsOverlay');

    // 绑定点击事件
    contentArea.addEventListener('click', function () {
      openGridSettingsPanel();
    });

    // 模拟点击内容区域
    contentArea.click();

    expect(overlay.classList.contains('active')).toBe(true);
  });

  it('确认按钮应该可以点击', () => {
    const entryCard = document.createElement('div');
    entryCard.className = 'grid-settings-entry-card';
    entryCard.innerHTML =
      '<div class="grid-settings-entry-content">' +
      '<div class="grid-settings-entry-header">⚡ 电网输入和输出设置</div>' +
      '<div class="grid-settings-entry-arrow">›</div>' +
      '</div>' +
      '<div class="grid-settings-entry-actions">' +
      '<button class="grid-settings-entry-btn cancel">取消</button>' +
      '<button class="grid-settings-entry-btn confirm">确认执行</button>' +
      '</div>';
    document.body.appendChild(entryCard);

    const confirmBtn = entryCard.querySelector('.grid-settings-entry-btn.confirm');
    expect(confirmBtn).toBeTruthy();
    expect(confirmBtn.textContent).toBe('确认执行');
  });

  it('取消按钮应该可以点击', () => {
    const entryCard = document.createElement('div');
    entryCard.className = 'grid-settings-entry-card';
    entryCard.innerHTML =
      '<div class="grid-settings-entry-content">' +
      '<div class="grid-settings-entry-header">⚡ 电网输入和输出设置</div>' +
      '<div class="grid-settings-entry-arrow">›</div>' +
      '</div>' +
      '<div class="grid-settings-entry-actions">' +
      '<button class="grid-settings-entry-btn cancel">取消</button>' +
      '<button class="grid-settings-entry-btn confirm">确认执行</button>' +
      '</div>';
    document.body.appendChild(entryCard);

    const cancelBtn = entryCard.querySelector('.grid-settings-entry-btn.cancel');
    expect(cancelBtn).toBeTruthy();
    expect(cancelBtn.textContent).toBe('取消');
  });
});

describe('电网设置面板校验 (validateGridSettings)', () => {
  let dom;

  beforeEach(() => {
    dom = new JSDOM(`
      <!DOCTYPE html>
      <html>
        <body>
          <div class="grid-settings-overlay" id="gridSettingsOverlay">
            <div class="grid-settings-panel" id="gridSettingsPanel">
              <button id="gridSettingsBack"></button>
              <div class="grid-settings-select">
                <select id="gridChargeSelect">
                  <option value="allow">允许电网充电</option>
                  <option value="disallow">不允许电网充电</option>
                </select>
              </div>
              <div class="grid-settings-item" id="maxChargeItem">
                <div class="grid-settings-input-group">
                  <input type="text" id="maxChargeInput" value="">
                </div>
              </div>
              <div class="grid-settings-select">
                <select id="energyOutputSelect">
                  <option value="pv_apower">光伏 & aPower</option>
                  <option value="pv_only">仅光伏</option>
                </select>
              </div>
              <div class="grid-settings-input-group">
                <input type="text" id="maxExportInput" value="">
              </div>
              <button id="gridSettingsConfirm">保存</button>
            </div>
          </div>
        </body>
      </html>
    `);
    global.document = dom.window.document;
    global.window = dom.window;
  });

  it('所有控件都有值时校验通过', () => {
    const { validateGridSettings } = require('../gridsettings.js');

    // select 默认有值，填充 input
    document.getElementById('maxChargeInput').value = '30';
    document.getElementById('maxExportInput').value = '50';

    var result = validateGridSettings();
    expect(result.valid).toBe(true);
    expect(result.emptyFields.length).toBe(0);
  });

  it('input 为空时校验失败，返回空字段 ID', () => {
    const { validateGridSettings } = require('../gridsettings.js');

    // input 留空
    document.getElementById('maxChargeInput').value = '';
    document.getElementById('maxExportInput').value = '';

    var result = validateGridSettings();
    expect(result.valid).toBe(false);
    expect(result.emptyFields).toContain('maxChargeInput');
    expect(result.emptyFields).toContain('maxExportInput');
  });

  it('部分 input 为空时只返回空的那个', () => {
    const { validateGridSettings } = require('../gridsettings.js');

    document.getElementById('maxChargeInput').value = '30';
    document.getElementById('maxExportInput').value = '';

    var result = validateGridSettings();
    expect(result.valid).toBe(false);
    expect(result.emptyFields).toContain('maxExportInput');
    expect(result.emptyFields).not.toContain('maxChargeInput');
  });

  it('highlightEmptyControls 给空控件容器添加 error 类', () => {
    const { highlightEmptyControls } = require('../gridsettings.js');

    highlightEmptyControls(['maxChargeInput', 'maxExportInput']);

    var wrapper1 = document.getElementById('maxChargeInput').closest('.grid-settings-input-group');
    var wrapper2 = document.getElementById('maxExportInput').closest('.grid-settings-input-group');
    expect(wrapper1.classList.contains('grid-settings-error')).toBe(true);
    expect(wrapper2.classList.contains('grid-settings-error')).toBe(true);
  });

  it('highlightEmptyControls 给空 select 容器添加 error 类', () => {
    const { highlightEmptyControls } = require('../gridsettings.js');

    // 模拟 select 值为空（虽然实际 select 总有默认值）
    highlightEmptyControls(['gridChargeSelect']);

    var wrapper = document.getElementById('gridChargeSelect').closest('.grid-settings-select');
    expect(wrapper.classList.contains('grid-settings-error')).toBe(true);
  });

  it('clearValidationErrors 清除所有 error 类', () => {
    const { highlightEmptyControls, clearValidationErrors } = require('../gridsettings.js');

    highlightEmptyControls(['maxChargeInput', 'maxExportInput']);
    clearValidationErrors();

    var errorEls = document.querySelectorAll('.grid-settings-error');
    expect(errorEls.length).toBe(0);
  });

  it('保存按钮点击时如果有空控件则不关闭面板', () => {
    const { initGridSettingsPanel, openGridSettingsPanel } = require('../gridsettings.js');

    initGridSettingsPanel();
    openGridSettingsPanel();

    // input 留空
    document.getElementById('maxChargeInput').value = '';
    document.getElementById('maxExportInput').value = '';

    // 点击保存
    document.getElementById('gridSettingsConfirm').click();

    // 面板应该仍然打开（overlay 仍有 active 类）
    var overlay = document.getElementById('gridSettingsOverlay');
    expect(overlay.classList.contains('active')).toBe(true);

    // 空控件应该有 error 类
    var wrapper1 = document.getElementById('maxChargeInput').closest('.grid-settings-input-group');
    var wrapper2 = document.getElementById('maxExportInput').closest('.grid-settings-input-group');
    expect(wrapper1.classList.contains('grid-settings-error')).toBe(true);
    expect(wrapper2.classList.contains('grid-settings-error')).toBe(true);
  });

  it('所有控件填满后保存按钮可以正常执行', () => {
    const { initGridSettingsPanel, openGridSettingsPanel } = require('../gridsettings.js');

    initGridSettingsPanel();
    openGridSettingsPanel();

    // 填满所有控件
    document.getElementById('maxChargeInput').value = '30';
    document.getElementById('maxExportInput').value = '50';

    // 点击保存
    document.getElementById('gridSettingsConfirm').click();

    // 面板应该进入已保存状态
    var panel = document.getElementById('gridSettingsPanel');
    expect(panel.classList.contains('saved')).toBe(true);
    expect(document.getElementById('gridSettingsConfirm').textContent).toBe('已保存');
  });

  it('不允许电网充电时，电网取电限制应该隐藏', () => {
    const { toggleMaxChargeVisibility } = require('../gridsettings.js');

    var item = document.getElementById('maxChargeItem');
    document.getElementById('gridChargeSelect').value = 'disallow';
    toggleMaxChargeVisibility();

    expect(item.style.display).toBe('none');
  });

  it('允许电网充电时，电网取电限制应该显示', () => {
    const { toggleMaxChargeVisibility } = require('../gridsettings.js');

    var item = document.getElementById('maxChargeItem');
    document.getElementById('gridChargeSelect').value = 'allow';
    toggleMaxChargeVisibility();

    expect(item.style.display).toBe('');
  });

  it('不允许电网充电时，校验应跳过 maxChargeInput', () => {
    const { validateGridSettings } = require('../gridsettings.js');

    document.getElementById('gridChargeSelect').value = 'disallow';
    document.getElementById('maxChargeInput').value = '';
    document.getElementById('maxExportInput').value = '50';

    var result = validateGridSettings();
    expect(result.valid).toBe(true);
    expect(result.emptyFields).not.toContain('maxChargeInput');
  });
});
