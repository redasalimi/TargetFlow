import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import NotificationBell from './NotificationBell'
import UserAvatar from './UserAvatar'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
     <div style={{ 
       fontSize: 28, 
       fontWeight: 900, 
       color: 'var(--accent)', 
       fontFamily: 'var(--font-display)',
       letterSpacing: '-0.05em',
       lineHeight: 1
     }}>T</div>
     <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--accent)', marginLeft: 1, marginTop: 12 }}></div>
  </div>
);

const EXPERT_NAV = [
  { path: '/app',       label: 'Accueil',     icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { path: '/expert',    label: 'Analyse CSV', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg> },
  { path: '/dashboard', label: 'Dashboard',   icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"/></svg> },
  { path: '/insights',  label: 'Insights',    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/></svg> },
  { path: '/profile',   label: 'Profil',      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> }
]

const STARTUP_NAV = [
  { path: '/app',             label: 'Accueil',         icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { path: '/startup',         label: 'Nouvelle Analyse', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> },
  { path: '/startup-history', label: 'Historique',      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg> },
  { path: '/profile',         label: 'Profil',          icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> }
]

const COMMON_NAV = [
  { path: '/app',       label: 'Accueil',     icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg> },
  { path: '/expert',    label: 'Mode Expert', icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg> },
  { path: '/startup',   label: 'Mode Startup',icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg> },
  { path: '/profile',   label: 'Profil',      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> }
]

export default function Layout({ children, user, onLogout }) {
  const loc = useLocation()
  const nav = useNavigate()
  const role = sessionStorage.getItem('tf_role')
  
  let baseNav = COMMON_NAV
  if (loc.pathname === '/expert' || loc.pathname === '/dashboard' || loc.pathname === '/insights') {
    baseNav = EXPERT_NAV
  } else if (loc.pathname.startsWith('/startup')) {
    baseNav = STARTUP_NAV
  } else if (loc.pathname === '/profile') {
    // If in profile, try to remember if we came from Expert or Startup, 
    // but for now let's just show Expert as default or a merged nav
    baseNav = EXPERT_NAV 
  }

  const items = role === 'admin' ? [...baseNav, { path: '/admin', label: 'Admin', icon: '⚙️' }] : baseNav

  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [isDark, setIsDark] = useState(true)
  const [width, setWidth] = useState(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const isMobile = width <= 768
  const isTablet = width <= 1024
  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark')
  }

  const handleLogout = () => {
    onLogout()
    nav('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar Toggle (Mobile) */}
      <div style={{
        position: 'fixed', top: 16, left: 16, zIndex: 101,
        display: isMobile ? 'block' : 'none'
      }}>
        <button 
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          style={{
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 8, width: 40, height: 40, display: 'flex', 
            alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            color: 'var(--text)'
          }}
        >
          {showMobileMenu ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar */}
      <aside style={{
        width: 'var(--sidebar-width)',
        background: 'var(--surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '28px 0',
        flexShrink: 0,
        position: 'fixed',
        top: 0, left: (isMobile && !showMobileMenu) ? '-240px' : 0, bottom: 0,
        zIndex: 100,
        boxShadow: '4px 0 24px rgba(0,0,0,0.3)',
        transition: 'left 0.3s ease, width 0.3s ease',
        overflowX: 'hidden'
      }}>
        {/* Brand/Logo */}
        <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, var(--accent), #059669)', borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,229,196,0.25)',
          }}>
            <svg style={{ width: 20, height: 20, color: '#000' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 19, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              Target<span style={{ color: 'var(--accent)' }}>Flow</span>
            </div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginTop: 2 }}>
              Consulting IA
            </div>
            <div style={{ fontSize: 8, color: 'var(--accent)', fontWeight: 800, marginTop: 4, opacity: 0.8 }}>
              v3.0.0 - AI PREDICTIVE ENGINE
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0 12px' }}>
          {items.map(item => {
            const active = loc.pathname === item.path
            return (
              <Link key={item.path} to={item.path} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 8,
                  marginBottom: 2,
                  background: active ? 'rgba(0,229,196,0.08)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--text-muted)',
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  transition: 'all 0.15s',
                  cursor: 'pointer',
                  borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
                }}>
                  <span style={{ fontSize: 16, minWidth: 20, textAlign: 'center' }}>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            )
          })}
          
          {/* Mode Switcher - Premium Toggle Style */}
          <div style={{ marginTop: 'auto', padding: '0 16px 20px' }}>
            <div style={{ 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: 12, 
              padding: '4px',
              border: '1px solid var(--border)',
            }}>
              <button 
                onClick={() => nav(loc.pathname.startsWith('/startup') ? '/expert' : '/startup')}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: 9,
                  background: 'var(--surface2)', border: '1px solid var(--border)',
                  color: 'var(--text)', fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  fontFamily: 'var(--font-display)'
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 5, background: '#1F2937' }}>
                  {loc.pathname.startsWith('/startup') ? (
                    <svg style={{ width: 14, height: 14, color: 'var(--accent3)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg>
                  ) : (
                    <svg style={{ width: 14, height: 14, color: 'var(--accent)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  )}
                </div>
                {loc.pathname.startsWith('/startup') ? 'Mode Expert' : 'Mode Startup'}
              </button>
            </div>
          </div>
        </nav>

        {/* User footer */}
        <div style={{
          padding: '24px 20px',
          borderTop: '1px solid var(--border)',
          background: 'rgba(255,255,255,0.01)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <UserAvatar name={user} size={40} />
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user || 'Utilisateur'}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize', fontWeight: 500, opacity: 0.8 }}>
                {role || 'Viewer'} · {sessionStorage.getItem('tf_plan') || 'Starter'}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 10,
            background: 'transparent',
            border: '1px solid var(--border)',
            color: 'var(--text-muted)',
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--danger)'; e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'rgba(239,68,68,0.05)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ 
        flex: 1, 
        marginLeft: 'var(--sidebar-width)', 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'margin-left 0.3s ease'
      }}>
        <header style={{ 
          padding: '24px var(--content-padding) 0', 
          display: 'flex', 
          justifyContent: 'flex-end', 
          alignItems: 'center', 
          gap: 16 
        }}>
          <button 
            onClick={toggleTheme}
            style={{ 
              background: 'var(--surface2)', border: '1px solid var(--border)', 
              borderRadius: '50%', width: 36, height: 36, display: 'flex', 
              alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              fontSize: 16
            }}
          >
            {isDark ? '🌙' : '☀️'}
          </button>
          <NotificationBell />
        </header>
        <div key={loc.pathname} className="page-transition" style={{ padding: '24px var(--content-padding)', flex: 1 }}>
          {children}
        </div>
      </main>
    </div>
  )
}
