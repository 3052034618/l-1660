import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { riskLevelBadge, taskStatusBadge, alertLevelBadge } from '@/components/Badges'
import {
  FlaskConical,
  ClipboardCheck,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Plus,
  TestTubes,
  FileSearch,
  FileBarChart,
  ChevronRight,
  Bell,
  Clock,
} from 'lucide-react'

export default function Dashboard() {
  const { tasks, testResults, alerts, markAlertRead } = useStore()

  const samplingTasks = tasks.filter((t) => t.status === 'sampling' || t.status === 'assigned')
  const reviewingTasks = tasks.filter((t) => t.status === 'reviewing')
  const unreadAlerts = alerts.filter((a) => !a.isRead)
  const totalResults = testResults.length
  const qualifiedResults = testResults.filter((r) => r.overallResult === 'qualified').length
  const qualifiedRate = totalResults > 0 ? Math.round((qualifiedResults / totalResults) * 100) : 0

  const pendingTasks = tasks.filter(
    (t) => t.status === 'pending' || t.status === 'assigned' || t.status === 'sampling' || t.status === 'reviewing'
  )

  const statCards = [
    {
      label: '今日采样任务',
      value: samplingTasks.length,
      icon: FlaskConical,
      gradient: 'gradient-accent',
      growth: 12,
      growthUp: true,
      suffix: '项',
    },
    {
      label: '待审核任务',
      value: reviewingTasks.length,
      icon: ClipboardCheck,
      gradient: 'gradient-blue',
      growth: 3,
      growthUp: false,
      suffix: '项',
    },
    {
      label: '预警数',
      value: unreadAlerts.length,
      icon: AlertTriangle,
      gradient: 'gradient-orange',
      growth: 8,
      growthUp: true,
      suffix: '条',
    },
    {
      label: '本月合格率',
      value: qualifiedRate,
      icon: TrendingUp,
      gradient: 'gradient-purple',
      growth: 2.5,
      growthUp: true,
      suffix: '%',
    },
  ]

  const quickActions = [
    { label: '录入任务', icon: Plus, to: '/tasks/create', gradient: 'gradient-accent' },
    { label: '采样执行', icon: TestTubes, to: '/sampling', gradient: 'gradient-blue' },
    { label: '审核任务', icon: FileSearch, to: '/review', gradient: 'gradient-yellow' },
    { label: '查看报告', icon: FileBarChart, to: '/statistics/report', gradient: 'gradient-purple' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-txt-primary">工作台</h1>
        <div className="flex items-center gap-2 text-sm text-txt-secondary">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="glass-card glass-card-hover p-5 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.gradient} opacity-15 rounded-bl-full`} />
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-txt-secondary">{card.label}</span>
              <div className={`${card.gradient} p-2 rounded-lg`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-mono-num text-3xl font-medium text-txt-primary animate-count-up">
                {card.value}
              </span>
              <span className="text-sm text-txt-secondary mb-1">{card.suffix}</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {card.growthUp ? (
                <TrendingUp className="w-3 h-3 text-accent" />
              ) : (
                <TrendingDown className="w-3 h-3 text-alert-red" />
              )}
              <span className={`text-xs ${card.growthUp ? 'text-accent' : 'text-alert-red'}`}>
                {card.growthUp ? '+' : '-'}{card.growth}%
              </span>
              <span className="text-xs text-txt-secondary ml-1">较昨日</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-txt-primary">待办任务</h2>
            <Link to="/tasks" className="text-sm text-accent hover:text-accent-light flex items-center gap-1 transition-colors">
              查看全部 <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-txt-secondary text-sm">暂无待办任务</div>
          ) : (
            <div className="space-y-3">
              {pendingTasks.slice(0, 6).map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-primary/40 hover:bg-surface-hover border border-transparent hover:border-accent/20 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      task.riskLevel === 'high' ? 'bg-alert-red' :
                      task.riskLevel === 'medium' ? 'bg-alert-yellow' : 'bg-accent'
                    }`} />
                    <div className="min-w-0">
                      <div className="text-sm text-txt-primary truncate group-hover:text-accent transition-colors">
                        {task.productName}
                      </div>
                      <div className="text-xs text-txt-secondary mt-0.5">
                        {task.region} · {task.productCategory}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {riskLevelBadge(task.riskLevel)}
                    {taskStatusBadge(task.status)}
                    <ChevronRight className="w-4 h-4 text-txt-secondary group-hover:text-accent transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-txt-primary flex items-center gap-2">
              <Bell className="w-5 h-5 text-alert-orange" />
              预警通知
            </h2>
            <span className="text-xs text-txt-secondary">{unreadAlerts.length} 条未读</span>
          </div>
          {unreadAlerts.length === 0 ? (
            <div className="text-center py-8 text-txt-secondary text-sm">暂无预警通知</div>
          ) : (
            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {unreadAlerts.map((alert) => {
                const pulseClass =
                  alert.level === 'red'
                    ? 'animate-pulse-red'
                    : alert.level === 'orange'
                    ? 'animate-pulse-orange'
                    : 'animate-pulse-yellow'

                return (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg bg-primary/40 border ${pulseClass} transition-all cursor-pointer hover:bg-surface-hover`}
                    onClick={() => markAlertRead(alert.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {alertLevelBadge(alert.level)}
                          <span className="text-xs text-txt-secondary">
                            {new Date(alert.createdAt).toLocaleDateString('zh-CN')}
                          </span>
                        </div>
                        <div className="text-sm text-txt-primary truncate">{alert.title}</div>
                        <div className="text-xs text-txt-secondary mt-1 line-clamp-2">{alert.message}</div>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${
                          alert.level === 'red' ? 'bg-alert-red' :
                          alert.level === 'orange' ? 'bg-alert-orange' : 'bg-alert-yellow'
                        }`}
                        style={{ animation: 'pulse-border 1.5s ease-in-out infinite' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="glass-card p-5">
        <h2 className="text-lg font-semibold text-txt-primary mb-4">快捷操作</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              className="flex flex-col items-center gap-3 p-5 rounded-xl bg-primary/40 hover:bg-surface-hover border border-transparent hover:border-accent/20 transition-all group"
            >
              <div className={`${action.gradient} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                <action.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm text-txt-secondary group-hover:text-accent transition-colors">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
