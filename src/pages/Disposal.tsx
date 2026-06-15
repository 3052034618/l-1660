import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Gavel, ChevronRight } from 'lucide-react'
import { useStore } from '@/store'
import { riskLevelBadge, disposalTypeText } from '@/components/Badges'
import type { DisposalOrder } from '@/types'

type FilterKey = 'all' | 'pending' | 'approved' | 'completed'

const filterTabs: { label: string; value: FilterKey }[] = [
  { label: '全部', value: 'all' },
  { label: '待审批', value: 'pending' },
  { label: '已审批', value: 'approved' },
  { label: '已完成', value: 'completed' },
]

const statusConfig: Record<string, { text: string; cls: string }> = {
  pending: { text: '待审批', cls: 'bg-alert-yellow/20 text-alert-yellow' },
  approved: { text: '已审批', cls: 'bg-green-500/20 text-green-400' },
  rejected: { text: '已驳回', cls: 'bg-alert-red/20 text-alert-red' },
  completed: { text: '已完成', cls: 'bg-accent/20 text-accent' },
}

const typeIconColor: Record<string, string> = {
  retest: 'bg-blue-500/20 text-blue-400',
  destroy: 'bg-alert-red/20 text-alert-red',
  recall: 'bg-alert-orange/20 text-alert-orange',
}

const riskBorderColor: Record<string, string> = {
  low: 'border-l-accent',
  medium: 'border-l-alert-yellow',
  high: 'border-l-alert-red',
}

export default function Disposal() {
  const disposalOrders = useStore((s) => s.disposalOrders)
  const [filter, setFilter] = useState<FilterKey>('all')

  const filtered = filter === 'all'
    ? disposalOrders
    : disposalOrders.filter((o) => o.status === filter)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-red flex items-center justify-center">
            <Gavel className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-txt-primary">处置审批</h1>
            <p className="text-xs text-txt-secondary">共 {disposalOrders.length} 条处置工单</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === tab.value
                ? 'bg-accent/20 text-accent border border-accent/30'
                : 'bg-surface-card text-txt-secondary hover:text-txt-primary border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((order: DisposalOrder) => (
          <Link
            key={order.id}
            to={`/disposal/${order.id}`}
            className={`glass-card glass-card-hover p-5 border-l-4 ${riskBorderColor[order.riskLevel]}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${typeIconColor[order.type]}`}>
                  {disposalTypeText(order.type)}
                </span>
                {riskLevelBadge(order.riskLevel)}
              </div>
              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusConfig[order.status].cls}`}>
                {statusConfig[order.status].text}
              </span>
            </div>
            <h3 className="text-sm font-medium text-txt-primary mb-2">{order.productName}</h3>
            <p className="text-xs text-txt-secondary mb-3 line-clamp-2">{order.reason}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-txt-secondary">
                涉案金额：<span className="font-mono-num text-txt-primary">¥{order.amount.toLocaleString()}</span>
              </span>
              <ChevronRight className="w-4 h-4 text-txt-secondary" />
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card py-12 text-center text-sm text-txt-secondary">暂无处置工单</div>
      )}
    </div>
  )
}
