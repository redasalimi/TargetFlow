import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { api } from '../api/client'

const CAMPAIGN_ICONS = {
  'Champions':                 { icon: '◈', color: '#00E5C4' },
  'Clients Fidèles':          { icon: '♥', color: '#3B82F6' },
  'Clients Hibernants / Risque': { icon: '⚠', color: '#EF4444' },
  'Nouveaux / Potentiels':     { icon: '☆', color: '#F59E0B' },
}

function getCampaignStyle(segment = '') {
  if (segment.includes('Champions') || segment.includes('VIP')) return CAMPAIGN_ICONS['Champions']
  if (segment.includes('Fidèles') || segment.includes('Loyal')) return CAMPAIGN_ICONS['Clients Fidèles']
  if (segment.includes('Risque') || segment.includes('At Risk')) return CAMPAIGN_ICONS['Clients Hibernants / Risque']
  return CAMPAIGN_ICONS['Nouveaux / Potentiels']
}

export default function InsightsPage({ user, onLogout }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    setLoading(true)
    api.insights()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  const handlePersonalize = (camp) => {
    setSelectedCampaign(camp)
    setShowModal(true)
  }

  const handleLaunch = () => {
     alert('Campagne lancée avec succès !');
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="fade-up">
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Insights & Campagnes
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Analyses IA et recommandations de ciblage.
          </p>
        </div>

        {loading && <LoadingState />}
        {error && <div style={{ color: '#EF4444', padding: 20, background: 'rgba(239,68,68,0.1)', borderRadius: 12 }}>{error}</div>}

        {data && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 24 }}>
            {/* Insights Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Recommandations Strategiques</h3>
               {data.insights && data.insights.map((insight, i) => (
                 <InsightCard key={i} insight={insight} />
               ))}
               {(!data.insights || data.insights.length === 0) && <div style={{ padding: 20, background: 'var(--surface)', borderRadius: 12, textAlign: 'center', color: 'var(--text-muted)' }}>Aucun insight disponible.</div>}
            </div>

            {/* Campaigns Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
               <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>Simulateur de Campagnes</h3>
               {data.campaigns && data.campaigns.map((camp, i) => (
                 <CampaignCard 
                  key={i} 
                  camp={camp} 
                  onLaunch={handleLaunch}
                  onPersonalize={() => handlePersonalize(camp)}
                 />
               ))}
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <CampaignModal 
          campaign={selectedCampaign} 
          onClose={() => setShowModal(false)}
        />
      )}
    </Layout>
  )
}

function InsightCard({ insight }) {
  // Support both message (v3.1) and title/description (v3.0) formats
  const title = insight.title || insight.segment || 'Insight Segment'
  const desc = insight.description || insight.message || ''
  const priority = insight.priority || insight.severity || 'Normal'
  const color = priority === 'Critique' ? '#EF4444' : priority === 'Elevee' ? '#00E5C4' : '#8B5CF6'

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', borderLeft: `6px solid ${color}`, padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <h4 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</h4>
        <span style={{ fontSize: 10, background: `${color}15`, color: color, padding: '4px 10px', borderRadius: 20, fontWeight: 800 }}>{priority}</span>
      </div>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>{desc}</p>
      {insight.recommended_action || insight.action ? (
        <div style={{ fontSize: 13, fontWeight: 700, color }}>Action : {insight.recommended_action || insight.action}</div>
      ) : null}
    </div>
  )
}

function CampaignCard({ camp, onLaunch, onPersonalize }) {
  const { icon, color } = getCampaignStyle(camp.segment)
  const pred = camp.prediction || {}
  
  // Robust Image Logic
  const [imgSrc, setImgSrc] = useState(null)
  const [imgError, setImgError] = useState(false)

  const aiPrompt = camp.segment.includes('Champions') ? 'luxury' : 
                   camp.segment.includes('Risque') ? 'business-alert' : 
                   camp.segment.includes('Fidele') ? 'community' : 'marketing';

  const aiUrl = `https://pollinations.ai/p/${aiPrompt}?width=500&height=300&seed=${camp.segment.length}&nologo=true`;
  const fallbackUrl = `https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=500&q=80`; // Reliable Business Static

  useEffect(() => {
    setImgSrc(aiUrl)
  }, [camp.segment])

  const handleError = () => {
    if (imgSrc === aiUrl) {
      setImgSrc(fallbackUrl)
    } else {
      setImgError(true)
    }
  }

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 20, border: '1px solid var(--border)', padding: 0, overflow: 'hidden' }}>
      <div style={{ width: '100%', height: 140, background: 'linear-gradient(45deg, #1A1A1A, #2A2A2A)', position: 'relative' }}>
        {!imgError && imgSrc && (
          <img 
            src={imgSrc} 
            alt="IA Visual" 
            onError={handleError}
            style={{ width: '100%', height: '140px', objectFit: 'cover', opacity: 0.9 }} 
          />
        )}
        <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(0,0,0,0.6)', padding: '4px 10px', borderRadius: 4, fontSize: 10, color: 'var(--accent)', fontWeight: 800, border: '1px solid rgba(255,255,255,0.1)' }}>IA VISUAL</div>
      </div>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 40, height: 40, background: `${color}15`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>{icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 15 }}>{camp.campaign?.title || 'Campagne IA'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cible : <span style={{ color }}>{camp.segment}</span></div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: 16, marginBottom: 0 }}>
           <div style={{ textAlign: 'center', minWidth: 60 }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--accent)' }}>{pred.roi_estimate || pred.roi || 0}%</div>
              <div style={{ fontSize: 9, textTransform: 'uppercase', color: 'var(--text-muted)' }}>ROI Predi</div>
           </div>
           <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={onLaunch} style={{ flex: 1, padding: '10px', borderRadius: 10, background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text)', fontWeight: 700, cursor: 'pointer' }}>Lancer</button>
              <button onClick={onPersonalize} style={{ flex: 1, padding: '10px', borderRadius: 10, background: color, border: 'none', color: '#000', fontWeight: 700, cursor: 'pointer' }}>Ajuster</button>
           </div>
        </div>
      </div>
    </div>
  )
}

function CampaignModal({ campaign, onClose }) {
  const [incentive, setIncentive] = useState(campaign.campaign?.incentive || campaign.campaign?.offer || '')
  const [channel, setChannel] = useState(campaign.campaign?.channel || 'Email')
  const [budget, setBudget] = useState(500)
  const [prediction, setPrediction] = useState(campaign.prediction || {})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      api.predictCampaign(campaign.segment, { offer: incentive, channel, budget })
        .then(setPrediction)
        .finally(() => setLoading(false))
    }, 500)
    return () => clearTimeout(timer)
  }, [incentive, channel, budget])

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: 'var(--surface)', width: '100%', maxWidth: 500, borderRadius: 24, border: '1px solid var(--border)', padding: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
          <h3 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>Simulateur de Campagne</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 20, cursor: 'pointer' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
           <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>OFFRE</label>
              <input value={incentive} onChange={e => setIncentive(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: '#fff' }} />
           </div>
           <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, marginBottom: 4 }}>CANAL</label>
              <select value={channel} onChange={e => setChannel(e.target.value)} style={{ width: '100%', padding: '12px', background: 'var(--surface2)', border: '1px solid var(--border)', borderRadius: 10, color: '#fff' }}>
                <option>WhatsApp</option>
                <option>Email</option>
                <option>SMS</option>
              </select>
           </div>
           
           <div style={{ marginTop: 12, padding: 20, background: 'rgba(0,229,196,0.05)', borderRadius: 16, border: '1px solid rgba(0,229,196,0.1)' }}>
              <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 800, marginBottom: 12 }}>PREDICTIONS IA</div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                 <div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{prediction.roi_estimate || prediction.roi || 0}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>ROI ESTIME</div>
                 </div>
                 <div>
                    <div style={{ fontSize: 18, fontWeight: 900 }}>{prediction.conversion_rate || 0}%</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>CONVERSION</div>
                 </div>
              </div>
           </div>
        </div>

        <button onClick={onClose} style={{ width: '100%', marginTop: 24, padding: '14px', borderRadius: 12, background: 'var(--accent)', border: 'none', color: '#000', fontWeight: 800, cursor: 'pointer' }}>Appliquer la Strategie</button>
      </div>
    </div>
  )
}

function LoadingState() {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>{[1,2,3,4].map(i => <div key={i} style={{ height: 120, background: 'var(--surface2)', borderRadius: 20, animation: 'pulse 1.5s infinite' }} />)}</div>
}
