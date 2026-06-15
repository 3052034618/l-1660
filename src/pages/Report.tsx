import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useStore } from '@/store'
import { Printer, FileText } from 'lucide-react'

export default function Report() {
  const { tasks, testResults, disposalOrders, samplingPoints } = useStore()

  const currentMonth = new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })

  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'testing').length
  const samplingRate = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0
  const qualifiedCount = testResults.filter((r) => r.overallResult === 'qualified').length
  const qualifiedRate = testResults.length > 0 ? (qualifiedCount / testResults.length) * 100 : 0
  const completedDisposals = disposalOrders.filter((d) => d.status === 'completed').length
  const disposalRate = disposalOrders.length > 0 ? (completedDisposals / disposalOrders.length) * 100 : 0
  const unqualifiedResults = testResults.filter((r) => r.overallResult === 'unqualified')

  const regions = useMemo(() => [...new Set(tasks.map((t) => t.region))], [tasks])
  const categories = useMemo(() => [...new Set(tasks.map((t) => t.productCategory))], [tasks])

  const regionStats = useMemo(() => {
    return regions.map((region) => {
      const regionTasks = tasks.filter((t) => t.region === region)
      const regionTaskIds = regionTasks.map((t) => t.id)
      const regionResults = testResults.filter((r) => regionTaskIds.includes(r.taskId))
      const qCount = regionResults.filter((r) => r.overallResult === 'qualified').length
      return {
        region,
        taskCount: regionTasks.length,
        resultCount: regionResults.length,
        qualifiedRate: regionResults.length > 0 ? (qCount / regionResults.length) * 100 : 100,
      }
    })
  }, [regions, tasks, testResults])

  const categoryStats = useMemo(() => {
    return categories.map((cat) => {
      const catTasks = tasks.filter((t) => t.productCategory === cat)
      const catTaskIds = catTasks.map((t) => t.id)
      const catResults = testResults.filter((r) => catTaskIds.includes(r.taskId))
      const qCount = catResults.filter((r) => r.overallResult === 'qualified').length
      return {
        category: cat,
        taskCount: catTasks.length,
        resultCount: catResults.length,
        qualifiedRate: catResults.length > 0 ? (qCount / catResults.length) * 100 : 100,
      }
    })
  }, [categories, tasks, testResults])

  const barOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(15, 43, 70, 0.9)',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      textStyle: { color: '#E8EDF2' },
      formatter: (params: any) => {
        const p = params[0]
        return `${p.name}<br/>合格率: ${p.value.toFixed(1)}%`
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: regionStats.map((r) => r.region),
      axisLabel: { color: '#8BA3BC', fontSize: 11 },
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
        type: 'bar' as const,
        data: regionStats.map((r) => r.qualifiedRate),
        barWidth: '45%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: '#00D4AA' },
              { offset: 1, color: 'rgba(0, 212, 170, 0.3)' },
            ],
          },
        },
      },
    ],
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-2xl font-bold text-txt-primary">分析报告</h1>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg gradient-accent text-white text-sm hover:opacity-90 transition-opacity"
        >
          <Printer className="w-4 h-4" />
          导出PDF
        </button>
      </div>

      <div className="glass-card p-8 max-w-4xl mx-auto print-page">
        <div className="text-center mb-8 pb-6 border-b border-accent/20">
          <h2 className="text-2xl font-bold text-txt-primary mb-2">食品安全抽检月度分析报告</h2>
          <p className="text-txt-secondary">{currentMonth}</p>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="text-lg font-semibold text-accent mb-3">一、总体情况</h3>
            <div className="text-sm text-txt-secondary leading-relaxed space-y-2">
              <p>
                {currentMonth}，本市共安排抽检任务 <span className="text-txt-primary font-mono-num">{tasks.length}</span> 项，
                已完成采样及检测 <span className="text-txt-primary font-mono-num">{completedTasks}</span> 项，
                采样完成率为 <span className="text-txt-primary font-mono-num">{samplingRate.toFixed(1)}%</span>。
              </p>
              <p>
                共出具检测报告 <span className="text-txt-primary font-mono-num">{testResults.length}</span> 份，
                其中合格 <span className="text-txt-primary font-mono-num">{qualifiedCount}</span> 份，
                不合格 <span className="text-txt-primary font-mono-num">{testResults.length - qualifiedCount}</span> 份，
                总体合格率为 <span className="text-txt-primary font-mono-num">{qualifiedRate.toFixed(1)}%</span>。
              </p>
              <p>
                不合格产品涉及处置订单 <span className="text-txt-primary font-mono-num">{disposalOrders.length}</span> 份，
                已完成处置 <span className="text-txt-primary font-mono-num">{completedDisposals}</span> 份，
                处置率为 <span className="text-txt-primary font-mono-num">{disposalRate.toFixed(1)}%</span>。
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-accent mb-3">二、区域分析</h3>
            <div className="text-sm text-txt-secondary leading-relaxed space-y-2">
              <p>
                本次抽检覆盖 <span className="text-txt-primary font-mono-num">{regions.length}</span> 个区域，
                各区域任务完成情况如下：
              </p>
              {regionStats.map((rs) => (
                <p key={rs.region}>
                  {rs.region}：安排任务 <span className="text-txt-primary font-mono-num">{rs.taskCount}</span> 项，
                  出具报告 <span className="text-txt-primary font-mono-num">{rs.resultCount}</span> 份，
                  合格率 <span className="text-txt-primary font-mono-num">{rs.qualifiedRate.toFixed(1)}%</span>
                  {rs.qualifiedRate < 90 && (
                    <span className="text-alert-yellow">（低于90%需关注）</span>
                  )}
                  。
                </p>
              ))}
            </div>
            <div className="mt-4">
              <ReactECharts option={barOption} style={{ height: 240 }} />
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-accent mb-3">三、产品类别分析</h3>
            <div className="text-sm text-txt-secondary leading-relaxed space-y-2">
              <p>
                抽检涉及 <span className="text-txt-primary font-mono-num">{categories.length}</span> 个产品类别：
              </p>
              {categoryStats.map((cs) => (
                <p key={cs.category}>
                  {cs.category}：任务 <span className="text-txt-primary font-mono-num">{cs.taskCount}</span> 项，
                  合格率 <span className="text-txt-primary font-mono-num">{cs.qualifiedRate.toFixed(1)}%</span>。
                </p>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-accent mb-3">四、问题与建议</h3>
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
              {disposalOrders.filter((d) => d.status === 'pending').length > 0 && (
                <p>
                  仍有 <span className="text-txt-primary font-mono-num">{disposalOrders.filter((d) => d.status === 'pending').length}</span> 份
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
