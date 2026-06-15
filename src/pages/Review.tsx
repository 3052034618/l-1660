import { useState } from 'react'
import { CheckCircle2, XCircle, Check, X, AlertTriangle, FileCheck } from 'lucide-react'
import { useStore } from '@/store'
import { riskLevelBadge, taskStatusBadge } from '@/components/Badges'

interface ValidationResult {
  label: string
  passed: boolean
  detail: string
}

function getValidationResults(task: ReturnType<typeof useStore.getState>['tasks'][0]): ValidationResult[] {
  const now = Date.now()
  const deadline = new Date(task.deadline).getTime()
  return [
    {
      label: '样本量校验',
      passed: task.sampleCount >= task.requiredSampleCount,
      detail: `${task.sampleCount}/${task.requiredSampleCount} 份`,
    },
    {
      label: '采样时间窗口',
      passed: now <= deadline,
      detail: now <= deadline ? '在截止时间内' : '已超过截止时间',
    },
    {
      label: '检测项目完整性',
      passed: task.testItems.length > 0,
      detail: `${task.testItems.length} 项检测项目`,
    },
  ]
}

export default function Review() {
  const tasks = useStore((s) => s.tasks)
  const reviewTask = useStore((s) => s.reviewTask)

  const [rejectTaskId, setRejectTaskId] = useState<string | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  const reviewTasks = tasks.filter((t) => t.status === 'reviewing' || t.status === 'sampled')

  const handleApprove = (taskId: string) => {
    reviewTask(taskId, true)
  }

  const handleReject = (taskId: string) => {
    reviewTask(taskId, false, rejectReason)
    setRejectTaskId(null)
    setRejectReason('')
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
                  {!allPassed && (
                    <div className="flex items-center gap-1 text-alert-red text-xs">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      异常
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {results.map((r) => (
                    <div
                      key={r.label}
                      className={`glass-card p-3 bg-primary/40 ${
                        r.passed ? 'border-green-500/20' : 'border-alert-red/20'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {r.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-alert-red" />
                        )}
                        <span className="text-xs text-txt-primary font-medium">{r.label}</span>
                      </div>
                      <p className={`text-[11px] font-mono-num ${r.passed ? 'text-green-400/80' : 'text-alert-red/80'}`}>
                        {r.detail}
                      </p>
                    </div>
                  ))}
                </div>

                {isRejecting ? (
                  <div className="glass-card p-4 bg-primary/40 border-alert-red/20">
                    <p className="text-xs text-txt-secondary mb-2">请输入退回原因</p>
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
                        确认退回
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleApprove(task.id)}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium gradient-accent text-white rounded-lg hover:opacity-90 transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                      通过
                    </button>
                    <button
                      onClick={() => setRejectTaskId(task.id)}
                      className="flex items-center gap-1.5 px-5 py-2 text-xs font-medium border border-alert-red/30 text-alert-red rounded-lg hover:bg-alert-red/10 transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      退回补采
                    </button>
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
