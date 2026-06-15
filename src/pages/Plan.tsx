import { useStore } from '@/store'
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Target,
  FileText,
  AlertCircle,
} from 'lucide-react'

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日']

export default function Plan() {
  const { monthlyPlan, approvePlan, rejectPlan } = useStore()

  const daysInMonth = monthlyPlan.dailyTasks.length || 30
  const firstDayOffset = new Date('2026-07-01').getDay()
  const startOffset = firstDayOffset === 0 ? 6 : firstDayOffset - 1

  const taskDays = monthlyPlan.dailyTasks.filter((d) => d.taskCount > 0).length
  const totalTaskDays = monthlyPlan.dailyTasks.filter((d) => d.taskCount > 0).reduce((s, d) => s + d.taskCount, 0)
  const avgTasks = taskDays > 0 ? (totalTaskDays / taskDays).toFixed(1) : '0'

  const calendarCells: (number | null)[] = []
  for (let i = 0; i < startOffset; i++) calendarCells.push(null)
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d)
  const remaining = 7 - (calendarCells.length % 7)
  if (remaining < 7) for (let i = 0; i < remaining; i++) calendarCells.push(null)

  const getDayData = (day: number | null) => {
    if (!day) return null
    return monthlyPlan.dailyTasks.find((d) => d.day === day) ?? null
  }

  const isWeekend = (index: number) => {
    const col = index % 7
    return col === 5 || col === 6
  }

  const statusConfig: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
    draft: { label: '草稿', cls: 'bg-gray-500/20 text-gray-400', icon: FileText },
    pending_approval: { label: '待审批', cls: 'bg-alert-yellow/20 text-alert-yellow', icon: Clock },
    approved: { label: '已审批', cls: 'bg-green-500/20 text-green-400', icon: CheckCircle2 },
    rejected: { label: '已驳回', cls: 'bg-alert-red/20 text-alert-red', icon: XCircle },
  }
  const currentStatus = statusConfig[monthlyPlan.status]
  const StatusIcon = currentStatus.icon

  return (
    <div className="space-y-6">
      <div className="glass-card p-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="gradient-accent p-3 rounded-xl">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-txt-primary">{monthlyPlan.month}月度抽检计划</h1>
              <div className="flex items-center gap-4 mt-1 text-sm text-txt-secondary">
                <span>总任务: <span className="font-mono-num text-accent">{monthlyPlan.totalTasks}</span></span>
                <span>生成日期: {monthlyPlan.generatedAt}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${currentStatus.cls}`}>
              <StatusIcon className="w-4 h-4" />
              {currentStatus.label}
            </span>
            {monthlyPlan.status === 'approved' && monthlyPlan.approvedBy && (
              <span className="text-xs text-txt-secondary">
                审批人: {monthlyPlan.approvedBy} · {monthlyPlan.approvedAt ? new Date(monthlyPlan.approvedAt).toLocaleDateString('zh-CN') : ''}
              </span>
            )}
            {monthlyPlan.status === 'pending_approval' && (
              <>
                <button
                  onClick={() => approvePlan('陈局长')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-accent/20 text-accent hover:bg-accent/30 transition-colors text-sm font-medium"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  审批
                </button>
                <button
                  onClick={() => rejectPlan()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-alert-red/20 text-alert-red hover:bg-alert-red/30 transition-colors text-sm font-medium"
                >
                  <XCircle className="w-4 h-4" />
                  驳回
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 glass-card p-5">
          <h2 className="text-lg font-semibold text-txt-primary mb-4">月度日历</h2>
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((wd, i) => (
              <div
                key={wd}
                className={`text-center text-xs font-medium py-2 ${i >= 5 ? 'text-alert-yellow/70' : 'text-txt-secondary'}`}
              >
                周{wd}
              </div>
            ))}
            {calendarCells.map((day, index) => {
              const dayData = getDayData(day)
              const weekend = isWeekend(index)
              return (
                <div
                  key={index}
                  className={`relative aspect-square flex flex-col items-center justify-center rounded-lg border transition-all ${
                    day === null
                      ? 'border-transparent'
                      : weekend
                        ? 'bg-primary/30 border-border/50 opacity-60'
                        : 'bg-primary/40 border-border/50 hover:border-accent/30 hover:bg-surface-hover'
                  }`}
                >
                  {day !== null && (
                    <>
                      <span className={`text-sm font-medium ${weekend ? 'text-txt-secondary' : 'text-txt-primary'}`}>
                        {day}
                      </span>
                      {dayData && dayData.taskCount > 0 && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                          <span className="text-[10px] font-mono-num text-accent">{dayData.taskCount}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-semibold text-txt-primary mb-3">计划概览</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-txt-secondary">总任务数</span>
                <span className="font-mono-num text-sm text-accent">{monthlyPlan.totalTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-txt-secondary">工作天数</span>
                <span className="font-mono-num text-sm text-txt-primary">{taskDays}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-txt-secondary">日均任务</span>
                <span className="font-mono-num text-sm text-txt-primary">{avgTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-txt-secondary">覆盖区域</span>
                <span className="font-mono-num text-sm text-txt-primary">{monthlyPlan.regions.length}</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-4 h-4 text-alert-orange" />
              <h3 className="text-sm font-semibold text-txt-primary">重点关注类别</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {monthlyPlan.focusCategories.map((cat) => (
                <span key={cat} className="px-2.5 py-1 rounded-md text-xs font-medium bg-alert-orange/15 text-alert-orange">
                  {cat}
                </span>
              ))}
            </div>
          </div>

          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-accent" />
              <h3 className="text-sm font-semibold text-txt-primary">抽检区域</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {monthlyPlan.regions.map((region) => (
                <span key={region} className="px-2.5 py-1 rounded-md text-xs font-medium bg-accent/15 text-accent">
                  {region}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
