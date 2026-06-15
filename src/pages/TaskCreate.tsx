import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, X, Send } from 'lucide-react'
import { useStore } from '@/store'
import { categories, regions } from '@/data/mockData'
import type { RiskLevel } from '@/types'

interface TaskForm {
  productName: string
  productCategory: string
  riskLevel: RiskLevel
  region: string
  requiredSampleCount: number
  deadline: string
  testItems: string[]
  description: string
}

const defaultForm: TaskForm = {
  productName: '',
  productCategory: categories[0],
  riskLevel: 'low',
  region: regions[0],
  requiredSampleCount: 5,
  deadline: '',
  testItems: [],
  description: '',
}

export default function TaskCreate() {
  const navigate = useNavigate()
  const addTask = useStore((s) => s.addTask)
  const tasks = useStore((s) => s.tasks)
  const [forms, setForms] = useState<TaskForm[]>([{ ...defaultForm }])
  const [testItemInput, setTestItemInput] = useState<Record<number, string>>({})

  const updateForm = (index: number, updates: Partial<TaskForm>) => {
    setForms((prev) => prev.map((f, i) => (i === index ? { ...f, ...updates } : f)))
  }

  const addFormRow = () => {
    setForms((prev) => [...prev, { ...defaultForm }])
  }

  const removeFormRow = (index: number) => {
    if (forms.length <= 1) return
    setForms((prev) => prev.filter((_, i) => i !== index))
  }

  const addTestItem = (index: number) => {
    const input = testItemInput[index]?.trim()
    if (!input) return
    const items = input.split(/[,，]/).map((s) => s.trim()).filter(Boolean)
    updateForm(index, { testItems: [...forms[index].testItems, ...items] })
    setTestItemInput((prev) => ({ ...prev, [index]: '' }))
  }

  const removeTestItem = (formIndex: number, itemIndex: number) => {
    updateForm(formIndex, {
      testItems: forms[formIndex].testItems.filter((_, i) => i !== itemIndex),
    })
  }

  const handleSubmit = () => {
    const maxNum = tasks.reduce((max, t) => {
      const num = parseInt(t.id.replace('T', ''), 10)
      return num > max ? num : max
    }, 0)

    forms.forEach((form, i) => {
      if (!form.productName || !form.deadline) return
      const id = `T${String(maxNum + i + 1).padStart(9, '0')}`
      addTask({
        id,
        productName: form.productName,
        productCategory: form.productCategory,
        riskLevel: form.riskLevel,
        region: form.region,
        sampleCount: 0,
        requiredSampleCount: form.requiredSampleCount,
        status: 'pending',
        createdAt: new Date().toISOString().slice(0, 10),
        deadline: form.deadline,
        testItems: form.testItems,
        description: form.description,
      })
    })

    navigate('/tasks')
  }

  const allValid = forms.every((f) => f.productName && f.deadline)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/tasks')}
          className="p-2 rounded-lg border border-[var(--border)] hover:border-[var(--accent)] text-[var(--text-secondary)] hover:text-[var(--accent)] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-bold">批量录入抽检任务</h1>
      </div>

      {forms.map((form, formIndex) => (
        <div key={formIndex} className="glass-card p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-[var(--accent)]">任务 #{formIndex + 1}</h2>
            {forms.length > 1 && (
              <button
                onClick={() => removeFormRow(formIndex)}
                className="p-1.5 rounded-lg text-[var(--alert-red)] hover:bg-[var(--alert-red)]/10 transition-colors"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm text-[var(--text-secondary)]">产品名称 *</label>
              <input
                value={form.productName}
                onChange={(e) => updateForm(formIndex, { productName: e.target.value })}
                placeholder="请输入产品名称"
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-[var(--text-secondary)]">产品类别</label>
              <select
                value={form.productCategory}
                onChange={(e) => updateForm(formIndex, { productCategory: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-[var(--text-secondary)]">风险等级</label>
              <select
                value={form.riskLevel}
                onChange={(e) => updateForm(formIndex, { riskLevel: e.target.value as RiskLevel })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="low">低风险</option>
                <option value="medium">中风险</option>
                <option value="high">高风险</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-[var(--text-secondary)]">抽检区域</label>
              <select
                value={form.region}
                onChange={(e) => updateForm(formIndex, { region: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                {regions.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-[var(--text-secondary)]">需采样数量</label>
              <input
                type="number"
                min={1}
                value={form.requiredSampleCount}
                onChange={(e) => updateForm(formIndex, { requiredSampleCount: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono-num"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm text-[var(--text-secondary)]">截止日期 *</label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => updateForm(formIndex, { deadline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)] font-mono-num"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)]">检测项目</label>
            <div className="flex gap-2">
              <input
                value={testItemInput[formIndex] || ''}
                onChange={(e) => setTestItemInput((prev) => ({ ...prev, [formIndex]: e.target.value }))}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTestItem(formIndex) } }}
                placeholder="输入检测项目，用逗号分隔，回车添加"
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)]"
              />
              <button
                onClick={() => addTestItem(formIndex)}
                className="px-3 py-2 rounded-lg border border-[var(--border)] text-[var(--accent)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/10 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
            {form.testItems.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.testItems.map((item, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[var(--accent)]/10 text-[var(--accent)] text-xs font-medium"
                  >
                    {item}
                    <button onClick={() => removeTestItem(formIndex, i)} className="hover:text-white transition-colors">
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm text-[var(--text-secondary)]">任务描述</label>
            <textarea
              value={form.description}
              onChange={(e) => updateForm(formIndex, { description: e.target.value })}
              rows={2}
              placeholder="请输入任务描述..."
              className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-secondary)] focus:outline-none focus:border-[var(--accent)] resize-none"
            />
          </div>
        </div>
      ))}

      <div className="flex items-center justify-between">
        <button
          onClick={addFormRow}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors text-sm"
        >
          <Plus size={16} />
          添加任务
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => navigate('/tasks')}
            className="px-5 py-2 rounded-lg border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--accent)] transition-colors text-sm"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!allValid}
            className="flex items-center gap-2 px-5 py-2 rounded-lg gradient-accent text-white font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={16} />
            提交录入 ({forms.length} 条)
          </button>
        </div>
      </div>
    </div>
  )
}
