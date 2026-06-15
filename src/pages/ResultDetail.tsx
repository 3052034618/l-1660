import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, AlertTriangle, CheckCircle2, XCircle, FileText } from 'lucide-react'
import { useStore } from '@/store'
import { alertLevelBadge } from '@/components/Badges'

const alertColorMap = {
  yellow: { bg: 'bg-alert-yellow/10', border: 'border-alert-yellow/30', text: 'text-alert-yellow' },
  orange: { bg: 'bg-alert-orange/10', border: 'border-alert-orange/30', text: 'text-alert-orange' },
  red: { bg: 'bg-alert-red/10', border: 'border-alert-red/30', text: 'text-alert-red' },
}

const disposalSuggestionMap = {
  yellow: '建议安排复检，确认超标情况',
  orange: '建议启动产品召回程序，排查同批次产品',
  red: '建议立即下架销毁涉事产品，启动召回程序',
}

export default function ResultDetail() {
  const { id } = useParams<{ id: string }>()
  const testResults = useStore((s) => s.testResults)
  const tasks = useStore((s) => s.tasks)
  const disposalOrders = useStore((s) => s.disposalOrders)

  const result = testResults.find((r) => r.id === id)
  if (!result) {
    return (
      <div className="p-6 text-center text-txt-secondary">
        <p>未找到检测结果记录</p>
        <Link to="/results" className="text-accent text-sm mt-2 inline-block">返回列表</Link>
      </div>
    )
  }

  const task = tasks.find((t) => t.id === result.taskId)
  const relatedDisposal = disposalOrders.find((d) => d.taskId === result.taskId)

  return (
    <div className="p-6 space-y-6">
      <Link to="/results" className="inline-flex items-center gap-1.5 text-sm text-txt-secondary hover:text-accent transition-colors">
        <ArrowLeft className="w-4 h-4" />
        返回检测结果
      </Link>

      {result.overallResult === 'unqualified' && result.alertLevel && (
        <div className={`${alertColorMap[result.alertLevel].bg} border ${alertColorMap[result.alertLevel].border} rounded-xl p-4 flex items-start gap-3`}>
          <AlertTriangle className={`w-5 h-5 ${alertColorMap[result.alertLevel].text} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-medium ${alertColorMap[result.alertLevel].text}`}>
                {result.alertLevel === 'yellow' ? '黄色预警' : result.alertLevel === 'orange' ? '橙色预警' : '红色预警'}
              </span>
              {alertLevelBadge(result.alertLevel)}
            </div>
            <p className="text-sm text-txt-secondary">{disposalSuggestionMap[result.alertLevel]}</p>
          </div>
        </div>
      )}

      <div className="glass-card p-5">
        <h2 className="text-base font-bold text-txt-primary mb-4">检测概览</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-txt-secondary mb-1">检测结果</p>
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
              result.overallResult === 'qualified' ? 'bg-green-500/20 text-green-400' : 'bg-alert-red/20 text-alert-red'
            }`}>
              {result.overallResult === 'qualified' ? '合格' : '不合格'}
            </span>
          </div>
          <div>
            <p className="text-xs text-txt-secondary mb-1">预警等级</p>
            {result.alertLevel ? alertLevelBadge(result.alertLevel) : <span className="text-sm text-txt-secondary">-</span>}
          </div>
          <div>
            <p className="text-xs text-txt-secondary mb-1">检测日期</p>
            <p className="text-sm text-txt-primary font-mono-num">{result.testedAt}</p>
          </div>
          <div>
            <p className="text-xs text-txt-secondary mb-1">检测机构</p>
            <p className="text-sm text-txt-primary">{result.testedBy}</p>
          </div>
        </div>
        {task && (
          <div className="mt-4 pt-4 border-t border-accent/10 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-txt-secondary mb-1">任务编号</p>
              <p className="text-sm text-txt-primary font-mono-num">{task.id}</p>
            </div>
            <div>
              <p className="text-xs text-txt-secondary mb-1">产品名称</p>
              <p className="text-sm text-txt-primary">{task.productName}</p>
            </div>
            <div>
              <p className="text-xs text-txt-secondary mb-1">产品类别</p>
              <p className="text-sm text-txt-primary">{task.productCategory}</p>
            </div>
            <div>
              <p className="text-xs text-txt-secondary mb-1">风险等级</p>
              <p className="text-sm text-txt-primary">{task.riskLevel === 'low' ? '低风险' : task.riskLevel === 'medium' ? '中风险' : '高风险'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-5 py-4 border-b border-accent/10">
          <h2 className="text-base font-bold text-txt-primary">检测项目明细</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-accent/10">
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">检测项目</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">检测值</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">标准限值</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">单位</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">是否超标</th>
              <th className="text-left text-xs font-medium text-txt-secondary px-5 py-3">超标倍数</th>
            </tr>
          </thead>
          <tbody>
            {result.items.map((item, idx) => (
              <tr key={idx} className="border-b border-accent/5 hover:bg-surface-hover transition-colors">
                <td className="px-5 py-3.5 text-sm text-txt-primary">{item.name}</td>
                <td className="px-5 py-3.5 text-sm text-txt-primary font-mono-num">{item.value}</td>
                <td className="px-5 py-3.5 text-sm text-txt-secondary font-mono-num">{item.standard}</td>
                <td className="px-5 py-3.5 text-sm text-txt-secondary">{item.unit}</td>
                <td className="px-5 py-3.5">
                  {item.isExceeded ? (
                    <XCircle className="w-4 h-4 text-alert-red" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                  )}
                </td>
                <td className="px-5 py-3.5 text-sm font-mono-num">
                  {item.isExceeded && item.exceedMultiple ? (
                    <span className="text-alert-red">{item.exceedMultiple}倍</span>
                  ) : (
                    <span className="text-txt-secondary">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {relatedDisposal && (
        <Link
          to={`/disposal/${relatedDisposal.id}`}
          className="glass-card glass-card-hover p-4 flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-lg bg-alert-orange/20 flex items-center justify-center">
            <FileText className="w-4 h-4 text-alert-orange" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-txt-primary">关联处置工单</p>
            <p className="text-xs text-txt-secondary">{relatedDisposal.id} · {relatedDisposal.reason}</p>
          </div>
          <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${
            relatedDisposal.status === 'pending' ? 'bg-alert-yellow/20 text-alert-yellow' :
            relatedDisposal.status === 'approved' ? 'bg-green-500/20 text-green-400' :
            relatedDisposal.status === 'completed' ? 'bg-accent/20 text-accent' :
            'bg-alert-red/20 text-alert-red'
          }`}>
            {relatedDisposal.status === 'pending' ? '待审批' : relatedDisposal.status === 'approved' ? '已审批' : relatedDisposal.status === 'completed' ? '已完成' : '已驳回'}
          </span>
        </Link>
      )}
    </div>
  )
}
