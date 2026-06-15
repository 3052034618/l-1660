import { create } from 'zustand'
import type {
  InspectionTask,
  SamplingRecord,
  TestResult,
  DisposalOrder,
  MonthlyPlan,
  Equipment,
  MaintenanceOrder,
  SparePart,
  Alert,
  SamplingPoint,
} from '@/types'
import {
  mockTasks,
  mockSamplingRecords,
  mockTestResults,
  mockDisposalOrders,
  mockMonthlyPlan,
  mockEquipment,
  mockMaintenanceOrders,
  mockSpareParts,
  mockAlerts,
  mockSamplingPoints,
  personnel,
  agencies,
} from '@/data/mockData'

interface AppState {
  tasks: InspectionTask[]
  samplingRecords: SamplingRecord[]
  testResults: TestResult[]
  disposalOrders: DisposalOrder[]
  monthlyPlan: MonthlyPlan
  equipment: Equipment[]
  maintenanceOrders: MaintenanceOrder[]
  spareParts: SparePart[]
  alerts: Alert[]
  samplingPoints: SamplingPoint[]

  addTask: (task: InspectionTask) => void
  updateTask: (id: string, updates: Partial<InspectionTask>) => void
  assignTask: (id: string, personnel: string, agency: string) => void
  addSamplingRecord: (record: SamplingRecord) => void
  reviewTask: (taskId: string, passed: boolean, reason?: string) => void
  approveDisposal: (orderId: string, level: number, comment: string) => void
  rejectDisposal: (orderId: string, level: number, comment: string) => void
  approvePlan: (approver: string) => void
  rejectPlan: () => void
  addMaintenanceOrder: (order: MaintenanceOrder) => void
  completeMaintenance: (orderId: string, partsUsed: { partId: string; partName: string; quantity: number }[]) => void
  markAlertRead: (id: string) => void
  useSparePart: (partId: string, quantity: number) => void
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'isRead'>) => void
  checkStockAndWarn: () => void
  checkEquipmentMaintenance: () => void
}

let alertIdSeq = 100
let maintenanceIdSeq = 100

export const useStore = create<AppState>((set, get) => ({
  tasks: mockTasks,
  samplingRecords: mockSamplingRecords,
  testResults: mockTestResults,
  disposalOrders: mockDisposalOrders,
  monthlyPlan: mockMonthlyPlan,
  equipment: mockEquipment,
  maintenanceOrders: mockMaintenanceOrders,
  spareParts: mockSpareParts,
  alerts: mockAlerts,
  samplingPoints: mockSamplingPoints,

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),

  assignTask: (id, person, agency) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id
          ? { ...t, samplingPersonnel: person, testingAgency: agency, status: 'assigned' as const }
          : t
      ),
    })),

  addSamplingRecord: (record) =>
    set((state) => ({
      samplingRecords: [...state.samplingRecords, record],
    })),

  reviewTask: (taskId, passed, reason) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: passed ? ('testing' as const) : ('rejected' as const),
              description: reason ? `${t.description} | 审核意见: ${reason}` : t.description,
              rejectReason: passed ? undefined : reason,
            }
          : t
      ),
    })),

  approveDisposal: (orderId, level, comment) =>
    set((state) => ({
      disposalOrders: state.disposalOrders.map((o) => {
        if (o.id !== orderId) return o
        const chain = o.approvalChain.map((n) =>
          n.level === level
            ? { ...n, status: 'approved' as const, comment, timestamp: new Date().toLocaleString('zh-CN') }
            : n
        )
        const allApproved = chain.every((n) => n.status === 'approved')
        return { ...o, approvalChain: chain, status: allApproved ? ('approved' as const) : o.status }
      }),
    })),

  rejectDisposal: (orderId, level, comment) =>
    set((state) => ({
      disposalOrders: state.disposalOrders.map((o) => {
        if (o.id !== orderId) return o
        const chain = o.approvalChain.map((n) =>
          n.level === level
            ? { ...n, status: 'rejected' as const, comment, timestamp: new Date().toLocaleString('zh-CN') }
            : n
        )
        return { ...o, approvalChain: chain, status: 'rejected' as const }
      }),
    })),

  approvePlan: (approver) =>
    set((state) => ({
      monthlyPlan: {
        ...state.monthlyPlan,
        status: 'approved',
        approvedBy: approver,
        approvedAt: new Date().toLocaleString('zh-CN'),
      },
    })),

  rejectPlan: () =>
    set((state) => ({
      monthlyPlan: { ...state.monthlyPlan, status: 'rejected' },
    })),

  addMaintenanceOrder: (order) =>
    set((state) => ({
      maintenanceOrders: [...state.maintenanceOrders, order],
    })),

  completeMaintenance: (orderId, partsUsed) =>
    set((state) => {
      const order = state.maintenanceOrders.find((o) => o.id === orderId)
      if (!order) return state

      let newSpareParts = state.spareParts
      let newAlerts = state.alerts

      partsUsed.forEach((usage) => {
        newSpareParts = newSpareParts.map((sp) =>
          sp.id === usage.partId ? { ...sp, stock: Math.max(0, sp.stock - usage.quantity) } : sp
        )
      })

      newSpareParts.forEach((sp) => {
        if (sp.stock < sp.safetyStock) {
          const existingAlert = newAlerts.find(
            (a) => a.type === 'stock' && a.relatedId === sp.id && !a.isRead
          )
          if (!existingAlert) {
            const level = sp.stock < sp.safetyStock / 2 ? 'red' : 'orange'
            newAlerts = [
              {
                id: `AL${++alertIdSeq}`,
                type: 'stock',
                level,
                title: `${sp.name}库存不足`,
                message: `${sp.name}当前库存${sp.stock}${sp.unit}，低于安全库存${sp.safetyStock}${sp.unit}`,
                relatedId: sp.id,
                createdAt: new Date().toLocaleString('zh-CN'),
                isRead: false,
              },
              ...newAlerts,
            ]
          }
        }
      })

      return {
        maintenanceOrders: state.maintenanceOrders.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: 'completed' as const,
                completedAt: new Date().toLocaleString('zh-CN'),
                partsUsed,
              }
            : o
        ),
        equipment: state.equipment.map((eq) =>
          eq.id === order.equipmentId
            ? {
                ...eq,
                status: 'normal' as const,
                lastMaintenance: new Date().toLocaleDateString('zh-CN'),
                usageCount: 0,
              }
            : eq
        ),
        spareParts: newSpareParts,
        alerts: newAlerts,
      }
    }),

  markAlertRead: (id) =>
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a)),
    })),

  useSparePart: (partId, quantity) =>
    set((state) => ({
      spareParts: state.spareParts.map((sp) =>
        sp.id === partId ? { ...sp, stock: Math.max(0, sp.stock - quantity) } : sp
      ),
    })),

  addAlert: (alert) =>
    set((state) => ({
      alerts: [
        {
          ...alert,
          id: `AL${++alertIdSeq}`,
          createdAt: new Date().toLocaleString('zh-CN'),
          isRead: false,
        },
        ...state.alerts,
      ],
    })),

  checkStockAndWarn: () => {
    const state = get()
    const lowStockParts = state.spareParts.filter((sp) => sp.stock < sp.safetyStock)
    lowStockParts.forEach((sp) => {
      const existingAlert = state.alerts.find(
        (a) => a.type === 'stock' && a.relatedId === sp.id && !a.isRead
      )
      if (!existingAlert) {
        const level = sp.stock < sp.safetyStock / 2 ? 'red' : 'orange'
        get().addAlert({
          type: 'stock',
          level,
          title: `${sp.name}库存不足`,
          message: `${sp.name}当前库存${sp.stock}${sp.unit}，低于安全库存${sp.safetyStock}${sp.unit}`,
          relatedId: sp.id,
        })
      }
    })
  },

  checkEquipmentMaintenance: () => {
    const state = get()
    state.equipment.forEach((eq) => {
      if (eq.usageCount >= eq.maintenanceThreshold && eq.status === 'normal') {
        const existingOrder = state.maintenanceOrders.find(
          (o) => o.equipmentId === eq.id && o.status !== 'completed'
        )
        if (!existingOrder) {
          const newOrder: MaintenanceOrder = {
            id: `M${++maintenanceIdSeq}`,
            equipmentId: eq.id,
            equipmentName: eq.name,
            type: 'routine',
            status: 'pending',
            createdAt: new Date().toLocaleString('zh-CN'),
            partsUsed: [],
          }
          get().addMaintenanceOrder(newOrder)
          get().addAlert({
            type: 'maintenance',
            level: 'yellow',
            title: `${eq.name}需维保`,
            message: `${eq.name}使用次数已达${eq.usageCount}次，达到维保阈值${eq.maintenanceThreshold}次`,
            relatedId: eq.id,
          })
          set((s) => ({
            equipment: s.equipment.map((e) =>
              e.id === eq.id ? { ...e, status: 'maintenance_due' as const } : e
            ),
          }))
        }
      }
    })
  },
}))

export { personnel, agencies }
