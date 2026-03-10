import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../markdown.js';

describe('renderMarkdown', () => {
  // Empty / null input
  it('returns empty string for empty input', () => {
    expect(renderMarkdown('')).toBe('');
    expect(renderMarkdown(null)).toBe('');
    expect(renderMarkdown(undefined)).toBe('');
  });

  // H1 heading with brand color left border
  it('renders H1 with md-h1 class', () => {
    const result = renderMarkdown('# Hello World');
    expect(result).toContain('<h1 class="md-h1">');
    expect(result).toContain('Hello World');
  });

  // H2 heading with brand color left border
  it('renders H2 with md-h2 class', () => {
    const result = renderMarkdown('## Sub Title');
    expect(result).toContain('<h2 class="md-h2">');
    expect(result).toContain('Sub Title');
  });

  // Image block with skeleton, error handling, caption
  it('renders image with img element, skeleton, and caption', () => {
    const result = renderMarkdown('![产品图片](https://example.com/img.png)');
    expect(result).toContain('<img');
    expect(result).toContain('src="https://example.com/img.png"');
    expect(result).toContain('alt="产品图片"');
    expect(result).toContain('md-image-skeleton');
    expect(result).toContain('md-image-error');
    expect(result).toContain('md-image-caption');
    expect(result).toContain('产品图片');
  });

  // Table rendering
  it('renders table with md-table class and correct rows', () => {
    const md = '| Name | Value |\n|------|-------|\n| A | 1 |\n| B | 2 |';
    const result = renderMarkdown(md);
    expect(result).toContain('<table class="md-table">');
    expect(result).toContain('<th>');
    expect(result).toContain('<td>');
    // Header + 2 data rows = 3 <tr>
    const trCount = (result.match(/<tr>/g) || []).length;
    expect(trCount).toBe(3);
  });

  // Code block
  it('renders code block with pre and code elements', () => {
    const md = '```\nconst x = 1;\nconsole.log(x);\n```';
    const result = renderMarkdown(md);
    expect(result).toContain('<pre class="md-code-block"><code>');
    expect(result).toContain('const x = 1;');
  });

  // Bold and italic
  it('renders bold and italic inline', () => {
    const result = renderMarkdown('This is **bold** and *italic*');
    expect(result).toContain('<strong>bold</strong>');
    expect(result).toContain('<em>italic</em>');
  });

  // Links
  it('renders links', () => {
    const result = renderMarkdown('[Click here](https://example.com)');
    expect(result).toContain('<a href="https://example.com"');
    expect(result).toContain('Click here');
  });

  // Unordered list
  it('renders unordered list', () => {
    const md = '- Item 1\n- Item 2\n- Item 3';
    const result = renderMarkdown(md);
    expect(result).toContain('<ul');
    expect(result).toContain('<li');
    const liCount = (result.match(/<li/g) || []).length;
    expect(liCount).toBe(3);
  });

  // Ordered list with step number icons
  it('renders ordered list with md-step-number icons', () => {
    const md = '1. First step\n2. Second step\n3. Third step';
    const result = renderMarkdown(md);
    expect(result).toContain('<ol class="md-ordered-list">');
    expect(result).toContain('md-step-number');
    expect(result).toContain('First step');
    expect(result).toContain('>1<');
    expect(result).toContain('>2<');
    expect(result).toContain('>3<');
  });

  // Blockquote
  it('renders blockquote', () => {
    const result = renderMarkdown('> This is a quote');
    expect(result).toContain('<div class="md-blockquote">');
    expect(result).toContain('This is a quote');
  });

  // Warning emoji card
  it('renders ⚠️ line as warning card', () => {
    const result = renderMarkdown('⚠️ 注意事项：请小心操作');
    expect(result).toContain('md-alert-card warning');
  });

  // Tip emoji card
  it('renders 💡 line as tip card', () => {
    const result = renderMarkdown('💡 专家建议：建议使用此方案');
    expect(result).toContain('md-alert-card tip');
  });

  // Config emoji card
  it('renders ⚙️ line as config card', () => {
    const result = renderMarkdown('⚙️ 系统配置说明');
    expect(result).toContain('md-alert-card config');
  });

  // Source tag
  it('renders 📖 来源 as source tag', () => {
    const result = renderMarkdown('📖 来源：FranklinWH 安装手册 v3.2');
    expect(result).toContain('md-source-tag');
    expect(result).toContain('FranklinWH 安装手册 v3.2');
  });

  // Reference section
  it('renders 📚 参考文档 section', () => {
    const md = '📚 参考文档\n- [手册](https://example.com/doc)\n- [指南](https://example.com/guide)';
    const result = renderMarkdown(md);
    expect(result).toContain('md-reference-section');
    expect(result).toContain('md-reference-title');
    expect(result).toContain('手册');
    expect(result).toContain('https://example.com/doc');
  });

  // Invalid syntax passes through as plain text
  it('renders unrecognized syntax as plain text paragraph', () => {
    const result = renderMarkdown('Just some plain text');
    expect(result).toContain('<p>Just some plain text</p>');
  });
});
