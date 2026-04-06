import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../api/client'

export default function DashboardPage({ user, onLogout }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    setLoading(true)
    api.dashboard()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="fade-up">
        {/* Header */}
        <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', marginBottom: 6 }}>
              Tableau de Bord
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Apercu global de votre analyse client.
            </p>
          </div>
          <button 
            onClick={fetchData}
            style={{ padding: '10px 16px', borderRadius: 10, background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Rafraichir
          </button>
        </div>

        {loading && <LoadingState />}
        {error && <div style={{ color: '#EF4444', padding: 20, background: 'rgba(239,68,68,0.1)', borderRadius: 12 }}>{error}</div>}

        {data && <DashboardContent data={data} />}
      </div>
    </Layout>
  )
}

function DashboardContent({ data }) {
  // Support both flat and nested structures for robustness
  const kpiData = data.kpis || data
  const segments = data.segments || (data.kpis && data.kpis.segments) || []
  const total = segments.reduce((s, x) => s + x.total, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <KPICard 
          label="CLV Moyenne" 
          value={kpiData.avg_clv ? `${Math.round(kpiData.avg_clv).toLocaleString()} MAD` : 'N/A'} 
          color="var(--accent)"
        />
        <KPICard 
          label="Panier Moyen" 
          value={kpiData.avg_spent ? `${Math.round(kpiData.avg_spent).toLocaleString()} MAD` : 'N/A'} 
          color="#8B5CF6"
        />
        <KPICard 
          label="Total Clients" 
          value={total.toLocaleString()} 
          color="#3B82F6"
        />
        <KPICard 
          label="Analyse" 
          value={kpiData.analysis_date ? new Date(kpiData.analysis_date).toLocaleDateString() : 'Active'} 
          color="#F59E0B"
        />
      </div>

      <div style={{ background: 'var(--surface)', borderRadius: 24, border: '1px solid var(--border)', padding: 28 }}>
        <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 24 }}>Repartition des Segments</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {segments.map((seg, i) => (
            <SegmentRow key={i} segment={seg} total={total} />
          ))}
        </div>
      </div>
      
      {/* Priorities from v3.0.1 */}
      {data.priorities && (
          <div style={{ background: 'var(--surface2)', borderRadius: 24, padding: 28, border: '1px solid var(--border)' }}>
             <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, marginBottom: 20 }}>Priorites de Ciblage</h3>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                {data.priorities.slice(0,3).map((p, i) => (
                  <div key={i} style={{ background: 'var(--surface)', padding: 20, borderRadius: 16, border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 800, marginBottom: 8 }}>{p.priority}</div>
                    <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{p.segment}</div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{p.action}</div>
                  </div>
                ))}
             </div>
          </div>
      )}
    </div>
  )
}

function KPICard({ label, value, color }) {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', padding: 24 }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 12 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 900, color }}>{value}</div>
    </div>
  )
}

function SegmentRow({ segment, total }) {
  const pct = Math.round((segment.total / total) * 100)
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, fontWeight: 700 }}>
        <span>{segment.segment_name}</span>
        <span style={{ color: 'var(--text-muted)' }}>{pct}% ({segment.total})</span>
      </div>
      <div style={{ height: 10, background: 'var(--surface2)', borderRadius: 5, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent)', borderRadius: 5 }} />
      </div>
    </div>
  )
}

function LoadingState() {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>{[1,2,3,4].map(i => <div key={i} style={{ height: 120, background: 'var(--surface2)', borderRadius: 20, animation: 'pulse 1.5s infinite' }} />)}</div>
}
