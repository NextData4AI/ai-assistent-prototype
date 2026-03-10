import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Load ROLES into global scope (context.js expects it)
const mockdata = require('../mockdata.js');
global.ROLES = mockdata.ROLES;

const {
  initContextRecommender,
  showSuggestions,
  hideSuggestions,
  triggerRecommendation,
  destroyContextRecommender,
  _ctxState,
  _getSuggestionsForRole
} = require('../context.js');

describe('initContextRecommender', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'context-recommender';
    container.innerHTML = `
      <div class="context-recommender-list" id="contextRecommenderList"></div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    destroyContextRecommender();
    document.body.innerHTML = '';
  });

  it('does not throw if container is null', () => {
    expect(() => initContextRecommender(null, () => {})).not.toThrow();
  });

  it('stores container and onSelect references', () => {
    const cb = vi.fn();
    initContextRecommender(container, cb);
    expect(_ctxState.container).toBe(container);
    expect(_ctxState.onSelect).toBe(cb);
  });

  it('finds list element', () => {
    initContextRecommender(container, () => {});
    expect(_ctxState.listEl).toBeTruthy();
  });
});

describe('showSuggestions', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'context-recommender';
    container.innerHTML = `
      <div class="context-recommender-list"></div>
    `;
    document.body.appendChild(container);
    initContextRecommender(container, () => {});
  });

  afterEach(() => {
    destroyContextRecommender();
    document.body.innerHTML = '';
  });

  it('shows suggestions immediately with no delay', () => {
    showSuggestions('general');
    expect(container.classList.contains('visible')).toBe(true);
    const items = container.querySelectorAll('.context-recommender-item');
    expect(items.length).toBeGreaterThan(0);
  });

  it('displays all role suggestions', () => {
    showSuggestions('general');
    const items = container.querySelectorAll('.context-recommender-item');
    expect(items.length).toBe(4); // general has 4 suggestions
  });

  it('displays role-specific suggestions', () => {
    showSuggestions('device');
    const items = container.querySelectorAll('.context-recommender-item');
    expect(items[0].textContent).toBe('aPower 电池参数是什么？');
  });

  it('clicking a suggestion triggers onSelect callback', () => {
    const callback = vi.fn();
    destroyContextRecommender();
    initContextRecommender(container, callback);

    showSuggestions('general');
    const items = container.querySelectorAll('.context-recommender-item');
    items[0].click();

    expect(callback).toHaveBeenCalledWith('FranklinWH 产品有哪些？');
  });

  it('updates suggestions when switching roles', () => {
    showSuggestions('general');
    let items = container.querySelectorAll('.context-recommender-item');
    expect(items[0].textContent).toBe('FranklinWH 产品有哪些？');

    showSuggestions('energy');
    items = container.querySelectorAll('.context-recommender-item');
    expect(items[0].textContent).toBe('今日发电量是多少？');
  });

  it('clears previous suggestions before rendering new ones', () => {
    showSuggestions('general');
    showSuggestions('device');
    const items = container.querySelectorAll('.context-recommender-item');
    expect(items.length).toBe(4); // only device suggestions, not 8
  });
});

describe('hideSuggestions', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'context-recommender';
    container.innerHTML = `
      <div class="context-recommender-list"></div>
    `;
    document.body.appendChild(container);
    initContextRecommender(container, () => {});
  });

  afterEach(() => {
    destroyContextRecommender();
    document.body.innerHTML = '';
  });

  it('hides the recommender and clears items', () => {
    showSuggestions('general');
    expect(container.classList.contains('visible')).toBe(true);
    expect(container.querySelectorAll('.context-recommender-item').length).toBeGreaterThan(0);

    hideSuggestions();
    expect(container.classList.contains('visible')).toBe(false);
    expect(container.querySelectorAll('.context-recommender-item').length).toBe(0);
  });

  it('does not throw if container is null', () => {
    destroyContextRecommender();
    expect(() => hideSuggestions()).not.toThrow();
  });

  it('can show again after hiding', () => {
    showSuggestions('general');
    hideSuggestions();
    expect(container.classList.contains('visible')).toBe(false);

    showSuggestions('general');
    expect(container.classList.contains('visible')).toBe(true);
    expect(container.querySelectorAll('.context-recommender-item').length).toBeGreaterThan(0);
  });
});

describe('triggerRecommendation (backward compat)', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'context-recommender';
    container.innerHTML = `
      <div class="context-recommender-list"></div>
    `;
    document.body.appendChild(container);
    initContextRecommender(container, () => {});
  });

  afterEach(() => {
    destroyContextRecommender();
    document.body.innerHTML = '';
  });

  it('works the same as showSuggestions', () => {
    triggerRecommendation('general');
    expect(container.classList.contains('visible')).toBe(true);
    const items = container.querySelectorAll('.context-recommender-item');
    expect(items.length).toBe(4);
  });
});

describe('destroyContextRecommender', () => {
  let container;

  beforeEach(() => {
    container = document.createElement('div');
    container.className = 'context-recommender';
    container.innerHTML = `
      <div class="context-recommender-list"></div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('resets all internal state', () => {
    initContextRecommender(container, () => {});
    destroyContextRecommender();

    expect(_ctxState.container).toBeNull();
    expect(_ctxState.listEl).toBeNull();
    expect(_ctxState.onSelect).toBeNull();
    expect(_ctxState.currentRoleId).toBeNull();
  });
});

describe('_getSuggestionsForRole', () => {
  it('returns all suggestions for general role', () => {
    const suggestions = _getSuggestionsForRole('general');
    expect(suggestions.length).toBe(4);
    expect(suggestions[0]).toBe('FranklinWH 产品有哪些？');
  });

  it('returns all suggestions for device role', () => {
    const suggestions = _getSuggestionsForRole('device');
    expect(suggestions.length).toBe(4);
    expect(suggestions[0]).toBe('aPower 电池参数是什么？');
  });

  it('returns empty array for unknown role', () => {
    const suggestions = _getSuggestionsForRole('unknown');
    expect(suggestions.length).toBe(0);
  });
});
