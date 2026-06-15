import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FlaskConical, Filter, ChevronRight } from 'lucide-react'
import { useStore } from '@/store'
import { alertLevelBadge } from '@/components/Badges'
import type { OverallResult } from '@/types'

const filterOptions: { label: string; value: 'all' | OverallResult }[] = [
  { label: '全部', value: 'all' },
  { label: '合格', value: 'qualified' },
  { label: '不合格', value: 'unqualified' },
]

export default function Results() {
  const testResults = useStore((s) => s.testResults)
  const tasks = useStore((s) => s.tasks)
  const [filter, setFilter] = useState<'all' | OverallResult>('all')

  const filtered = filter === 'all' ? testResults : testResults.filter((r) => r.overallResult === filter)

  const getProductName = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    return task?.productName ?? '-'
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-txt-primary">检测结果</h1>
            <p className="text-xs text-txt-secondary">共 {testResults.length} 条检测记录</p>
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
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">检测结果</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">预警等级</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">检测日期</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">检测机构</th>
              <th className="w-10 px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((result) => (
              <Link
                key={result.id}
                to={`/results/${result.id}`}
                className={`contents cursor-pointer group`}
              >
                <tr
                  className={`border-b border-accent/5 group-hover:bg-surface-hover transition-colors ${
                    result.overallResult === 'unqualified' ? 'border-l-4 border-l-alert-red' : ''
                  }`}
                >
                  <td className="px-5 py-3.5 text-sm text-txt-primary font-mono-num">{result.taskId}</td>
                  <td className="px-5 py-3.5 text-sm text-txt-primary">{getProductName(result.taskId)}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        result.overallResult === 'qualified'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-alert-red/20 text-alert-red'
                      }`}
                    >
                      {result.overallResult === 'qualified' ? '合格' : '不合格'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {result.alertLevel ? alertLevelBadge(result.alertLevel) : <span className="text-xs text-txt-secondary">-</span>}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-txt-secondary font-mono-num">{result.testedAt.split(' ')[0]}</td>
                  <td className="px-5 py-3.5 text-sm text-txt-secondary">{result.testedBy}</td>
                  <td className="px-5 py-3.5">
                    <ChevronRight className="w-4 h-4 text-txt-secondary group-hover:text-accent transition-colors" />
                  </td>
                </tr>
              </Link>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-txt-secondary">暂无检测记录</div>
        )}
      </div>
    </div>
  )
}
