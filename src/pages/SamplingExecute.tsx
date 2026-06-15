import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ScanLine, Camera, MapPin, ChevronRight, ChevronLeft, Check, Upload, Pencil, X, Loader2 } from 'lucide-react'
import { useStore } from '@/store'
import { riskLevelBadge, taskStatusBadge } from '@/components/Badges'
import type { SamplingRecord } from '@/types'

type Step = 1 | 2 | 3

const PLACEHOLDER_PHOTOS = [
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20sampling%20photo%20product%20on%20table%20laboratory&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20inspection%20sample%20collection%20equipment&image_size=square',
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=food%20safety%20testing%20sample%20bag%20sealed&image_size=square',
]

export default function SamplingExecute() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const tasks = useStore((s) => s.tasks)
  const updateTask = useStore((s) => s.updateTask)
  const addSamplingRecord = useStore((s) => s.addSamplingRecord)
  const addReviewHistoryEntry = useStore((s) => s.addReviewHistoryEntry)
  const task = tasks.find((t) => t.id === id)

  const [step, setStep] = useState<Step>(1)
  const [scanConfirmed, setScanConfirmed] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [photos, setPhotos] = useState<string[]>([])
  const [gps, setGps] = useState({ lat: 39.9042, lng: 116.4074 })
  const [editingGps, setEditingGps] = useState(false)
  const [gpsInput, setGpsInput] = useState({ lat: '', lng: '' })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setGpsInput({ lat: gps.lat.toFixed(4), lng: gps.lng.toFixed(4) })
  }, [gps])

  if (!task) {
    return (
      <div className="glass-card p-12 text-center">
        <p className="text-txt-secondary">任务不存在</p>
        <button onClick={() => navigate('/sampling')} className="mt-4 text-accent text-sm hover:underline">
          返回列表
        </button>
      </div>
    )
  }

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setScanConfirmed(true)
      const now = new Date().toLocaleString('zh-CN')
      if (task) {
        if (task.status === 'needs_resampling') {
          addReviewHistoryEntry(task.id, {
            action: 'resample_start',
            operator: task.samplingPersonnel || '采样人员',
            comment: '开始补采',
          })
        }
        updateTask(task.id, { status: 'sampling', scanConfirmedAt: now })
      }
    }, 1500)
  }

  useEffect(() => {
    if (task && (task.status === 'assigned' || task.status === 'needs_resampling')) {
    }
  }, [task])

  const handleAddPhoto = () => {
    const idx = photos.length % PLACEHOLDER_PHOTOS.length
    setPhotos((prev) => [...prev, PLACEHOLDER_PHOTOS[idx]])
  }

  const handleRemovePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const handleGpsSave = () => {
    const lat = parseFloat(gpsInput.lat)
    const lng = parseFloat(gpsInput.lng)
    if (!isNaN(lat) && !isNaN(lng)) {
      setGps({ lat, lng })
    }
    setEditingGps(false)
  }

  const handleSubmit = () => {
    setSubmitting(true)
    setTimeout(() => {
      if (task) {
        const isResample = task.status === 'needs_resampling'
        const record: SamplingRecord = {
          id: `S${Date.now()}`,
          taskId: task.id,
          sampleCode: `BAR-${task.id}-${Date.now().toString().slice(-6)}`,
          photos: photos,
          gpsLocation: gps,
          sampledAt: new Date().toLocaleString('zh-CN'),
          confirmedBy: task.samplingPersonnel || '采样人员',
          isResample,
        }
        addSamplingRecord(record, isResample)
      }
      setSubmitting(false)
      navigate('/sampling')
    }, 1000)
  }

  const canProceed = () => {
    if (step === 1) return scanConfirmed
    if (step === 2) return photos.length > 0
    return true
  }

  const steps = [
    { num: 1, label: '扫码确认', icon: ScanLine },
    { num: 2, label: '现场采集', icon: Camera },
    { num: 3, label: '提交确认', icon: Check },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/sampling')} className="text-txt-secondary hover:text-accent transition-colors">
          <ChevronLeft className="w-5 h-5" />
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

      <div className="glass-card p-1 flex gap-1">
        {steps.map((s) => (
          <button
            key={s.num}
            onClick={() => { if (s.num < step || (s.num === step + 1 && canProceed())) setStep(s.num as Step) }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              step === s.num
                ? 'bg-accent/15 text-accent'
                : step > s.num
                ? 'bg-accent/5 text-accent/70'
                : 'text-txt-secondary/50'
            }`}
          >
            {step > s.num ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
            {s.label}
          </button>
        ))}
      </div>

      <div className="glass-card p-6">
        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center">
              <h3 className="text-base font-bold text-txt-primary mb-1">扫码确认采样信息</h3>
              <p className="text-xs text-txt-secondary">扫描样品条码以确认任务信息</p>
            </div>

            <div className="mx-auto w-56 h-56 relative rounded-2xl overflow-hidden bg-primary/60 border border-accent/20">
              <div className="absolute inset-0 flex items-center justify-center">
                {scanning ? (
                  <div className="w-full h-full relative">
                    <div className="absolute inset-x-4 top-1/2 h-0.5 bg-accent shadow-[0_0_8px_var(--accent-glow)] animate-bounce" />
                    <ScanLine className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 text-accent/30" />
                    <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-accent/50 rounded-tl" />
                    <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-accent/50 rounded-tr" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-accent/50 rounded-bl" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-accent/50 rounded-br" />
                  </div>
                ) : scanConfirmed ? (
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-full gradient-accent flex items-center justify-center mx-auto mb-3">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-accent text-sm font-medium">扫码成功</p>
                    <p className="text-txt-secondary text-[11px] mt-1 font-mono-num">{task.id}</p>
                  </div>
                ) : (
                  <ScanLine className="w-16 h-16 text-txt-secondary/20" />
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleScan}
                disabled={scanning || scanConfirmed}
                className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  scanConfirmed
                    ? 'bg-accent/10 text-accent/50 cursor-default'
                    : 'gradient-accent text-white hover:opacity-90'
                }`}
              >
                {scanning ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    扫描中...
                  </span>
                ) : scanConfirmed ? (
                  '已确认'
                ) : (
                  '开始扫码'
                )}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-txt-primary mb-1">现场采集</h3>
              <p className="text-xs text-txt-secondary">上传采样照片并确认GPS定位</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-txt-secondary">采样照片</span>
                <span className="text-[10px] text-txt-secondary font-mono-num">{photos.length}/6</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {photos.map((url, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-accent/10 group">
                    <img src={url} alt={`采样照片${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => handleRemovePhoto(i)}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-alert-red/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {photos.length < 6 && (
                  <button
                    onClick={handleAddPhoto}
                    className="aspect-square rounded-lg border border-dashed border-accent/20 flex flex-col items-center justify-center text-txt-secondary/50 hover:text-accent hover:border-accent/40 transition-all"
                  >
                    <Upload className="w-5 h-5 mb-1" />
                    <span className="text-[10px]">添加照片</span>
                  </button>
                )}
              </div>
            </div>

            <div className="glass-card p-4 bg-primary/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs text-txt-secondary">
                  <MapPin className="w-3.5 h-3.5 text-accent" />
                  GPS定位
                </div>
                <button
                  onClick={() => setEditingGps(!editingGps)}
                  className="text-[10px] text-accent hover:text-accent-light flex items-center gap-1"
                >
                  <Pencil className="w-3 h-3" />
                  {editingGps ? '取消' : '手动调整'}
                </button>
              </div>
              {editingGps ? (
                <div className="flex items-center gap-2 mt-2">
                  <input
                    value={gpsInput.lat}
                    onChange={(e) => setGpsInput((p) => ({ ...p, lat: e.target.value }))}
                    className="flex-1 px-2 py-1 text-xs bg-primary/60 border border-accent/10 rounded text-txt-primary font-mono-num focus:outline-none focus:border-accent/40"
                    placeholder="纬度"
                  />
                  <input
                    value={gpsInput.lng}
                    onChange={(e) => setGpsInput((p) => ({ ...p, lng: e.target.value }))}
                    className="flex-1 px-2 py-1 text-xs bg-primary/60 border border-accent/10 rounded text-txt-primary font-mono-num focus:outline-none focus:border-accent/40"
                    placeholder="经度"
                  />
                  <button onClick={handleGpsSave} className="px-3 py-1 text-xs gradient-accent text-white rounded">
                    保存
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-4 text-xs font-mono-num">
                  <span className="text-txt-primary">
                    纬度 <span className="text-accent">{gps.lat.toFixed(4)}</span>
                  </span>
                  <span className="text-txt-primary">
                    经度 <span className="text-accent">{gps.lng.toFixed(4)}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="text-center">
              <h3 className="text-base font-bold text-txt-primary mb-1">确认提交</h3>
              <p className="text-xs text-txt-secondary">请核实以下采样信息后提交</p>
            </div>

            <div className="space-y-3">
              <div className="glass-card p-3 bg-primary/40 flex items-center justify-between">
                <span className="text-xs text-txt-secondary">产品名称</span>
                <span className="text-xs text-txt-primary font-medium">{task.productName}</span>
              </div>
              <div className="glass-card p-3 bg-primary/40 flex items-center justify-between">
                <span className="text-xs text-txt-secondary">任务编号</span>
                <span className="text-xs text-txt-primary font-mono-num">{task.id}</span>
              </div>
              <div className="glass-card p-3 bg-primary/40 flex items-center justify-between">
                <span className="text-xs text-txt-secondary">采样区域</span>
                <span className="text-xs text-txt-primary">{task.region}</span>
              </div>
              <div className="glass-card p-3 bg-primary/40 flex items-center justify-between">
                <span className="text-xs text-txt-secondary">采样照片</span>
                <span className="text-xs text-accent font-mono-num">{photos.length} 张</span>
              </div>
              <div className="glass-card p-3 bg-primary/40 flex items-center justify-between">
                <span className="text-xs text-txt-secondary">GPS定位</span>
                <span className="text-xs text-txt-primary font-mono-num">
                  {gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}
                </span>
              </div>
              <div className="glass-card p-3 bg-primary/40 flex items-center justify-between">
                <span className="text-xs text-txt-secondary">样本数量</span>
                <span className="text-xs text-txt-primary font-mono-num">
                  {task.requiredSampleCount} 份
                </span>
              </div>
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-8 py-2.5 gradient-accent text-white rounded-lg text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    提交中...
                  </span>
                ) : (
                  '确认提交'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1) as Step)}
          disabled={step === 1}
          className="flex items-center gap-1 px-4 py-2 text-sm text-txt-secondary hover:text-txt-primary disabled:opacity-30 disabled:cursor-default transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          上一步
        </button>
        <button
          onClick={() => setStep((s) => Math.min(3, s + 1) as Step)}
          disabled={step === 3 || !canProceed()}
          className="flex items-center gap-1 px-4 py-2 text-sm text-accent hover:text-accent-light disabled:opacity-30 disabled:cursor-default transition-all"
        >
          下一步
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
