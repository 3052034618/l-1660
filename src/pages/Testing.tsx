import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical, Filter, ChevronRight, Plus } from 'lucide-react'
import { useStore } from '@/store'
import { taskStatusBadge, riskLevelBadge } from '@/components/Badges'
import type { TaskStatus } from '@/types'

const filterOptions: { label: string; value: 'all' | TaskStatus }[] = [
  { label: '全部', value: 'all' },
  { label: '检测中', value: 'testing' },
  { label: '已完成', value: 'completed' },
]

export default function Testing() {
  const tasks = useStore((s) => s.tasks)
  const testResults = useStore((s) => s.testResults)
  const [filter, setFilter] = useState<'all' | TaskStatus>('all')

  const testingTasks = tasks.filter((t) => t.status === 'testing' || t.status === 'completed')
  const filtered = filter === 'all' ? testingTasks : testingTasks.filter((t) => t.status === filter)

  const getResultStatus = (taskId: string) => {
    const results = testResults.filter((r) => r.taskId === taskId)
    if (results.length === 0) return '未检测'
    const hasUnqualified = results.some((r) => r.overallResult === 'unqualified')
    return hasUnqualified ? '已出结果(不合格)' : '已出结果(合格)'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-purple flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-txt-primary">检测管理</h1>
            <p className="text-xs text-txt-secondary">共 {testingTasks.length} 条检测任务</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-txt-secondary" />
          {filterOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filter === opt.value
                  ? 'bg-accent/20 text-accent border border-accent/30'
                  : 'bg-surface-card text-txt-secondary hover:text-txt-primary border border-transparent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-accent/10">
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">任务编号</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">产品名称</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">风险等级</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">检测项目</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">任务状态</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">检测状态</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">截止日期</th>
              <th className="w-10 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((task) => {
              const hasResult = testResults.some((r) => r.taskId === task.id)
              return (
                <tr
                  key={task.id}
                  className="border-b border-accent/5 hover:bg-surface-hover transition-colors"
                >
                  <td className="px-5 py-3.5 text-sm text-txt-primary font-mono-num">{task.id}</td>
                  <td className="px-5 py-3.5 text-sm text-txt-primary">{task.productName}</td>
                  <td className="px-5 py-3.5">{riskLevelBadge(task.riskLevel)}</td>
                  <td className="px-5 py-3.5 text-sm text-txt-secondary">{task.testItems.join('、')}</td>
                  <td className="px-5 py-3.5">{taskStatusBadge(task.status)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium ${
                      getResultStatus(task.id) === '未检测' ? 'text-txt-secondary' :
                      getResultStatus(task.id).includes('不合格') ? 'text-alert-red' : 'text-green-400'
                    }`}>
                      {getResultStatus(task.id)}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-sm text-txt-secondary font-mono-num">{task.deadline}</td>
                  <td className="px-5 py-3.5">
                    {task.status === 'testing' && !hasResult ? (
                      <Link
                        to={`/testing/${task.id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs bg-accent/15 text-accent hover:bg-accent/25 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        录入结果
                      </Link>
                    ) : hasResult ? (
                      <Link
                        to={`/results?taskId=${task.id}`}
                        className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                      >
                        查看
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    ) : (
                      <span className="text-xs text-txt-secondary">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-txt-secondary">暂无检测任务</div>
        )}
      </div>
    </div>
  )
}
