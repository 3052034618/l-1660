import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Clock, Search, Filter } from 'lucide-react'
import { useStore } from '@/store'
import { riskLevelBadge, taskStatusBadge } from '@/components/Badges'
import type { TaskStatus } from '@/types'

type FilterKey = 'assigned' | 'sampling' | 'completed'

const filterOptions: { key: FilterKey; label: string; statuses: TaskStatus[] }[] = [
  { key: 'assigned', label: '待采样', statuses: ['assigned', 'needs_resampling'] },
  { key: 'sampling', label: '采样中', statuses: ['sampling'] },
  { key: 'completed', label: '已完成', statuses: ['sampled', 'reviewing', 'testing', 'completed'] },
]

function getCountdown(deadline: string) {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return { text: '已逾期', overdue: true }
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  if (days > 0) return { text: `${days}天${hours}时`, overdue: false }
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { text: `${hours}时${mins}分`, overdue: hours < 6 }
}

export default function Sampling() {
  const navigate = useNavigate()
  const tasks = useStore((s) => s.tasks)
  const [activeFilter, setActiveFilter] = useState<FilterKey>('assigned')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const statuses = filterOptions.find((f) => f.key === activeFilter)!.statuses
    return tasks.filter(
      (t) =>
        statuses.includes(t.status) &&
        (t.productName.includes(search) || t.region.includes(search) || t.id.includes(search))
    )
  }, [tasks, activeFilter, search])

  const counts = useMemo(() => {
    const map: Record<FilterKey, number> = { assigned: 0, sampling: 0, completed: 0 }
    tasks.forEach((t) => {
      const match = filterOptions.find((f) => f.statuses.includes(t.status))
      if (match) map[match.key]++
    })
    return map
  }, [tasks])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-txt-primary">采样任务</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-txt-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索产品/区域/编号"
            className="w-full pl-9 pr-3 py-2 text-sm bg-primary/60 border border-accent/10 rounded-lg text-txt-primary placeholder:text-txt-secondary/50 focus:outline-none focus:border-accent/40"
          />
        </div>
      </div>

      <div className="flex gap-2">
        {filterOptions.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeFilter === f.key
                ? 'bg-accent/15 text-accent border border-accent/30'
                : 'bg-primary/40 text-txt-secondary border border-transparent hover:bg-primary/60 hover:text-txt-primary'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {f.label}
            <span
              className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono-num ${
                activeFilter === f.key ? 'bg-accent/20 text-accent' : 'bg-primary/60 text-txt-secondary'
              }`}
            >
              {counts[f.key]}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <MapPin className="w-10 h-10 text-txt-secondary/30 mx-auto mb-3" />
          <p className="text-txt-secondary text-sm">暂无{filterOptions.find((f) => f.key === activeFilter)?.label}任务</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((task) => {
            const countdown = getCountdown(task.deadline)
            return (
              <div
                key={task.id}
                onClick={() => navigate(`/sampling/${task.id}`)}
                className="glass-card glass-card-hover p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-bold text-txt-primary mb-1">{task.productName}</h3>
                    <p className="text-[11px] text-txt-secondary font-mono-num">{task.id}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    {riskLevelBadge(task.riskLevel)}
                    {taskStatusBadge(task.status)}
                  </div>
                </div>

                <div className="space-y-2 text-xs text-txt-secondary">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-accent/60 flex-shrink-0" />
                    <span>{task.region}</span>
                    <span className="ml-auto font-mono-num">
                      {task.sampleCount}/{task.requiredSampleCount} 样本
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-accent/60 flex-shrink-0" />
                    <span>截止 {task.deadline}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-accent/10 flex items-center justify-between">
                  <span
                    className={`text-xs font-mono-num ${
                      countdown.overdue ? 'text-alert-red' : 'text-accent'
                    }`}
                  >
                    {countdown.text}
                  </span>
                  <span className="text-[10px] text-txt-secondary">
                    {task.samplingPersonnel || '未分配'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
