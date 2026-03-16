// mockdata.js - Mock 数据层
// FranklinWH 智能助手 Mock 数据

const ROLES = [
  {
    id: 'general',
    name: '通用智能助手',
    icon: '🤖',
    suggestions: [
      'FranklinWH 产品有哪些？',
      '如何安装 aPower 电池？',
      '系统支持哪些通信协议？',
      '如何查看实时发电数据？'
    ]
  },
  {
    id: 'device',
    name: '设备管理助手',
    icon: '⚙️',
    suggestions: [
      'aPower 电池参数是什么？',
      '如何重启 aGate 网关？',
      '设备固件如何升级？',
      'PCS 电网输入如何配置？'
    ]
  },
  {
    id: 'energy',
    name: '能源分析专家',
    icon: '⚡',
    suggestions: [
      '今日发电量是多少？',
      '电池充放电效率如何？',
      '如何优化自用电比例？',
      '峰谷电价策略怎么设置？'
    ]
  },
  {
    id: 'service',
    name: '售后协同助手',
    icon: '🛠️',
    suggestions: [
      '保修政策是什么？',
      '如何提交售后工单？',
      '安装商认证流程是什么？',
      '常见故障代码有哪些？'
    ]
  }
];

const DANMAKU_DATA = {
  basic: {
    color: '#3b82f6',
    label: '基础能力',
    items: [
      'FranklinWH 产品有哪些？',
      '如何查看实时发电数据？',
      '系统支持哪些通信协议？',
      'aPower 电池容量是多少？',
      '如何连接 Wi-Fi？'
    ]
  },
  operate: {
    color: '#22c55e',
    label: '操作能力',
    items: [
      '帮我配置电网充电模式',
      '调整取电限制到 50A',
      '切换能量输出策略为最大馈网',
      '设置馈网限制为 10kW',
      '帮我重启 aGate 网关'
    ]
  },
  service: {
    color: '#f59e0b',
    label: '服务能力',
    items: [
      '保修政策是什么？',
      '如何提交售后工单？',
      '安装商认证流程是什么？',
      '常见故障代码有哪些？',
      '如何联系技术支持？'
    ]
  }
};

const PCS_SCENARIOS = {
  grid_charge: {
    name: '电网输入切换',
    keywords: ['grid charge', '电网充电', 'grid mode', '电网输入'],
    currentValue: 'Solar Only',
    targetValue: 'Grid + Solar',
    unit: ''
  },
  import_limit: {
    name: '取电限制调整',
    keywords: ['import limit', '取电限制', '进口限制', '取电'],
    currentValue: 30,
    targetValue: 50,
    unit: 'A'
  },
  energy_output: {
    name: '能量输出策略',
    keywords: ['energy output', '输出策略', 'export strategy', '能量输出'],
    currentValue: 'Self-consumption',
    targetValue: 'Max Export',
    unit: ''
  },
  export_limit: {
    name: '馈网限制调整',
    keywords: ['export limit', '馈网限制', '出口限制', '馈网'],
    currentValue: 5,
    targetValue: 10,
    unit: 'kW'
  }
};

// Mock 回复数据库
const MOCK_REPLIES = [
  // ===== complex 回复 =====
  {
    keywords: ['电池', 'battery', '原理', '工作', 'apower', '安装'],
    roleIds: ['general', 'device'],
    reply: {
      type: 'markdown',
      complexity: 'complex',
      content: `# FranklinWH aPower 电池工作原理

aPower 是一款集成式家用储能系统，核心工作流程如下：

1. 太阳能板通过逆变器将直流电转换为交流电
2. 多余电能存储至 LFP 电池模组 (13.6 kWh/模组)
3. 停电时自动切换至离网模式，实现无缝供电

![aPower 接线示意图](https://example.com/apower-wiring.png)

## 核心参数对比

| 参数 | aPower | aGate |
|------|--------|-------|
| 容量 | 13.6 kWh | N/A |
| 功率 | 5 kW | N/A |
| 接口 | CAN / RS485 | Wi-Fi / Ethernet |

⚠️ 安装时请确保接地线正确连接，否则可能触发保护机制。

💡 建议在安装前使用 FranklinWH App 进行系统预配置。

📖 来源：FranklinWH 安装手册 v3.2`,
      source: 'FranklinWH 安装手册 v3.2',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['保修', 'warranty', '保固', '质保'],
    roleIds: ['general', 'service'],
    reply: {
      type: 'markdown',
      complexity: 'complex',
      content: `# 保修政策

FranklinWH 提供行业领先的保修服务：

| 产品 | 保修期 | 覆盖范围 |
|------|--------|---------|
| aPower 电池 | 12 年 | 容量衰减 < 30% |
| aGate 网关 | 12 年 | 硬件故障 |
| 安装服务 | 2 年 | 工艺缺陷 |

## 保修申请流程

1. 登录 FranklinWH App，进入"我的设备"
2. 选择需要保修的设备，点击"申请保修"
3. 填写故障描述并上传照片
4. 等待售后团队审核（通常 1-3 个工作日）

⚠️ 非授权安装商操作可能导致保修失效。

💡 注册产品后可在 App 中查看保修状态。

📖 来源：FranklinWH 保修政策 2025`,
      source: 'FranklinWH 保修政策 2025',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['故障', '错误', 'error', 'fault', '故障代码'],
    roleIds: ['general', 'device', 'service'],
    reply: {
      type: 'markdown',
      complexity: 'complex',
      content: `# 常见故障代码及解决方案

## 故障代码一览

| 代码 | 描述 | 严重程度 | 解决方案 |
|------|------|---------|---------|
| E001 | 电池过温 | 高 | 检查通风，降低负载 |
| E002 | 通信中断 | 中 | 重启 aGate 网关 |
| E003 | 逆变器过载 | 高 | 减少并发负载 |
| E004 | 电网频率异常 | 低 | 等待电网恢复 |

1. 首先检查设备指示灯状态
2. 在 App 中查看详细错误日志
3. 尝试重启相关设备
4. 如问题持续，联系技术支持

⚠️ 高严重程度故障请立即断开负载并联系专业人员。

💡 定期检查设备固件版本，保持最新可减少故障发生。

📖 来源：FranklinWH 故障排查手册 v2.1`,
      source: 'FranklinWH 故障排查手册 v2.1',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['发电', '用电', '能源', '效率', '分析', '电量'],
    roleIds: ['general', 'energy'],
    reply: {
      type: 'markdown',
      complexity: 'complex',
      content: `# 能源数据分析报告

## 今日概览

| 指标 | 数值 | 较昨日 |
|------|------|--------|
| 发电量 | 28.5 kWh | +12% |
| 用电量 | 22.3 kWh | -5% |
| 自用率 | 78% | +8% |
| 馈网量 | 6.2 kWh | +15% |

## 优化建议

1. 将大功率设备使用时间调整至 10:00-15:00 光伏高峰期
2. 开启峰谷电价模式，低谷时段自动充电
3. 设置电池最低保留电量为 20%，保障应急用电

💡 当前自用率 78%，通过调整用电习惯可提升至 85% 以上。

📖 来源：FranklinWH 能源管理指南 v1.5`,
      source: 'FranklinWH 能源管理指南 v1.5',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  // ===== simple 回复 =====
  {
    keywords: ['你好', 'hello', 'hi', '嗨'],
    roleIds: ['general', 'device', 'energy', 'service'],
    reply: {
      type: 'text',
      complexity: 'simple',
      content: '你好！我是 FranklinWH 智能助手，有什么可以帮您的吗？',
      source: 'FranklinWH 智能助手',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['电网输入输出', '电网输入和输出', '设置电网', '电网设置'],
    roleIds: ['general', 'device'],
    reply: {
      type: 'text',
      complexity: 'simple',
      content: '已为您打开电网输入输出设置面板，您可以在面板中配置电网充电和馈网参数。',
      source: 'FranklinWH 设备管理手册',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['什么情况允许电网输入', '什么情况不允许', '允许电网输入条件'],
    roleIds: ['general', 'device'],
    reply: {
      type: 'markdown',
      complexity: 'simple',
      content: `## 电网输入条件

**允许电网输入的情况：**
- 电池电量低于设定阈值（通常 20%）
- 用户手动开启电网充电模式
- 峰谷电价低谷时段（如已配置）
- 应急备电需求

**不允许电网输入的情况：**
- 电池已充满（达到 100%）
- 用户关闭电网充电功能
- 电网频率或电压异常
- 系统检测到电网故障

💡 建议在低谷电价时段开启电网充电，可有效降低用电成本。`,
      source: 'FranklinWH 用户手册 v3.2',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['最大允许充电功率', '充电功率应该是多少', '充电功率设置'],
    roleIds: ['general', 'device', 'energy'],
    reply: {
      type: 'markdown',
      complexity: 'simple',
      content: `## 最大允许充电功率设置

**推荐设置：**
- 单个 aPower 模组：建议设置为 5 kW
- 多个模组并联：可按模组数量 × 5 kW 设置
- 家庭用电负载较大：建议预留 2-3 kW 给家用电器

**注意事项：**
- 充电功率过大可能导致电网过载
- 建议不超过家庭总用电容量的 80%
- 可设置为"不限制"，系统将自动优化

💡 如果不确定，建议设置为"不限制"，让系统智能管理。`,
      source: 'FranklinWH 安装手册 v3.2',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['允许电网充电后', '还能给电网馈电吗', '充电和馈电', '同时充电馈电'],
    roleIds: ['general', 'device', 'energy'],
    reply: {
      type: 'markdown',
      complexity: 'simple',
      content: `## 电网充电与馈电关系

**可以同时进行：**
- 电网充电和光伏馈网可以同时进行
- 白天光伏发电多余时可馈网
- 夜间低谷电价时可从电网充电

**系统智能管理：**
- 优先使用光伏发电
- 多余电量优先存储到 aPower
- aPower 充满后再馈网
- 电网充电不会立即馈网（避免能量损耗）

⚠️ 部分地区法规要求电网充电不能与电池馈网共存，请咨询当地电力公司。`,
      source: 'FranklinWH 能源管理指南 v1.5',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['apower最大馈网功率', '馈网功率是多少', '最大馈网', '馈网限制'],
    roleIds: ['general', 'device', 'energy'],
    reply: {
      type: 'markdown',
      complexity: 'simple',
      content: `## aPower 最大馈网功率

**单模组规格：**
- 额定功率：5 kW
- 峰值功率：6 kW（短时）
- 持续馈网：建议不超过 5 kW

**多模组并联：**
- 2 台并联：10 kW
- 3 台并联：15 kW
- 最多 15 台：75 kW

**建议设置：**
- 根据当地电网接入标准设置
- 一般家庭：5-10 kW
- 如无特殊要求，可设置为"不限制"

💡 馈网功率过大可能触发电网保护，建议咨询安装商或电力公司。`,
      source: 'FranklinWH 产品规格书 v2.0',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['wifi', 'wi-fi', '网络', '连接'],
    roleIds: ['general', 'device'],
    reply: {
      type: 'text',
      complexity: 'simple',
      content: 'aGate 网关支持 Wi-Fi 和以太网连接，请在设备背面找到 Wi-Fi 配置按钮进行设置。',
      source: 'FranklinWH 快速入门指南',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['容量', '多少', 'kwh'],
    roleIds: ['general', 'device', 'energy'],
    reply: {
      type: 'text',
      complexity: 'simple',
      content: 'aPower 单模组容量为 13.6 kWh，最多可并联 15 台，总容量达 204 kWh。',
      source: 'FranklinWH 产品规格书',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['工单', '提交', '售后'],
    roleIds: ['general', 'service'],
    reply: {
      type: 'text',
      complexity: 'simple',
      content: '您可以在 FranklinWH App 的"服务"页面提交售后工单，或拨打客服热线 400-XXX-XXXX。',
      source: 'FranklinWH 售后服务指南',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['认证', '安装商'],
    roleIds: ['general', 'service'],
    reply: {
      type: 'text',
      complexity: 'simple',
      content: '安装商认证需完成线上培训课程并通过考核，详情请访问 FranklinWH 合作伙伴门户。',
      source: 'FranklinWH 合作伙伴手册',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['固件', '升级', 'firmware', 'update'],
    roleIds: ['general', 'device'],
    reply: {
      type: 'text',
      complexity: 'simple',
      content: '设备固件可通过 FranklinWH App 的"设备管理 > 固件升级"进行 OTA 更新。',
      source: 'FranklinWH 设备管理手册',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['预填电网', '预填设置', '帮我设置电网参数', '设置电网参数'],
    roleIds: ['general', 'device'],
    reply: {
      type: 'text',
      complexity: 'simple',
      content: '已为您预填电网设置，请在面板中确认或修改后点击保存。',
      source: 'FranklinWH 设备管理手册',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  },
  {
    keywords: ['峰谷', '电价', '策略'],
    roleIds: ['general', 'energy'],
    reply: {
      type: 'text',
      complexity: 'simple',
      content: '峰谷电价策略可在 App 的"能源管理 > 电价设置"中配置，系统将自动在低谷时段充电。',
      source: 'FranklinWH 能源管理指南 v1.5',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    }
  }
];

/**
 * 根据用户消息和角色匹配回复
 * @param {string} message - 用户消息文本
 * @param {string} roleId - 当前角色 ID
 * @returns {MockReply} 匹配的回复数据
 */
function getMockReply(message, roleId) {
  if (!message || typeof message !== 'string') {
    return {
      type: 'no_match',
      content: '未在官方手册找到相关信息',
      complexity: 'simple',
      source: 'FranklinWH 智能助手',
      cotSteps: [
        { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
        { label: '分析数据', detail: '正在分析数据…' },
        { label: '归纳结果', detail: '正在归纳结果...' }
      ]
    };
  }

  var lowerMsg = message.toLowerCase();
  var role = roleId || 'general';

  for (var i = 0; i < MOCK_REPLIES.length; i++) {
    var entry = MOCK_REPLIES[i];
    // 检查角色是否匹配
    if (entry.roleIds.indexOf(role) === -1) continue;
    // 检查关键词是否匹配
    for (var j = 0; j < entry.keywords.length; j++) {
      if (lowerMsg.indexOf(entry.keywords[j].toLowerCase()) !== -1) {
        return entry.reply;
      }
    }
  }

  // 无匹配
  return {
    type: 'no_match',
    content: '未在官方手册找到相关信息',
    complexity: 'simple',
    source: 'FranklinWH 智能助手',
    cotSteps: [
      { label: '查询数据', detail: '正在查询 FranklinWH 设备数据…' },
      { label: '分析数据', detail: '正在分析数据…' },
      { label: '归纳结果', detail: '正在归纳结果...' }
    ]
  };
}

// 电网设置关键词映射数据
const GRID_SETTINGS_KEYWORDS = {
  gridCharge: {
    field: 'gridCharge',
    controlId: 'gridChargeSelect',
    type: 'select',
    options: [
      { keywords: ['不允许电网充电', '不允许充电', '不允许'], value: 'disallow' },
      { keywords: ['允许电网充电', '允许充电', '允许'], value: 'allow' }
    ]
  },
  maxCharge: {
    field: 'maxCharge',
    controlId: 'maxChargeInput',
    type: 'number',
    keywords: ['取电限制', '充电限制', '取电功率'],
    unit: 'kW',
    range: [0.1, 100000.0]
  },
  energyOutput: {
    field: 'energyOutput',
    controlId: 'energyOutputSelect',
    type: 'select',
    options: [
      { keywords: ['光伏和aPower', '光伏&aPower', '光伏 & aPower', '光伏和apower', '光伏&apower'], value: 'pv_apower' },
      { keywords: ['仅光伏', '只有光伏'], value: 'pv_only' }
    ]
  },
  maxExport: {
    field: 'maxExport',
    controlId: 'maxExportInput',
    type: 'number',
    keywords: ['馈网限制', '馈网功率', '馈电限制', '最大馈网'],
    unit: 'kW',
    range: [0.1, 100000.0]
  }
};

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ROLES, DANMAKU_DATA, PCS_SCENARIOS, MOCK_REPLIES, getMockReply, GRID_SETTINGS_KEYWORDS };
}
