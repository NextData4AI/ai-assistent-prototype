// markdown.js - Markdown 渲染器
// 轻量级内联 Markdown 解析器，不依赖外部库

/**
 * 将 Markdown 文本解析为 HTML 字符串
 * @param {string} markdown - 原始 Markdown 文本
 * @returns {string} - 渲染后的 HTML
 */
function renderMarkdown(markdown) {
  if (!markdown || typeof markdown !== 'string') return '';

  var lines = markdown.split('\n');
  var html = [];
  var inCodeBlock = false;
  var codeContent = [];
  var inTable = false;
  var tableRows = [];
  var inOrderedList = false;
  var orderedItems = [];
  var orderedStart = 0;
  var inUnorderedList = false;
  var unorderedItems = [];
  var inReferenceSection = false;
  var referenceItems = [];

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];

    // --- Code block (fenced) ---
    if (line.trim().indexOf('```') === 0) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeContent = [];
        continue;
      } else {
        inCodeBlock = false;
        html.push('<pre class="md-code-block"><code>' + escapeHtml(codeContent.join('\n')) + '</code></pre>');
        continue;
      }
    }
    if (inCodeBlock) {
      codeContent.push(line);
      continue;
    }

    // --- Flush pending lists/table before processing non-matching line ---
    var trimmed = line.trim();

    // Check if we should continue ordered list
    if (inOrderedList && !/^\d+\.\s/.test(trimmed) && trimmed !== '') {
      html.push(flushOrderedList(orderedItems));
      orderedItems = [];
      inOrderedList = false;
    }

    // Check if we should continue unordered list
    if (inUnorderedList && !/^[-*]\s/.test(trimmed) && trimmed !== '') {
      html.push(flushUnorderedList(unorderedItems));
      unorderedItems = [];
      inUnorderedList = false;
    }

    // Check if we should continue table
    if (inTable && (trimmed === '' || trimmed.indexOf('|') !== 0)) {
      html.push(flushTable(tableRows));
      tableRows = [];
      inTable = false;
    }

    // Check if we should continue reference section
    if (inReferenceSection && trimmed !== '' && trimmed.indexOf('-') !== 0 && trimmed.indexOf('[') !== 0) {
      html.push(flushReferenceSection(referenceItems));
      referenceItems = [];
      inReferenceSection = false;
    }

    // --- Empty line ---
    if (trimmed === '') {
      // Flush any pending lists
      if (inOrderedList) {
        html.push(flushOrderedList(orderedItems));
        orderedItems = [];
        inOrderedList = false;
      }
      if (inUnorderedList) {
        html.push(flushUnorderedList(unorderedItems));
        unorderedItems = [];
        inUnorderedList = false;
      }
      if (inReferenceSection) {
        html.push(flushReferenceSection(referenceItems));
        referenceItems = [];
        inReferenceSection = false;
      }
      continue;
    }


    // --- 📖 来源标注 ---
    if (trimmed.indexOf('📖 来源：') === 0 || trimmed.indexOf('📖 来源:') === 0) {
      var sourceText = trimmed.replace(/^📖\s*来源[：:]/, '').trim();
      html.push('<div class="md-source-tag">📖 来源：' + escapeHtml(sourceText) + '</div>');
      continue;
    }

    // --- 📚 参考文档 section ---
    if (trimmed.indexOf('📚 参考文档') === 0 || trimmed.indexOf('📚 参考文档') !== -1 && trimmed.length < 30) {
      inReferenceSection = true;
      referenceItems = [];
      continue;
    }

    if (inReferenceSection) {
      // Parse reference items: - [name](url) or - name
      var refMatch = trimmed.match(/^[-*]\s*\[([^\]]+)\]\(([^)]+)\)/);
      if (refMatch) {
        referenceItems.push({ name: refMatch[1], url: refMatch[2] });
        continue;
      }
      var refPlain = trimmed.match(/^[-*]\s+(.+)/);
      if (refPlain) {
        referenceItems.push({ name: refPlain[1], url: null });
        continue;
      }
      // If line starts with [ it might be a link without bullet
      var refLink = trimmed.match(/^\[([^\]]+)\]\(([^)]+)\)/);
      if (refLink) {
        referenceItems.push({ name: refLink[1], url: refLink[2] });
        continue;
      }
    }

    // --- Emoji alert cards ---
    if (trimmed.indexOf('⚠️') === 0) {
      html.push('<div class="md-alert-card warning">' + renderInline(trimmed) + '</div>');
      continue;
    }
    if (trimmed.indexOf('💡') === 0) {
      html.push('<div class="md-alert-card tip">' + renderInline(trimmed) + '</div>');
      continue;
    }
    if (trimmed.indexOf('⚙️') === 0) {
      html.push('<div class="md-alert-card config">' + renderInline(trimmed) + '</div>');
      continue;
    }

    // --- Headings ---
    if (trimmed.indexOf('## ') === 0) {
      html.push('<h2 class="md-h2">' + renderInline(trimmed.substring(3)) + '</h2>');
      continue;
    }
    if (trimmed.indexOf('# ') === 0) {
      html.push('<h1 class="md-h1">' + renderInline(trimmed.substring(2)) + '</h1>');
      continue;
    }

    // --- Image ---
    var imgMatch = trimmed.match(/^!\[([^\]]*)\]\(([^)]+)\)/);
    if (imgMatch) {
      html.push(renderImageBlock(imgMatch[1], imgMatch[2]));
      continue;
    }

    // --- Table ---
    if (trimmed.indexOf('|') === 0 && trimmed.lastIndexOf('|') > 0) {
      // Skip separator rows like |---|---|
      if (/^\|[\s\-:|]+\|$/.test(trimmed)) {
        if (inTable) continue; // skip separator
        continue;
      }
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      tableRows.push(trimmed);
      continue;
    }

    // --- Ordered list ---
    var olMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (olMatch) {
      if (!inOrderedList) {
        inOrderedList = true;
        orderedItems = [];
        orderedStart = parseInt(olMatch[1], 10);
      }
      orderedItems.push(olMatch[2]);
      continue;
    }

    // --- Unordered list ---
    if (/^[-*]\s+/.test(trimmed)) {
      if (!inUnorderedList) {
        inUnorderedList = true;
        unorderedItems = [];
      }
      unorderedItems.push(trimmed.replace(/^[-*]\s+/, ''));
      continue;
    }

    // --- Blockquote ---
    if (trimmed.indexOf('> ') === 0) {
      html.push('<div class="md-blockquote">' + renderInline(trimmed.substring(2)) + '</div>');
      continue;
    }

    // --- Default: paragraph ---
    html.push('<p>' + renderInline(trimmed) + '</p>');
  }

  // Flush remaining pending blocks
  if (inCodeBlock) {
    html.push('<pre class="md-code-block"><code>' + escapeHtml(codeContent.join('\n')) + '</code></pre>');
  }
  if (inOrderedList && orderedItems.length > 0) {
    html.push(flushOrderedList(orderedItems));
  }
  if (inUnorderedList && unorderedItems.length > 0) {
    html.push(flushUnorderedList(unorderedItems));
  }
  if (inTable && tableRows.length > 0) {
    html.push(flushTable(tableRows));
  }
  if (inReferenceSection && referenceItems.length > 0) {
    html.push(flushReferenceSection(referenceItems));
  }

  return html.join('\n');
}


/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render inline Markdown: bold, italic, links, inline code, images
 */
function renderInline(text) {
  if (!text) return '';

  // Escape HTML first but preserve markdown syntax chars
  var result = text;

  // Inline images: ![alt](url)
  result = result.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, function(match, alt, url) {
    return renderImageBlock(alt, url);
  });

  // Links: [text](url)
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');

  // Inline code: `code`
  result = result.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Bold: **text**
  result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Italic: *text*
  result = result.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  return result;
}

/**
 * Render an image block with skeleton loading, error handling, and caption
 */
function renderImageBlock(alt, url) {
  var safeAlt = escapeHtml(alt);
  var safeUrl = escapeHtml(url);
  var block = '<div class="md-image-block">';
  block += '<div class="md-image-skeleton"></div>';
  block += '<img src="' + safeUrl + '" alt="' + safeAlt + '" ';
  block += 'style="display:none;" ';
  block += 'onload="this.style.display=\'block\';this.previousElementSibling.style.display=\'none\';" ';
  block += 'onerror="this.style.display=\'none\';this.previousElementSibling.outerHTML=\'<div class=\\\'md-image-error\\\'>图片加载失败</div>\';" ';
  if (typeof openImageViewer === 'function' || true) {
    block += 'onclick="if(typeof openImageViewer===\'function\')openImageViewer(this.src);" ';
  }
  block += '>';
  if (safeAlt) {
    block += '<div class="md-image-caption">' + safeAlt + '</div>';
  }
  block += '</div>';
  return block;
}

/**
 * Flush ordered list items into HTML
 */
function flushOrderedList(items) {
  var html = '<ol class="md-ordered-list">';
  for (var i = 0; i < items.length; i++) {
    html += '<li>';
    html += '<span class="md-step-number">' + (i + 1) + '</span>';
    html += '<span>' + renderInline(items[i]) + '</span>';
    html += '</li>';
  }
  html += '</ol>';
  return html;
}

/**
 * Flush unordered list items into HTML
 */
function flushUnorderedList(items) {
  var html = '<ul style="margin:6px 0 6px 18px;">';
  for (var i = 0; i < items.length; i++) {
    html += '<li style="margin:2px 0;font-size:13px;">' + renderInline(items[i]) + '</li>';
  }
  html += '</ul>';
  return html;
}

/**
 * Flush table rows into HTML
 */
function flushTable(rows) {
  if (rows.length === 0) return '';
  var html = '<table class="md-table">';

  for (var r = 0; r < rows.length; r++) {
    var cells = parseTableRow(rows[r]);
    var tag = (r === 0) ? 'th' : 'td';
    html += '<tr>';
    for (var c = 0; c < cells.length; c++) {
      html += '<' + tag + '>' + renderInline(cells[c].trim()) + '</' + tag + '>';
    }
    html += '</tr>';
  }

  html += '</table>';
  return html;
}

/**
 * Parse a table row string into cell values
 */
function parseTableRow(row) {
  // Remove leading/trailing pipes and split
  var trimmed = row.trim();
  if (trimmed.charAt(0) === '|') trimmed = trimmed.substring(1);
  if (trimmed.charAt(trimmed.length - 1) === '|') trimmed = trimmed.substring(0, trimmed.length - 1);
  return trimmed.split('|');
}

/**
 * Flush reference section into HTML
 */
function flushReferenceSection(items) {
  if (items.length === 0) return '';
  var html = '<div class="md-reference-section">';
  html += '<div class="md-reference-title">📚 参考文档</div>';
  html += '<ul class="md-reference-list">';
  for (var i = 0; i < items.length; i++) {
    if (items[i].url) {
      html += '<li><a href="' + escapeHtml(items[i].url) + '" target="_blank" rel="noopener">' + escapeHtml(items[i].name) + '</a></li>';
    } else {
      html += '<li>' + escapeHtml(items[i].name) + '</li>';
    }
  }
  html += '</ul></div>';
  return html;
}

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { renderMarkdown, renderInline, escapeHtml, renderImageBlock, flushOrderedList, flushUnorderedList, flushTable, flushReferenceSection, parseTableRow };
}
