import type { InspectionTask, SamplingRecord, TestResult, DisposalOrder, MonthlyPlan, Equipment, MaintenanceOrder, SparePart, Alert, SamplingPoint } from '@/types'

export const mockTasks: InspectionTask[] = [
  { id: 'T202606001', productName: '金龙鱼大豆油', productCategory: '食用油', riskLevel: 'medium', region: '朝阳区', sampleCount: 0, requiredSampleCount: 5, samplingPersonnel: '张伟', testingAgency: '北京市食品检测中心', status: 'assigned', createdAt: '2026-06-01', deadline: '2026-06-10', testItems: ['酸价', '过氧化值', '黄曲霉毒素B1', '苯并芘'], description: '朝阳区超市抽样检测' },
  { id: 'T202606002', productName: '蒙牛纯牛奶', productCategory: '乳制品', riskLevel: 'high', region: '海淀区', sampleCount: 5, requiredSampleCount: 5, samplingPersonnel: '李娜', testingAgency: '国家乳制品质量检验中心', status: 'reviewing', createdAt: '2026-06-02', deadline: '2026-06-12', testItems: ['蛋白质', '脂肪', '菌落总数', '三聚氰胺', '铅'], description: '海淀区乳制品专项抽检' },
  { id: 'T202606003', productName: '双汇王中王火腿肠', productCategory: '肉制品', riskLevel: 'high', region: '丰台区', sampleCount: 3, requiredSampleCount: 5, samplingPersonnel: '王磊', testingAgency: '北京市食品检测中心', status: 'sampling', createdAt: '2026-06-03', deadline: '2026-06-13', testItems: ['亚硝酸盐', '菌落总数', '大肠菌群', '铅', '铬'], description: '丰台区肉制品风险监测' },
  { id: 'T202606004', productName: '农夫山泉饮用水', productCategory: '饮用水', riskLevel: 'low', region: '西城区', sampleCount: 5, requiredSampleCount: 5, testingAgency: '北京市食品检测中心', status: 'testing', createdAt: '2026-06-04', deadline: '2026-06-14', testItems: ['菌落总数', '大肠菌群', '溴酸盐'], description: '西城区饮用水常规抽检' },
  { id: 'T202606005', productName: '三全速冻水饺', productCategory: '速冻食品', riskLevel: 'medium', region: '东城区', sampleCount: 5, requiredSampleCount: 5, samplingPersonnel: '赵敏', testingAgency: '国家速冻食品质量检验中心', status: 'completed', createdAt: '2026-05-28', deadline: '2026-06-07', testItems: ['菌落总数', '大肠菌群', '过氧化值', '铅'], description: '东城区速冻食品季节性抽检' },
  { id: 'T202606006', productName: '五芳斋粽子', productCategory: '节令食品', riskLevel: 'high', region: '朝阳区', sampleCount: 2, requiredSampleCount: 5, status: 'rejected', createdAt: '2026-06-05', deadline: '2026-06-15', testItems: ['菌落总数', '大肠菌群', '过氧化值', '糖精钠'], description: '端午节令食品专项抽检-样本量不足退回' },
  { id: 'T202606007', productName: '海天酱油', productCategory: '调味品', riskLevel: 'low', region: '海淀区', sampleCount: 0, requiredSampleCount: 3, status: 'pending', createdAt: '2026-06-06', deadline: '2026-06-16', testItems: ['氨基酸态氮', '菌落总数', '苯甲酸'], description: '海淀区调味品常规抽检' },
  { id: 'T202606008', productName: '伊利酸奶', productCategory: '乳制品', riskLevel: 'medium', region: '丰台区', sampleCount: 5, requiredSampleCount: 5, samplingPersonnel: '李娜', testingAgency: '国家乳制品质量检验中心', status: 'sampled', createdAt: '2026-06-05', deadline: '2026-06-15', testItems: ['蛋白质', '脂肪', '乳酸菌数', '大肠菌群'], description: '丰台区发酵乳制品抽检' },
  { id: 'T202606009', productName: '康师傅方便面', productCategory: '方便食品', riskLevel: 'low', region: '西城区', sampleCount: 5, requiredSampleCount: 5, samplingPersonnel: '张伟', testingAgency: '北京市食品检测中心', status: 'completed', createdAt: '2026-05-25', deadline: '2026-06-04', testItems: ['酸价', '过氧化值', '菌落总数'], description: '西城区方便食品常规抽检' },
  { id: 'T202606010', productName: '百事可乐', productCategory: '饮料', riskLevel: 'low', region: '东城区', sampleCount: 0, requiredSampleCount: 3, status: 'pending', createdAt: '2026-06-07', deadline: '2026-06-17', testItems: ['二氧化碳容量', '菌落总数', '糖精钠'], description: '东城区碳酸饮料抽检' },
  { id: 'T202606011', productName: '雨润冷鲜肉', productCategory: '肉制品', riskLevel: 'high', region: '朝阳区', sampleCount: 4, requiredSampleCount: 5, samplingPersonnel: '王磊', testingAgency: '北京市食品检测中心', status: 'sampling', createdAt: '2026-06-06', deadline: '2026-06-16', testItems: ['挥发性盐基氮', '菌落总数', '瘦肉精', '铅'], description: '朝阳区生鲜肉风险监测' },
  { id: 'T202606012', productName: '安井速冻丸子', productCategory: '速冻食品', riskLevel: 'medium', region: '海淀区', sampleCount: 5, requiredSampleCount: 5, samplingPersonnel: '赵敏', testingAgency: '国家速冻食品质量检验中心', status: 'reviewing', createdAt: '2026-06-04', deadline: '2026-06-14', testItems: ['菌落总数', '过氧化值', '铅', '淀粉'], description: '海淀区速冻调制食品抽检' },
]

export const mockSamplingRecords: SamplingRecord[] = [
  { id: 'S202606001', taskId: 'T202606002', sampleCode: 'BAR-20260602-001', photos: ['/photo1.jpg', '/photo2.jpg'], gpsLocation: { lat: 39.9590, lng: 116.2982 }, sampledAt: '2026-06-03 09:15:00', confirmedBy: '李娜' },
  { id: 'S202606002', taskId: 'T202606005', sampleCode: 'BAR-20260605-001', photos: ['/photo3.jpg', '/photo4.jpg'], gpsLocation: { lat: 39.9289, lng: 116.4163 }, sampledAt: '2026-06-01 10:30:00', confirmedBy: '赵敏' },
  { id: 'S202606003', taskId: 'T202606008', sampleCode: 'BAR-20260608-001', photos: ['/photo5.jpg'], gpsLocation: { lat: 39.8585, lng: 116.2869 }, sampledAt: '2026-06-06 14:20:00', confirmedBy: '李娜' },
]

export const mockTestResults: TestResult[] = [
  { id: 'R202606001', taskId: 'T202606005', items: [
    { name: '菌落总数', value: 1200, standard: 100000, unit: 'CFU/g', isExceeded: false },
    { name: '大肠菌群', value: 15, standard: 100, unit: 'MPN/100g', isExceeded: false },
    { name: '过氧化值', value: 0.08, standard: 0.25, unit: 'g/100g', isExceeded: false },
    { name: '铅', value: 0.02, standard: 0.5, unit: 'mg/kg', isExceeded: false },
  ], overallResult: 'qualified', testedAt: '2026-06-03 16:00:00', testedBy: '北京市食品检测中心' },
  { id: 'R202606002', taskId: 'T202606009', items: [
    { name: '酸价', value: 1.2, standard: 1.8, unit: 'mg/g', isExceeded: false },
    { name: '过氧化值', value: 0.15, standard: 0.25, unit: 'g/100g', isExceeded: false },
    { name: '菌落总数', value: 800, standard: 100000, unit: 'CFU/g', isExceeded: false },
  ], overallResult: 'qualified', testedAt: '2026-06-02 14:30:00', testedBy: '北京市食品检测中心' },
  { id: 'R202606003', taskId: 'T202606004', items: [
    { name: '菌落总数', value: 20, standard: 100, unit: 'CFU/mL', isExceeded: false },
    { name: '大肠菌群', value: 0, standard: 0, unit: 'MPN/100mL', isExceeded: false },
    { name: '溴酸盐', value: 0.012, standard: 0.01, unit: 'mg/L', isExceeded: true, exceedMultiple: 1.2 },
  ], overallResult: 'unqualified', alertLevel: 'yellow', testedAt: '2026-06-08 11:00:00', testedBy: '北京市食品检测中心' },
  { id: 'R202606004', taskId: 'T202606002', items: [
    { name: '蛋白质', value: 2.8, standard: 2.9, unit: 'g/100g', isExceeded: false },
    { name: '脂肪', value: 3.5, standard: 3.1, unit: 'g/100g', isExceeded: false },
    { name: '菌落总数', value: 250000, standard: 100000, unit: 'CFU/mL', isExceeded: true, exceedMultiple: 2.5 },
    { name: '三聚氰胺', value: 0.01, standard: 2.5, unit: 'mg/kg', isExceeded: false },
    { name: '铅', value: 0.05, standard: 0.05, unit: 'mg/kg', isExceeded: false },
  ], overallResult: 'unqualified', alertLevel: 'orange', testedAt: '2026-06-07 09:00:00', testedBy: '国家乳制品质量检验中心' },
]

export const mockDisposalOrders: DisposalOrder[] = [
  { id: 'D202606001', taskId: 'T202606004', productName: '农夫山泉饮用水', type: 'retest', riskLevel: 'low', amount: 15000, reason: '溴酸盐超标1.2倍', status: 'pending', approvalChain: [
    { level: 1, approver: '刘科长', approverRole: '科室负责人', status: 'pending' },
  ], createdAt: '2026-06-08' },
  { id: 'D202606002', taskId: 'T202606002', productName: '蒙牛纯牛奶', type: 'recall', riskLevel: 'high', amount: 285000, reason: '菌落总数超标2.5倍，属高风险', status: 'pending', approvalChain: [
    { level: 1, approver: '刘科长', approverRole: '科室负责人', status: 'approved', comment: '同意上报', timestamp: '2026-06-07 10:30:00' },
    { level: 2, approver: '王处长', approverRole: '部门负责人', status: 'approved', comment: '同意召回方案', timestamp: '2026-06-07 14:00:00' },
    { level: 3, approver: '陈局长', approverRole: '局领导', status: 'pending' },
  ], createdAt: '2026-06-07' },
  { id: 'D202606003', taskId: 'T202606011', productName: '雨润冷鲜肉', type: 'destroy', riskLevel: 'high', amount: 45000, reason: '瘦肉精阳性，需立即销毁', status: 'completed', approvalChain: [
    { level: 1, approver: '刘科长', approverRole: '科室负责人', status: 'approved', comment: '紧急处理', timestamp: '2026-06-05 09:00:00' },
    { level: 2, approver: '王处长', approverRole: '部门负责人', status: 'approved', comment: '批准销毁', timestamp: '2026-06-05 10:30:00' },
  ], createdAt: '2026-06-05' },
]

export const mockMonthlyPlan: MonthlyPlan = {
  id: 'P202607', month: '2026年7月', totalTasks: 48, status: 'pending_approval',
  generatedAt: '2026-06-15',
  dailyTasks: [
    { day: 1, taskCount: 2, categories: ['食用油', '乳制品'] },
    { day: 2, taskCount: 1, categories: ['肉制品'] },
    { day: 3, taskCount: 3, categories: ['饮用水', '调味品', '饮料'] },
    { day: 4, taskCount: 2, categories: ['速冻食品', '乳制品'] },
    { day: 5, taskCount: 1, categories: ['肉制品'] },
    { day: 6, taskCount: 0, categories: [] },
    { day: 7, taskCount: 0, categories: [] },
    { day: 8, taskCount: 2, categories: ['食用油', '节令食品'] },
    { day: 9, taskCount: 3, categories: ['乳制品', '方便食品', '饮料'] },
    { day: 10, taskCount: 2, categories: ['肉制品', '调味品'] },
    { day: 11, taskCount: 1, categories: ['速冻食品'] },
    { day: 12, taskCount: 2, categories: ['饮用水', '乳制品'] },
    { day: 13, taskCount: 0, categories: [] },
    { day: 14, taskCount: 0, categories: [] },
    { day: 15, taskCount: 3, categories: ['食用油', '肉制品', '饮料'] },
    { day: 16, taskCount: 2, categories: ['乳制品', '调味品'] },
    { day: 17, taskCount: 2, categories: ['速冻食品', '方便食品'] },
    { day: 18, taskCount: 1, categories: ['饮用水'] },
    { day: 19, taskCount: 2, categories: ['肉制品', '节令食品'] },
    { day: 20, taskCount: 0, categories: [] },
    { day: 21, taskCount: 0, categories: [] },
    { day: 22, taskCount: 3, categories: ['乳制品', '食用油', '饮料'] },
    { day: 23, taskCount: 2, categories: ['调味品', '速冻食品'] },
    { day: 24, taskCount: 2, categories: ['肉制品', '方便食品'] },
    { day: 25, taskCount: 1, categories: ['饮用水'] },
    { day: 26, taskCount: 2, categories: ['乳制品', '节令食品'] },
    { day: 27, taskCount: 0, categories: [] },
    { day: 28, taskCount: 0, categories: [] },
    { day: 29, taskCount: 3, categories: ['食用油', '肉制品', '速冻食品'] },
    { day: 30, taskCount: 2, categories: ['饮料', '调味品'] },
    { day: 31, taskCount: 1, categories: ['乳制品'] },
  ],
  regions: ['朝阳区', '海淀区', '丰台区', '西城区', '东城区'],
  focusCategories: ['乳制品', '肉制品', '节令食品'],
}

export const mockEquipment: Equipment[] = [
  { id: 'EQ001', name: '气相色谱仪', model: 'GC-2026A', usageCount: 950, maintenanceThreshold: 1000, status: 'maintenance_due', lastMaintenance: '2026-03-15', nextMaintenance: '2026-06-15', location: '实验室A' },
  { id: 'EQ002', name: '液相色谱仪', model: 'HPLC-2600', usageCount: 720, maintenanceThreshold: 1000, status: 'normal', lastMaintenance: '2026-04-01', nextMaintenance: '2026-07-01', location: '实验室A' },
  { id: 'EQ003', name: '原子吸收分光光度计', model: 'AA-7000', usageCount: 480, maintenanceThreshold: 800, status: 'normal', lastMaintenance: '2026-05-10', nextMaintenance: '2026-08-10', location: '实验室B' },
  { id: 'EQ004', name: '紫外分光光度计', model: 'UV-2700', usageCount: 350, maintenanceThreshold: 500, status: 'normal', lastMaintenance: '2026-04-20', nextMaintenance: '2026-07-20', location: '实验室B' },
  { id: 'EQ005', name: '微生物培养箱', model: 'BSC-1000', usageCount: 1200, maintenanceThreshold: 1000, status: 'under_maintenance', lastMaintenance: '2026-01-01', nextMaintenance: '2026-06-20', location: '实验室C' },
  { id: 'EQ006', name: '快速检测仪', model: 'RD-500', usageCount: 200, maintenanceThreshold: 500, status: 'normal', lastMaintenance: '2026-05-25', nextMaintenance: '2026-08-25', location: '现场采样车' },
]

export const mockMaintenanceOrders: MaintenanceOrder[] = [
  { id: 'M202606001', equipmentId: 'EQ001', equipmentName: '气相色谱仪', type: 'routine', status: 'pending', createdAt: '2026-06-15', partsUsed: [] },
  { id: 'M202606002', equipmentId: 'EQ005', equipmentName: '微生物培养箱', type: 'repair', status: 'in_progress', createdAt: '2026-06-10', partsUsed: [
    { partId: 'SP003', partName: '密封条', quantity: 2 },
    { partId: 'SP005', partName: '温控传感器', quantity: 1 },
  ] },
]

export const mockSpareParts: SparePart[] = [
  { id: 'SP001', name: '色谱柱', stock: 8, safetyStock: 5, unit: '根', category: '色谱配件' },
  { id: 'SP002', name: '检测器灯泡', stock: 3, safetyStock: 5, unit: '个', category: '检测器配件' },
  { id: 'SP003', name: '密封条', stock: 15, safetyStock: 10, unit: '米', category: '通用配件' },
  { id: 'SP004', name: '进样针', stock: 12, safetyStock: 8, unit: '支', category: '色谱配件' },
  { id: 'SP005', name: '温控传感器', stock: 2, safetyStock: 3, unit: '个', category: '通用配件' },
  { id: 'SP006', name: '滤膜', stock: 50, safetyStock: 20, unit: '片', category: '通用配件' },
  { id: 'SP007', name: '泵密封圈', stock: 4, safetyStock: 6, unit: '个', category: '色谱配件' },
]

export const mockAlerts: Alert[] = [
  { id: 'AL001', type: 'exceedance', level: 'orange', title: '菌落总数超标', message: '蒙牛纯牛奶菌落总数超标2.5倍', relatedId: 'T202606002', createdAt: '2026-06-07 09:00:00', isRead: false },
  { id: 'AL002', type: 'exceedance', level: 'yellow', title: '溴酸盐超标', message: '农夫山泉饮用水溴酸盐超标1.2倍', relatedId: 'T202606004', createdAt: '2026-06-08 11:00:00', isRead: false },
  { id: 'AL003', type: 'stock', level: 'red', title: '检测器灯泡库存不足', message: '检测器灯泡当前库存3个，低于安全库存5个', relatedId: 'SP002', createdAt: '2026-06-09 08:00:00', isRead: false },
  { id: 'AL004', type: 'stock', level: 'orange', title: '温控传感器库存不足', message: '温控传感器当前库存2个，低于安全库存3个', relatedId: 'SP005', createdAt: '2026-06-10 09:00:00', isRead: true },
  { id: 'AL005', type: 'maintenance', level: 'yellow', title: '气相色谱仪待维保', message: '气相色谱仪使用次数已达950次，接近维保阈值1000次', relatedId: 'EQ001', createdAt: '2026-06-12 10:00:00', isRead: true },
  { id: 'AL006', type: 'exceedance', level: 'red', title: '瘦肉精阳性', message: '雨润冷鲜肉检出瘦肉精，需紧急处理', relatedId: 'T202606011', createdAt: '2026-06-05 08:00:00', isRead: true },
]

export const mockSamplingPoints: SamplingPoint[] = [
  { id: 'SP01', name: '朝阳大悦城超市', lat: 39.9219, lng: 116.4744, region: '朝阳区', totalTasks: 8, completedTasks: 6, qualifiedRate: 0.92 },
  { id: 'SP02', name: '海淀沃尔玛', lat: 39.9590, lng: 116.2982, region: '海淀区', totalTasks: 12, completedTasks: 10, qualifiedRate: 0.88 },
  { id: 'SP03', name: '丰台永辉超市', lat: 39.8585, lng: 116.2869, region: '丰台区', totalTasks: 6, completedTasks: 4, qualifiedRate: 0.75 },
  { id: 'SP04', name: '西城区华联超市', lat: 39.9120, lng: 116.3560, region: '西城区', totalTasks: 5, completedTasks: 5, qualifiedRate: 0.95 },
  { id: 'SP05', name: '东城区物美超市', lat: 39.9289, lng: 116.4163, region: '东城区', totalTasks: 7, completedTasks: 5, qualifiedRate: 0.85 },
  { id: 'SP06', name: '朝阳CBD便利店', lat: 39.9087, lng: 116.4594, region: '朝阳区', totalTasks: 4, completedTasks: 3, qualifiedRate: 0.90 },
  { id: 'SP07', name: '海淀中关村超市发', lat: 39.9812, lng: 116.3105, region: '海淀区', totalTasks: 9, completedTasks: 7, qualifiedRate: 0.82 },
  { id: 'SP08', name: '丰台方庄家乐福', lat: 39.8650, lng: 116.4300, region: '丰台区', totalTasks: 3, completedTasks: 2, qualifiedRate: 0.70 },
  { id: 'SP09', name: '西城西单商场', lat: 39.9090, lng: 116.3720, region: '西城区', totalTasks: 6, completedTasks: 6, qualifiedRate: 0.98 },
  { id: 'SP10', name: '东城王府井百货', lat: 39.9130, lng: 116.4115, region: '东城区', totalTasks: 5, completedTasks: 4, qualifiedRate: 0.87 },
]

export const personnel = ['张伟', '李娜', '王磊', '赵敏', '陈刚', '刘芳']
export const agencies = ['北京市食品检测中心', '国家乳制品质量检验中心', '国家速冻食品质量检验中心']
export const regions = ['朝阳区', '海淀区', '丰台区', '西城区', '东城区']
export const categories = ['食用油', '乳制品', '肉制品', '饮用水', '速冻食品', '节令食品', '调味品', '方便食品', '饮料']
