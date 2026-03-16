# 实施计划：FranklinWH 智能助手原型升级

## 概述

基于现有 vanilla HTML/CSS/JS 单页架构，将当前 `app.js` 中的单体代码重构为模块化架构，并逐步实现 8 项功能升级。每个模块独立为一个 JS 文件，通过 `<script>` 标签引入 `index.html`。实现顺序为：项目结构重构 → Mock 数据层 → 核心渲染器 → 交互组件 → 集成联调。测试使用 Vitest + fast-check。

## Tasks

- [x] 1. 搭建测试环境与项目基础结构
  - [x] 1.1 初始化测试环境
    - 创建 `package.json`，添加 vitest 和 fast-check 依赖
    - 创建 `vitest.config.js` 配置文件
    - 创建 `tests/` 目录
    - 确保 JS 模块可被测试文件导入（各模块文件使用条件 export 兼容浏览器和 Node）
    - _Requirements: 全部_

  - [x] 1.2 更新 `index.html`，添加模块化 JS 引用和新增 HTML 结构
    - 添加 9 个 JS 模块的 `<script>` 标签（按依赖顺序：mockdata → markdown → imageviewer → cot → agent → role → context → danmaku → app）
    - 添加 Role_Selector 的 HTML 容器（输入区域上方的 Tab 栏），替换现有 `#roleBar` 为设计中定义的 4 个角色（通用智能助手、设备管理助手、能源分析专家、售后协同助手）
    - 添加 Context_Recommender 的 HTML 容器（左下角推荐条）
    - 添加 Danmaku_Banner 的 HTML 容器（欢迎区域下方三行弹幕），替换现有 `#marqueeBar`
    - 添加 ImageViewer 全屏模态的 HTML 容器
    - 添加所有新组件的 CSS 样式到 `styles.css`（CoT spinner 动画、折叠/展开、步骤图标、角色 Tab、弹幕胶囊、确认卡片、推荐条、图片骨架屏、全屏模态、Markdown 增强样式等）
    - _Requirements: 1.1, 1.2, 1.3, 2.1, 5.3, 6.1, 7.5, 8.1, 8.7_

- [-] 2. 实现 Mock 数据层 (`mockdata.js`)
  - [x] 2.1 创建 `mockdata.js`，定义所有 Mock 数据结构
    - 实现 `ROLES` 角色配置数组（4 个角色：general/device/energy/service，各含 id、name、icon、suggestions）
    - 实现 `DANMAKU_DATA` 弹幕数据（三类：basic/operate/service，含颜色和 items）
    - 实现 `PCS_SCENARIOS` 四类 PCS 操作场景数据（grid_charge、import_limit、energy_output、export_limit，含 keywords、currentValue、targetValue、unit）
    - 实现 `getMockReply(message, roleId)` 函数，根据用户消息和角色匹配回复，返回 `MockReply` 结构
    - 包含 `complexity: 'complex'` 的回复示例（含表格、分步说明、⚠️ 注意事项、💡 专家建议）
    - 包含 `complexity: 'simple'` 的回复示例（简洁 1-2 句话）
    - 包含 `type: 'no_match'` 的回复（显示"未在官方手册找到相关信息"）
    - 每条回复包含 `source` 字段（如 "FranklinWH 安装手册 v3.2"），用于 `📖 来源：` 标注
    - _Requirements: 3.3, 3.7, 3.8, 3.9, 5.6, 6.2, 6.4, 6.5, 6.6, 8.2_

  - [ ]* 2.2 编写 mockdata.js 属性测试
    - **Property 21: 回复详略策略**
    - 验证 `complexity: 'complex'` 的回复包含结构化元素（表格、分步说明或注意事项），`complexity: 'simple'` 的回复长度显著更短
    - **Validates: Requirements 3.7, 3.8**

- [-] 3. 实现 Markdown 渲染器 (`markdown.js`)
  - [x] 3.1 实现 `renderMarkdown(markdown)` 核心解析函数
    - 解析标题 `#` → H1 带 4px Brand_Color 左边框装饰，`##` → H2 带 3px Brand_Color 左边框装饰
    - 解析图片 `![alt](url)` → Image_Block：`<img>` 元素 + 骨架屏加载态 + onerror 灰色占位"图片加载失败" + 图片下方居中灰色小字 alt 描述
    - 图片宽度限制为消息气泡 100%，高度按比例自适应
    - 解析表格 `| col | col |` → 带边框和交替行背景色的 `<table>`
    - 解析代码块 `` ```code``` `` → `<pre><code>` 深色背景等宽字体
    - 解析内联样式：`**bold**`、`*italic*`、`[link](url)`
    - 解析无序列表 `- item`
    - 解析有序列表 `1. item` → 圆形背景 + 数字的序号图标，替代默认数字序号
    - 解析引用块 `> blockquote`
    - 解析 emoji 提示行：`⚠️` 行 → 橙色左边框高亮卡片，`💡` 行 → 蓝色左边框高亮卡片，`⚙️` 行 → 设置/配置类样式
    - 解析 `📚 参考文档` 区域 → 引用文档列表
    - 解析 `📖 来源：{文档名称}` → 来源标注区域
    - 无效语法原样输出为纯文本，空内容返回空字符串
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.7, 1.8, 3.1, 3.4, 3.5, 3.6, 3.9, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 3.2 编写 Markdown 图片语法解析属性测试
    - **Property 1: Markdown 图片语法解析**
    - 随机生成 alt 文本和 URL，验证 `renderMarkdown` 输出包含 `<img>` 元素，src=url, alt=alt
    - **Validates: Requirements 1.1**

  - [ ]* 3.3 编写图片描述文字渲染属性测试
    - **Property 18: 图片描述文字渲染**
    - 随机生成 alt 文本和 URL，验证输出在图片下方包含 alt 文本的描述元素
    - **Validates: Requirements 1.8**

  - [ ]* 3.4 编写 Markdown 表格渲染属性测试
    - **Property 5: Markdown 表格渲染**
    - 随机生成行列数和单元格内容，验证输出包含 `<table>` 且行数与源数据一致
    - **Validates: Requirements 3.4**

  - [ ]* 3.5 编写 Emoji 提示卡片渲染属性测试
    - **Property 6: Emoji 提示卡片渲染**
    - 随机生成含 ⚠️/💡 前缀的文本，验证 ⚠️ 行渲染为橙色卡片，💡 行渲染为蓝色卡片
    - **Validates: Requirements 3.5, 3.6, 4.4, 4.5**

  - [ ]* 3.6 编写 Markdown 标题装饰渲染属性测试
    - **Property 7: Markdown 标题装饰渲染**
    - 随机生成标题文本，验证 `#`/`##` 标题输出带品牌色左边框装饰样式类
    - **Validates: Requirements 4.1, 4.2**

  - [ ]* 3.7 编写参考文档区域渲染属性测试
    - **Property 8: 参考文档区域渲染**
    - 随机生成文档名和 URL 列表，验证 `📚 参考文档` 标记生成参考文档列表区域
    - **Validates: Requirements 4.6**

  - [ ]* 3.8 编写代码块渲染属性测试
    - **Property 9: 代码块渲染**
    - 随机生成代码内容，验证三反引号代码块输出 `<pre><code>` 元素
    - **Validates: Requirements 4.7**

  - [ ]* 3.9 编写有序列表序号图标渲染属性测试
    - **Property 19: 有序列表序号图标渲染**
    - 随机生成有序列表内容，验证列表项序号渲染为圆形背景 + 数字图标样式
    - **Validates: Requirements 4.8**

  - [ ]* 3.10 编写来源标注渲染属性测试
    - **Property 20: 来源标注渲染**
    - 随机生成文档名称，验证 `📖 来源：` 标记渲染出来源标注区域
    - **Validates: Requirements 3.9**

- [x] 4. 检查点 - 确保 Markdown 渲染器测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. 实现图片查看器 (`imageviewer.js`)
  - [x] 5.1 实现 `openImageViewer(src)` 和 `closeImageViewer()` 函数
    - 全屏模态展示图片，覆盖整个视口
    - 双指缩放（pinch-zoom）：通过 `touchstart`/`touchmove`/`touchend` 事件计算两指距离变化
    - 缩放范围约束 1x-3x（`Math.min(3, Math.max(1, scale))`）
    - 单指触摸不触发缩放（仅处理 `touches.length >= 2`）
    - 单击关闭全屏模态
    - _Requirements: 1.4, 1.6_

  - [ ]* 5.2 编写图片缩放范围约束属性测试
    - **Property 2: 图片缩放范围约束**
    - 随机生成 scale 值序列，验证任意缩放操作后 scale 始终在 [1, 3] 范围内
    - **Validates: Requirements 1.4**

- [-] 6. 实现 CoT 推理面板 (`cot.js`)
  - [x] 6.1 实现 `createCoTPanel(container, steps, onComplete)` 函数
    - 创建折叠面板 DOM 结构，初始标题为"AI 智能助手正在思考你的需求..."
    - 实现点击标题区域切换展开/折叠状态
    - 按顺序展示三个固定推理步骤："正在查询 FranklinWH 设备数据…"、"正在分析数据…"、"正在归纳结果..."
    - 展开状态下以流式动画逐步显示每个推理步骤的文字内容
    - 步骤状态图标：进行中显示 CSS spinner，完成显示绿色 ✓
    - 完成后标题更新为"思考完成"，保持可折叠
    - 调用 `onComplete` 回调通知动画完成
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ]* 6.2 编写 CoT 面板折叠切换属性测试
    - **Property 3: CoT 面板折叠切换**
    - 随机生成点击次数序列，验证点击标题区域正确切换展开/折叠状态
    - **Validates: Requirements 2.2**

  - [ ]* 6.3 编写 CoT 步骤状态图标映射属性测试
    - **Property 4: CoT 步骤状态图标映射**
    - 随机生成步骤状态（pending/done），验证进行中显示 spinner，完成显示绿色勾选
    - **Validates: Requirements 2.6**

- [x] 7. 实现 Agent 工作流 (`agent.js`)
  - [x] 7.1 实现 `detectPCSIntent(message)` 意图检测函数
    - 根据 `PCS_SCENARIOS` 中的关键词匹配用户消息
    - 匹配成功返回 `{matched: true, type, params}`
    - 无匹配返回 `{matched: false, type: null, params: null}`
    - 多重意图取第一个匹配
    - _Requirements: 5.1, 5.2_

  - [x] 7.2 实现 `createConfirmationCard(operationType, params, onConfirm, onCancel)` 确认卡片
    - 渲染操作名称、当前值与目标值对比信息（卡片形式）
    - 包含"确认执行"和"取消"两个按钮
    - 确认后显示执行进度动画和"执行成功"结果卡片
    - 取消后显示"操作已取消"消息
    - 支持四类 PCS 操作场景：电网输入切换、取电限制调整、能量输出策略、馈网限制调整
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7_

  - [x] 7.3 实现缺少参数时的追问流程
    - 检测到意图但参数不完整时（`params: null`），触发追问消息引导用户补充
    - _Requirements: 5.8_

  - [ ]* 7.4 编写 PCS 意图检测属性测试
    - **Property 10: PCS 意图检测**
    - 随机生成含/不含 PCS 关键词的消息，验证含关键词返回 matched:true 并正确识别类型，不含关键词返回 matched:false
    - **Validates: Requirements 5.1, 5.2**

  - [ ]* 7.5 编写确认卡片值对比展示属性测试
    - **Property 11: 确认卡片值对比展示**
    - 随机生成 PCS 操作参数，验证确认卡片渲染输出同时包含当前值和目标值
    - **Validates: Requirements 5.7**

- [x] 8. 检查点 - 确保核心组件测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [x] 9. 实现角色选择器 (`role.js`)
  - [x] 9.1 实现 `initRoleSelector(container, onRoleChange)` 函数
    - 渲染横向可滑动 Tab 栏，包含 4 个预设角色（🤖 通用智能助手、⚙️ 设备管理助手、⚡ 能源分析专家、🛠️ 售后协同助手）
    - 默认选中"通用智能助手"
    - 点击 Tab 高亮选中状态，取消其他 Tab 选中
    - 切换角色时调用 `onRoleChange(roleId)` 回调
    - 非默认角色选中时在 Header 区域显示角色名称标签
    - _Requirements: 6.1, 6.2, 6.3, 6.7, 6.8_

  - [x] 9.2 实现角色切换联动建议问题更新
    - 角色切换时从 `ROLES` 配置中获取对应 suggestions 并更新建议问题列表
    - _Requirements: 6.4, 6.5, 6.6_

  - [ ]* 9.3 编写角色选择单选约束属性测试
    - **Property 12: 角色选择单选约束**
    - 随机生成角色点击序列，验证任意点击操作后有且仅有一个 Tab 选中
    - **Validates: Requirements 6.3**

  - [ ]* 9.4 编写角色切换更新建议问题属性测试
    - **Property 13: 角色切换更新建议问题**
    - 随机生成角色 ID，验证建议问题列表与角色配置数据完全匹配
    - **Validates: Requirements 6.4, 6.5, 6.6**

  - [ ]* 9.5 编写非默认角色显示标签属性测试
    - **Property 14: 非默认角色显示标签**
    - 随机生成角色 ID，验证非默认角色显示标签，默认角色不显示
    - **Validates: Requirements 6.8**

- [x] 10. 实现上下文感知推荐 (`context.js`)
  - [x] 10.1 实现 `initContextRecommender(container, onSelect)` 和 `triggerRecommendation(roleId)` 函数
    - 进入页面/切换角色后 3 秒延迟显示推荐条（左下角滑入动画）
    - 显示 1-3 条与当前角色相关的推荐问题
    - 点击推荐问题触发 `onSelect(question)` 回调
    - 点击关闭按钮滑出隐藏
    - 10 秒无交互自动滑出隐藏
    - 圆角卡片样式，轻微阴影和半透明背景
    - 组件销毁时清除 `setTimeout`/`setInterval` 防止内存泄漏
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ]* 10.2 编写上下文推荐数量约束属性测试
    - **Property 15: 上下文推荐数量约束**
    - 随机生成角色和上下文，验证推荐问题数量在 1-3 条之间
    - **Validates: Requirements 7.2**

- [x] 11. 实现弹幕系统 (`danmaku.js`)
  - [x] 11.1 实现 `initDanmaku(container, onSelect)` 和 `hideDanmaku()` 函数
    - 仅在当前会话无历史消息时显示三行弹幕（替换现有 marquee 实现）
    - 三行弹幕分类：基础能力（蓝色 #3b82f6, 30s）、操作能力（绿色 #22c55e, 25s）、服务能力（橙色 #f59e0b, 35s）
    - 弹幕从右向左滚动，三行不同速度营造视觉层次感
    - 每条弹幕为圆角胶囊样式（类别色标 + 问题文字）
    - 点击弹幕触发 `onSelect(question)` 回调
    - 点击后 / 用户输入时以淡出动画隐藏全部弹幕
    - 隐藏后停止 CSS 动画，移除 DOM 元素
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ]* 11.2 编写弹幕显示条件属性测试
    - **Property 16: 弹幕显示条件**
    - 随机生成会话状态（有/无消息），验证仅在无历史消息时显示，有消息时不显示
    - **Validates: Requirements 8.1**

  - [ ]* 11.3 编写弹幕类别颜色映射属性测试
    - **Property 17: 弹幕类别颜色映射**
    - 随机生成弹幕项，验证颜色与类别一致：基础=蓝 #3b82f6，操作=绿 #22c55e，服务=橙 #f59e0b
    - **Validates: Requirements 8.2**

- [x] 12. 集成主控制器 (`app.js`) 重构
  - [x] 12.1 重构 `app.js` 消息处理流程，集成所有模块
    - 重构现有 `sendMessage` 流程：用户发送消息 → `getMockReply` 匹配回复 → CoT 面板动画 → Markdown 渲染 → PCS 确认卡片（如需）
    - 替换现有 `getBotResponseHtml` 为调用 `renderMarkdown` + `createCoTPanel`
    - 替换现有 `detectIntent` 为调用 `detectPCSIntent` + `createConfirmationCard`
    - 集成 Role_Selector：调用 `initRoleSelector`，角色切换更新建议问题和推荐内容
    - 集成 Context_Recommender：调用 `initContextRecommender` + `triggerRecommendation`
    - 集成 Danmaku_Banner：调用 `initDanmaku`，替换现有 `initMarquee`
    - 集成 ImageViewer：图片点击调用 `openImageViewer`
    - 实现流式渲染策略：增量 DOM 更新、滚动锚定（自动滚动到底部，手动上滑暂停自动滚动）
    - 扩展 Session 数据结构，添加 `roleId` 字段
    - 无匹配结果时显示"未在官方手册找到相关信息"提示
    - _Requirements: 1.6, 1.7, 2.1, 3.3, 4.9, 5.1, 6.4, 6.5, 6.6, 7.1, 8.1, 8.4, 8.5, 8.6_

  - [x] 12.2 绑定输入框事件，实现弹幕淡出联动
    - 监听输入框 `input` 事件，触发 `hideDanmaku()`
    - _Requirements: 8.6_

- [x] 13. 最终检查点 - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [-] 14. 实现电网设置自然语言精确控制（需求 5.9-5.13）
  - [x] 14.1 在 `mockdata.js` 中添加 `GRID_SETTINGS_KEYWORDS` 数据和电网设置相关 mock 回复
    - 添加 `GRID_SETTINGS_KEYWORDS` 常量，包含四个设置项的关键词映射配置（gridCharge、maxCharge、energyOutput、maxExport）
    - 每个设置项定义 `field`、`controlId`、`type`（select/number）、关键词列表和选项值
    - 下拉选择项（gridCharge、energyOutput）包含 `options` 数组，每个选项含 `keywords` 和 `value`
    - 数值输入项（maxCharge、maxExport）包含 `keywords`、`unit`、`range`
    - 添加电网设置精确控制场景的 mock 回复条目（如"已为您预填电网设置，请在面板中确认"）
    - 在条件 export 中导出 `GRID_SETTINGS_KEYWORDS`
    - _Requirements: 5.9, 5.10_

  - [x] 14.2 在 `agent.js` 中实现 `detectGridSettings(message)` 函数
    - 基于 `GRID_SETTINGS_KEYWORDS` 关键词映射，从用户自然语言中提取电网设置目标值
    - 下拉选择项匹配：先匹配否定关键词（"不允许"），再匹配肯定关键词（"允许"），避免误匹配
    - 数值输入项匹配：匹配关键词后提取附近数值，正则为 `(\d+(?:\.\d+)?)\s*(?:kW|kw)?`
    - 返回 `{matched: boolean, settings: GridSettingsValues|null}`，`settings` 仅包含用户明确指定的字段
    - 无匹配时返回 `{matched: false, settings: null}`
    - 支持一条消息中同时指定多个设置项
    - 在条件 export 中导出 `detectGridSettings`
    - _Requirements: 5.9, 5.13_

  - [x] 14.3 在 `gridsettings.js` 中实现 `prefillGridSettings(settings)` 函数
    - 遍历 `settings` 对象的键，仅对存在的字段执行 DOM 操作
    - 下拉选择项（`gridCharge` → `#gridChargeSelect`，`energyOutput` → `#energyOutputSelect`）：设置 `<select>` 的 `value`
    - 数值输入项（`maxCharge` → `#maxChargeInput`，`maxExport` → `#maxExportInput`）：设置 `<input>` 的 `value`
    - 未包含在 `settings` 中的字段不做任何修改，保持控件当前默认值
    - 设置值前检查 DOM 控件是否存在，不存在则跳过
    - 在条件 export 中导出 `prefillGridSettings`
    - _Requirements: 5.10, 5.13_

  - [x] 14.4 在 `app.js` 中集成电网设置精确控制流程（含 Confirmation_Card 显示）
    - 在 `sendMessage` 流程中，优先调用 `detectGridSettings(content)` 检测电网设置意图
    - 若 `matched: true`：
      1. 调用 `prefillGridSettings(settings)` 预填面板控件值
      2. 在 Bot_Message 中渲染提示文字（如"已为您预填电网设置，请确认或修改后执行"）
      3. 在提示文字下方追加 `createConfirmationCard` 生成的 Confirmation_Card（电网设置缩略预览样式 `grid-settings-entry-card`），包含"⚡ 电网输入和输出设置›"入口和"取消"/"确认执行"按钮
      4. 用户点击缩略预览区域 → 调用 `openGridSettingsPanel()` 弹出预填好值的 Grid_Settings_Panel
      5. 不再直接自动弹出面板，改为通过 Confirmation_Card 入口让用户主动打开
    - 电网设置精确控制分支优先级高于 `isGridSettingsQuery` 和 `detectPCSIntent` 分支
    - _Requirements: 5.10, 5.11, 5.12, 5.14, 5.15_

  - [ ]* 14.5 编写 Property 22 属性测试（电网设置自然语言解析）
    - **Property 22: 电网设置自然语言解析**
    - 随机生成含/不含电网设置关键词的消息文本和随机数值
    - 验证含关键词时返回 `matched: true`，`settings` 仅包含用户消息中明确提及的字段
    - 验证不含关键词时返回 `matched: false, settings: null`
    - **Validates: Requirements 5.9**

  - [ ]* 14.6 编写 Property 23 属性测试（电网设置预填正确性）
    - **Property 23: 电网设置预填正确性（含部分设置）**
    - 随机生成完整或部分的 `GridSettingsValues` 对象
    - 验证 `prefillGridSettings` 调用后，`settings` 中存在的字段对应 DOM 控件值等于指定值
    - 验证 `settings` 中不存在的字段对应 DOM 控件值保持调用前的原始值不变
    - **Validates: Requirements 5.10, 5.13**

  - [ ]* 14.7 编写 Property 24 属性测试（电网设置精确控制消息显示 Confirmation_Card）
    - **Property 24: 电网设置精确控制消息显示 Confirmation_Card**
    - 随机生成含电网设置关键词的消息文本
    - 验证 `detectGridSettings` 返回 `matched: true` 时，Bot_Message 渲染输出包含 `grid-settings-entry-card` 类型的 Confirmation_Card
    - 验证卡片包含"⚡ 电网输入和输出设置"入口区域和"取消"/"确认执行"按钮
    - **Validates: Requirements 5.14**

- [ ] 15. 检查点 - 确保电网设置精确控制功能测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- 标记 `*` 的子任务为可选测试任务，可跳过以加速 MVP 交付
- 每个任务引用了具体的需求编号，确保可追溯性
- 属性测试验证系统的通用正确性属性（最少 100 次迭代），单元测试验证具体示例和边界情况
- 检查点任务确保增量验证，及时发现问题
- 所有模块为纯函数或 DOM 操作函数，便于独立测试
- 现有 `app.js` 中的 `getBotResponseHtml`、`detectIntent`、`initMarquee` 等函数将在集成阶段被模块化替换
