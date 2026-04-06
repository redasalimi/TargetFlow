import { useState, useEffect } from 'react'
import { api } from '../api/client'
import Layout from '../components/Layout'

export default function NotificationHistoryPage({ user, onLogout }) {
  const [notifs, setNotifs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifs = async () => {
    try {
      const data = await api.getNotifications()
      setNotifs(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifs()
  }, [])

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
    <Layout user={user} onLogout={onLogout}>
      <div className="fade-up" style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
          <div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              <span style={{ color: 'var(--text)' }}>Accueil</span> <span style={{ margin: '0 8px', color: 'var(--border)' }}>/</span> <span style={{ color: 'var(--accent)' }}>Notifications</span>
            </div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>Historique des notifications</h1>
            <p style={{ color: 'var(--text-muted)' }}>Toutes vos alertes, rapports et résultats d'analyse.</p>
          </div>
          {notifs.some(n => !n.is_read) && (
            <button
              onClick={() => handleMarkRead()}
              style={{
                padding: '10px 16px', borderRadius: 8, background: 'var(--surface2)',
                border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13,
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              ✓ Tout marquer comme lu
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
             {[1,2,3,4].map(i => (
               <div key={i} style={{ height: 80, borderRadius: 12, background: 'var(--surface2)', animation: 'shimmer 1.5s infinite' }} />
             ))}
          </div>
        ) : notifs.length === 0 ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16, opacity: 0.5 }}>📭</div>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Aucune notification</div>
            <div style={{ color: 'var(--text-muted)', fontSize: 14 }}>Vous n'avez pas encore reçu de notifications.</div>
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
            {notifs.map(n => {
              const style = getTypeStyle(n.type)
              return (
                <div key={n.id} style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid var(--border)',
                  background: n.is_read ? 'transparent' : 'rgba(255,255,255,0.02)',
                  display: 'flex', gap: 16,
                  alignItems: 'flex-start'
                }}>
                  <div style={{ fontSize: 24, background: 'var(--bg)', border: '1px solid var(--border)', width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {style.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: n.is_read ? 'var(--text)' : style.color }}>{n.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(n.created_at).toLocaleString()}</div>
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 12 }}>{n.message}</div>
                    
                    {!n.is_read && (
                      <button onClick={() => handleMarkRead(n.id)} style={{
                        background: 'transparent', border: '1px solid var(--border)',
                        borderRadius: 6, color: 'var(--text)', fontSize: 12,
                        padding: '6px 12px', cursor: 'pointer', fontWeight: 600
                      }}>
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}
