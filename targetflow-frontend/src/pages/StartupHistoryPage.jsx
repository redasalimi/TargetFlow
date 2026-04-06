import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../api/client'

export default function StartupHistoryPage({ user, onLogout }) {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getStartupHistory()
      .then(res => setHistory(res))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Layout user={user} onLogout={onLogout}><div style={{ padding: 40, color: 'var(--text-muted)' }}>Chargement de l'historique...</div></Layout>

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="fade-up" style={{ maxWidth: 900, margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, marginBottom: 8 }}>Historique Startup AI</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Retrouvez toutes vos analyses de marché générées par l'intelligence artificielle.</p>
        
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: '#FCA5A5', padding: 12, borderRadius: 8, marginBottom: 20, border: '1px solid rgba(239,68,68,0.3)' }}>{error}</div>}

        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤖</div>
            <h3 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Aucun historique</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Lancez votre première analyse Startup pour voir les résultats ici.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {history.map(item => (
              <div key={item.id} style={{ background: 'var(--surface)', padding: 24, borderRadius: 20, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent2)', marginBottom: 4 }}>{item.business_type}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>📍 {item.target_city}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg)', padding: '6px 12px', borderRadius: 20, border: '1px solid var(--border)' }}>
                    {item.date}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) minmax(300px, 2fr)', gap: 24 }}>
                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Segments & Personas</h4>
                    {item.response?.personas?.map((p, idx) => (
                      <div key={idx} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 12, marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
                        <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${p.name}`} alt={p.name} style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--surface2)' }} />
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600 }}>{p.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.age} ans • {p.interest}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12 }}>Stratégies clés</h4>
                    <ul style={{ listStyle: 'none', padding: 0 }}>
                      {item.response?.strategies?.map((strat, idx) => (
                        <li key={idx} style={{ fontSize: 13, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <span style={{ color: 'var(--accent2)', marginTop: 2 }}>◆</span>
                          <span style={{ color: 'var(--text)' }}>{strat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
