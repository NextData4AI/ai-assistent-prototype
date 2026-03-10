// imageviewer.js - 图片查看器
// 全屏模态 + 双指缩放

// 内部状态
var _ivState = {
  scale: 1,
  initialDistance: 0,
  overlay: null,
  img: null
};

/**
 * 计算两个触摸点之间的距离
 * @param {Touch} t1
 * @param {Touch} t2
 * @returns {number}
 */
function _getDistance(t1, t2) {
  var dx = t1.clientX - t2.clientX;
  var dy = t1.clientY - t2.clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * 将缩放值约束在 [1, 3] 范围内
 * @param {number} value
 * @returns {number}
 */
function clampScale(value) {
  return Math.min(3, Math.max(1, value));
}

/**
 * 应用缩放到图片元素
 */
function _applyScale() {
  if (_ivState.img) {
    _ivState.img.style.transform = 'scale(' + _ivState.scale + ')';
  }
}

/**
 * 打开全屏图片查看器
 * @param {string} src - 图片 URL
 */
function openImageViewer(src) {
  _ivState.overlay = document.getElementById('imageViewerOverlay');
  _ivState.img = document.getElementById('imageViewerImg');
  if (!_ivState.overlay || !_ivState.img) return;

  _ivState.scale = 1;
  _ivState.initialDistance = 0;
  _ivState.img.src = src;
  _ivState.img.style.transform = 'scale(1)';
  _ivState.overlay.classList.add('active');

  // 双指缩放 - touchstart
  _ivState.overlay.ontouchstart = function(e) {
    if (e.touches.length >= 2) {
      e.preventDefault();
      _ivState.initialDistance = _getDistance(e.touches[0], e.touches[1]);
    }
  };

  // 双指缩放 - touchmove
  _ivState.overlay.ontouchmove = function(e) {
    if (e.touches.length >= 2) {
      e.preventDefault();
      var currentDistance = _getDistance(e.touches[0], e.touches[1]);
      if (_ivState.initialDistance > 0) {
        var ratio = currentDistance / _ivState.initialDistance;
        _ivState.scale = clampScale(ratio);
        _applyScale();
      }
    }
  };

  // touchend - 更新 initialDistance 或关闭
  _ivState.overlay.ontouchend = function(e) {
    if (e.touches.length < 2) {
      _ivState.initialDistance = 0;
    }
  };

  // 单击关闭（使用 click 事件，不与 pinch 冲突）
  _ivState.overlay.onclick = function(e) {
    // 仅在非缩放状态或点击 overlay 背景时关闭
    if (e.target === _ivState.overlay || e.target === _ivState.img) {
      closeImageViewer();
    }
  };
}

/**
 * 关闭全屏图片查看器
 */
function closeImageViewer() {
  if (_ivState.overlay) {
    _ivState.overlay.classList.remove('active');
    _ivState.overlay.ontouchstart = null;
    _ivState.overlay.ontouchmove = null;
    _ivState.overlay.ontouchend = null;
    _ivState.overlay.onclick = null;
  }
  _ivState.scale = 1;
  _ivState.initialDistance = 0;
  if (_ivState.img) {
    _ivState.img.style.transform = 'scale(1)';
    _ivState.img.src = '';
  }
}

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { openImageViewer, closeImageViewer, clampScale };
}
