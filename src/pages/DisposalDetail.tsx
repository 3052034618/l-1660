import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, XCircle, Clock, User } from 'lucide-react'
import { useStore } from '@/store'
import { riskLevelBadge, disposalTypeText } from '@/components/Badges'

const statusConfig: Record<string, { text: string; cls: string }> = {
  pending: { text: '待审批', cls: 'bg-alert-yellow/20 text-alert-yellow' },
  approved: { text: '已审批', cls: 'bg-green-500/20 text-green-400' },
  rejected: { text: '已驳回', cls: 'bg-alert-red/20 text-alert-red' },
  completed: { text: '已完成', cls: 'bg-accent/20 text-accent' },
}

const nodeStatusStyle: Record<string, { dot: string; ring: string; line: string }> = {
  approved: { dot: 'bg-green-400', ring: 'ring-green-400/20', line: 'bg-green-400/40' },
  rejected: { dot: 'bg-alert-red', ring: 'ring-alert-red/20', line: 'bg-alert-red/40' },
  pending: { dot: 'bg-gray-400', ring: 'ring-gray-400/20', line: 'bg-gray-400/20' },
}

export default function DisposalDetail() {
  const { id } = useParams<{ id: string }>()
  const disposalOrders = useStore((s) => s.disposalOrders)
  const approveDisposal = useStore((s) => s.approveDisposal)
  const rejectDisposal = useStore((s) => s.rejectDisposal)

  const [comment, setComment] = useState('')

  const order = disposalOrders.find((o) => o.id === id)
  if (!order) {
    return (
      <div className="p-6 text-center text-txt-secondary">
        <p>未找到处置工单</p>
        <Link to="/disposal" className="text-accent text-sm mt-2 inline-block">返回列表</Link>
      </div>
    )
  }

  const currentPendingNode = order.approvalChain.find((n) => n.status === 'pending')
  const canApprove = order.status === 'pending' && currentPendingNode

  const handleApprove = () => {
    if (!currentPendingNode) return
    approveDisposal(order.id, currentPendingNode.level, comment)
    setComment('')
  }

  const handleReject = () => {
    if (!currentPendingNode) return
    rejectDisposal(order.id, currentPendingNode.level, comment)
    setComment('')
  }

  return (
    <div className="p-6 space-y-6">
      <Link to="/disposal" className="inline-flex items-center gap-1.5 text-sm text-txt-secondary hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回处置审批
      </Link>

      <div className="glass-card p-5">
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-base font-bold text-txt-primary">处置工单详情</h2>
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusConfig[order.status].cls}`}>
            {statusConfig[order.status].text}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-txt-secondary mb-1">处置类型</p>
            <p className="text-sm text-txt-primary">{disposalTypeText(order.type)}</p>
          </div>
          <div>
            <p className="text-xs text-txt-secondary mb-1">产品名称</p>
            <p className="text-sm text-txt-primary">{order.productName}</p>
          </div>
          <div>
            <p className="text-xs text-txt-secondary mb-1">风险等级</p>
            {riskLevelBadge(order.riskLevel)}
          </div>
          <div>
            <p className="text-xs text-txt-secondary mb-1">涉案金额</p>
            <p className="text-sm text-txt-primary font-mono-num">¥{order.amount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-xs text-txt-secondary mb-1">创建日期</p>
            <p className="text-sm text-txt-primary font-mono-num">{order.createdAt}</p>
          </div>
          <div>
            <p className="text-xs text-txt-secondary mb-1">工单编号</p>
            <p className="text-sm text-txt-primary font-mono-num">{order.id}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-accent/10">
          <p className="text-xs text-txt-secondary mb-1">处置原因</p>
          <p className="text-sm text-txt-primary">{order.reason}</p>
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="text-base font-bold text-txt-primary mb-5">审批流程</h2>
        <div className="relative">
          {order.approvalChain.map((node, idx) => {
            const style = nodeStatusStyle[node.status]
            const isLast = idx === order.approvalChain.length - 1
            const isCurrentPending = node.status === 'pending' && order.status === 'pending'

            return (
              <div key={node.level} className="relative flex gap-4">
                {!isLast && (
                  <div className={`absolute left-[15px] top-[36px] w-0.5 h-[calc(100%-12px)] ${style.line}`} />
                )}
                <div className="flex-shrink-0 pt-1">
                  <div className={`w-[30px] h-[30px] rounded-full ring-4 ${style.ring} flex items-center justify-center ${
                    isCurrentPending ? 'animate-pulse-border' : ''
                  }`}>
                    <div className={`w-3 h-3 rounded-full ${style.dot}`} />
                  </div>
                </div>
                <div className={`flex-1 pb-6 ${isLast ? 'pb-0' : ''}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-txt-primary">第{node.level}级审批</span>
                    {node.status === 'approved' && <CheckCircle2 className="w-4 h-4 text-green-400" />}
                    {node.status === 'rejected' && <XCircle className="w-4 h-4 text-alert-red" />}
                    {node.status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3.5 h-3.5 text-txt-secondary" />
                    <span className="text-xs text-txt-secondary">{node.approver}</span>
                    <span className="text-xs text-txt-secondary">·</span>
                    <span className="text-xs text-txt-secondary">{node.approverRole}</span>
                  </div>
                  {node.timestamp && (
                    <p className="text-xs text-txt-secondary font-mono-num mb-1">{node.timestamp}</p>
                  )}
                  {node.comment && (
                    <p className="text-xs text-txt-primary bg-primary/50 rounded px-2 py-1 inline-block">{node.comment}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {canApprove && currentPendingNode && (
        <div className="glass-card p-5">
          <h2 className="text-base font-bold text-txt-primary mb-4">
            当前审批（第{currentPendingNode.level}级 · {currentPendingNode.approver}）
          </h2>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="请输入审批意见..."
            className="w-full bg-primary/50 border border-accent/10 rounded-lg px-4 py-3 text-sm text-txt-primary placeholder:text-txt-secondary/50 focus:outline-none focus:border-accent/40 resize-none h-24 mb-4"
          />
          <div className="flex items-center gap-3 justify-end">
            <button
              onClick={handleReject}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-alert-red/20 text-alert-red border border-alert-red/30 hover:bg-alert-red/30 transition-colors"
            >
              驳回
            </button>
            <button
              onClick={handleApprove}
              className="px-5 py-2 rounded-lg text-sm font-medium bg-accent/20 text-accent border border-accent/30 hover:bg-accent/30 transition-colors"
            >
              批准
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
