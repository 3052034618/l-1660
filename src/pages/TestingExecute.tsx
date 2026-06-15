import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { useStore } from '@/store'
import { taskStatusBadge, riskLevelBadge } from '@/components/Badges'
import type { TestItem } from '@/types'

const STANDARD_MAP: Record<string, { standard: number; unit: string }> = {
  '酸价': { standard: 1.8, unit: 'mg/g' },
  '过氧化值': { standard: 0.25, unit: 'g/100g' },
  '黄曲霉毒素B1': { standard: 5, unit: 'μg/kg' },
  '苯并芘': { standard: 10, unit: 'μg/kg' },
  '蛋白质': { standard: 2.9, unit: 'g/100g' },
  '脂肪': { standard: 3.1, unit: 'g/100g' },
  '菌落总数': { standard: 100000, unit: 'CFU/g' },
  '三聚氰胺': { standard: 2.5, unit: 'mg/kg' },
  '铅': { standard: 0.5, unit: 'mg/kg' },
  '亚硝酸盐': { standard: 30, unit: 'mg/kg' },
  '大肠菌群': { standard: 100, unit: 'MPN/100g' },
  '铬': { standard: 1, unit: 'mg/kg' },
  '溴酸盐': { standard: 0.01, unit: 'mg/L' },
  '乳酸菌数': { standard: 1000000, unit: 'CFU/g' },
  '氨基酸态氮': { standard: 0.4, unit: 'g/100mL' },
  '苯甲酸': { standard: 1, unit: 'g/kg' },
  '糖精钠': { standard: 0.15, unit: 'g/kg' },
  '二氧化碳容量': { standard: 3, unit: '倍' },
  '挥发性盐基氮': { standard: 15, unit: 'mg/100g' },
  '瘦肉精': { standard: 0, unit: 'μg/kg' },
  '淀粉': { standard: 10, unit: 'g/100g' },
}

export default function TestingExecute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tasks = useStore((s) => s.tasks)
  const addTestResult = useStore((s) => s.addTestResult)
  const task = tasks.find((t) => t.id === id)

  const [itemValues, setItemValues] = useState<Record<string, string>>({})
  const [testedBy, setTestedBy] = useState('北京市食品检测中心')
  const [submitting, setSubmitting] = useState(false)

  if (!task) {
    return (
      <div className="p-6 text-center text-txt-secondary">
        <p>任务不存在</p>
        <button onClick={() => navigate('/testing')} className="mt-4 text-accent text-sm hover:underline">
          返回列表
        </button>
      </div>
    )
  }

  if (task.status !== 'testing') {
    return (
      <div className="p-6 text-center text-txt-secondary">
        <p>该任务当前不处于检测中状态，无法录入结果</p>
        <button onClick={() => navigate('/testing')} className="mt-4 text-accent text-sm hover:underline">
          返回列表
        </button>
      </div>
    )
  }

  const handleValueChange = (itemName: string, value: string) => {
    setItemValues((prev) => ({ ...prev, [itemName]: value }))
  }

  const getItemConfig = (itemName: string) => {
    return STANDARD_MAP[itemName] || { standard: 100, unit: '' }
  }

  const getPreviewItems = (): TestItem[] => {
    return task.testItems.map((itemName) => {
      const config = getItemConfig(itemName)
      const value = parseFloat(itemValues[itemName] || '0')
      return {
        name: itemName,
        value: isNaN(value) ? 0 : value,
        standard: config.standard,
        unit: config.unit,
        isExceeded: !isNaN(value) && value > config.standard,
        exceedMultiple:
          !isNaN(value) && value > config.standard
            ? parseFloat((value / config.standard).toFixed(1))
            : undefined,
      }
    })
  }

  const previewItems = getPreviewItems()
  const hasExceeded = previewItems.some((i) => i.isExceeded)
  const allFilled = task.testItems.every((name) => itemValues[name] !== undefined && itemValues[name] !== '')

  const handleSubmit = () => {
    if (!allFilled) {
      alert('请填写所有检测项目的检测值')
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      addTestResult({
        taskId: task.id,
        items: previewItems.map((i) => ({
          name: i.name,
          value: i.value,
          standard: i.standard,
          unit: i.unit,
          isExceeded: i.isExceeded,
          exceedMultiple: i.exceedMultiple,
        })),
        overallResult: hasExceeded ? 'unqualified' : 'qualified',
        testedBy,
      })
      setSubmitting(false)
      navigate('/testing')
    }, 800)
  }

  const maxExceedMultiple = hasExceeded
    ? Math.max(...previewItems.filter((i) => i.exceedMultiple).map((i) => i.exceedMultiple!))
    : 0

  const getAlertLevel = () => {
    if (!hasExceeded) return null
    if (maxExceedMultiple >= 2) return { text: '红色预警', cls: 'text-alert-red' }
    if (maxExceedMultiple >= 1.2) return { text: '橙色预警', cls: 'text-alert-orange' }
    return { text: '黄色预警', cls: 'text-alert-yellow' }
  }

  const alertLevel = getAlertLevel()
  const suggestion = !alertLevel
    ? null
    : alertLevel.text === '红色预警'
    ? '建议立即下架销毁涉事产品，启动召回程序'
    : alertLevel.text === '橙色预警'
    ? '建议启动产品召回程序，排查同批次产品'
    : '建议安排复检，确认超标情况'

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/testing')} className="text-txt-secondary hover:text-accent transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-txt-primary">{task.productName}</h2>
          <div className="flex items-center gap-2 mt-0.5">
            {riskLevelBadge(task.riskLevel)}
            {taskStatusBadge(task.status)}
            <span className="text-[11px] text-txt-secondary font-mono-num">{task.id}</span>
          </div>
        </div>
      </div>

      {hasExceeded && alertLevel && (
        <div className={`rounded-xl p-4 flex items-start gap-3 border ${
          alertLevel.text === '红色预警'
            ? 'bg-alert-red/10 border-alert-red/30'
            : alertLevel.text === '橙色预警'
            ? 'bg-alert-orange/10 border-alert-orange/30'
            : 'bg-alert-yellow/10 border-alert-yellow/30'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${alertLevel.cls} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-medium ${alertLevel.cls}`}>{alertLevel.text}</span>
            </div>
            <p className="text-sm text-txt-secondary">{suggestion}</p>
          </div>
        </div>
      )}

      <div className="glass-card p-6 space-y-4">
        <div className="flex items-center gap-2 text-accent">
          <CheckCircle2 className="w-4 h-4" />
          <h2 className="text-lg font-medium">检测项目录入</h2>
        </div>

        <div className="space-y-3">
          {task.testItems.map((itemName) => {
            const config = getItemConfig(itemName)
            const value = itemValues[itemName]
            const numValue = parseFloat(value || '0')
            const isExceeded = !isNaN(numValue) && numValue > config.standard
            return (
              <div
                key={itemName}
                className={`p-4 rounded-lg border transition-colors ${
                  isExceeded
                    ? 'bg-alert-red/5 border-alert-red/30'
                    : value
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-primary/60 border-accent/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-txt-primary">{itemName}</span>
                  <span className="text-xs text-txt-secondary font-mono-num">
                    标准值：≤{config.standard} {config.unit}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    step="any"
                    value={value || ''}
                    onChange={(e) => handleValueChange(itemName, e.target.value)}
                    placeholder="请输入检测值"
                    className={`flex-1 px-3 py-2 rounded-lg bg-primary/60 border text-sm text-txt-primary focus:outline-none focus:border-accent/40 font-mono-num ${
                      isExceeded ? 'border-alert-red/40' : 'border-accent/10'
                    }`}
                  />
                  <span className="text-sm text-txt-secondary w-16">{config.unit}</span>
                  {value && (
                    isExceeded ? (
                      <span className="text-xs text-alert-red font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        超标{previewItems.find((i) => i.name === itemName)?.exceedMultiple}倍
                      </span>
                    ) : (
                      <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        合格
                      </span>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <div className="pt-4 border-t border-accent/10 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm text-txt-secondary">检测机构</label>
            <input
              type="text"
              value={testedBy}
              onChange={(e) => setTestedBy(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-primary/60 border border-accent/10 text-sm text-txt-primary focus:outline-none focus:border-accent/40"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => navigate('/testing')}
              className="px-4 py-2 rounded-lg border border-accent/20 text-txt-secondary text-sm hover:text-txt-primary transition-colors"
            >
              取消
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !allFilled}
              className="flex items-center gap-2 px-6 py-2 rounded-lg gradient-accent text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  提交中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  提交检测结果
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
