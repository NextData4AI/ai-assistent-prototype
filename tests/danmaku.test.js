import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Load DANMAKU_DATA into global scope (danmaku.js expects it)
const mockdata = require('../mockdata.js');
global.DANMAKU_DATA = mockdata.DANMAKU_DATA;

const {
  initDanmaku,
  hideDanmaku,
  _danmakuState,
  _createChip,
  DANMAKU_ROWS
} = require('../danmaku.js');

describe('initDanmaku', () => {
  let container;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    container.className = 'danmaku-bar';
    container.innerHTML = `
      <div class="danmaku-track" data-category="basic"></div>
      <div class="danmaku-track" data-category="operate"></div>
      <div class="danmaku-track" data-category="service"></div>
    `;
    document.body.appendChild(container);
    // Reset state
    _danmakuState.container = null;
    _danmakuState.onSelect = null;
    _danmakuState.active = false;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
    _danmakuState.container = null;
    _danmakuState.onSelect = null;
    _danmakuState.active = false;
  });

  it('does not throw if container is null', () => {
    expect(() => initDanmaku(null, () => {})).not.toThrow();
  });

  it('stores container and onSelect references', () => {
    const cb = vi.fn();
    initDanmaku(container, cb);
    expect(_danmakuState.container).toBe(container);
    expect(_danmakuState.onSelect).toBe(cb);
    expect(_danmakuState.active).toBe(true);
  });

  it('creates three rows of danmaku tracks (Req 8.1)', () => {
    initDanmaku(container, () => {});
    const tracks = container.querySelectorAll('.danmaku-track');
    expect(tracks.length).toBe(3);
  });

  it('populates basic track with blue chips (Req 8.2)', () => {
    initDanmaku(container, () => {});
    const basicTrack = container.querySelector('[data-category="basic"]');
    const chips = basicTrack.querySelectorAll('.danmaku-chip');
    // Items are duplicated for seamless scroll, so 5 items × 2 = 10
    expect(chips.length).toBe(10);
    // Check color tag
    const tag = chips[0].querySelector('.danmaku-chip-tag');
    expect(tag.style.backgroundColor).toBe('rgb(59, 130, 246)'); // #3b82f6
  });

  it('populates operate track with green chips (Req 8.2)', () => {
    initDanmaku(container, () => {});
    const operateTrack = container.querySelector('[data-category="operate"]');
    const chips = operateTrack.querySelectorAll('.danmaku-chip');
    expect(chips.length).toBe(10);
    const tag = chips[0].querySelector('.danmaku-chip-tag');
    expect(tag.style.backgroundColor).toBe('rgb(34, 197, 94)'); // #22c55e
  });

  it('populates service track with orange chips (Req 8.2)', () => {
    initDanmaku(container, () => {});
    const serviceTrack = container.querySelector('[data-category="service"]');
    const chips = serviceTrack.querySelectorAll('.danmaku-chip');
    expect(chips.length).toBe(10);
    const tag = chips[0].querySelector('.danmaku-chip-tag');
    expect(tag.style.backgroundColor).toBe('rgb(245, 158, 11)'); // #f59e0b
  });

  it('each chip has capsule style with color tag and question text (Req 8.7)', () => {
    initDanmaku(container, () => {});
    const chip = container.querySelector('.danmaku-chip');
    expect(chip).toBeTruthy();
    expect(chip.querySelector('.danmaku-chip-tag')).toBeTruthy();
    expect(chip.querySelector('.danmaku-chip-text')).toBeTruthy();
    expect(chip.querySelector('.danmaku-chip-text').textContent.length).toBeGreaterThan(0);
  });

  it('three rows have different animation speeds (Req 8.3)', () => {
    // Verify DANMAKU_ROWS config has different durations
    const durations = DANMAKU_ROWS.map(r => r.duration);
    expect(durations[0]).toBe(30); // basic
    expect(durations[1]).toBe(25); // operate
    expect(durations[2]).toBe(35); // service
    // All different
    expect(new Set(durations).size).toBe(3);
  });

  it('removes hidden class on init to show container', () => {
    container.classList.add('hidden');
    initDanmaku(container, () => {});
    expect(container.classList.contains('hidden')).toBe(false);
  });

  it('clicking a chip triggers onSelect callback (Req 8.4)', () => {
    const callback = vi.fn();
    initDanmaku(container, callback);

    const chip = container.querySelector('.danmaku-chip');
    const question = chip.getAttribute('data-question');
    chip.click();

    expect(callback).toHaveBeenCalledWith(question);
  });

  it('clicking a chip hides all danmaku (Req 8.5)', () => {
    initDanmaku(container, () => {});

    const chip = container.querySelector('.danmaku-chip');
    chip.click();

    expect(container.classList.contains('hidden')).toBe(true);
  });

  it('stores data-question attribute on each chip', () => {
    initDanmaku(container, () => {});
    const chips = container.querySelectorAll('.danmaku-chip');
    chips.forEach(chip => {
      expect(chip.getAttribute('data-question')).toBeTruthy();
    });
  });
});

describe('hideDanmaku', () => {
  let container;

  beforeEach(() => {
    vi.useFakeTimers();
    container = document.createElement('div');
    container.className = 'danmaku-bar';
    container.innerHTML = `
      <div class="danmaku-track" data-category="basic"></div>
      <div class="danmaku-track" data-category="operate"></div>
      <div class="danmaku-track" data-category="service"></div>
    `;
    document.body.appendChild(container);
    _danmakuState.container = null;
    _danmakuState.onSelect = null;
    _danmakuState.active = false;
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.useRealTimers();
    _danmakuState.container = null;
    _danmakuState.onSelect = null;
    _danmakuState.active = false;
  });

  it('adds hidden class for fade-out animation (Req 8.5)', () => {
    initDanmaku(container, () => {});
    hideDanmaku();
    expect(container.classList.contains('hidden')).toBe(true);
  });

  it('sets active to false', () => {
    initDanmaku(container, () => {});
    expect(_danmakuState.active).toBe(true);
    hideDanmaku();
    expect(_danmakuState.active).toBe(false);
  });

  it('removes DOM elements after fade-out transition', () => {
    initDanmaku(container, () => {});
    const basicTrack = container.querySelector('[data-category="basic"]');
    expect(basicTrack.querySelectorAll('.danmaku-chip').length).toBeGreaterThan(0);

    hideDanmaku();
    // Before transition completes, chips still exist
    expect(basicTrack.querySelectorAll('.danmaku-chip').length).toBeGreaterThan(0);

    // After 500ms transition
    vi.advanceTimersByTime(500);
    expect(basicTrack.querySelectorAll('.danmaku-chip').length).toBe(0);
  });

  it('stops CSS animations after fade-out', () => {
    initDanmaku(container, () => {});
    hideDanmaku();
    vi.advanceTimersByTime(500);

    const tracks = container.querySelectorAll('.danmaku-track');
    tracks.forEach(track => {
      expect(track.style.animation).toBe('none');
    });
  });

  it('does not throw if called when not active', () => {
    expect(() => hideDanmaku()).not.toThrow();
  });

  it('does not throw if called multiple times', () => {
    initDanmaku(container, () => {});
    hideDanmaku();
    expect(() => hideDanmaku()).not.toThrow();
  });
});

describe('_createChip', () => {
  it('creates a chip with color tag and text', () => {
    const chip = _createChip('Test question?', '#3b82f6', '基础能力', () => {});
    expect(chip.className).toBe('danmaku-chip');
    expect(chip.querySelector('.danmaku-chip-tag').style.backgroundColor).toBe('rgb(59, 130, 246)');
    expect(chip.querySelector('.danmaku-chip-text').textContent).toBe('Test question?');
  });

  it('stores data attributes for testing', () => {
    const chip = _createChip('My question', '#22c55e', '操作能力', () => {});
    expect(chip.getAttribute('data-question')).toBe('My question');
    expect(chip.getAttribute('data-color')).toBe('#22c55e');
    expect(chip.getAttribute('data-label')).toBe('操作能力');
  });

  it('click triggers onSelect with question text', () => {
    const cb = vi.fn();
    const chip = _createChip('Click me', '#f59e0b', '服务能力', cb);
    document.body.appendChild(chip);

    // Need to set up danmaku state for hideDanmaku to work
    _danmakuState.container = document.createElement('div');
    _danmakuState.active = true;

    chip.click();
    expect(cb).toHaveBeenCalledWith('Click me');
  });
});
