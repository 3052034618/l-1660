import { useMemo, useRef, useState } from 'react'
import ReactECharts from 'echarts-for-react'
import { useStore } from '@/store'
import { Printer, FileText, Download, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function Report() {
  const { tasks, testResults, disposalOrders, samplingPoints, currentMonth, setCurrentMonth } = useStore()
  const reportRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const [year, month] = currentMonth.split('-')
  const currentMonthLabel = `${year}年${parseInt(month)}月`

  const filteredTasks = useMemo(() => tasks.filter((t) => t.month === currentMonth), [tasks, currentMonth])
  const filteredTaskIds = useMemo(() => filteredTasks.map((t) => t.id), [filteredTasks])
  const filteredResults = useMemo(() => testResults.filter((r) => filteredTaskIds.includes(r.taskId)), [testResults, filteredTaskIds])
  const filteredDisposals = useMemo(() => disposalOrders.filter((d) => filteredTaskIds.includes(d.taskId)), [disposalOrders, filteredTaskIds])

  const completedTasks = filteredTasks.filter((t) => t.status === 'completed' || t.status === 'testing').length
  const samplingRate = filteredTasks.length > 0 ? (completedTasks / filteredTasks.length) * 100 : 0
  const qualifiedCount = filteredResults.filter((r) => r.overallResult === 'qualified').length
  const qualifiedRate = filteredResults.length > 0 ? (qualifiedCount / filteredResults.length) * 100 : 0
  const completedDisposals = filteredDisposals.filter((d) => d.status === 'completed').length
  const disposalRate = filteredDisposals.length > 0 ? (completedDisposals / filteredDisposals.length) * 100 : 0
  const unqualifiedResults = filteredResults.filter((r) => r.overallResult === 'unqualified')

  const availableMonths = useMemo(() => {
    const set = new Set(tasks.map((t) => t.month))
    return Array.from(set).sort().reverse()
  }, [tasks])

  const regions = useMemo(() => [...new Set(filteredTasks.map((t) => t.region))], [filteredTasks])
  const categories = useMemo(() => [...new Set(filteredTasks.map((t) => t.productCategory))], [filteredTasks])

  const regionStats = useMemo(() => {
    return regions.map((region) => {
      const regionTasks = filteredTasks.filter((t) => t.region === region)
      const regionTaskIds = regionTasks.map((t) => t.id)
      const regionResults = filteredResults.filter((r) => regionTaskIds.includes(r.taskId))
      const regionDisposals = filteredDisposals.filter((d) => regionTaskIds.includes(d.taskId))
      const qCount = regionResults.filter((r) => r.overallResult === 'qualified').length
      const dCount = regionDisposals.filter((d) => d.status === 'completed').length
      const sCount = regionTasks.filter((t) => t.status === 'completed' || t.status === 'testing').length
      return {
        region,
        taskCount: regionTasks.length,
        resultCount: regionResults.length,
        disposalCount: regionDisposals.length,
        samplingRate: regionTasks.length > 0 ? (sCount / regionTasks.length) * 100 : 0,
        qualifiedRate: regionResults.length > 0 ? (qCount / regionResults.length) * 100 : 100,
        disposalRate: regionDisposals.length > 0 ? (dCount / regionDisposals.length) * 100 : 100,
      }
    })
  }, [regions, filteredTasks, filteredResults, filteredDisposals])

  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catTasks = filteredTasks.filter((t) => t.productCategory === cat)
      const catTaskIds = catTasks.map((t) => t.id)
      const catResults = filteredResults.filter((r) => catTaskIds.includes(r.taskId))
      const catDisposals = filteredDisposals.filter((d) => catTaskIds.includes(d.taskId))
      const qCount = catResults.filter((r) => r.overallResult === 'qualified').length
      const dCount = catDisposals.filter((d) => d.status === 'completed').length
      const sCount = catTasks.filter((t) => t.status === 'completed' || t.status === 'testing').length
      return {
        category: cat,
        taskCount: catTasks.length,
        resultCount: catResults.length,
        disposalCount: catDisposals.length,
        samplingRate: catTasks.length > 0 ? (sCount / catTasks.length) * 100 : 0,
        qualifiedRate: catResults.length > 0 ? (qCount / catResults.length) * 100 : 100,
        disposalRate: catDisposals.length > 0 ? (dCount / catDisposals.length) * 100 : 100,
      }
    })
  }, [categories, filteredTasks, filteredResults, filteredDisposals])

  const pieOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: 'rgba(15, 43, 70, 0.9)',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      textStyle: { color: '#E8EDF2' },
    },
    legend: {
      orient: 'vertical' as const,
      right: '5%',
      top: 'center',
      textStyle: { color: '#8BA3BC' },
    },
    series: [
      {
        type: 'pie' as const,
        radius: ['45%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: 'bold', color: '#E8EDF2' },
        },
        data: [
          { value: qualifiedCount, name: '合格', itemStyle: { color: '#00D4AA' } },
          { value: filteredResults.length - qualifiedCount, name: '不合格', itemStyle: { color: '#E63946' } },
        ],
      },
    ],
  }

  const regionBarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(15, 43, 70, 0.9)',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      textStyle: { color: '#E8EDF2', fontSize: 12 },
      axisPointer: { type: 'shadow' as const },
    },
    legend: {
      data: ['采样完成率', '合格率', '问题处置率'],
      textStyle: { color: '#8BA3BC', fontSize: 11 },
      top: 0,
      right: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: regionStats.map((r) => r.region),
      axisLabel: { color: '#8BA3BC', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.2)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      max: 100,
      axisLabel: { color: '#8BA3BC', formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.08)' } },
    },
    series: [
      {
        name: '采样完成率',
        type: 'bar' as const,
        data: regionStats.map((r) => r.samplingRate),
        barWidth: '22%',
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
          color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00D4AA' }, { offset: 1, color: 'rgba(0,212,170,0.3)' }] },
        },
      },
      {
        name: '合格率',
        type: 'bar' as const,
        data: regionStats.map((r) => r.qualifiedRate),
        barWidth: '22%',
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
          color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#1E88E5' }, { offset: 1, color: 'rgba(30,136,229,0.3)' }] },
        },
      },
      {
        name: '问题处置率',
        type: 'bar' as const,
        data: regionStats.map((r) => r.disposalRate),
        barWidth: '22%',
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
          color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#F5A623' }, { offset: 1, color: 'rgba(245,166,35,0.3)' }] },
        },
      },
    ],
  }

  const categoryBarOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(15, 43, 70, 0.9)',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      textStyle: { color: '#E8EDF2', fontSize: 12 },
      axisPointer: { type: 'shadow' as const },
    },
    legend: {
      data: ['采样完成率', '合格率', '问题处置率'],
      textStyle: { color: '#8BA3BC', fontSize: 11 },
      top: 0,
      right: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: categoryStats.map((c) => c.category),
      axisLabel: { color: '#8BA3BC', fontSize: 10 },
      axisLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.2)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      max: 100,
      axisLabel: { color: '#8BA3BC', formatter: '{value}%' },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.08)' } },
    },
    series: [
      {
        name: '采样完成率',
        type: 'bar' as const,
        data: categoryStats.map((c) => c.samplingRate),
        barWidth: '22%',
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
          color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#00D4AA' }, { offset: 1, color: 'rgba(0,212,170,0.3)' }] },
        },
      },
      {
        name: '合格率',
        type: 'bar' as const,
        data: categoryStats.map((c) => c.qualifiedRate),
        barWidth: '22%',
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
          color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#1E88E5' }, { offset: 1, color: 'rgba(30,136,229,0.3)' }] },
        },
      },
      {
        name: '问题处置率',
        type: 'bar' as const,
        data: categoryStats.map((c) => c.disposalRate),
        barWidth: '22%',
        itemStyle: {
          borderRadius: [3, 3, 0, 0],
          color: { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#F5A623' }, { offset: 1, color: 'rgba(245,166,35,0.3)' }] },
        },
      },
    ],
  }

  const handleExportPDF = async () => {
    if (!reportRef.current || isExporting) return
    setIsExporting(true)
    try {
      const element = reportRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0a1f33',
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      const fileName = `食品安全抽检月度分析报告_${new Date().toISOString().slice(0, 7)}.pdf`
      pdf.save(fileName)
    } catch (err) {
      console.error('PDF导出失败:', err)
      alert('PDF导出失败，请重试')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold text-txt-primary">分析报告</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-txt-secondary">报告月份：</span>
            <select
              value={currentMonth}
              onChange={(e) => setCurrentMonth(e.target.value)}
              className="px-3 py-1.5 text-sm bg-primary/60 border border-accent/10 rounded-lg text-txt-primary focus:outline-none focus:border-accent/40 font-mono-num"
            >
              {availableMonths.map((m) => {
                const [y, mo] = m.split('-')
                return (
                  <option key={m} value={m}>
                    {y}年{parseInt(mo)}月
                  </option>
                )
              })}
            </select>
          </div>
          <button
            onClick={handleExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-white text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                导出中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                导出PDF
              </>
            )}
          </button>
        </div>
      </div>

      <div ref={reportRef} className="glass-card p-8 max-w-4xl mx-auto print-page">
        <div className="text-center mb-8 pb-6 border-b border-accent/20">
          <h2 className="text-2xl font-bold text-txt-primary mb-2">食品安全抽检月度分析报告</h2>
          <p className="text-txt-secondary">{currentMonthLabel}</p>
        </div>

        <div className="space-y-8">
          <section>
            <h3 className="text-lg font-semibold text-accent mb-4">一、总体情况</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-accent/10 border border-accent/20 text-center">
                <p className="text-sm text-txt-secondary mb-1">采样完成率</p>
                <p className="font-mono-num text-2xl font-medium text-accent">{samplingRate.toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20 text-center">
                <p className="text-sm text-txt-secondary mb-1">合格率</p>
                <p className="font-mono-num text-2xl font-medium text-blue-400">{qualifiedRate.toFixed(1)}%</p>
              </div>
              <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-center">
                <p className="text-sm text-txt-secondary mb-1">问题处置率</p>
                <p className="font-mono-num text-2xl font-medium text-amber-400">{disposalRate.toFixed(1)}%</p>
              </div>
            </div>
            {filteredResults.length > 0 && (
              <div className="mb-4">
                <ReactECharts option={pieOption} style={{ height: 220 }} />
              </div>
            )}
            <div className="text-sm text-txt-secondary leading-relaxed space-y-2">
              <p>
                {currentMonthLabel}，本市共安排抽检任务 <span className="text-txt-primary font-mono-num">{filteredTasks.length}</span> 项，
                已完成采样及检测 <span className="text-txt-primary font-mono-num">{completedTasks}</span> 项，
                采样完成率为 <span className="text-txt-primary font-mono-num">{samplingRate.toFixed(1)}%</span>。
              </p>
              <p>
                共出具检测报告 <span className="text-txt-primary font-mono-num">{filteredResults.length}</span> 份，
                其中合格 <span className="text-txt-primary font-mono-num">{qualifiedCount}</span> 份，
                不合格 <span className="text-txt-primary font-mono-num">{filteredResults.length - qualifiedCount}</span> 份，
                总体合格率为 <span className="text-txt-primary font-mono-num">{qualifiedRate.toFixed(1)}%</span>。
              </p>
              <p>
                不合格产品涉及处置订单 <span className="text-txt-primary font-mono-num">{filteredDisposals.length}</span> 份，
                已完成处置 <span className="text-txt-primary font-mono-num">{completedDisposals}</span> 份，
                问题处置率为 <span className="text-txt-primary font-mono-num">{disposalRate.toFixed(1)}%</span>。
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-accent mb-4">二、区域分析</h3>
            <div className="text-sm text-txt-secondary leading-relaxed space-y-2 mb-4">
              <p>
                本次抽检覆盖 <span className="text-txt-primary font-mono-num">{regions.length}</span> 个区域，
                各区域三项指标如下：
              </p>
            </div>
            <div className="mb-4">
              <ReactECharts option={regionBarOption} style={{ height: 260 }} />
            </div>
            <div className="text-sm text-txt-secondary leading-relaxed space-y-1.5">
              {regionStats.map((rs) => (
                <p key={rs.region}>
                  {rs.region}：任务 <span className="text-txt-primary font-mono-num">{rs.taskCount}</span> 项，
                  采样完成率 <span className="text-txt-primary font-mono-num">{rs.samplingRate.toFixed(1)}%</span>，
                  合格率 <span className="text-txt-primary font-mono-num">{rs.qualifiedRate.toFixed(1)}%</span>，
                  处置率 <span className="text-txt-primary font-mono-num">{rs.disposalRate.toFixed(1)}%</span>
                </p>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-accent mb-4">三、产品类别分析</h3>
            <div className="text-sm text-txt-secondary leading-relaxed space-y-2 mb-4">
              <p>
                抽检涉及 <span className="text-txt-primary font-mono-num">{categories.length}</span> 个产品类别：
              </p>
            </div>
            <div className="mb-4">
              <ReactECharts option={categoryBarOption} style={{ height: 260 }} />
            </div>
            <div className="text-sm text-txt-secondary leading-relaxed space-y-1.5">
              {categoryStats.map((cs) => (
                <p key={cs.category}>
                  {cs.category}：任务 <span className="text-txt-primary font-mono-num">{cs.taskCount}</span> 项，
                  采样完成率 <span className="text-txt-primary font-mono-num">{cs.samplingRate.toFixed(1)}%</span>，
                  合格率 <span className="text-txt-primary font-mono-num">{cs.qualifiedRate.toFixed(1)}%</span>，
                  处置率 <span className="text-txt-primary font-mono-num">{cs.disposalRate.toFixed(1)}%</span>
                </p>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-accent mb-4">四、问题与建议</h3>
            <div className="text-sm text-txt-secondary leading-relaxed space-y-2">
              {unqualifiedResults.length > 0 && (
                <p>
                  检出不合格产品 <span className="text-txt-primary font-mono-num">{unqualifiedResults.length}</span> 批次，
                  超标项目包括：
                  {unqualifiedResults
                    .flatMap((r) => r.items.filter((i) => i.isExceeded).map((i) => i.name))
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .join('、')}
                  。
                </p>
              )}
              {samplingPoints.filter((sp) => sp.qualifiedRate < 0.8).length > 0 && (
                <p>
                  合格率低于80%的采样点有{' '}
                  <span className="text-txt-primary font-mono-num">
                    {samplingPoints.filter((sp) => sp.qualifiedRate < 0.8).length}
                  </span>{' '}
                  个，建议加强重点区域监管力度。
                </p>
              )}
              {filteredDisposals.filter((d) => d.status === 'pending').length > 0 && (
                <p>
                  仍有 <span className="text-txt-primary font-mono-num">{filteredDisposals.filter((d) => d.status === 'pending').length}</span> 份
                  处置订单待审批，建议加快处置流程。
                </p>
              )}
              <p>
                建议持续关注高风险产品类别（乳制品、肉制品）的抽检频次，
                加强对合格率较低区域的重点监管，确保食品安全风险可控。
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-accent/20 text-center">
          <p className="text-xs text-txt-secondary">
            北京市市场监督管理局 · 食品安全抽检监测处
          </p>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white !important; }
          .print\\:hidden { display: none !important; }
          .print-page {
            background: white !important;
            color: #1a1a1a !important;
            border: none !important;
            backdrop-filter: none !important;
          }
          .print-page * {
            color: #1a1a1a !important;
          }
          .print-page .text-accent {
            color: #006644 !important;
          }
          .print-page .text-txt-primary {
            color: #1a1a1a !important;
          }
          .print-page .text-txt-secondary {
            color: #555 !important;
          }
          .print-page .text-alert-yellow {
            color: #b8860b !important;
          }
          .print-page .font-mono-num {
            color: #1a1a1a !important;
            font-weight: 600;
          }
          .print-page .border-accent\\/20 {
            border-color: #ddd !important;
          }
        }
      `}</style>
    </div>
  )
}
