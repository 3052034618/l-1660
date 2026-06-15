export type RiskLevel = 'low' | 'medium' | 'high'
export type TaskStatus = 'pending' | 'assigned' | 'sampling' | 'sampled' | 'reviewing' | 'testing' | 'completed' | 'rejected' | 'needs_resampling'
export type AlertLevel = 'yellow' | 'orange' | 'red'
export type DisposalType = 'retest' | 'destroy' | 'recall'
export type ApprovalStatus = 'pending' | 'approved' | 'rejected'
export type PlanStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected'
export type EquipmentStatus = 'normal' | 'maintenance_due' | 'under_maintenance'
export type OverallResult = 'qualified' | 'unqualified'

export type RejectCategory = 'sample' | 'time' | 'items' | 'other'

export interface ReviewHistoryEntry {
  id: string
  action: 'submit' | 'approve' | 'reject' | 'resample_start' | 'resample_submit'
  timestamp: string
  operator: string
  comment?: string
  rejectCategories?: RejectCategory[]
  rejectReasons?: string[]
}

export interface InspectionTask {
  id: string
  productName: string
  productCategory: string
  riskLevel: RiskLevel
  region: string
  sampleCount: number
  requiredSampleCount: number
  samplingPersonnel?: string
  testingAgency?: string
  status: TaskStatus
  createdAt: string
  deadline: string
  testItems: string[]
  description: string
  rejectReason?: string
  scanConfirmedAt?: string
  month?: string
  reviewHistory?: ReviewHistoryEntry[]
}

export interface SamplingRecord {
  id: string
  taskId: string
  sampleCode: string
  photos: string[]
  gpsLocation: { lat: number; lng: number }
  sampledAt: string
  confirmedBy: string
  isResample?: boolean
}

export interface TestItem {
  name: string
  value: number
  standard: number
  unit: string
  isExceeded: boolean
  exceedMultiple?: number
}

export interface TestResult {
  id: string
  taskId: string
  items: TestItem[]
  overallResult: OverallResult
  alertLevel?: AlertLevel
  testedAt: string
  testedBy: string
}

export interface ApprovalNode {
  level: number
  approver: string
  approverRole: string
  status: ApprovalStatus
  comment?: string
  timestamp?: string
}

export interface DisposalOrder {
  id: string
  taskId: string
  productName: string
  type: DisposalType
  riskLevel: RiskLevel
  amount: number
  reason: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  approvalChain: ApprovalNode[]
  createdAt: string
  testItems?: string[]
  exceedMultiple?: number
  suggestedAction?: string
  relatedResultId?: string
}

export interface DailyTask {
  day: number
  taskCount: number
  categories: string[]
}

export interface MonthlyPlan {
  id: string
  month: string
  totalTasks: number
  status: PlanStatus
  dailyTasks: DailyTask[]
  generatedAt: string
  approvedBy?: string
  approvedAt?: string
  regions: string[]
  focusCategories: string[]
}

export interface Equipment {
  id: string
  name: string
  model: string
  usageCount: number
  maintenanceThreshold: number
  status: EquipmentStatus
  lastMaintenance?: string
  nextMaintenance?: string
  location: string
}

export interface MaintenanceOrder {
  id: string
  equipmentId: string
  equipmentName: string
  type: 'routine' | 'repair'
  status: 'pending' | 'in_progress' | 'completed'
  createdAt: string
  completedAt?: string
  partsUsed: SparePartUsage[]
}

export interface SparePart {
  id: string
  name: string
  stock: number
  safetyStock: number
  unit: string
  category: string
}

export type SparePartTransactionType = 'use' | 'restock' | 'alert_resolve'

export interface SparePartTransaction {
  id: string
  partId: string
  partName: string
  type: SparePartTransactionType
  quantity: number
  balanceAfter: number
  relatedOrderId?: string
  operator: string
  remark?: string
  createdAt: string
}

export interface SparePartUsage {
  partId: string
  partName: string
  quantity: number
}

export interface Alert {
  id: string
  type: 'exceedance' | 'stock' | 'maintenance'
  level: AlertLevel
  title: string
  message: string
  relatedId: string
  createdAt: string
  isRead: boolean
}

export interface SamplingPoint {
  id: string
  name: string
  lat: number
  lng: number
  region: string
  totalTasks: number
  completedTasks: number
  qualifiedRate: number
}
