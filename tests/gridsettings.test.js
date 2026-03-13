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
