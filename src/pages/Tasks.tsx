import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Filter, ChevronDown } from 'lucide-react'
import { useStore } from '@/store'
import { riskLevelBadge, taskStatusBadge } from '@/components/Badges'
import { categories, regions } from '@/data/mockData'
import type { RiskLevel, TaskStatus } from '@/types'

const statusOptions: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: '全部状态' },
  { value: 'pending', label: '待分配' },
  { value: 'assigned', label: '已分配' },
  { value: 'sampling', label: '采样中' },
  { value: 'sampled', label: '已采样' },
  { value: 'reviewing', label: '审核中' },
  { value: 'testing', label: '检测中' },
  { value: 'completed', label: '已完成' },
  { value: 'rejected', label: '已退回' },
]

const riskOptions: { value: RiskLevel | ''; label: string }[] = [
  { value: '', label: '全部风险' },
  { value: 'low', label: '低风险' },
  { value: 'medium', label: '中风险' },
  { value: 'high', label: '高风险' },
]

export default function Tasks() {
  const navigate = useNavigate()
  const tasks = useStore((s) => s.tasks)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [riskFilter, setRiskFilter] = useState<RiskLevel | ''>('')
  const [regionFilter, setRegionFilter] = useState('')

  const filtered = tasks.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false
    if (riskFilter && t.riskLevel !== riskFilter) return false
    if (regionFilter && t.region !== regionFilter) return false
    if (search && !t.productName.includes(search) && !t.id.includes(search)) return false
    return true
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">抽检任务管理</h1>
        <button
          onClick={() => navigate('/tasks/create')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          批量录入
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索任务编号或产品名称..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              {statusOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value as RiskLevel | '')}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              {riskOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
            >
              <option value="">全部区域</option>
              {regions.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] pointer-events-none" />
          </div>

          <button
            onClick={() => { setStatusFilter(''); setRiskFilter(''); setRegionFilter(''); setSearch('') }}
            className="px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
          >
            <Filter size={16} />
          </button>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">任务编号</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">产品名称</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">类别</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">风险等级</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">区域</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">状态</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">采样人员</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">截止日期</th>
                <th className="text-left px-4 py-3 text-[var(--text-secondary)] font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr
                  key={task.id}
                  onClick={() => navigate(`/tasks/${task.id}`)}
                  className="border-b border-[var(--border)] hover:bg-[rgba(0,212,170,0.05)] cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 font-mono-num text-[var(--accent)]">{task.id}</td>
                  <td className="px-4 py-3 font-medium">{task.productName}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{task.productCategory}</td>
                  <td className="px-4 py-3">{riskLevelBadge(task.riskLevel)}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{task.region}</td>
                  <td className="px-4 py-3">{taskStatusBadge(task.status)}</td>
                  <td className="px-4 py-3 text-[var(--text-secondary)]">{task.samplingPersonnel || '—'}</td>
                  <td className="px-4 py-3 font-mono-num text-[var(--text-secondary)]">{task.deadline}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate(`/tasks/${task.id}`) }}
                      className="text-[var(--accent)] hover:underline text-sm"
                    >
                      详情
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-12 text-[var(--text-secondary)]">
                    暂无匹配的任务数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-[var(--border)] text-sm text-[var(--text-secondary)]">
          共 {filtered.length} 条记录
        </div>
      </div>
    </div>
  )
}
