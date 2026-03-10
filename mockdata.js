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

// 条件 export：兼容浏览器和 Node (vitest)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ROLES, DANMAKU_DATA, PCS_SCENARIOS, MOCK_REPLIES, getMockReply };
}
