import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import ReactECharts from 'echarts-for-react'
import { useStore } from '@/store'
import {
  BarChart3,
  MapPin,
  FileText,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  ClipboardCheck,
} from 'lucide-react'

const CHART_COLORS = ['#00D4AA', '#1E88E5', '#F5A623', '#FF6B35', '#E63946', '#7C4DFF']

export default function Statistics() {
  const { tasks, testResults, disposalOrders, alerts, samplingPoints } = useStore()
  const [activeTab, setActiveTab] = useState<'region' | 'category'>('region')

  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'testing').length
  const samplingRate = tasks.length > 0 ? completedTasks / tasks.length : 0
  const qualifiedCount = testResults.filter((r) => r.overallResult === 'qualified').length
  const qualifiedRate = testResults.length > 0 ? qualifiedCount / testResults.length : 0
  const completedDisposals = disposalOrders.filter((d) => d.status === 'completed').length
  const disposalRate = disposalOrders.length > 0 ? completedDisposals / disposalOrders.length : 0
  const alertCount = alerts.filter((a) => !a.isRead).length

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

  const regions = useMemo(() => [...new Set(tasks.map((t) => t.region))], [tasks])
  const categories = useMemo(() => [...new Set(tasks.map((t) => t.productCategory))], [tasks])

  const barData = useMemo(() => {
    if (activeTab === 'region') {
      return regions.map((region) => {
        const regionTasks = tasks.filter((t) => t.region === region)
        const done = regionTasks.filter((t) => t.status === 'completed' || t.status === 'testing').length
        return { name: region, rate: regionTasks.length > 0 ? done / regionTasks.length : 0 }
      })
    }
    return categories.map((cat) => {
      const catTasks = tasks.filter((t) => t.productCategory === cat)
      const done = catTasks.filter((t) => t.status === 'completed' || t.status === 'testing').length
      return { name: cat, rate: catTasks.length > 0 ? done / catTasks.length : 0 }
    })
  }, [activeTab, tasks, regions, categories])

  const barOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(15, 43, 70, 0.9)',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      textStyle: { color: '#E8EDF2' },
      formatter: (params: any) => {
        const p = params[0]
        return `${p.name}<br/>采样完成率: ${(p.value * 100).toFixed(1)}%`
      },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '12%', containLabel: true },
    xAxis: {
      type: 'category' as const,
      data: barData.map((d) => d.name),
      axisLabel: { color: '#8BA3BC', fontSize: 11, rotate: barData.length > 5 ? 30 : 0 },
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
        type: 'bar' as const,
        data: barData.map((d) => d.rate),
        barWidth: '50%',
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
          { value: testResults.length - qualifiedCount, name: '不合格', itemStyle: { color: '#E63946' } },
        ],
      },
    ],
  }

  const months = ['1月', '2月', '3月', '4月', '5月', '6月']
  const trendData = useMemo(() => {
    const mockQualified = [0.92, 0.88, 0.91, 0.85, 0.89, qualifiedRate]
    const mockTotal = [45, 52, 48, 55, 50, tasks.length]
    return { qualified: mockQualified, total: mockTotal }
  }, [qualifiedRate, tasks.length])

  const lineOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: 'rgba(15, 43, 70, 0.9)',
      borderColor: 'rgba(0, 212, 170, 0.3)',
      textStyle: { color: '#E8EDF2' },
    },
    legend: {
      data: ['合格率', '任务数'],
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
    yAxis: [
      {
        type: 'value' as const,
        position: 'left' as const,
        max: 1,
        axisLabel: { color: '#8BA3BC', formatter: (v: number) => `${(v * 100).toFixed(0)}%` },
        splitLine: { lineStyle: { color: 'rgba(0, 212, 170, 0.08)' } },
      },
      {
        type: 'value' as const,
        position: 'right' as const,
        axisLabel: { color: '#8BA3BC' },
        splitLine: { show: false },
      },
    ],
    series: [
      {
        name: '合格率',
        type: 'line' as const,
        smooth: true,
        data: trendData.qualified,
        lineStyle: { color: '#00D4AA', width: 2 },
        itemStyle: { color: '#00D4AA' },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 170, 0.3)' },
              { offset: 1, color: 'rgba(0, 212, 170, 0.02)' },
            ],
          },
        },
      },
      {
        name: '任务数',
        type: 'line' as const,
        smooth: true,
        yAxisIndex: 1,
        data: trendData.total,
        lineStyle: { color: '#1E88E5', width: 2 },
        itemStyle: { color: '#1E88E5' },
        areaStyle: {
          color: {
            type: 'linear' as const,
            x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(30, 136, 229, 0.3)' },
              { offset: 1, color: 'rgba(30, 136, 229, 0.02)' },
            ],
          },
        },
      },
    ],
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-txt-primary">统计分析</h1>
        <div className="flex items-center gap-3">
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
            采样完成率分析
          </h2>
          <div className="flex items-center gap-1 p-1 rounded-lg bg-primary/60">
            <button
              onClick={() => setActiveTab('region')}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                activeTab === 'region'
                  ? 'bg-accent/20 text-accent'
                  : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              按区域
            </button>
            <button
              onClick={() => setActiveTab('category')}
              className={`px-4 py-1.5 rounded-md text-sm transition-all ${
                activeTab === 'category'
                  ? 'bg-accent/20 text-accent'
                  : 'text-txt-secondary hover:text-txt-primary'
              }`}
            >
              按产品种类
            </button>
          </div>
        </div>
        <ReactECharts option={barOption} style={{ height: 320 }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold text-txt-primary mb-4">合格率分布</h2>
          <ReactECharts option={pieOption} style={{ height: 280 }} />
        </div>

        <div className="glass-card p-5">
          <h2 className="text-lg font-semibold text-txt-primary mb-4">月度趋势</h2>
          <ReactECharts option={lineOption} style={{ height: 280 }} />
        </div>
      </div>
    </div>
  )
}
