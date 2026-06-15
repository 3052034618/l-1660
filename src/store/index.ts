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
  RejectCategory,
  ReviewHistoryEntry,
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

const STORAGE_KEY = 'food-safety-inspection-store-v1'

interface PersistedState {
  tasks: InspectionTask[]
  samplingRecords: SamplingRecord[]
  testResults: TestResult[]
  disposalOrders: DisposalOrder[]
  equipment: Equipment[]
  maintenanceOrders: MaintenanceOrder[]
  spareParts: SparePart[]
  alerts: Alert[]
  samplingPoints: SamplingPoint[]
  currentMonth: string
  alertIdSeq: number
  maintenanceIdSeq: number
  reviewHistoryIdSeq: number
}

function getDefaultMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

function loadPersisted(): Partial<PersistedState> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as PersistedState
    return parsed
  } catch {
    return null
  }
}

function persistState(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

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
  currentMonth: string

  setCurrentMonth: (month: string) => void

  addTask: (task: InspectionTask) => void
  updateTask: (id: string, updates: Partial<InspectionTask>) => void
  assignTask: (id: string, personnel: string, agency: string) => void
  addSamplingRecord: (record: SamplingRecord, isResample?: boolean) => void
  reviewTask: (
    taskId: string,
    passed: boolean,
    options?: {
      comment?: string
      categories?: RejectCategory[]
      reasons?: string[]
      operator?: string
    }
  ) => void
  approveDisposal: (orderId: string, level: number, comment: string) => void
  rejectDisposal: (orderId: string, level: number, comment: string) => void
  approvePlan: (approver: string) => void
  rejectPlan: () => void
  addMaintenanceOrder: (order: MaintenanceOrder) => void
  completeMaintenance: (
    orderId: string,
    partsUsed: { partId: string; partName: string; quantity: number }[]
  ) => boolean
  markAlertRead: (id: string) => void
  markAllAlertsRead: () => void
  useSparePart: (partId: string, quantity: number) => boolean
  addAlert: (alert: Omit<Alert, 'id' | 'createdAt' | 'isRead'>) => void
  checkStockAndWarn: () => void
  checkEquipmentMaintenance: () => void
  resetStore: () => void
}

let alertIdSeq = 100
let maintenanceIdSeq = 100
let reviewHistoryIdSeq = 1000

function enrichTasks(tasks: typeof mockTasks): InspectionTask[] {
  const defaultMonth = getDefaultMonth()
  return tasks.map((t) => ({
    ...t,
    month: (t as any).month || defaultMonth,
    reviewHistory: (t as any).reviewHistory || [],
  }))
}

const persisted = loadPersisted()
if (persisted) {
  alertIdSeq = persisted.alertIdSeq ?? 100
  maintenanceIdSeq = persisted.maintenanceIdSeq ?? 100
  reviewHistoryIdSeq = persisted.reviewHistoryIdSeq ?? 1000
}

export const useStore = create<AppState>((set, get) => ({
  tasks: persisted?.tasks ?? enrichTasks(mockTasks),
  samplingRecords: persisted?.samplingRecords ?? mockSamplingRecords,
  testResults: persisted?.testResults ?? mockTestResults,
  disposalOrders: persisted?.disposalOrders ?? mockDisposalOrders,
  monthlyPlan: mockMonthlyPlan,
  equipment: persisted?.equipment ?? mockEquipment,
  maintenanceOrders: persisted?.maintenanceOrders ?? mockMaintenanceOrders,
  spareParts: persisted?.spareParts ?? mockSpareParts,
  alerts: persisted?.alerts ?? mockAlerts,
  samplingPoints: persisted?.samplingPoints ?? mockSamplingPoints,
  currentMonth: persisted?.currentMonth ?? getDefaultMonth(),

  setCurrentMonth: (month) => {
    set({ currentMonth: month })
    persistState({
      tasks: get().tasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: get().disposalOrders,
      equipment: get().equipment,
      maintenanceOrders: get().maintenanceOrders,
      spareParts: get().spareParts,
      alerts: get().alerts,
      samplingPoints: get().samplingPoints,
      currentMonth: month,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
  },

  addTask: (task) => {
    const normalizedTask: InspectionTask = {
      ...task,
      month: task.month || task.createdAt.slice(0, 7),
      reviewHistory: task.reviewHistory || [],
    }
    const newTasks = [...get().tasks, normalizedTask]
    set({ tasks: newTasks })
    persistState({
      tasks: newTasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: get().disposalOrders,
      equipment: get().equipment,
      maintenanceOrders: get().maintenanceOrders,
      spareParts: get().spareParts,
      alerts: get().alerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
  },

  updateTask: (id, updates) => {
    const newTasks = get().tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
    set({ tasks: newTasks })
    persistState({
      tasks: newTasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: get().disposalOrders,
      equipment: get().equipment,
      maintenanceOrders: get().maintenanceOrders,
      spareParts: get().spareParts,
      alerts: get().alerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
  },

  assignTask: (id, person, agency) => {
    const newTasks = get().tasks.map((t) =>
      t.id === id
        ? { ...t, samplingPersonnel: person, testingAgency: agency, status: 'assigned' as const }
        : t
    )
    set({ tasks: newTasks })
    persistState({
      tasks: newTasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: get().disposalOrders,
      equipment: get().equipment,
      maintenanceOrders: get().maintenanceOrders,
      spareParts: get().spareParts,
      alerts: get().alerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
  },

  addSamplingRecord: (record, isResample = false) => {
    const state = get()
    const newRecords = [...state.samplingRecords, { ...record, isResample }]
    const newTasks = state.tasks.map((t) => {
      if (t.id !== record.taskId) return t
      const historyEntry: ReviewHistoryEntry = {
        id: `RH${++reviewHistoryIdSeq}`,
        action: isResample ? 'resample_submit' : 'submit',
        timestamp: new Date().toLocaleString('zh-CN'),
        operator: record.confirmedBy,
        comment: isResample ? '补采提交' : '首次采样提交',
      }
      return {
        ...t,
        status: 'reviewing' as const,
        sampleCount: t.requiredSampleCount,
        rejectReason: undefined,
        reviewHistory: [...t.reviewHistory, historyEntry],
      }
    })
    set({ samplingRecords: newRecords, tasks: newTasks })
    persistState({
      tasks: newTasks,
      samplingRecords: newRecords,
      testResults: get().testResults,
      disposalOrders: get().disposalOrders,
      equipment: get().equipment,
      maintenanceOrders: get().maintenanceOrders,
      spareParts: get().spareParts,
      alerts: get().alerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
  },

  reviewTask: (taskId, passed, options = {}) => {
    const { comment, categories, reasons, operator = '审核员' } = options
    const state = get()
    const newTasks = state.tasks.map((t) => {
      if (t.id !== taskId) return t
      const historyEntry: ReviewHistoryEntry = {
        id: `RH${++reviewHistoryIdSeq}`,
        action: passed ? 'approve' : 'reject',
        timestamp: new Date().toLocaleString('zh-CN'),
        operator,
        comment,
        rejectCategories: passed ? undefined : categories,
        rejectReasons: passed ? undefined : reasons,
      }
      if (passed) {
        return {
          ...t,
          status: 'testing' as const,
          rejectReason: undefined,
          reviewHistory: [...t.reviewHistory, historyEntry],
        }
      }
      return {
        ...t,
        status: 'needs_resampling' as const,
        rejectReason: reasons?.join('；') || comment,
        reviewHistory: [...t.reviewHistory, historyEntry],
      }
    })
    set({ tasks: newTasks })
    persistState({
      tasks: newTasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: get().disposalOrders,
      equipment: get().equipment,
      maintenanceOrders: get().maintenanceOrders,
      spareParts: get().spareParts,
      alerts: get().alerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
  },

  approveDisposal: (orderId, level, comment) => {
    const newOrders = get().disposalOrders.map((o) => {
      if (o.id !== orderId) return o
      const chain = o.approvalChain.map((n) =>
        n.level === level
          ? { ...n, status: 'approved' as const, comment, timestamp: new Date().toLocaleString('zh-CN') }
          : n
      )
      const allApproved = chain.every((n) => n.status === 'approved')
      return { ...o, approvalChain: chain, status: allApproved ? ('approved' as const) : o.status }
    })
    set({ disposalOrders: newOrders })
    persistState({
      tasks: get().tasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: newOrders,
      equipment: get().equipment,
      maintenanceOrders: get().maintenanceOrders,
      spareParts: get().spareParts,
      alerts: get().alerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
  },

  rejectDisposal: (orderId, level, comment) => {
    const newOrders = get().disposalOrders.map((o) => {
      if (o.id !== orderId) return o
      const chain = o.approvalChain.map((n) =>
        n.level === level
          ? { ...n, status: 'rejected' as const, comment, timestamp: new Date().toLocaleString('zh-CN') }
          : n
      )
      return { ...o, approvalChain: chain, status: 'rejected' as const }
    })
    set({ disposalOrders: newOrders })
    persistState({
      tasks: get().tasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: newOrders,
      equipment: get().equipment,
      maintenanceOrders: get().maintenanceOrders,
      spareParts: get().spareParts,
      alerts: get().alerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
  },

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

  addMaintenanceOrder: (order) => {
    const newOrders = [...get().maintenanceOrders, order]
    set({ maintenanceOrders: newOrders })
    persistState({
      tasks: get().tasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: get().disposalOrders,
      equipment: get().equipment,
      maintenanceOrders: newOrders,
      spareParts: get().spareParts,
      alerts: get().alerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
  },

  completeMaintenance: (orderId, partsUsed) => {
    const state = get()
    const order = state.maintenanceOrders.find((o) => o.id === orderId)
    if (!order) return false

    for (const usage of partsUsed) {
      const sp = state.spareParts.find((s) => s.id === usage.partId)
      if (!sp || sp.stock < usage.quantity) {
        return false
      }
    }

    let newSpareParts = state.spareParts
    let newAlerts = state.alerts

    partsUsed.forEach((usage) => {
      newSpareParts = newSpareParts.map((sp) =>
        sp.id === usage.partId ? { ...sp, stock: sp.stock - usage.quantity } : sp
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

    const newMaintenanceOrders = state.maintenanceOrders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            status: 'completed' as const,
            completedAt: new Date().toLocaleString('zh-CN'),
            partsUsed,
          }
        : o
    )
    const newEquipment = state.equipment.map((eq) =>
      eq.id === order.equipmentId
        ? {
            ...eq,
            status: 'normal' as const,
            lastMaintenance: new Date().toLocaleDateString('zh-CN'),
            usageCount: 0,
          }
        : eq
    )

    set({
      maintenanceOrders: newMaintenanceOrders,
      equipment: newEquipment,
      spareParts: newSpareParts,
      alerts: newAlerts,
    })
    persistState({
      tasks: get().tasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: get().disposalOrders,
      equipment: newEquipment,
      maintenanceOrders: newMaintenanceOrders,
      spareParts: newSpareParts,
      alerts: newAlerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
    return true
  },

  markAlertRead: (id) => {
    const newAlerts = get().alerts.map((a) => (a.id === id ? { ...a, isRead: true } : a))
    set({ alerts: newAlerts })
    persistState({
      tasks: get().tasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: get().disposalOrders,
      equipment: get().equipment,
      maintenanceOrders: get().maintenanceOrders,
      spareParts: get().spareParts,
      alerts: newAlerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
  },

  markAllAlertsRead: () => {
    const newAlerts = get().alerts.map((a) => ({ ...a, isRead: true }))
    set({ alerts: newAlerts })
    persistState({
      tasks: get().tasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: get().disposalOrders,
      equipment: get().equipment,
      maintenanceOrders: get().maintenanceOrders,
      spareParts: get().spareParts,
      alerts: newAlerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
  },

  useSparePart: (partId, quantity) => {
    const state = get()
    const sp = state.spareParts.find((s) => s.id === partId)
    if (!sp || sp.stock < quantity) return false
    const newSpareParts = state.spareParts.map((s) =>
      s.id === partId ? { ...s, stock: s.stock - quantity } : s
    )
    set({ spareParts: newSpareParts })
    persistState({
      tasks: get().tasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: get().disposalOrders,
      equipment: get().equipment,
      maintenanceOrders: get().maintenanceOrders,
      spareParts: newSpareParts,
      alerts: get().alerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
    return true
  },

  addAlert: (alert) => {
    const newAlerts = [
      {
        ...alert,
        id: `AL${++alertIdSeq}`,
        createdAt: new Date().toLocaleString('zh-CN'),
        isRead: false,
      },
      ...get().alerts,
    ]
    set({ alerts: newAlerts })
    persistState({
      tasks: get().tasks,
      samplingRecords: get().samplingRecords,
      testResults: get().testResults,
      disposalOrders: get().disposalOrders,
      equipment: get().equipment,
      maintenanceOrders: get().maintenanceOrders,
      spareParts: get().spareParts,
      alerts: newAlerts,
      samplingPoints: get().samplingPoints,
      currentMonth: get().currentMonth,
      alertIdSeq,
      maintenanceIdSeq,
      reviewHistoryIdSeq,
    })
  },

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
          persistState({
            tasks: get().tasks,
            samplingRecords: get().samplingRecords,
            testResults: get().testResults,
            disposalOrders: get().disposalOrders,
            equipment: get().equipment,
            maintenanceOrders: get().maintenanceOrders,
            spareParts: get().spareParts,
            alerts: get().alerts,
            samplingPoints: get().samplingPoints,
            currentMonth: get().currentMonth,
            alertIdSeq,
            maintenanceIdSeq,
            reviewHistoryIdSeq,
          })
        }
      }
    })
  },

  resetStore: () => {
    localStorage.removeItem(STORAGE_KEY)
    alertIdSeq = 100
    maintenanceIdSeq = 100
    reviewHistoryIdSeq = 1000
    set({
      tasks: enrichTasks(mockTasks),
      samplingRecords: mockSamplingRecords,
      testResults: mockTestResults,
      disposalOrders: mockDisposalOrders,
      monthlyPlan: mockMonthlyPlan,
      equipment: mockEquipment,
      maintenanceOrders: mockMaintenanceOrders,
      spareParts: mockSpareParts,
      alerts: mockAlerts,
      samplingPoints: mockSamplingPoints,
      currentMonth: getDefaultMonth(),
    })
  },
}))

export { personnel, agencies }
