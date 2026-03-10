// cot.js - CoT 推理面板
// Chain-of-Thought 推理过程可视化

/**
 * 创建并插入 CoT 推理面板到消息列表
 * @param {HTMLElement} container - 消息容器
 * @param {Array<{label: string, detail: string}>} steps - 推理步骤
 * @param {Function} onComplete - 动画完成回调
 * @returns {HTMLElement} - CoT 面板 DOM 元素
 */
function createCoTPanel(container, steps, onComplete) {
  // 默认三步推理
  var defaultSteps = [
    { label: '正在查询 FranklinWH 设备数据…', detail: '' },
    { label: '正在分析数据…', detail: '' },
    { label: '正在归纳结果...', detail: '' }
  ];
  var actualSteps = (steps && steps.length > 0) ? steps : defaultSteps;

  // 创建面板容器
  var panel = document.createElement('div');
  panel.className = 'cot-panel';

  // 创建标题栏
  var header = document.createElement('div');
  header.className = 'cot-panel-header';
  header.innerHTML = '<span class="cot-arrow">▶</span><span class="cot-panel-title">AI 智能助手正在思考你的需求...</span>';

  // 创建面板体
  var body = document.createElement('div');
  body.className = 'cot-panel-body';

  var stepsContainer = document.createElement('div');
  stepsContainer.className = 'cot-panel-steps';

  // 创建步骤 DOM
  var stepElements = [];
  for (var i = 0; i < actualSteps.length; i++) {
    var stepItem = document.createElement('div');
    stepItem.className = 'cot-step-item';

    var icon = document.createElement('div');
    icon.className = 'cot-step-icon pending';
    icon.innerHTML = '<span style="font-size:10px;color:#999;">○</span>';

    var text = document.createElement('span');
    text.className = 'cot-step-text';
    text.textContent = '';

    stepItem.appendChild(icon);
    stepItem.appendChild(text);
    stepsContainer.appendChild(stepItem);
    stepElements.push({ item: stepItem, icon: icon, text: text, label: actualSteps[i].label });
  }

  body.appendChild(stepsContainer);
  panel.appendChild(header);
  panel.appendChild(body);

  // 点击标题切换展开/折叠
  header.addEventListener('click', function () {
    if (panel.classList.contains('expanded')) {
      panel.classList.remove('expanded');
    } else {
      panel.classList.add('expanded');
    }
  });

  // 插入到容器
  if (container) {
    container.appendChild(panel);
  }

  // 流式动画：逐步显示每个步骤
  var stepDelay = 800;
  var charDelay = 30;

  function animateStep(index) {
    if (index >= stepElements.length) {
      // 所有步骤完成，更新标题
      var titleEl = header.querySelector('.cot-panel-title');
      if (titleEl) {
        titleEl.textContent = '思考完成';
      }
      if (typeof onComplete === 'function') {
        onComplete();
      }
      return;
    }

    var step = stepElements[index];

    // 设置当前步骤为进行中
    step.icon.className = 'cot-step-icon running';
    step.icon.innerHTML = '<div class="cot-spinner"></div>';

    // 流式显示文字
    var label = step.label;
    var charIndex = 0;
    step.text.textContent = '';

    var typeInterval = setInterval(function () {
      if (charIndex < label.length) {
        step.text.textContent += label[charIndex];
        charIndex++;
      } else {
        clearInterval(typeInterval);
        // 标记完成
        step.icon.className = 'cot-step-icon done';
        step.icon.innerHTML = '<span style="font-size:12px;">✓</span>';

        // 延迟后进入下一步
        setTimeout(function () {
          animateStep(index + 1);
        }, stepDelay);
      }
    }, charDelay);
  }

  // 启动动画
  setTimeout(function () {
    animateStep(0);
  }, 300);

  return panel;
}

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createCoTPanel };
}
