import { create } from 'zustand'
import type { InspectionTask, TestResult, DisposalOrder, MonthlyPlan, Equipment, SparePart, Alert, SamplingPoint } from '@/types'
import { mockTasks, mockTestResults, mockDisposalOrders, mockMonthlyPlan, mockEquipment, mockSpareParts, mockAlerts, mockSamplingPoints, personnel, agencies } from '@/data/mockData'

interface AppState {
  tasks: InspectionTask[]
  testResults: TestResult[]
  disposalOrders: DisposalOrder[]
  monthlyPlan: MonthlyPlan
  equipment: Equipment[]
  spareParts: SparePart[]
  alerts: Alert[]
  samplingPoints: SamplingPoint[]

  addTask: (task: InspectionTask) => void
  updateTask: (id: string, updates: Partial<InspectionTask>) => void
  assignTask: (id: string, personnel: string, agency: string) => void
  approveDisposal: (orderId: string, level: number, comment: string) => void
  rejectDisposal: (orderId: string, level: number, comment: string) => void
  approvePlan: (approver: string) => void
  rejectPlan: () => void
  completeMaintenance: (orderId: string) => void
  markAlertRead: (id: string) => void
  useSparePart: (partId: string, quantity: number) => void
  reviewTask: (taskId: string, passed: boolean, reason?: string) => void
}

export const useStore = create<AppState>((set) => ({
  tasks: mockTasks,
  testResults: mockTestResults,
  disposalOrders: mockDisposalOrders,
  monthlyPlan: mockMonthlyPlan,
  equipment: mockEquipment,
  spareParts: mockSpareParts,
  alerts: mockAlerts,
  samplingPoints: mockSamplingPoints,

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),

  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => t.id === id ? { ...t, ...updates } : t),
  })),

  assignTask: (id, person, agency) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === id ? { ...t, samplingPersonnel: person, testingAgency: agency, status: 'assigned' as const } : t
    ),
  })),

  approveDisposal: (orderId, level, comment) => set((state) => ({
    disposalOrders: state.disposalOrders.map((o) => {
      if (o.id !== orderId) return o
      const chain = o.approvalChain.map((n) =>
        n.level === level ? { ...n, status: 'approved' as const, comment, timestamp: new Date().toISOString() } : n
      )
      const allApproved = chain.every((n) => n.status === 'approved')
      return { ...o, approvalChain: chain, status: allApproved ? 'approved' as const : o.status }
    }),
  })),

  rejectDisposal: (orderId, level, comment) => set((state) => ({
    disposalOrders: state.disposalOrders.map((o) => {
      if (o.id !== orderId) return o
      const chain = o.approvalChain.map((n) =>
        n.level === level ? { ...n, status: 'rejected' as const, comment, timestamp: new Date().toISOString() } : n
      )
      return { ...o, approvalChain: chain, status: 'rejected' as const }
    }),
  })),

  approvePlan: (approver) => set((state) => ({
    monthlyPlan: { ...state.monthlyPlan, status: 'approved', approvedBy: approver, approvedAt: new Date().toISOString() },
  })),

  rejectPlan: () => set((state) => ({
    monthlyPlan: { ...state.monthlyPlan, status: 'rejected' },
  })),

  completeMaintenance: (orderId) => set((state) => ({
    equipment: state.equipment.map((eq) => {
      const order = state.disposalOrders.find((_) => false)
      return eq
    }),
  })),

  markAlertRead: (id) => set((state) => ({
    alerts: state.alerts.map((a) => a.id === id ? { ...a, isRead: true } : a),
  })),

  useSparePart: (partId, quantity) => set((state) => ({
    spareParts: state.spareParts.map((sp) =>
      sp.id === partId ? { ...sp, stock: Math.max(0, sp.stock - quantity) } : sp
    ),
  })),

  reviewTask: (taskId, passed, reason) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === taskId
        ? { ...t, status: passed ? 'testing' as const : 'rejected' as const, description: reason ? `${t.description} | 审核意见: ${reason}` : t.description }
        : t
    ),
  })),
}))

export { personnel, agencies }
