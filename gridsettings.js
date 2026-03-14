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
        // 面板进入已保存/只读状态
        panel.classList.add('saved');
        confirmBtn.textContent = '已保存';
        confirmBtn.disabled = true;

        // 短暂显示已保存状态后关闭面板
        setTimeout(function () {
            closePanel();
        }, 600);
    });
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

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initGridSettingsPanel, openGridSettingsPanel, isGridSettingsQuery };
}
