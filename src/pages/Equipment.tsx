import { Link } from 'react-router-dom'
import { useStore } from '@/store'
import { equipmentStatusBadge } from '@/components/Badges'
import {
  Wrench,
  MapPin,
  CalendarDays,
  ArrowRight,
  Package,
  Gauge,
} from 'lucide-react'

export default function Equipment() {
  const { equipment } = useStore()

  const getProgressColor = (count: number, threshold: number) => {
    const ratio = count / threshold
    if (ratio >= 1) return 'bg-alert-red'
    if (ratio >= 0.8) return 'bg-alert-yellow'
    return 'bg-accent'
  }

  const getProgressTrack = (count: number, threshold: number) => {
    const ratio = count / threshold
    if (ratio >= 1) return 'bg-alert-red/20'
    if (ratio >= 0.8) return 'bg-alert-yellow/20'
    return 'bg-accent/20'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="gradient-blue p-3 rounded-xl">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-txt-primary">设备维保管理</h1>
        </div>
        <Link
          to="/equipment/spare-parts"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/15 text-accent hover:bg-accent/25 transition-colors text-sm font-medium"
        >
          <Package className="w-4 h-4" />
          备件库存
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {equipment.map((eq) => {
          const usagePercent = Math.min((eq.usageCount / eq.maintenanceThreshold) * 100, 100)
          return (
            <div key={eq.id} className="glass-card glass-card-hover p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-txt-primary">{eq.name}</h3>
                  <p className="text-xs text-txt-secondary mt-0.5">{eq.model}</p>
                </div>
                {equipmentStatusBadge(eq.status)}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-txt-secondary">
                <MapPin className="w-3.5 h-3.5" />
                <span>{eq.location}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-txt-secondary flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5" />
                    使用进度
                  </span>
                  <span className="font-mono-num">
                    <span className={usagePercent >= 100 ? 'text-alert-red' : usagePercent >= 80 ? 'text-alert-yellow' : 'text-accent'}>
                      {eq.usageCount}
                    </span>
                    <span className="text-txt-secondary"> / {eq.maintenanceThreshold}</span>
                  </span>
                </div>
                <div className={`h-2 rounded-full ${getProgressTrack(eq.usageCount, eq.maintenanceThreshold)}`}>
                  <div
                    className={`h-full rounded-full transition-all ${getProgressColor(eq.usageCount, eq.maintenanceThreshold)}`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/50">
                <div className="space-y-1">
                  <span className="text-[10px] text-txt-secondary">上次维保</span>
                  <div className="flex items-center gap-1 text-xs text-txt-primary">
                    <CalendarDays className="w-3 h-3 text-txt-secondary" />
                    {eq.lastMaintenance ?? '-'}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-txt-secondary">下次维保</span>
                  <div className="flex items-center gap-1 text-xs text-txt-primary">
                    <CalendarDays className="w-3 h-3 text-txt-secondary" />
                    {eq.nextMaintenance ?? '-'}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
