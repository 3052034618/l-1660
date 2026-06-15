import { useState, useMemo } from 'react'
import {
  CheckCircle2,
  XCircle,
  Check,
  X,
  AlertTriangle,
  FileCheck,
  Clock,
  Package,
  ListChecks,
} from 'lucide-react'
import { useStore } from '@/store'
import { riskLevelBadge, taskStatusBadge } from '@/components/Badges'
import type { InspectionTask, RejectCategory } from '@/types'

interface ValidationResult {
  label: string
  icon: typeof Clock
  passed: boolean
  detail: string
  key: 'sample' | 'time' | 'items'
}

function getValidationResults(task: InspectionTask): ValidationResult[] {
  const now = Date.now()
  const deadline = new Date(task.deadline).getTime()
  return [
    {
      key: 'sample',
      label: '样本量校验',
      icon: Package,
      passed: task.sampleCount >= task.requiredSampleCount,
      detail: `${task.sampleCount}/${task.requiredSampleCount} 份${task.sampleCount < task.requiredSampleCount ? `，缺少 ${task.requiredSampleCount - task.sampleCount} 份` : ''}`,
    },
    {
      key: 'time',
      label: '采样时间窗口',
      icon: Clock,
      passed: now <= deadline,
      detail: now <= deadline ? '在截止时间内' : `已超过截止时间 ${task.deadline}`,
    },
    {
      key: 'items',
      label: '检测项目完整性',
      icon: ListChecks,
      passed: task.testItems.length > 0,
      detail: task.testItems.length > 0 ? `${task.testItems.length} 项检测项目` : '检测项目为空',
    },
  ]
}

function getRejectReasons(results: ValidationResult[]): string {
  return results
    .filter((r) => !r.passed)
    .map((r) => {
      if (r.key === 'sample') return '样本量不足'
      if (r.key === 'time') return '超出采样时间窗口'
      if (r.key === 'items') return '检测项目不完整'
      return r.label + '未通过'
    })
    .join('、')
}

export default function Review() {
  const tasks = useStore((s) => s.tasks)
  const reviewTask = useStore((s) => s.reviewTask)

  const [rejectTaskId, setRejectTaskId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectCategories, setRejectCategories] = useState<RejectCategory[]>([])
  const [rejectReasons, setRejectReasons] = useState<string[]>([])

  const reviewTasks = useMemo(
    () => tasks.filter((t) => t.status === 'reviewing' || t.status === 'sampled'),
    [tasks]
  )

  const handleApprove = (taskId: string) => {
    reviewTask(taskId, true, { operator: '审核员' })
  }

  const handleRejectOpen = (taskId: string, results: ValidationResult[]) => {
    const cats = results.filter((r) => !r.passed).map((r) => r.key)
    const reas = results
      .filter((r) => !r.passed)
      .map((r) => {
        if (r.key === 'sample') return `样本量不足：${r.detail}`
        if (r.key === 'time') return `超出采样时间窗口：${r.detail}`
        if (r.key === 'items') return `检测项目不完整：${r.detail}`
        return r.detail
      })
    setRejectCategories(cats)
    setRejectReasons(reas)
    setRejectReason(reas.join('；') + '，请补采后重新提交')
    setRejectTaskId(taskId)
  }

  const handleReject = (taskId: string) => {
    reviewTask(taskId, false, {
      comment: rejectReason,
      categories: rejectCategories,
      reasons: rejectReasons.length > 0 ? rejectReasons : [rejectReason],
      operator: '审核员',
    })
    setRejectTaskId(null)
    setRejectReason('')
    setRejectCategories([])
    setRejectReasons([])
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-txt-primary">任务审核</h2>
        <div className="flex items-center gap-2 text-xs text-txt-secondary">
          <FileCheck className="w-4 h-4 text-accent/60" />
          待审核 <span className="font-mono-num text-accent">{reviewTasks.length}</span> 项
        </div>
      </div>

      {reviewTasks.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-accent/30 mx-auto mb-3" />
          <p className="text-txt-secondary text-sm">暂无待审核任务</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviewTasks.map((task) => {
            const results = getValidationResults(task)
            const allPassed = results.every((r) => r.passed)
            const isRejecting = rejectTaskId === task.id

            return (
              <div key={task.id} className="glass-card p-5">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-bold text-txt-primary">{task.productName}</h3>
                      {riskLevelBadge(task.riskLevel)}
                      {taskStatusBadge(task.status)}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-txt-secondary">
                      <span className="font-mono-num">{task.id}</span>
                      <span>{task.region}</span>
                      <span>截止 {task.deadline}</span>
                    </div>
                  </div>
                  {!allPassed ? (
                    <div className="flex items-center gap-1 text-alert-red text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      校验不通过
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-green-400 text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      校验通过
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {results.map((r) => (
                    <div
                      key={r.key}
                      className={`glass-card p-3 bg-primary/40 ${
                        r.passed ? 'border-green-500/20' : 'border-alert-red/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        {r.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-4 h-4 text-alert-red flex-shrink-0" />
                        )}
                        <span className="text-xs text-txt-primary font-medium">{r.label}</span>
                      </div>
                      <p
                        className={`text-[11px] leading-relaxed ${
                          r.passed ? 'text-green-400/80' : 'text-alert-red/90'
                        }`}
                      >
                        {r.detail}
                      </p>
                    </div>
                  ))}
                </div>

                {isRejecting ? (
                  <div className="glass-card p-4 bg-primary/40 border-alert-red/30 border">
                    <p className="text-xs text-txt-secondary mb-2">请确认退回原因</p>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 text-sm bg-primary/60 border border-accent/10 rounded-lg text-txt-primary placeholder:text-txt-secondary/40 focus:outline-none focus:border-accent/40 resize-none"
                      placeholder="输入退回原因..."
                    />
                    <div className="flex justify-end gap-2 mt-3">
                      <button
                        onClick={() => {
                          setRejectTaskId(null)
                          setRejectReason('')
                        }}
                        className="px-4 py-1.5 text-xs text-txt-secondary hover:text-txt-primary border border-accent/10 rounded-lg transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={() => handleReject(task.id)}
                        disabled={!rejectReason.trim()}
                        className="px-4 py-1.5 text-xs gradient-red text-white rounded-lg disabled:opacity-40 transition-opacity"
                      >
                        确认退回补采
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(task.id)}
                      disabled={!allPassed}
                      className={`flex items-center gap-1.5 px-5 py-2 text-xs font-medium rounded-lg transition-all ${
                        allPassed
                          ? 'gradient-accent text-white hover:opacity-90'
                          : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                      }`}
                      title={!allPassed ? '存在不达标项，无法通过' : ''}
                    >
                      <Check className="w-3.5 h-3.5" />
                      通过
                    </button>
                    <button
                      onClick={() => handleRejectOpen(task.id, results)}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium border border-alert-red/30 text-alert-red rounded-lg hover:bg-alert-red/10 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      退回补采
                    </button>
                    {!allPassed && (
                      <span className="text-[11px] text-alert-red/70 ml-2">
                        * 校验不达标，仅可退回补采
                      </span>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
