import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client'

export default function NotificationBell() {
  const [notifs, setNotifs] = useState([])
  const [open, setOpen] = useState(false)
  const menuRef = useRef(null)
  const nav = useNavigate()

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications()
      setNotifs(data)
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000) // Poll every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuRef])

  const unreadCount = notifs.filter(n => !n.is_read).length

  const handleMarkRead = async (id = null) => {
    try {
      await api.markNotificationRead(id)
      fetchNotifs()
    } catch (e) {
      console.error(e)
    }
  }

  const getTypeStyle = (type) => {
    if (type === 'warning') return { color: '#FCD34D', icon: '⚠️' }
    if (type === 'success') return { color: 'var(--accent)', icon: '✅' }
    if (type === 'error') return { color: '#FCA5A5', icon: '❌' }
    return { color: 'var(--accent2)', icon: 'ℹ️' }
  }

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button 
        onClick={() => setOpen(!open)}
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '50%',
          width: 40, height: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative',
          transition: 'all 0.2s'
        }}
      >
        <span style={{ fontSize: 18 }}>🔔</span>
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -2,
            background: 'var(--danger)', color: 'white',
            fontSize: 10, fontWeight: 800,
            width: 18, height: 18, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--bg)'
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fade-up" style={{
          position: 'absolute', top: 52, right: 0,
          width: 360, background: 'var(--surface)',
          border: '1px solid var(--border)', borderRadius: 16,
          boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          overflow: 'hidden', zIndex: 1000
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={() => handleMarkRead()}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifs.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                Aucune notification pour le moment.
              </div>
            ) : (
              notifs.map(n => {
                const style = getTypeStyle(n.type)
                return (
                  <div key={n.id} style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border)',
                    background: n.is_read ? 'transparent' : 'rgba(255,255,255,0.02)',
                    display: 'flex', gap: 14,
                    transition: 'background 0.2s'
                  }}>
                    <div style={{ flexShrink: 0, fontSize: 16 }}>{style.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: n.is_read ? 'var(--text)' : style.color }}>{n.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleDateString()}</div>
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 8 }}>{n.message}</div>
                      {!n.is_read && (
                        <button onClick={() => handleMarkRead(n.id)} style={{ background: 'transparent', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-muted)', fontSize: 11, padding: '4px 8px', cursor: 'pointer' }}>
                          Marquer comme lu
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
          <div style={{ borderTop: '1px solid var(--border)', padding: '12px 20px', textAlign: 'center' }}>
            <button
              onClick={() => { setOpen(false); nav('/notifications') }}
              style={{ background: 'transparent', border: 'none', color: 'var(--accent)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Voir toutes les notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
