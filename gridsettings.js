// gridsettings.js - 电网输入输出设置面板

/**
 * 初始化电网设置面板
 */
function initGridSettingsPanel() {
    const overlay = document.getElementById('gridSettingsOverlay');
    const panel = document.getElementById('gridSettingsPanel');
    const backBtn = document.getElementById('gridSettingsBack');
    const confirmBtn = document.getElementById('gridSettingsConfirm');

    if (!overlay || !panel || !backBtn || !confirmBtn) return;

    // 关闭面板
    function closePanel() {
        overlay.classList.remove('active');
    }

    // 点击遮罩关闭
    overlay.addEventListener('click', function (e) {
        if (e.target === overlay) {
            closePanel();
        }
    });

    // 返回按钮
    backBtn.addEventListener('click', closePanel);

    // 保存按钮
    confirmBtn.addEventListener('click', function () {
        // 校验 4 个控件是否都有值
        var validationResult = validateGridSettings();
        if (!validationResult.valid) {
            // 高亮空控件边框为红色
            highlightEmptyControls(validationResult.emptyFields);
            return;
        }

        // 清除所有错误状态
        clearValidationErrors();

        // 面板进入已保存/只读状态
        panel.classList.add('saved');
        confirmBtn.textContent = '已保存';
        confirmBtn.disabled = true;

        // 短暂显示已保存状态后关闭面板
        setTimeout(function () {
            closePanel();
        }, 600);
    });

    // 监听控件值变化，实时清除对应的错误状态
    _bindValidationListeners();
}

/**
 * 打开电网设置面板
 */
function openGridSettingsPanel() {
    const overlay = document.getElementById('gridSettingsOverlay');
    const panel = document.getElementById('gridSettingsPanel');
    const confirmBtn = document.getElementById('gridSettingsConfirm');
    if (overlay) {
        // 重置保存状态
        if (panel) panel.classList.remove('saved');
        if (confirmBtn) {
            confirmBtn.textContent = '保存';
            confirmBtn.disabled = false;
        }
        overlay.classList.add('active');
        // 同步取电限制显隐状态
        toggleMaxChargeVisibility();
    }
}

/**
 * 检测是否是电网设置相关的查询
 * @param {string} message - 用户消息
 * @returns {boolean}
 */
function isGridSettingsQuery(message) {
    if (!message || typeof message !== 'string') return false;

    const keywords = [
        '电网输入输出',
        '电网输入和输出',
        '设置电网',
        '电网设置',
        '怎么设置电网',
        '如何设置电网',
        '电网充电',
        '电网馈网',
        '电网配置'
    ];

    const lowerMsg = message.toLowerCase();
    return keywords.some(keyword => lowerMsg.includes(keyword.toLowerCase()));
}

// 初始化
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGridSettingsPanel);
    } else {
        initGridSettingsPanel();
    }
}

/**
 * 校验电网设置面板 4 个控件是否都已填充
 * - 下拉选择项 (select): 检查是否有选中值（非空字符串）
 * - 数值输入项 (input): 检查是否有输入值（非空字符串）
 * @returns {{valid: boolean, emptyFields: string[]}}
 */
function validateGridSettings() {
    var gridChargeEl = document.getElementById('gridChargeSelect');
    var isDisallow = gridChargeEl && gridChargeEl.value === 'disallow';

    var controls = [
        { id: 'gridChargeSelect', type: 'select' },
        { id: 'maxChargeInput', type: 'input', skipWhen: isDisallow },
        { id: 'energyOutputSelect', type: 'select' },
        { id: 'maxExportInput', type: 'input' }
    ];

    var emptyFields = [];

    for (var i = 0; i < controls.length; i++) {
        if (controls[i].skipWhen) continue;

        var el = document.getElementById(controls[i].id);
        if (!el) {
            emptyFields.push(controls[i].id);
            continue;
        }

        var val = el.value;
        if (val === null || val === undefined || String(val).trim() === '') {
            emptyFields.push(controls[i].id);
        }
    }

    return {
        valid: emptyFields.length === 0,
        emptyFields: emptyFields
    };
}

/**
 * 高亮空控件的边框为红色
 * @param {string[]} emptyFields - 空控件的 ID 列表
 */
function highlightEmptyControls(emptyFields) {
    // 先清除所有错误状态
    clearValidationErrors();

    for (var i = 0; i < emptyFields.length; i++) {
        var el = document.getElementById(emptyFields[i]);
        if (!el) continue;

        // 找到包裹控件的容器（input-group 或 select 容器）
        var wrapper = el.closest('.grid-settings-input-group') || el.closest('.grid-settings-select');
        if (wrapper) {
            wrapper.classList.add('grid-settings-error');
        } else {
            el.classList.add('grid-settings-error');
        }
    }
}

/**
 * 清除所有控件的错误状态
 */
function clearValidationErrors() {
    var errorEls = document.querySelectorAll('.grid-settings-error');
    for (var i = 0; i < errorEls.length; i++) {
        errorEls[i].classList.remove('grid-settings-error');
    }
}

/**
 * 根据电网充电选择切换"电网取电限制"区域的显隐
 * 不允许电网充电时隐藏取电限制，允许时显示
 */
function toggleMaxChargeVisibility() {
    var select = document.getElementById('gridChargeSelect');
    var item = document.getElementById('maxChargeItem');
    if (!select || !item) return;
    if (select.value === 'disallow') {
        item.style.display = 'none';
    } else {
        item.style.display = '';
    }
}

/**
 * 绑定控件值变化监听器，输入/选择时实时清除对应的错误状态
 */
function _bindValidationListeners() {
    var inputIds = ['maxChargeInput', 'maxExportInput'];
    var selectIds = ['gridChargeSelect', 'energyOutputSelect'];

    for (var i = 0; i < inputIds.length; i++) {
        var input = document.getElementById(inputIds[i]);
        if (input) {
            input.addEventListener('input', function () {
                var wrapper = this.closest('.grid-settings-input-group');
                if (wrapper) wrapper.classList.remove('grid-settings-error');
            });
        }
    }

    for (var j = 0; j < selectIds.length; j++) {
        var select = document.getElementById(selectIds[j]);
        if (select) {
            select.addEventListener('change', function () {
                var wrapper = this.closest('.grid-settings-select');
                if (wrapper) wrapper.classList.remove('grid-settings-error');
                // 电网充电选择变化时切换取电限制显隐
                if (this.id === 'gridChargeSelect') {
                    toggleMaxChargeVisibility();
                }
            });
        }
    }
}

/**
 * 将解析出的电网设置值预填到面板控件中
 * 仅更新 settings 对象中存在的字段，未指定的控件保持当前值不变
 * @param {Object} settings - 解析出的设置值对象
 */
function prefillGridSettings(settings) {
    if (!settings || typeof settings !== 'object') return;

    var controlMap = {
        gridCharge: 'gridChargeSelect',
        maxCharge: 'maxChargeInput',
        energyOutput: 'energyOutputSelect',
        maxExport: 'maxExportInput'
    };

    var keys = Object.keys(settings);
    for (var i = 0; i < keys.length; i++) {
        var field = keys[i];
        var controlId = controlMap[field];
        if (!controlId) continue;

        var el = document.getElementById(controlId);
        if (!el) continue;

        el.value = settings[field];
    }

    // 预填后同步显隐状态
    toggleMaxChargeVisibility();
}

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initGridSettingsPanel, openGridSettingsPanel, isGridSettingsQuery, prefillGridSettings, validateGridSettings, highlightEmptyControls, clearValidationErrors, toggleMaxChargeVisibility };
}
