import { Link } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useStore } from '@/store'
import { ArrowLeft, MapPin, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'

function getStatusColor(qualifiedRate: number): string {
  if (qualifiedRate >= 0.9) return '#00D4AA'
  if (qualifiedRate >= 0.8) return '#F5A623'
  return '#E63946'
}

function getStatusIcon(qualifiedRate: number) {
  if (qualifiedRate >= 0.9) return CheckCircle
  if (qualifiedRate >= 0.8) return AlertTriangle
  return AlertCircle
}

export default function HeatMap() {
  const { samplingPoints } = useStore()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/statistics"
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-primary/40 hover:bg-surface-hover border border-transparent hover:border-accent/20 transition-all text-sm text-txt-secondary hover:text-accent"
          >
            <ArrowLeft className="w-4 h-4" />
            返回统计
          </Link>
          <h1 className="text-2xl font-bold text-txt-primary">采样点热力地图</h1>
        </div>
      </div>

      <div className="flex gap-6" style={{ minHeight: 520 }}>
        <div className="w-72 flex-shrink-0 glass-card p-4 overflow-y-auto" style={{ maxHeight: 520 }}>
          <h2 className="text-sm font-semibold text-txt-primary mb-3">采样点列表</h2>
          <div className="space-y-2">
            {samplingPoints.map((point) => {
              const StatusIcon = getStatusIcon(point.qualifiedRate)
              const color = getStatusColor(point.qualifiedRate)
              return (
                <div
                  key={point.id}
                  className="p-3 rounded-lg bg-primary/40 hover:bg-surface-hover border border-transparent hover:border-accent/20 transition-all"
                >
                  <div className="flex items-start gap-2">
                    <StatusIcon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color }} />
                    <div className="min-w-0">
                      <div className="text-sm text-txt-primary truncate">{point.name}</div>
                      <div className="text-xs text-txt-secondary mt-1">{point.region}</div>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-xs text-txt-secondary">
                          任务 {point.completedTasks}/{point.totalTasks}
                        </span>
                        <span className="text-xs font-mono-num" style={{ color }}>
                          {(point.qualifiedRate * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex-1 glass-card overflow-hidden" style={{ minHeight: 520 }}>
          <MapContainer
            center={[39.92, 116.38]}
            zoom={11}
            style={{ height: '100%', width: '100%', minHeight: 520 }}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {samplingPoints.map((point) => (
              <CircleMarker
                key={point.id}
                center={[point.lat, point.lng]}
                radius={Math.max(8, point.totalTasks * 2)}
                pathOptions={{
                  color: getStatusColor(point.qualifiedRate),
                  fillColor: getStatusColor(point.qualifiedRate),
                  fillOpacity: 0.5,
                  weight: 2,
                }}
              >
                <Popup>
                  <div style={{ color: '#0A1628', fontSize: 13 }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{point.name}</div>
                    <div>区域: {point.region}</div>
                    <div>任务总数: {point.totalTasks}</div>
                    <div>已完成: {point.completedTasks}</div>
                    <div>合格率: {(point.qualifiedRate * 100).toFixed(1)}%</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-6 justify-center">
          <span className="text-sm text-txt-secondary">图例:</span>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00D4AA' }} />
            <span className="text-sm text-txt-secondary">合格率 ≥ 90%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#F5A623' }} />
            <span className="text-sm text-txt-secondary">合格率 80%-90%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#E63946' }} />
            <span className="text-sm text-txt-secondary">合格率 &lt; 80%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
