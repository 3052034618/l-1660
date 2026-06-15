import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import {
  Package,
  ArrowLeft,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Plus,
  X,
  TrendingDown,
  TrendingUp,
  BellOff,
} from 'lucide-react'
import type { SparePartTransaction } from '@/types'

export default function SpareParts() {
  const { spareParts, sparePartTransactions, restockSparePart } = useStore()
  const [expandedPartId, setExpandedPartId] = useState<string | null>(null)
  const [restockModal, setRestockModal] = useState<{ partId: string; partName: string } | null>(null)
  const [restockQuantity, setRestockQuantity] = useState('')
  const [restockRemark, setRestockRemark] = useState('')

  const getTransactionsForPart = (partId: string): SparePartTransaction[] => {
    return sparePartTransactions
      .filter((t) => t.partId === partId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20)
  }

  const handleRestock = () => {
    if (!restockModal || !restockQuantity) return
    const qty = parseInt(restockQuantity)
    if (isNaN(qty) || qty <= 0) return

    restockSparePart(restockModal.partId, qty, '管理员', restockRemark || undefined)
    setRestockModal(null)
    setRestockQuantity('')
    setRestockRemark('')
  }

  const getTransactionTypeInfo = (type: SparePartTransaction['type']) => {
    switch (type) {
      case 'use':
        return { icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10', label: '消耗' }
      case 'restock':
        return { icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10', label: '补货' }
      case 'alert_resolve':
        return { icon: BellOff, color: 'text-blue-400', bg: 'bg-blue-500/10', label: '预警解除' }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-purple p-3 rounded-xl">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-txt-primary">备件库存</h1>
        </div>
        <Link
          to="/equipment"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/60 text-txt-secondary hover:text-accent hover:bg-accent/10 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回设备管理
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary w-8"></th>
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary">备件名称</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary">类别</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary">当前库存</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary">安全库存</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary">单位</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary">状态</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary w-28">操作</th>
            </tr>
          </thead>
          <tbody>
            {spareParts.map((part) => {
              const isLow = part.stock < part.safetyStock
              const stockRatio = Math.min((part.stock / part.safetyStock) * 100, 100)
              const isExpanded = expandedPartId === part.id
              const transactions = getTransactionsForPart(part.id)

              return (
                <>
                  <tr
                    key={part.id}
                    className={`border-b border-border/30 transition-colors cursor-pointer ${
                      isLow ? 'bg-alert-red/10 animate-pulse-red' : 'hover:bg-surface-hover'
                    }`}
                    onClick={() => setExpandedPartId(isExpanded ? null : part.id)}
                  >
                    <td className="px-5 py-3.5">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-txt-secondary" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-txt-secondary" />
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {isLow && <AlertTriangle className="w-4 h-4 text-alert-red flex-shrink-0" />}
                        <span className={`text-sm ${isLow ? 'text-alert-red animate-blink' : 'text-txt-primary'}`}>
                          {part.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-accent/15 text-accent">
                        {part.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-mono-num ${isLow ? 'text-alert-red' : 'text-txt-primary'}`}>
                          {part.stock}
                        </span>
                        <div className="w-20 h-1.5 rounded-full bg-primary-dark">
                          <div
                            className={`h-full rounded-full transition-all ${isLow ? 'bg-alert-red' : 'bg-accent'}`}
                            style={{ width: `${stockRatio}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono-num text-txt-secondary">{part.safetyStock}</td>
                    <td className="px-5 py-3.5 text-sm text-txt-secondary">{part.unit}</td>
                    <td className="px-5 py-3.5">
                      {isLow ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-alert-red/20 text-alert-red">
                          <AlertTriangle className="w-3 h-3" />
                          低于安全库存
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-green-500/20 text-green-400">
                          正常
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setRestockModal({ partId: part.id, partName: part.name })
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded text-[11px] font-medium bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        补货
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${part.id}-detail`} className="bg-primary/20">
                      <td colSpan={8} className="px-10 py-5">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-txt-primary">出入库流水（最近20条）</h4>
                            <span className="text-xs text-txt-secondary">
                              当前余额：<span className="font-mono-num text-accent">{part.stock} {part.unit}</span>
                            </span>
                          </div>
                          {transactions.length === 0 ? (
                            <div className="text-center py-8 text-sm text-txt-secondary">
                              暂无出入库记录
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-80 overflow-y-auto">
                              {transactions.map((tx) => {
                                const typeInfo = getTransactionTypeInfo(tx.type)
                                const TypeIcon = typeInfo.icon
                                return (
                                  <div
                                    key={tx.id}
                                    className="flex items-center justify-between p-3 rounded-lg bg-primary/40 border border-border/30"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg ${typeInfo.bg}`}>
                                        <TypeIcon className={`w-4 h-4 ${typeInfo.color}`} />
                                      </div>
                                      <div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-txt-primary">
                                            {tx.partName}
                                          </span>
                                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${typeInfo.bg} ${typeInfo.color}`}>
                                            {typeInfo.label}
                                          </span>
                                        </div>
                                        <div className="text-xs text-txt-secondary mt-0.5">
                                          {tx.remark || `操作人：${tx.operator}`}
                                          {tx.relatedOrderId && (
                                            <span className="ml-2">· 关联：{tx.relatedOrderId}</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <div className={`text-sm font-mono-num ${tx.type === 'use' ? 'text-red-400' : 'text-green-400'}`}>
                                        {tx.type === 'use' ? '-' : '+'}{tx.quantity} {part.unit}
                                      </div>
                                      <div className="text-xs text-txt-secondary mt-0.5">
                                        余额：{tx.balanceAfter} {part.unit}
                                      </div>
                                      <div className="text-xs text-txt-muted mt-0.5">
                                        {tx.createdAt}
                                      </div>
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {restockModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-txt-primary">手动补货</h3>
              <button
                onClick={() => setRestockModal(null)}
                className="p-1.5 rounded-lg hover:bg-primary transition-colors"
              >
                <X className="w-4 h-4 text-txt-secondary" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-txt-secondary mb-1.5">备件名称</label>
                <div className="px-3 py-2.5 rounded-lg bg-primary/50 border border-border/50 text-sm text-txt-primary">
                  {restockModal.partName}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-txt-secondary mb-1.5">补货数量</label>
                <input
                  type="number"
                  value={restockQuantity}
                  onChange={(e) => setRestockQuantity(e.target.value)}
                  placeholder="请输入补货数量"
                  className="w-full px-3 py-2.5 rounded-lg bg-primary/50 border border-border/50 text-sm text-txt-primary placeholder-txt-muted focus:outline-none focus:border-accent/50"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-txt-secondary mb-1.5">备注（可选）</label>
                <input
                  type="text"
                  value={restockRemark}
                  onChange={(e) => setRestockRemark(e.target.value)}
                  placeholder="补货说明"
                  className="w-full px-3 py-2.5 rounded-lg bg-primary/50 border border-border/50 text-sm text-txt-primary placeholder-txt-muted focus:outline-none focus:border-accent/50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setRestockModal(null)}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-primary/60 text-txt-secondary hover:bg-primary transition-colors text-sm font-medium"
                >
                  取消
                </button>
                <button
                  onClick={handleRestock}
                  disabled={!restockQuantity || parseInt(restockQuantity) <= 0}
                  className="flex-1 px-4 py-2.5 rounded-lg bg-accent text-white hover:bg-accent/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  确认补货
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
