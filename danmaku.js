// danmaku.js - 弹幕系统
// 三行弹幕滚动推荐

// Internal state for danmaku system
var _danmakuState = {
  container: null,
  onSelect: null,
  active: false
};

// Danmaku row configuration: category key → animation duration
var DANMAKU_ROWS = [
  { key: 'basic', duration: 30 },
  { key: 'operate', duration: 25 },
  { key: 'service', duration: 35 }
];

/**
 * 初始化弹幕系统
 * Creates 3 rows of scrolling danmaku items inside the container.
 * Each row corresponds to a category from DANMAKU_DATA.
 * @param {HTMLElement} container - 挂载容器 (the .danmaku-bar element)
 * @param {Function} onSelect - 点击弹幕回调 (question: string) => void
 */
function initDanmaku(container, onSelect) {
  if (!container) return;

  _danmakuState.container = container;
  _danmakuState.onSelect = onSelect || null;
  _danmakuState.active = true;

  // Get DANMAKU_DATA from global scope (loaded via mockdata.js)
  var data = (typeof DANMAKU_DATA !== 'undefined') ? DANMAKU_DATA : null;
  if (!data) return;

  // Show the container
  container.classList.remove('hidden');
  container.style.opacity = '1';

  // Find or create tracks for each category row
  for (var r = 0; r < DANMAKU_ROWS.length; r++) {
    var rowConfig = DANMAKU_ROWS[r];
    var categoryKey = rowConfig.key;
    var categoryData = data[categoryKey];
    if (!categoryData) continue;

    // Find existing track element by data-category attribute
    var track = container.querySelector('.danmaku-track[data-category="' + categoryKey + '"]');
    if (!track) {
      // Create track if not found
      track = document.createElement('div');
      track.className = 'danmaku-track';
      track.setAttribute('data-category', categoryKey);
      container.appendChild(track);
    }

    // Clear existing content
    track.innerHTML = '';

    // Create danmaku chips for this category
    // Duplicate items to create seamless infinite scroll effect
    var items = categoryData.items || [];
    var color = categoryData.color || '#999';
    var label = categoryData.label || '';

    _populateTrack(track, items, color, label, onSelect);
  }
}

/**
 * Populate a track with danmaku chip elements.
 * Items are duplicated to create seamless infinite scroll.
 */
function _populateTrack(track, items, color, label, onSelect) {
  // Create two sets of items for seamless looping
  for (var dup = 0; dup < 2; dup++) {
    for (var i = 0; i < items.length; i++) {
      var chip = _createChip(items[i], color, label, onSelect);
      track.appendChild(chip);
    }
  }
}

/**
 * Create a single danmaku chip element.
 * Capsule style: colored dot + question text
 */
function _createChip(question, color, label, onSelect) {
  var chip = document.createElement('span');
  chip.className = 'danmaku-chip';

  // Color tag dot
  var tag = document.createElement('span');
  tag.className = 'danmaku-chip-tag';
  tag.style.backgroundColor = color;
  chip.appendChild(tag);

  // Question text
  var text = document.createElement('span');
  text.className = 'danmaku-chip-text';
  text.textContent = question;
  chip.appendChild(text);

  // Store metadata for testing
  chip.setAttribute('data-question', question);
  chip.setAttribute('data-color', color);
  chip.setAttribute('data-label', label);

  // Click handler: trigger onSelect and hide all danmaku
  chip.addEventListener('click', function () {
    if (onSelect && typeof onSelect === 'function') {
      onSelect(question);
    }
    hideDanmaku();
  });

  return chip;
}

/**
 * 淡出隐藏弹幕
 * Fades out all danmaku with animation, then removes DOM elements
 * and stops CSS animations.
 */
function hideDanmaku() {
  if (!_danmakuState.active) return;
  _danmakuState.active = false;

  var container = _danmakuState.container;
  if (!container) return;

  // Add hidden class for fade-out animation
  container.classList.add('hidden');

  // After fade-out transition completes (500ms matches CSS transition),
  // stop animations and remove DOM elements
  var transitionDuration = 500;
  setTimeout(function () {
    // Stop CSS animations on all tracks
    var tracks = container.querySelectorAll('.danmaku-track');
    for (var i = 0; i < tracks.length; i++) {
      tracks[i].style.animationPlayState = 'paused';
      tracks[i].style.animation = 'none';
      // Remove all chip elements
      tracks[i].innerHTML = '';
    }
  }, transitionDuration);
}

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initDanmaku: initDanmaku,
    hideDanmaku: hideDanmaku,
    _danmakuState: _danmakuState,
    _createChip: _createChip,
    _populateTrack: _populateTrack,
    DANMAKU_ROWS: DANMAKU_ROWS
  };
}
