import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import {
  Package,
  ArrowLeft,
  AlertTriangle,
} from 'lucide-react'

export default function SpareParts() {
  const { spareParts } = useStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-purple p-3 rounded-xl">
            <Package className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-txt-primary">备件库存</h1>
        </div>
        <Link
          to="/equipment"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/60 text-txt-secondary hover:text-accent hover:bg-accent/10 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回设备管理
        </Link>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary">备件名称</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary">类别</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary">当前库存</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary">安全库存</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary">单位</th>
              <th className="text-left px-5 py-3 text-xs font-medium text-txt-secondary">状态</th>
            </tr>
          </thead>
          <tbody>
            {spareParts.map((part) => {
              const isLow = part.stock < part.safetyStock
              const stockRatio = Math.min((part.stock / part.safetyStock) * 100, 100)
              return (
                <tr
                  key={part.id}
                  className={`border-b border-border/30 transition-colors ${
                    isLow ? 'bg-alert-red/10 animate-pulse-red' : 'hover:bg-surface-hover'
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      {isLow && <AlertTriangle className="w-4 h-4 text-alert-red flex-shrink-0" />}
                      <span className={`text-sm ${isLow ? 'text-alert-red animate-blink' : 'text-txt-primary'}`}>
                        {part.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-accent/15 text-accent">
                      {part.category}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-mono-num ${isLow ? 'text-alert-red' : 'text-txt-primary'}`}>
                        {part.stock}
                      </span>
                      <div className="w-20 h-1.5 rounded-full bg-primary-dark">
                        <div
                          className={`h-full rounded-full transition-all ${isLow ? 'bg-alert-red' : 'bg-accent'}`}
                          style={{ width: `${stockRatio}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-sm font-mono-num text-txt-secondary">{part.safetyStock}</td>
                  <td className="px-5 py-3.5 text-sm text-txt-secondary">{part.unit}</td>
                  <td className="px-5 py-3.5">
                    {isLow ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-alert-red/20 text-alert-red">
                        <AlertTriangle className="w-3 h-3" />
                        低于安全库存
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-green-500/20 text-green-400">
                        正常
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
