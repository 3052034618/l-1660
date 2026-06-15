import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, MapPin, CheckSquare, FlaskConical, Gavel, CalendarClock, Wrench, BarChart3, Bell, Shield } from 'lucide-react'
import { useStore } from '@/store'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '工作台' },
  { path: '/tasks', icon: ClipboardList, label: '检测任务' },
  { path: '/sampling', icon: MapPin, label: '采样管理' },
  { path: '/review', icon: CheckSquare, label: '任务审核' },
  { path: '/testing', icon: FlaskConical, label: '检测管理' },
  { path: '/results', icon: FlaskConical, label: '检测结果' },
  { path: '/disposal', icon: Gavel, label: '处置审批' },
  { path: '/plan', icon: CalendarClock, label: '月度计划' },
  { path: '/equipment', icon: Wrench, label: '设备维保' },
  { path: '/statistics', icon: BarChart3, label: '统计分析' },
]

export default function Layout() {
  const location = useLocation()
  const alerts = useStore((s) => s.alerts)
  const unreadCount = alerts.filter((a) => !a.isRead).length

  return (
    <div className="flex min-h-screen bg-primary-dark">
      <aside className="w-60 bg-primary flex-shrink-0 flex flex-col border-r border-accent/10">
        <div className="h-16 flex items-center px-5 border-b border-accent/10">
          <Shield className="w-7 h-7 text-accent mr-2.5" />
          <div>
            <h1 className="text-base font-bold text-txt-primary leading-tight">食品安全抽检</h1>
            <p className="text-[10px] text-txt-secondary">管理系统 v2.0</p>
          </div>
        </div>
        <nav className="flex-1 py-3 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `sidebar-nav-item flex items-center px-5 py-2.5 text-sm ${
                  isActive ? 'active text-accent' : 'text-txt-secondary hover:text-txt-primary'
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px] mr-3 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-accent/10">
          <div className="glass-card p-3">
            <div className="flex items-center text-xs text-txt-secondary mb-2">
              <Bell className="w-3.5 h-3.5 mr-1.5" />
              预警通知
              {unreadCount > 0 && (
                <span className="ml-auto bg-alert-red text-white text-[10px] rounded-full px-1.5 py-0.5 font-mono-num">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="text-xs text-txt-secondary">当前在线</div>
            <div className="flex items-center mt-1">
              <div className="w-6 h-6 rounded-full gradient-accent flex items-center justify-center text-[10px] text-white font-bold">管</div>
              <span className="ml-2 text-xs text-txt-primary">系统管理员</span>
            </div>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">
        <header className="h-14 bg-primary/80 backdrop-blur-md border-b border-accent/10 flex items-center px-6 sticky top-0 z-10">
          <div className="flex items-center text-sm text-txt-secondary">
            <span>首页</span>
            {location.pathname !== '/' && (
              <>
                <span className="mx-2">/</span>
                <span className="text-txt-primary">
                  {navItems.find((n) => location.pathname.startsWith(n.path) && n.path !== '/')?.label || '详情'}
                </span>
              </>
            )}
          </div>
          <div className="ml-auto flex items-center gap-4">
            <div className="relative">
              <Bell className="w-[18px] h-[18px] text-txt-secondary cursor-pointer hover:text-accent transition-colors" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-alert-red rounded-full text-[9px] text-white flex items-center justify-center font-mono-num">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="text-xs text-txt-secondary">{new Date().toLocaleDateString('zh-CN')}</div>
          </div>
        </header>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
