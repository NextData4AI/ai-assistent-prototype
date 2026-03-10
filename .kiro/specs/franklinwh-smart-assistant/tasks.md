# 实施计划：FranklinWH 智能助手原型升级

## 概述

基于现有 vanilla HTML/CSS/JS 单页架构，按模块逐步实现 8 项功能升级。每个模块独立为一个 JS 文件，通过 `<script>` 标签引入 `index.html`。实现顺序为：基础数据层 → 核心渲染器 → 交互组件 → 集成联调。测试使用 Vitest + fast-check。

## Tasks

- [x] 1. 搭建项目基础结构与 Mock 数据层
  - [x] 1.1 创建 `mockdata.js`，定义所有 Mock 数据结构
    - 实现 `MockReply` 数据结构（type, content, complexity, cotSteps, source, pcsAction）
    - 实现 `ROLES` 角色配置数组（4 个角色及其 suggestions）
    - 实现 `DANMAKU_DATA` 弹幕数据（三类：basic/operate/service，含颜色和 items）
    - 实现 `PCS_SCENARIOS` 四类 PCS 操作场景数据
    - 实现 `getMockReply(message, roleId)` 函数，根据用户消息和角色匹配回复
    - 包含复杂问题（含表格、分步说明、注意事项）和简单问题的 mock 回复示例
    - _Requirements: 3.7, 3.8, 3.9, 5.6, 6.2, 8.2_

  - [x] 1.2 编写 mockdata.js 属性测试
    - **Property 21: 回复详略策略**
    - 验证 `complexity: 'complex'` 的回复包含结构化元素，`complexity: 'simple'` 的回复长度显著更短
    - **Validates: Requirements 3.7, 3.8**

  - [x] 1.3 更新 `index.html`，添加所有模块的 `<script>` 引用和新增 HTML 结构
    - 添加 9 个 JS 模块的 `<script>` 标签（按依赖顺序：mockdata → markdown → cot → agent → role → context → danmaku → imageviewer → app）
    - 添加 Role_Selector 的 HTML 容器（输入区域上方的 Tab 栏）
    - 添加 Context_Recommender 的 HTML 容器（左下角推荐条）
    - 添加 Danmaku_Banner 的 HTML 容器（欢迎区域下方三行弹幕）
    - 添加 ImageViewer 全屏模态的 HTML 容器
    - 添加 CoT_Panel 所需的 CSS 样式（spinner 动画、折叠/展开、步骤图标）
    - 添加所有新组件的 CSS 样式（角色 Tab、弹幕胶囊、确认卡片、推荐条等）
    - _Requirements: 1.1, 2.1, 5.3, 6.1, 7.5, 8.1, 8.7_

- [ ] 2. 实现 Markdown 渲染器 (`markdown.js`)
  - [x] 2.1 实现 `renderMarkdown(markdown)` 核心解析函数
    - 解析标题（`#` / `##`）→ 带品牌色左边框装饰的 heading 元素
    - 解析图片 `![alt](url)` → `<img>` 元素 + 骨架屏加载态 + 错误占位 + alt 描述文字
    - 解析表格 `| col | col |` → 带交替行背景色的 `<table>`
    - 解析代码块 `` ```code``` `` → `<pre><code>` 深色背景
    - 解析内联样式：`**bold**`、`*italic*`、`[link](url)`
    - 解析无序列表 `- item` 和有序列表 `1. item`（圆形序号图标）
    - 解析引用块 `> blockquote`
    - 解析 emoji 提示卡片：`⚠️` 行 → 橙色卡片，`💡` 行 → 蓝色卡片，`⚙️` 行 → 配置样式
    - 解析 `📚 参考文档` 区域 → 引用文档列表
    - 解析 `📖 来源：{文档名称}` → 来源标注区域
    - 无效语法原样输出为纯文本，空内容返回空字符串
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.7, 1.8, 3.1, 3.4, 3.5, 3.6, 3.9, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8_

  - [x] 2.2 编写 Markdown 图片语法解析属性测试
    - **Property 1: Markdown 图片语法解析**
    - 验证 `![alt](url)` 输出包含 `<img>` 元素，src=url, alt=alt
    - **Validates: Requirements 1.1**

  - [x] 2.3 编写 Markdown 表格渲染属性测试
    - **Property 5: Markdown 表格渲染**
    - 验证表格语法输出包含 `<table>`，行数与源数据一致
    - **Validates: Requirements 3.4**

  - [x] 2.4 编写 Emoji 提示卡片渲染属性测试
    - **Property 6: Emoji 提示卡片渲染**
    - 验证 `⚠️` 行渲染为橙色卡片，`💡` 行渲染为蓝色卡片
    - **Validates: Requirements 3.5, 3.6, 4.4, 4.5**

  - [ ] 2.5 编写 Markdown 标题装饰渲染属性测试
    - **Property 7: Markdown 标题装饰渲染**
    - 验证 `#`/`##` 标题输出带品牌色左边框装饰样式类
    - **Validates: Requirements 4.1, 4.2**

  - [ ] 2.6 编写参考文档区域渲染属性测试
    - **Property 8: 参考文档区域渲染**
    - 验证 `📚 参考文档` 标记生成参考文档列表区域
    - **Validates: Requirements 4.6**

  - [ ] 2.7 编写代码块渲染属性测试
    - **Property 9: 代码块渲染**
    - 验证三反引号代码块输出 `<pre><code>` 元素
    - **Validates: Requirements 4.7**

  - [ ] 2.8 编写图片描述文字渲染属性测试
    - **Property 18: 图片描述文字渲染**
    - 验证 `![alt](url)` 输出在图片下方包含 alt 文本的描述元素
    - **Validates: Requirements 1.8**

  - [ ] 2.9 编写有序列表序号图标渲染属性测试
    - **Property 19: 有序列表序号图标渲染**
    - 验证有序列表项序号渲染为圆形背景 + 数字图标样式
    - **Validates: Requirements 4.8**

  - [ ] 2.10 编写来源标注渲染属性测试
    - **Property 20: 来源标注渲染**
    - 验证 `📖 来源：` 标记渲染出来源标注区域
    - **Validates: Requirements 3.9**

- [ ] 3. 检查点 - 确保 Markdown 渲染器测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. 实现 CoT 推理面板 (`cot.js`)
  - [ ] 4.1 实现 `createCoTPanel(container, steps, onComplete)` 函数
    - 创建折叠面板 DOM 结构，初始标题为"AI 智能助手正在思考你的需求..."
    - 实现点击标题区域切换展开/折叠状态
    - 按顺序展示三个固定推理步骤，带流式动画逐步显示文字
    - 步骤状态图标：进行中显示 CSS spinner，完成显示绿色 ✓
    - 完成后标题更新为"思考完成"，保持可折叠
    - 调用 `onComplete` 回调通知动画完成
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

  - [ ] 4.2 编写 CoT 面板折叠切换属性测试
    - **Property 3: CoT 面板折叠切换**
    - 验证点击标题区域切换展开/折叠状态
    - **Validates: Requirements 2.2**

  - [ ] 4.3 编写 CoT 步骤状态图标映射属性测试
    - **Property 4: CoT 步骤状态图标映射**
    - 验证进行中显示 spinner，完成显示绿色勾选
    - **Validates: Requirements 2.6**

- [ ] 5. 实现 Agent 工作流 (`agent.js`)
  - [ ] 5.1 实现 `detectPCSIntent(message)` 意图检测函数
    - 根据 `PCS_SCENARIOS` 中的关键词匹配用户消息
    - 匹配成功返回 `{matched: true, type, params}`
    - 无匹配返回 `{matched: false, type: null, params: null}`
    - 多重意图取第一个匹配
    - _Requirements: 5.1, 5.2_

  - [ ] 5.2 实现 `createConfirmationCard(operationType, params, onConfirm, onCancel)` 确认卡片
    - 渲染操作名称、当前值与目标值对比信息
    - 包含"确认执行"和"取消"两个按钮
    - 确认后显示执行进度动画和"执行成功"结果卡片
    - 取消后显示"操作已取消"消息
    - 支持四类 PCS 操作场景
    - _Requirements: 5.3, 5.4, 5.5, 5.6, 5.7_

  - [ ] 5.3 实现缺少参数时的追问流程
    - 检测到意图但参数不完整时触发追问消息
    - _Requirements: 5.8_

  - [ ] 5.4 编写 PCS 意图检测属性测试
    - **Property 10: PCS 意图检测**
    - 验证含关键词消息返回 matched:true 并正确识别类型，不含关键词返回 matched:false
    - **Validates: Requirements 5.1, 5.2**

  - [ ] 5.5 编写确认卡片值对比展示属性测试
    - **Property 11: 确认卡片值对比展示**
    - 验证确认卡片渲染输出同时包含当前值和目标值
    - **Validates: Requirements 5.7**

- [ ] 6. 实现角色选择器 (`role.js`)
  - [ ] 6.1 实现 `initRoleSelector(container, onRoleChange)` 函数
    - 渲染横向可滑动 Tab 栏，包含 4 个预设角色（通用智能助手、设备管理助手、能源分析专家、售后协同助手）
    - 默认选中"通用智能助手"
    - 点击 Tab 高亮选中状态，取消其他 Tab 选中
    - 切换角色时调用 `onRoleChange(roleId)` 回调
    - 非默认角色选中时在 Header 区域显示角色名称标签
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 6.8_

  - [ ] 6.2 编写角色选择单选约束属性测试
    - **Property 12: 角色选择单选约束**
    - 验证任意点击操作后有且仅有一个 Tab 选中
    - **Validates: Requirements 6.3**

  - [ ] 6.3 编写角色切换更新建议问题属性测试
    - **Property 13: 角色切换更新建议问题**
    - 验证建议问题列表与角色配置数据完全匹配
    - **Validates: Requirements 6.4, 6.5, 6.6**

  - [ ] 6.4 编写非默认角色显示标签属性测试
    - **Property 14: 非默认角色显示标签**
    - 验证非默认角色显示标签，默认角色不显示
    - **Validates: Requirements 6.8**

- [ ] 7. 检查点 - 确保核心组件测试通过
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. 实现上下文推荐 (`context.js`)
  - [ ] 8.1 实现 `initContextRecommender(container, onSelect)` 和 `triggerRecommendation(roleId)` 函数
    - 进入页面/切换角色后 3 秒延迟显示推荐条（滑入动画）
    - 显示 1-3 条与当前角色相关的推荐问题
    - 点击推荐问题触发 `onSelect(question)` 回调
    - 点击关闭按钮滑出隐藏
    - 10 秒无交互自动滑出隐藏
    - 圆角卡片样式，轻微阴影和半透明背景
    - 组件销毁时清除定时器防止内存泄漏
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6_

  - [ ] 8.2 编写上下文推荐数量约束属性测试
    - **Property 15: 上下文推荐数量约束**
    - 验证推荐问题数量在 1-3 条之间
    - **Validates: Requirements 7.2**

- [ ] 9. 实现弹幕系统 (`danmaku.js`)
  - [ ] 9.1 实现 `initDanmaku(container, onSelect)` 和 `hideDanmaku()` 函数
    - 仅在当前会话无历史消息时显示三行弹幕
    - 三行弹幕分类：基础能力（蓝色 #3b82f6, 30s）、操作能力（绿色 #22c55e, 25s）、服务能力（橙色 #f59e0b, 35s）
    - 弹幕从右向左滚动，不同速度营造层次感
    - 每条弹幕为圆角胶囊样式（类别色标 + 问题文字）
    - 点击弹幕触发 `onSelect(question)` 回调
    - 点击后 / 用户输入时淡出隐藏全部弹幕
    - 隐藏后停止 CSS 动画，移除 DOM 元素
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6, 8.7_

  - [ ] 9.2 编写弹幕显示条件属性测试
    - **Property 16: 弹幕显示条件**
    - 验证仅在无历史消息时显示，有消息时不显示
    - **Validates: Requirements 8.1**

  - [ ] 9.3 编写弹幕类别颜色映射属性测试
    - **Property 17: 弹幕类别颜色映射**
    - 验证弹幕颜色与类别一致：基础=蓝，操作=绿，服务=橙
    - **Validates: Requirements 8.2**

- [ ] 10. 实现图片查看器 (`imageviewer.js`)
  - [ ] 10.1 实现 `openImageViewer(src)` 和 `closeImageViewer()` 函数
    - 全屏模态展示图片
    - 双指缩放（pinch-zoom）：通过 touch 事件计算两指距离变化
    - 缩放范围约束 1x-3x（`Math.min(3, Math.max(1, scale))`）
    - 单指触摸不触发缩放
    - 单击关闭全屏模态
    - _Requirements: 1.4, 1.6_

  - [ ] 10.2 编写图片缩放范围约束属性测试
    - **Property 2: 图片缩放范围约束**
    - 验证任意缩放操作序列后 scale 始终在 [1, 3] 范围内
    - **Validates: Requirements 1.4**

- [ ] 11. 集成主控制器 (`app.js`)
  - [ ] 11.1 重构 `app.js` 消息处理流程，集成所有模块
    - 用户发送消息 → `getMockReply` 匹配回复 → CoT 面板动画 → Markdown 渲染 → PCS 确认卡片（如需）
    - 集成 Role_Selector：角色切换更新建议问题和推荐内容
    - 集成 Context_Recommender：角色切换/进入页面后触发推荐
    - 集成 Danmaku_Banner：无历史消息时显示，用户输入/点击后隐藏
    - 集成 ImageViewer：图片点击打开全屏查看
    - 实现流式渲染策略：增量 DOM 更新、滚动锚定（自动滚动到底部，手动上滑暂停）
    - 扩展 Session 数据结构，添加 `roleId` 字段
    - 无匹配结果时显示"未在官方手册找到相关信息"提示
    - _Requirements: 1.6, 1.7, 2.1, 3.3, 4.9, 5.1, 6.4, 6.5, 6.6, 7.1, 8.1, 8.4, 8.5, 8.6_

  - [ ] 11.2 绑定输入框事件，实现弹幕淡出联动
    - 监听输入框 `input` 事件，触发 `hideDanmaku()`
    - _Requirements: 8.6_

- [ ] 12. 配置测试环境
  - [ ] 12.1 初始化 Vitest + fast-check 测试环境
    - 创建 `package.json`（添加 vitest、fast-check 依赖）
    - 创建 `vitest.config.js` 配置文件
    - 创建 `tests/` 目录结构
    - 确保 JS 模块可被测试文件导入（添加必要的 `export` 语句或调整模块结构）
    - _Requirements: 全部_

- [ ] 13. 最终检查点 - 确保所有测试通过
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- 标记 `*` 的子任务为可选，可跳过以加速 MVP 交付
- 每个任务引用了具体的需求编号，确保可追溯性
- 属性测试验证系统的通用正确性属性，单元测试验证具体示例和边界情况
- 检查点任务确保增量验证，及时发现问题
- 所有模块为纯函数或 DOM 操作函数，便于独立测试
