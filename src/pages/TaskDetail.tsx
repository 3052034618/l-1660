import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Zap, MapPin, FlaskConical, FileText, ClipboardList, ExternalLink, AlertTriangle, Clock, CheckCircle2, XCircle, RefreshCw, Send } from 'lucide-react'
import { useStore } from '@/store'
import { riskLevelBadge, taskStatusBadge, alertLevelBadge } from '@/components/Badges'
import { personnel, agencies } from '@/data/mockData'
import type { ReviewHistoryEntry } from '@/types'

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tasks = useStore((s) => s.tasks)
  const samplingRecords = useStore((s) => s.samplingRecords)
  const testResults = useStore((s) => s.testResults)
  const disposalOrders = useStore((s) => s.disposalOrders)
  const assignTask = useStore((s) => s.assignTask)

  const task = tasks.find((t) => t.id === id)
  const [selectedPersonnel, setSelectedPersonnel] = useState(task?.samplingPersonnel || '')
  const [selectedAgency, setSelectedAgency] = useState(task?.testingAgency || '')

  if (!task) {
    return (
      <div className="p-6">
        <div className="glass-card p-12 text-center">
          <p className="text-[var(--text-secondary)] text-lg">未找到该任务</p>
          <button
            onClick={() => navigate('/tasks')}
            className="mt-4 text-[var(--accent)] hover:underline text-sm"
          >
            返回任务列表
          </button>
        </div>
      </div>
    )
  }

  const relatedResults = testResults.filter((r) => r.taskId === task.id)
  const relatedDisposals = disposalOrders.filter((d) => d.taskId === task.id)
  const relatedSamplingRecords = samplingRecords.filter((s) => s.taskId === task.id)

  const handleSmartAssign = () => {
    const randomPerson = personnel[Math.floor(Math.random() * personnel.length)]
    const randomAgency = agencies[Math.floor(Math.random() * agencies.length)]
    setSelectedPersonnel(randomPerson)
    setSelectedAgency(randomAgency)
    assignTask(task.id, randomPerson, randomAgency)
  }

  const handleManualAssign = () => {
    if (selectedPersonnel && selectedAgency) {
      assignTask(task.id, selectedPersonnel, selectedAgency)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{task.productName}</h1>
            {riskLevelBadge(task.riskLevel)}
            {taskStatusBadge(task.status)}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-1 font-mono-num">{task.id}</p>
        </div>
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-[var(--accent)]">
          <FileText size={18} />
          <h2 className="text-lg font-medium">基本信息</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-3">
          {[
            ['产品名称', task.productName],
            ['产品类别', task.productCategory],
            ['风险等级', riskLevelBadge(task.riskLevel)],
            ['抽检区域', task.region],
            ['创建日期', task.createdAt],
            ['截止日期', task.deadline],
            ['需采样数量', `${task.requiredSampleCount}`],
            ['已采样数量', `${task.sampleCount}`],
            ['检测项目', task.testItems.join('、')],
            ['扫码确认时间', task.scanConfirmedAt || '—'],
          ].map(([label, value], i) => (
            <div key={i}>
              <span className="text-sm text-[var(--text-secondary)]">{label}</span>
              <div className="mt-0.5 text-[var(--text-primary)] text-sm">{value}</div>
            </div>
          ))}
        </div>
        {task.description && (
          <div>
            <span className="text-sm text-[var(--text-secondary)]">任务描述</span>
            <p className="mt-0.5 text-[var(--text-primary)] text-sm">{task.description}</p>
          </div>
        )}
        {task.rejectReason && (
          <div className="p-3 rounded-lg bg-alert-red/10 border border-alert-red/30">
            <div className="flex items-center gap-2 text-alert-red text-sm font-medium mb-1">
              <AlertTriangle className="w-4 h-4" />
              退回原因
            </div>
            <p className="text-sm text-txt-primary">{task.rejectReason}</p>
          </div>
        )}
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-[var(--accent)]">
          <ClipboardList size={18} />
          <h2 className="text-lg font-medium">分配信息</h2>
        </div>

        {(task.status === 'pending' || task.status === 'assigned') && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm text-[var(--text-secondary)]">采样人员</label>
                <select
                  value={selectedPersonnel}
                  onChange={(e) => setSelectedPersonnel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="">请选择</option>
                  {personnel.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-[var(--text-secondary)]">检测机构</label>
                <select
                  value={selectedAgency}
                  onChange={(e) => setSelectedAgency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="">请选择</option>
                  {agencies.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSmartAssign}
                className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-white font-medium text-sm hover:opacity-90 transition-opacity"
              >
                <Zap size={16} />
                智能分配
              </button>
              <button
                onClick={handleManualAssign}
                disabled={!selectedPersonnel || !selectedAgency}
                className="px-4 py-2 rounded-lg border border-[var(--accent)] text-[var(--accent)] text-sm hover:bg-[var(--accent)]/10 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                确认分配
              </button>
            </div>
          </div>
        )}

        {(task.status !== 'pending' && task.status !== 'rejected') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-[var(--text-secondary)]">采样人员</span>
              <p className="mt-0.5 text-[var(--text-primary)] text-sm">{task.samplingPersonnel || '—'}</p>
            </div>
            <div>
              <span className="text-sm text-[var(--text-secondary)]">检测机构</span>
              <p className="mt-0.5 text-[var(--text-primary)] text-sm">{task.testingAgency || '—'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-[var(--accent)]">
          <MapPin size={18} />
          <h2 className="text-lg font-medium">采样记录</h2>
        </div>
        {relatedSamplingRecords.length > 0 ? (
          <div className="space-y-4">
            {relatedSamplingRecords.map((record) => (
              <div key={record.id} className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-num text-sm text-[var(--accent)]">{record.sampleCode}</span>
                  <span className="text-xs text-[var(--text-secondary)]">{record.sampledAt}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                  <div>
                    <span className="text-[var(--text-secondary)]">确认人：</span>
                    <span className="text-txt-primary">{record.confirmedBy}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">GPS定位：</span>
                    <span className="font-mono-num text-xs text-txt-primary">
                      {record.gpsLocation.lat.toFixed(4)}, {record.gpsLocation.lng.toFixed(4)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--text-secondary)]">照片数量：</span>
                    <span className="text-txt-primary">{record.photos.length} 张</span>
                  </div>
                </div>
                {record.photos.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-accent/10">
                    {record.photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden border border-accent/10 group cursor-pointer"
                      >
                        <img
                          src={photo}
                          alt={`采样照片${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-secondary)] text-sm py-4">暂无采样记录</p>
        )}
      </div>

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-[var(--accent)]">
          <FlaskConical size={18} />
          <h2 className="text-lg font-medium">检测结果</h2>
        </div>
        {relatedResults.length > 0 ? (
          <div className="space-y-3">
            {relatedResults.map((result) => (
              <div key={result.id} className="p-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-num text-sm text-[var(--accent)]">{result.id}</span>
                    {result.alertLevel && alertLevelBadge(result.alertLevel)}
                  </div>
                  <Link
                    to={`/results/${result.id}`}
                    className="flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
                  >
                    查看详情 <ExternalLink size={12} />
                  </Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--text-secondary)]">
                        <th className="text-left py-1.5 pr-3 font-medium">项目</th>
                        <th className="text-right py-1.5 pr-3 font-medium">检测值</th>
                        <th className="text-right py-1.5 pr-3 font-medium">标准值</th>
                        <th className="text-left py-1.5 font-medium">结果</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.items.map((item, i) => (
                        <tr key={i} className={item.isExceeded ? 'text-[var(--alert-red)]' : ''}>
                          <td className="py-1.5 pr-3">{item.name}</td>
                          <td className="py-1.5 pr-3 text-right font-mono-num">{item.value} {item.unit}</td>
                          <td className="py-1.5 pr-3 text-right font-mono-num text-[var(--text-secondary)]">≤{item.standard} {item.unit}</td>
                          <td className="py-1.5">
                            {item.isExceeded ? (
                              <span className="text-[var(--alert-red)] font-medium">
                                超标{item.exceedMultiple ? ` (${item.exceedMultiple}倍)` : ''}
                              </span>
                            ) : (
                              <span className="text-green-400">合格</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span>检测机构：{result.testedBy}</span>
                  <span>检测时间：{result.testedAt}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-[var(--text-secondary)] text-sm py-4">暂无检测结果</p>
        )}
      </div>

      {relatedDisposals.length > 0 && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <FileText size={18} />
            <h2 className="text-lg font-medium">关联处置单</h2>
          </div>
          <div className="space-y-2">
            {relatedDisposals.map((order) => (
              <Link
                key={order.id}
                to={`/disposal/${order.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] hover:border-[var(--accent)] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono-num text-sm text-[var(--accent)]">{order.id}</span>
                  <span className="text-sm">{order.productName}</span>
                  {riskLevelBadge(order.riskLevel)}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[var(--text-secondary)]">{order.reason}</span>
                  <ExternalLink size={14} className="text-[var(--text-secondary)]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {(task.reviewHistory && task.reviewHistory.length > 0) && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 text-[var(--accent)]">
            <Clock size={18} />
            <h2 className="text-lg font-medium">审核历史</h2>
          </div>
          <div className="relative pl-6">
            <div className="absolute left-2.5 top-1 bottom-1 w-px bg-accent/20" />
            {task.reviewHistory.map((entry: ReviewHistoryEntry, idx: number) => {
              const isLast = idx === task.reviewHistory.length - 1
              const actionInfo = {
                submit: { label: '提交采样', icon: Send, color: 'text-accent', bg: 'bg-accent/20' },
                approve: { label: '审核通过', icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/20' },
                reject: { label: '退回补采', icon: XCircle, color: 'text-alert-red', bg: 'bg-alert-red/20' },
                resample_start: { label: '开始补采', icon: RefreshCw, color: 'text-amber-400', bg: 'bg-amber-500/20' },
                resample_submit: { label: '补采提交', icon: Send, color: 'text-amber-400', bg: 'bg-amber-500/20' },
              }[entry.action] || { label: entry.action, icon: Clock, color: 'text-txt-secondary', bg: 'bg-primary/40' }
              const Icon = actionInfo.icon
              return (
                <div key={entry.id} className={`relative pb-6 ${isLast ? 'pb-0' : ''}`}>
                  <div className={`absolute -left-[18px] top-0 w-5 h-5 rounded-full ${actionInfo.bg} flex items-center justify-center`}>
                    <Icon className={`w-3 h-3 ${actionInfo.color}`} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${actionInfo.color}`}>{actionInfo.label}</span>
                      <span className="text-[11px] text-txt-secondary font-mono-num">{entry.timestamp}</span>
                      <span className="text-[11px] text-txt-secondary">操作人：{entry.operator}</span>
                    </div>
                    {entry.comment && (
                      <p className="text-xs text-txt-secondary">{entry.comment}</p>
                    )}
                    {entry.rejectReasons && entry.rejectReasons.length > 0 && (
                      <div className="mt-1.5 p-2.5 rounded-lg bg-alert-red/10 border border-alert-red/20 space-y-1">
                        <p className="text-[11px] text-alert-red font-medium">退回原因：</p>
                        {entry.rejectReasons.map((r, i) => (
                          <p key={i} className="text-[11px] text-alert-red/90 pl-2">• {r}</p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
