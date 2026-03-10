import { describe, it, expect, beforeEach } from 'vitest';
import { openImageViewer, closeImageViewer, clampScale } from '../imageviewer.js';

describe('ImageViewer', () => {
  beforeEach(() => {
    // Set up the DOM elements the imageviewer expects
    document.body.innerHTML = `
      <div class="image-viewer-overlay" id="imageViewerOverlay">
        <img class="image-viewer-img" id="imageViewerImg" src="" alt="全屏图片">
      </div>
    `;
  });

  describe('clampScale', () => {
    it('returns 1 for values below 1', () => {
      expect(clampScale(0)).toBe(1);
      expect(clampScale(-5)).toBe(1);
      expect(clampScale(0.5)).toBe(1);
    });

    it('returns 3 for values above 3', () => {
      expect(clampScale(4)).toBe(3);
      expect(clampScale(100)).toBe(3);
      expect(clampScale(3.1)).toBe(3);
    });

    it('returns the value when within [1, 3]', () => {
      expect(clampScale(1)).toBe(1);
      expect(clampScale(2)).toBe(2);
      expect(clampScale(3)).toBe(3);
      expect(clampScale(1.5)).toBe(1.5);
    });
  });

  describe('openImageViewer', () => {
    it('adds active class to overlay and sets img src', () => {
      openImageViewer('https://example.com/photo.jpg');
      const overlay = document.getElementById('imageViewerOverlay');
      const img = document.getElementById('imageViewerImg');
      expect(overlay.classList.contains('active')).toBe(true);
      expect(img.src).toBe('https://example.com/photo.jpg');
    });

    it('resets scale to 1 on open', () => {
      openImageViewer('https://example.com/photo.jpg');
      const img = document.getElementById('imageViewerImg');
      expect(img.style.transform).toBe('scale(1)');
    });
  });

  describe('closeImageViewer', () => {
    it('removes active class and clears img src', () => {
      openImageViewer('https://example.com/photo.jpg');
      closeImageViewer();
      const overlay = document.getElementById('imageViewerOverlay');
      const img = document.getElementById('imageViewerImg');
      expect(overlay.classList.contains('active')).toBe(false);
      expect(img.getAttribute('src')).toBe('');
    });
  });

  describe('click to close', () => {
    it('closes when overlay is clicked', () => {
      openImageViewer('https://example.com/photo.jpg');
      const overlay = document.getElementById('imageViewerOverlay');
      overlay.click();
      expect(overlay.classList.contains('active')).toBe(false);
    });
  });
});
