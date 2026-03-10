# 需求文档

## 简介

FranklinWH 智能助手原型升级项目，涵盖两大方向：（1）现有智能助手体验优化——包括多模态 RAG 配图、CoT 推理可视化、知识结构化输出、Markdown UX 增强；（2）智能助手功能新增——包括 Agent 自动执行工作流、角色选择器、页面上下文感知推荐、主页弹幕推荐。本需求文档面向前端原型实现，目标是产出可交互的高保真原型，方便与开发团队沟通需求。

## 术语表

- **Smart_Assistant**: FranklinWH 智能助手前端原型应用，运行于移动端 WebView 或浏览器中
- **Chat_View**: 智能助手的主聊天界面视图，包含消息列表、输入区域和建议问题
- **Bot_Message**: 智能助手生成的回复消息气泡组件
- **User_Message**: 用户发送的消息气泡组件
- **Image_Block**: 嵌入在 Bot_Message 中的图片渲染区域，支持缩放手势
- **CoT_Panel**: Chain-of-Thought 推理过程折叠面板组件，显示"AI 智能助手正在思考你的需求..."
- **Markdown_Renderer**: 将 Markdown 格式文本渲染为富文本 HTML 的组件
- **Confirmation_Card**: Agent 执行工作流前弹出的参数确认卡片 UI 组件
- **Role_Selector**: 输入框上方的横向滑动角色选择 Tab 栏组件
- **Context_Recommender**: 页面上下文感知推荐条组件，出现在左下角
- **Danmaku_Banner**: 主页进入智能助手页面时的弹幕滚动推荐组件
- **PCS**: Power Control System，电力控制系统
- **HITL**: Human-In-The-Loop，人在回路中的确认流程
- **Brand_Color**: FranklinWH 品牌主色 (#1a1a1a 或设计规范中定义的主题色)

## 需求

### 需求 1：语料配图显示优化

**用户故事：** 作为安装商，我在询问 FranklinWH 硬件结构相关问题时，希望智能助手的回复中能嵌入与回答内容相关的产品图片，以便更直观地理解设备结构和接线方式。

#### 验收标准

1. WHEN Bot_Message 的回复内容包含 Markdown 图片语法 `![alt](url)`, THE Markdown_Renderer SHALL 将图片语法解析并渲染为可见的 `<img>` 元素
2. THE Image_Block SHALL 在图片加载完成前显示一个占位骨架屏动画
3. IF 图片加载失败, THEN THE Image_Block SHALL 显示一个带有"图片加载失败"文字的灰色占位区域
4. WHEN 用户在 Image_Block 上执行双指缩放手势, THE Image_Block SHALL 支持放大和缩小操作，缩放范围为 1x 至 3x
5. THE Image_Block SHALL 将图片宽度限制为消息气泡宽度的 100%，高度按比例自适应
6. WHEN 用户点击 Image_Block 中的图片, THE Smart_Assistant SHALL 以全屏模态方式展示该图片，并支持双指缩放浏览
7. WHEN 模拟后端返回的回复数据中包含 `images` 字段, THE Markdown_Renderer SHALL 在回复正文对应位置自动插入图片，图片位置由回复内容中的 Markdown 图片语法决定
8. THE Image_Block SHALL 在图片下方显示图片描述文字（取自 Markdown 图片语法的 alt 文本），使用灰色小字居中排列

### 需求 2：CoT 推理过程可视化

**用户故事：** 作为用户，我希望在等待回复时看到 AI 的推理过程步骤，以便了解 AI 正在做什么并增强信任感。

#### 验收标准

1. WHEN Smart_Assistant 开始生成回复, THE CoT_Panel SHALL 在消息列表中显示一个折叠状态的面板，标题为"AI 智能助手正在思考你的需求..."
2. WHEN 用户点击 CoT_Panel 的标题区域, THE CoT_Panel SHALL 展开并显示推理步骤列表
3. THE CoT_Panel SHALL 按顺序展示以下推理步骤："正在查询 FranklinWH 设备数据…"、"正在分析数据…"、"正在归纳结果..."
4. WHILE CoT_Panel 处于展开状态, THE CoT_Panel SHALL 以流式动画逐步显示每个推理步骤的文字内容
5. WHEN Bot_Message 生成完成, THE CoT_Panel SHALL 将标题更新为"思考完成"并保持可折叠状态
6. THE CoT_Panel SHALL 在每个推理步骤前显示对应的状态图标：进行中显示旋转加载图标，完成显示绿色勾选图标

### 需求 3：知识归纳与结构化输出

**用户故事：** 作为用户，我希望智能助手的回复以结构化的格式呈现，以便快速获取关键信息和对比数据。

#### 验收标准

1. WHEN Bot_Message 的回复内容包含对比类信息, THE Markdown_Renderer SHALL 将对比数据渲染为 Markdown 表格格式
2. THE Bot_Message SHALL 在回复末尾包含"⚠️ 注意事项"区块或"💡 专家建议"区块（根据内容性质选择）
3. WHEN 模拟的知识库中无匹配结果, THE Bot_Message SHALL 在回复开头显示明确提示文字"未在官方手册找到相关信息"
4. THE Markdown_Renderer SHALL 将 Markdown 表格渲染为带有边框和交替行背景色的 HTML 表格
5. THE Markdown_Renderer SHALL 将"⚠️ 注意事项"区块渲染为带有橙色左边框的高亮卡片样式
6. THE Markdown_Renderer SHALL 将"💡 专家建议"区块渲染为带有蓝色左边框的高亮卡片样式
7. WHEN 用户提出复杂问题（涉及多设备对比、故障排查、系统配置等）, THE Bot_Message SHALL 以详细结构化格式回复，包含分步说明、表格和注意事项
8. WHEN 用户提出简单问题（单一事实查询、是否类问题）, THE Bot_Message SHALL 以简洁格式回复，直接给出答案，避免冗余内容
9. THE Bot_Message SHALL 在回复末尾标注信息来源，格式为"📖 来源：{文档名称}"，以便用户追溯和验证回答依据

### 需求 4：Markdown UX 深度增强

**用户故事：** 作为用户，我希望智能助手的回复具有清晰的视觉层次和品牌一致性，以便更高效地阅读和理解内容。

#### 验收标准

1. THE Markdown_Renderer SHALL 将 H1 标题渲染为加粗文字并在左侧显示 4px 宽的 Brand_Color 装饰条
2. THE Markdown_Renderer SHALL 将 H2 标题渲染为加粗文字并在左侧显示 3px 宽的 Brand_Color 装饰条
3. THE Markdown_Renderer SHALL 将包含"⚙️"图标的文本行渲染为"设置/配置"类视觉样式
4. THE Markdown_Renderer SHALL 将包含"⚠️"图标的文本行渲染为"警告/注意"类视觉样式，使用橙色背景色
5. THE Markdown_Renderer SHALL 将包含"💡"图标的文本行渲染为"建议/提示"类视觉样式，使用蓝色背景色
6. WHEN Bot_Message 的回复内容包含来源引用, THE Markdown_Renderer SHALL 在回复末尾渲染一个"📚 参考文档"区域，以列表形式展示引用的文档名称和链接
7. THE Markdown_Renderer SHALL 将代码块渲染为带有深色背景和等宽字体的样式区域
8. WHEN Bot_Message 的回复内容包含有序列表中的步骤描述, THE Markdown_Renderer SHALL 为每个步骤自动匹配对应的序号图标（圆形背景 + 数字），替代默认的数字序号样式
9. WHILE Bot_Message 以流式方式逐步渲染内容, THE Markdown_Renderer SHALL 保持已渲染内容的位置稳定，避免页面抖动或内容跳动

### 需求 5：Agent 自动执行工作流

**用户故事：** 作为用户，我希望通过自然语言指令让智能助手自动执行 PCS 电网设置操作，以便简化复杂的设备配置流程。

#### 验收标准

1. WHEN 用户发送包含 PCS 操作意图的消息, THE Smart_Assistant SHALL 在 CoT_Panel 中显示"意图识别"步骤并标注识别到的操作类型
2. WHEN Smart_Assistant 识别到 PCS 操作意图, THE Smart_Assistant SHALL 从用户消息中提取操作参数并显示在 CoT_Panel 的"参数提取"步骤中
3. WHEN 参数提取完成, THE Smart_Assistant SHALL 弹出 Confirmation_Card 展示操作摘要，包含操作名称、目标参数值和"确认执行"与"取消"两个按钮
4. WHEN 用户点击 Confirmation_Card 的"确认执行"按钮, THE Smart_Assistant SHALL 显示执行进度动画并在完成后展示"执行成功"结果卡片
5. WHEN 用户点击 Confirmation_Card 的"取消"按钮, THE Smart_Assistant SHALL 关闭 Confirmation_Card 并在 Bot_Message 中显示"操作已取消"
6. THE Confirmation_Card SHALL 展示以下四类 PCS 操作场景：电网输入切换、取电限制调整、能量输出策略、馈网限制调整
7. THE Confirmation_Card SHALL 以卡片形式展示当前值与目标值的对比信息
8. IF 用户消息中缺少必要的操作参数, THEN THE Smart_Assistant SHALL 通过追问消息引导用户补充缺失参数

### 需求 6：Agent 角色选择器

**用户故事：** 作为用户，我希望在对话前选择特定的助手角色，以便获得更精准和专业的回答。

#### 验收标准

1. THE Role_Selector SHALL 在输入区域上方显示一个横向可滑动的 Tab 栏
2. THE Role_Selector SHALL 包含以下预设角色选项：通用智能助手、设备管理助手、能源分析专家、售后协同助手
3. WHEN 用户点击 Role_Selector 中的某个角色 Tab, THE Role_Selector SHALL 将该 Tab 高亮显示为选中状态，并取消其他 Tab 的选中状态
4. WHEN 用户选择"设备管理助手"角色, THE Smart_Assistant SHALL 将建议问题更新为设备管理相关的问题列表
5. WHEN 用户选择"能源分析专家"角色, THE Smart_Assistant SHALL 将建议问题更新为能源分析相关的问题列表
6. WHEN 用户选择"售后协同助手"角色, THE Smart_Assistant SHALL 将建议问题更新为售后服务相关的问题列表
7. THE Role_Selector SHALL 默认选中"通用智能助手"角色
8. WHILE 某个非默认角色处于选中状态, THE Smart_Assistant SHALL 在 Header 区域的标题旁显示当前角色名称标签

### 需求 7：页面上下文感知推荐

**用户故事：** 作为用户，我希望在浏览复杂页面时获得智能助手的主动推荐问题，以便快速获取当前页面相关的帮助信息。

#### 验收标准

1. WHEN 用户在 Chat_View 停留超过 3 秒且未发送任何消息, THE Context_Recommender SHALL 在屏幕左下角以动画方式滑入显示
2. THE Context_Recommender SHALL 显示 1 至 3 条与当前对话上下文相关的推荐问题
3. WHEN 用户点击 Context_Recommender 中的某条推荐问题, THE Smart_Assistant SHALL 将该问题作为用户消息发送并触发回复流程
4. WHEN 用户点击 Context_Recommender 的关闭按钮, THE Context_Recommender SHALL 以动画方式滑出隐藏
5. THE Context_Recommender SHALL 以圆角卡片样式呈现，带有轻微阴影和半透明背景
6. WHILE Context_Recommender 处于显示状态超过 10 秒且用户未交互, THE Context_Recommender SHALL 自动以动画方式滑出隐藏

### 需求 8：主页弹幕推荐

**用户故事：** 作为用户，我希望在进入智能助手页面时看到滚动的推荐问题弹幕，以便快速了解智能助手的能力范围并选择感兴趣的问题。

#### 验收标准

1. WHEN 用户进入 Chat_View 且当前会话无历史消息, THE Danmaku_Banner SHALL 在欢迎区域下方显示三行从右向左滚动的弹幕
2. THE Danmaku_Banner SHALL 将弹幕分为三类：基础能力（蓝色标签）、操作能力（绿色标签）、服务能力（橙色标签）
3. THE Danmaku_Banner 的三行弹幕 SHALL 以不同速度滚动，营造视觉层次感
4. WHEN 用户点击 Danmaku_Banner 中的某条弹幕问题, THE Smart_Assistant SHALL 将该问题作为用户消息发送并触发回复流程
5. WHEN 用户点击弹幕问题后, THE Danmaku_Banner SHALL 以淡出动画方式隐藏全部弹幕
6. WHEN 用户在输入框中开始输入文字, THE Danmaku_Banner SHALL 以淡出动画方式隐藏全部弹幕
7. THE Danmaku_Banner 的每条弹幕 SHALL 以圆角胶囊样式呈现，包含类别色标和问题文字
