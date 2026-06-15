import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { useStore } from '@/store'
import {
  BarChart3,
  MapPin,
  FileText,
  ShieldCheck,
  AlertTriangle,
  ClipboardCheck,
  TrendingUp,
} from 'lucide-react'

const CHART_COLORS = {
  sampling: '#00D4AA',
  qualified: '#1E88E5',
  disposal: '#F5A623',
}

export default function Statistics() {
  const { tasks, testResults, disposalOrders, alerts, samplingPoints, currentMonth, setCurrentMonth } = useStore()
  const [activeTab, setActiveTab] = useState<'region' | 'category'>('region')

  const filteredTasks = useMemo(() => tasks.filter((t) => t.month === currentMonth), [tasks, currentMonth])
  const filteredTaskIds = useMemo(() => filteredTasks.map((t) => t.id), [filteredTasks])
  const filteredResults = useMemo(() => testResults.filter((r) => filteredTaskIds.includes(r.taskId)), [testResults, filteredTaskIds])
  const filteredDisposals = useMemo(() => disposalOrders.filter((d) => filteredTaskIds.includes(d.taskId)), [disposalOrders, filteredTaskIds])

  const completedTasks = filteredTasks.filter((t) => t.status === 'completed' || t.status === 'testing').length
  const samplingRate = filteredTasks.length > 0 ? completedTasks / filteredTasks.length : 0
  const qualifiedCount = filteredResults.filter((r) => r.overallResult === 'qualified').length
  const qualifiedRate = filteredResults.length > 0 ? qualifiedCount / filteredResults.length : 0
  const completedDisposals = filteredDisposals.filter((d) => d.status === 'completed').length
  const disposalRate = filteredDisposals.length > 0 ? completedDisposals / filteredDisposals.length : 0
  const alertCount = alerts.filter((a) => !a.isRead).length

  const availableMonths = useMemo(() => {
    const set = new Set(tasks.map((t) => t.month))
    return Array.from(set).sort().reverse()
  }, [tasks])

  const statCards = [
    {
      label: '采样完成率',
      value: (samplingRate * 100).toFixed(1),
      suffix: '%',
      icon: ClipboardCheck,
      gradient: 'gradient-accent',
    },
    {
      label: '合格率',
      value: (qualifiedRate * 100).toFixed(1),
      suffix: '%',
      icon: ShieldCheck,
      gradient: 'gradient-blue',
    },
    {
      label: '问题处置率',
      value: (disposalRate * 100).toFixed(1),
      suffix: '%',
      icon: TrendingUp,
      gradient: 'gradient-yellow',
    },
    {
      label: '预警数',
      value: alertCount,
      suffix: '条',
      icon: AlertTriangle,
      gradient: 'gradient-red',
    },
  ]

  const regions = useMemo(() => [...new Set(filteredTasks.map((t) => t.region))], [filteredTasks])
  const categories = useMemo(() => [...new Set(filteredTasks.map((t) => t.productCategory))], [filteredTasks])

  const chartData = useMemo(() => {
    const groups = activeTab === 'region' ? regions : categories
    return groups.map((group) => {
      const groupTasks = filteredTasks.filter(
        (t) => (activeTab === 'region' ? t.region === group : t.productCategory === group)
      )
      const taskIds = groupTasks.map((t) => t.id)
      const groupResults = filteredResults.filter((r) => taskIds.includes(r.taskId))
      const groupDisposals = filteredDisposals.filter((d) => taskIds.includes(d.taskId))

      const samplingDone = groupTasks.filter((t) => t.status === 'completed' || t.status === 'testing').length
      const qualifiedDone = groupResults.filter((r) => r.overallResult === 'qualified').length
      const disposalDone = groupDisposals.filter((d) => d.status === 'completed').length

      return {
        name: group,
        samplingRate: groupTasks.length > 0 ? samplingDone / groupTasks.length : 0,
        qualifiedRate: groupResults.length > 0 ? qualifiedDone / groupResults.length : 1,
        disposalRate: groupDisposals.length > 0 ? disposalDone / groupDisposals.length : 1,
        taskCount: groupTasks.length,
        resultCount: groupResults.length,
        disposalCount: groupDisposals.length,
      }
    })
  }, [activeTab, filteredTasks, filteredResults, filteredDisposals, regions, categories])

  const barOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(15, 43, 70, 0.95)',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      textStyle: { color: '#E8EDF2', fontSize: 12 },
      axisPointer: { type: 'shadow' as const },
      formatter: (params: any[]) => {
        const first = params[0]
        const data = chartData.find((d) => d.name === first.name)
        if (!data) return first.name
        return `
          <div style="font-weight:600;margin-bottom:6px">${first.name}</div>
          <div style="font-size:11px;line-height:1.8">
            采样完成率: <b style="color:${CHART_COLORS.sampling}">${(data.samplingRate * 100).toFixed(1)}%</b> (${data.taskCount}项)<br/>
            合格率: <b style="color:${CHART_COLORS.qualified}">${(data.qualifiedRate * 100).toFixed(1)}%</b> (${data.resultCount}份)<br/>
            问题处置率: <b style="color:${CHART_COLORS.disposal}">${(data.disposalRate * 100).toFixed(1)}%</b> (${data.disposalCount}单)
          </div>
        `
      },
    },
    legend: {
      data: ['采样完成率', '合格率', '问题处置率'],
      textStyle: { color: '#8BA3BC', fontSize: 12 },
      top: 0,
      right: 0,
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '18%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: chartData.map((d) => d.name),
      axisLabel: { color: '#8BA3BC', fontSize: 11, rotate: chartData.length > 6 ? 30 : 0 },
      axisLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.2)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      max: 1,
      axisLabel: { color: '#8BA3BC', formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.08)' } },
    },
    series: [
      {
        name: '采样完成率',
        type: 'bar' as const,
        data: chartData.map((d) => d.samplingRate),
        barWidth: '22%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: CHART_COLORS.sampling },
              { offset: 1, color: 'rgba(0, 212, 170, 0.3)' },
            ],
          },
        },
      },
      {
        name: '合格率',
        type: 'bar' as const,
        data: chartData.map((d) => d.qualifiedRate),
        barWidth: '22%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: CHART_COLORS.qualified },
              { offset: 1, color: 'rgba(30, 136, 229, 0.3)' },
            ],
          },
        },
      },
      {
        name: '问题处置率',
        type: 'bar' as const,
        data: chartData.map((d) => d.disposalRate),
        barWidth: '22%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: CHART_COLORS.disposal },
              { offset: 1, color: 'rgba(245, 166, 35, 0.3)' },
            ],
          },
        },
      },
    ],
  }

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

  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  const trendData = useMemo(() => {
    const mockQualified = [0.92, 0.88, 0.91, 0.85, 0.89, qualifiedRate]
    const mockSampling = [0.85, 0.88, 0.92, 0.87, 0.9, samplingRate]
    const mockDisposal = [0.7, 0.75, 0.82, 0.78, 0.85, disposalRate]
    return { qualified: mockQualified, sampling: mockSampling, disposal: mockDisposal }
  }, [qualifiedRate, samplingRate, disposalRate])

  const lineOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(15, 43, 70, 0.9)',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      textStyle: { color: '#E8EDF2' },
    },
    legend: {
      data: ['采样完成率', '合格率', '问题处置率'],
      textStyle: { color: '#8BA3BC' },
      top: '2%',
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: months,
      axisLabel: { color: '#8BA3BC' },
      axisLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.2)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      max: 1,
      axisLabel: { color: '#8BA3BC', formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
      splitLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.08)' } },
    },
    series: [
      {
        name: '采样完成率',
        type: 'line' as const,
        smooth: true,
        data: trendData.sampling,
        lineStyle: { color: '#00D4AA', width: 2 },
        itemStyle: { color: '#00D4AA' },
        symbolSize: 6,
      },
      {
        name: '合格率',
        type: 'line' as const,
        smooth: true,
        data: trendData.qualified,
        lineStyle: { color: '#1E88E5', width: 2 },
        itemStyle: { color: '#1E88E5' },
        symbolSize: 6,
      },
      {
        name: '问题处置率',
        type: 'line' as const,
        smooth: true,
        data: trendData.disposal,
        lineStyle: { color: '#F5A623', width: 2 },
        itemStyle: { color: '#F5A623' },
        symbolSize: 6,
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-txt-primary">统计分析</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-txt-secondary">统计月份：</span>
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
          <Link
            to="/statistics/map"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/40 hover:bg-surface-hover border border-transparent hover:border-accent/20 transition-all text-sm text-txt-secondary hover:text-accent"
          >
            <MapPin className="w-4 h-4" />
            热力地图
          </Link>
          <Link
            to="/statistics/report"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/40 hover:bg-surface-hover border border-transparent hover:border-accent/20 transition-all text-sm text-txt-secondary hover:text-accent"
          >
            <FileText className="w-4 h-4" />
            分析报告
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="glass-card glass-card-hover p-5 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-24 h-24 ${card.gradient} opacity-15 rounded-bl-full`} />
            <div className="flex items-start justify-between mb-3">
              <span className="text-sm text-txt-secondary">{card.label}</span>
              <div className={`${card.gradient} p-2 rounded-lg`}>
                <card.icon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div className="flex items-end gap-2">
              <span className="font-mono-num text-3xl font-medium text-txt-primary">
                {card.value}
              </span>
              <span className="text-sm text-txt-secondary mb-1">{card.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-txt-primary flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-accent" />
            三项指标对比分析
          </h2>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-primary/60">
            <button
              onClick={() => setActiveTab('region')}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                activeTab === 'region' ? 'bg-accent/20 text-accent' : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              按区域
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                activeTab === 'category' ? 'bg-accent/20 text-accent' : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              按产品种类
            </button>
          </div>
        </div>
        <ReactECharts option={barOption} style={{ height: 340 }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold text-txt-primary mb-4">合格率分布</h2>
          <ReactECharts option={pieOption} style={{ height: 260 }} />
        </div>

        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold text-txt-primary mb-4">月度趋势</h2>
          <ReactECharts option={lineOption} style={{ height: 260 }} />
        </div>
      </div>
    </div>
  )
}
