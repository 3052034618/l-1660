import type { RiskLevel, TaskStatus, AlertLevel, DisposalType, EquipmentStatus } from '@/types'

export function riskLevelBadge(level: RiskLevel) {
  const map = {
    low: { text: '低风险', cls: 'bg-accent/20 text-accent' },
    medium: { text: '中风险', cls: 'bg-alert-yellow/20 text-alert-yellow' },
    high: { text: '高风险', cls: 'bg-alert-red/20 text-alert-red' },
  }
  const item = map[level]
  return <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${item.cls}`}>{item.text}</span>
}

export function taskStatusBadge(status: TaskStatus) {
  const map: Record<TaskStatus, { text: string; cls: string }> = {
    pending: { text: '待分配', cls: 'bg-gray-500/20 text-gray-400' },
    assigned: { text: '已分配', cls: 'bg-blue-500/20 text-blue-400' },
    sampling: { text: '采样中', cls: 'bg-accent/20 text-accent' },
    sampled: { text: '已采样', cls: 'bg-indigo-500/20 text-indigo-400' },
    reviewing: { text: '审核中', cls: 'bg-alert-yellow/20 text-alert-yellow' },
    testing: { text: '检测中', cls: 'bg-purple-500/20 text-purple-400' },
    completed: { text: '已完成', cls: 'bg-green-500/20 text-green-400' },
    rejected: { text: '已退回', cls: 'bg-alert-red/20 text-alert-red' },
  }
  const item = map[status]
  return <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${item.cls}`}>{item.text}</span>
}

export function alertLevelBadge(level: AlertLevel) {
  const map = {
    yellow: { text: '黄色预警', cls: 'bg-alert-yellow/20 text-alert-yellow border-alert-yellow/30', animate: 'animate-pulse-yellow' },
    orange: { text: '橙色预警', cls: 'bg-alert-orange/20 text-alert-orange border-alert-orange/30', animate: 'animate-pulse-orange' },
    red: { text: '红色预警', cls: 'bg-alert-red/20 text-alert-red border-alert-red/30', animate: 'animate-pulse-red' },
  }
  const item = map[level]
  return <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${item.cls}`}>{item.text}</span>
}

export function disposalTypeText(type: DisposalType) {
  const map = { retest: '复检', destroy: '销毁', recall: '召回' }
  return map[type]
}

export function equipmentStatusBadge(status: EquipmentStatus) {
  const map = {
    normal: { text: '正常', cls: 'bg-green-500/20 text-green-400' },
    maintenance_due: { text: '待维保', cls: 'bg-alert-yellow/20 text-alert-yellow' },
    under_maintenance: { text: '维保中', cls: 'bg-blue-500/20 text-blue-400' },
  }
  const item = map[status]
  return <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${item.cls}`}>{item.text}</span>
}
