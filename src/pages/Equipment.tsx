import { useState, useEffect } from 'react'
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
  ListTodo,
  CheckCircle,
  Clock,
  Plus,
  Minus,
  X,
  Check,
  Settings,
} from 'lucide-react'

export default function Equipment() {
  const {
    equipment,
    maintenanceOrders,
    spareParts,
    completeMaintenance,
    checkEquipmentMaintenance,
    checkStockAndWarn,
  } = useStore()

  const [activeTab, setActiveTab] = useState<'equipment' | 'orders'>('equipment')
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null)
  const [selectedParts, setSelectedParts] = useState<{ partId: string; partName: string; quantity: number }[]>([])

  useEffect(() => {
    checkEquipmentMaintenance()
    checkStockAndWarn()
  }, [checkEquipmentMaintenance, checkStockAndWarn])

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

  const getOrderStatusText = (status: string) => {
    const map: Record<string, { text: string; cls: string }> = {
      pending: { text: '待处理', cls: 'bg-alert-yellow/20 text-alert-yellow' },
      in_progress: { text: '进行中', cls: 'bg-blue-500/20 text-blue-400' },
      completed: { text: '已完成', cls: 'bg-green-500/20 text-green-400' },
    }
    return map[status] || { text: status, cls: 'bg-gray-500/20 text-gray-400' }
  }

  const handleOpenComplete = (orderId: string) => {
    setCompletingOrderId(orderId)
    setSelectedParts([])
  }

  const handleAddPart = (part: { id: string; name: string }) => {
    const existing = selectedParts.find((p) => p.partId === part.id)
    if (existing) {
      setSelectedParts((prev) =>
        prev.map((p) => (p.partId === part.id ? { ...p, quantity: p.quantity + 1 } : p))
      )
    } else {
      setSelectedParts((prev) => [...prev, { partId: part.id, partName: part.name, quantity: 1 }])
    }
  }

  const handleChangeQty = (partId: string, delta: number) => {
    setSelectedParts((prev) =>
      prev
        .map((p) => (p.partId === partId ? { ...p, quantity: Math.max(1, p.quantity + delta) } : p))
        .filter((p) => p.quantity > 0)
    )
  }

  const handleRemovePart = (partId: string) => {
    setSelectedParts((prev) => prev.filter((p) => p.partId !== partId))
  }

  const handleCompleteOrder = (orderId: string) => {
    completeMaintenance(orderId, selectedParts)
    setCompletingOrderId(null)
    setSelectedParts([])
  }

  const pendingOrders = maintenanceOrders.filter((o) => o.status === 'pending')
  const inProgressOrders = maintenanceOrders.filter((o) => o.status === 'in_progress')
  const completedOrders = maintenanceOrders.filter((o) => o.status === 'completed')

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

      <div className="flex items-center gap-1 p-1 rounded-lg bg-primary/40 w-fit">
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${
            activeTab === 'equipment' ? 'bg-accent/20 text-accent' : 'text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <Settings className="w-4 h-4" />
          设备台账
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-md text-sm transition-all flex items-center gap-2 ${
            activeTab === 'orders' ? 'bg-accent/20 text-accent' : 'text-txt-secondary hover:text-txt-primary'
          }`}
        >
          <ListTodo className="w-4 h-4" />
          维保工单
          {pendingOrders.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-alert-red text-white rounded-full font-mono-num">
              {pendingOrders.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'equipment' && (
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
                      <span
                        className={
                          usagePercent >= 100
                            ? 'text-alert-red'
                            : usagePercent >= 80
                              ? 'text-alert-yellow'
                              : 'text-accent'
                        }
                      >
                        {eq.usageCount}
                      </span>
                      <span className="text-txt-secondary"> / {eq.maintenanceThreshold}</span>
                    </span>
                  </div>
                  <div
                    className={`h-2 rounded-full ${getProgressTrack(eq.usageCount, eq.maintenanceThreshold)}`}
                  >
                    <div
                      className={`h-full rounded-full transition-all ${getProgressColor(
                        eq.usageCount,
                        eq.maintenanceThreshold
                      )}`}
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
      )}

      {activeTab === 'orders' && (
        <div className="space-y-5">
          {['pending', 'in_progress', 'completed'].map((status) => {
            const orders = maintenanceOrders.filter((o) => o.status === status)
            if (orders.length === 0) return null
            return (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2">
                  {status === 'pending' && <Clock className="w-4 h-4 text-alert-yellow" />}
                  {status === 'in_progress' && <Wrench className="w-4 h-4 text-blue-400" />}
                  {status === 'completed' && <CheckCircle className="w-4 h-4 text-green-400" />}
                  <h3 className="text-sm font-semibold text-txt-primary">
                    {status === 'pending'
                      ? '待处理'
                      : status === 'in_progress'
                        ? '进行中'
                        : '已完成'}
                    <span className="ml-2 text-txt-secondary font-normal text-xs">({orders.length})</span>
                  </h3>
                </div>
                <div className="space-y-3">
                  {orders.map((order) => {
                    const statusInfo = getOrderStatusText(order.status)
                    const isCompleting = completingOrderId === order.id
                    return (
                      <div key={order.id} className="glass-card p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-mono-num text-sm text-accent">{order.id}</span>
                              <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${statusInfo.cls}`}>
                                {statusInfo.text}
                              </span>
                              <span className="text-[11px] text-txt-secondary">
                                {order.type === 'routine' ? '常规维保' : '维修'}
                              </span>
                            </div>
                            <p className="text-sm text-txt-primary font-medium">{order.equipmentName}</p>
                          </div>
                          <span className="text-[11px] text-txt-secondary">{order.createdAt}</span>
                        </div>

                        {order.partsUsed.length > 0 && (
                          <div className="mb-3 p-2.5 rounded-lg bg-primary/40">
                            <p className="text-[11px] text-txt-secondary mb-1.5">消耗备件：</p>
                            <div className="flex flex-wrap gap-1.5">
                              {order.partsUsed.map((p) => (
                                <span
                                  key={p.partId}
                                  className="px-2 py-0.5 bg-accent/10 text-accent rounded text-[11px]"
                                >
                                  {p.partName} × {p.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {order.status === 'pending' && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenComplete(order.id)}
                              className="flex items-center gap-1.5 px-4 py-1.5 text-xs gradient-accent text-white rounded-lg hover:opacity-90 transition-opacity"
                            >
                              <Check className="w-3.5 h-3.5" />
                              完成维保
                            </button>
                          </div>
                        )}

                        {isCompleting && (
                          <div className="mt-4 p-4 rounded-lg bg-primary/60 border border-accent/20 space-y-3">
                            <p className="text-sm font-medium text-txt-primary">选择消耗的备件</p>
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {spareParts.map((sp) => (
                                <button
                                  key={sp.id}
                                  onClick={() => handleAddPart({ id: sp.id, name: sp.name })}
                                  className="px-2.5 py-1 text-[11px] bg-accent/5 text-txt-secondary border border-accent/10 rounded hover:bg-accent/10 hover:text-accent transition-colors"
                                >
                                  + {sp.name}
                                </button>
                              ))}
                            </div>
                            {selectedParts.length > 0 && (
                              <div className="space-y-2 mb-3">
                                {selectedParts.map((p) => (
                                  <div
                                    key={p.partId}
                                    className="flex items-center justify-between p-2 rounded bg-primary/40"
                                  >
                                    <span className="text-xs text-txt-primary">{p.partName}</span>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleChangeQty(p.partId, -1)}
                                        className="w-5 h-5 flex items-center justify-center rounded bg-accent/10 text-accent hover:bg-accent/20"
                                      >
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="text-xs font-mono-num text-txt-primary w-6 text-center">
                                        {p.quantity}
                                      </span>
                                      <button
                                        onClick={() => handleChangeQty(p.partId, 1)}
                                        className="w-5 h-5 flex items-center justify-center rounded bg-accent/10 text-accent hover:bg-accent/20"
                                      >
                                        <Plus className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleRemovePart(p.partId)}
                                        className="ml-2 w-5 h-5 flex items-center justify-center rounded text-alert-red hover:bg-alert-red/10"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => {
                                  setCompletingOrderId(null)
                                  setSelectedParts([])
                                }}
                                className="px-3 py-1.5 text-xs text-txt-secondary border border-accent/10 rounded hover:text-txt-primary transition-colors"
                              >
                                取消
                              </button>
                              <button
                                onClick={() => handleCompleteOrder(order.id)}
                                className="px-3 py-1.5 text-xs gradient-accent text-white rounded hover:opacity-90 transition-opacity"
                              >
                                确认完成
                              </button>
                            </div>
                          </div>
                        )}

                        {order.completedAt && (
                          <div className="text-[11px] text-txt-secondary">
                            完成时间：{order.completedAt}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {maintenanceOrders.length === 0 && (
            <div className="glass-card p-12 text-center">
              <Wrench className="w-10 h-10 text-accent/30 mx-auto mb-3" />
              <p className="text-txt-secondary text-sm">暂无维保工单</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
