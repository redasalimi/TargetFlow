import { useState } from 'react'
import Layout from '../components/Layout'
import { api } from '../api/client'

const STEPS = [
  { 
    title: 'Activité', 
    fields: ['business_type', 'sector'],
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
  },
  { 
    title: 'Stratégie', 
    fields: ['business_goal', 'target_audience'],
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
  },
  { 
    title: 'Marché', 
    fields: ['product_price', 'target_city', 'marketing_budget'],
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2 2 2 0 012 2v.1c0 1.1.9 2 2 2h2.5M12 2a10 10 0 100 20 10 10 0 000-20z"/></svg>
  }
]

const FIELD_LABELS = {
  business_type: { label: 'Type de business', placeholder: 'Ex: Boutique de vêtements en ligne' },
  sector: { label: 'Secteur d\'activité', placeholder: 'Ex: E-commerce, Retail, Services...' },
  business_goal: { label: 'Objectif principal', placeholder: 'Ex: Acquisition, Fidélisation...' },
  target_audience: { label: 'Audience cible', placeholder: 'Ex: Jeunes actifs, Familles...' },
  product_price: { label: 'Prix moyen (MAD)', placeholder: 'Ex: 250' },
  target_city: { label: 'Ville(s) cible', placeholder: 'Ex: Casablanca, Tout le Maroc...' },
  marketing_budget: { label: 'Budget mensuel (MAD)', placeholder: 'Ex: 5000' },
}

export default function StartupModePage({ user, onLogout }) {
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    business_type: '',
    sector: '',
    business_goal: '',
    target_audience: '',
    product_price: '',
    target_city: '',
    marketing_budget: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleNext = () => setStep(s => Math.min(s + 1, STEPS.length - 1))
  const handlePrev = () => setStep(s => Math.max(s - 1, 0))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (step < STEPS.length - 1) {
      handleNext()
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await api.startupAI(form)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="fade-up" style={{ maxWidth: result ? '100%' : '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: 40, textAlign: result ? 'left' : 'center' }}>
          <h1 style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 36, color: '#1F4E79', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Assistant de Segmentation Stratégique
          </h1>
          <p style={{ color: '#475569', fontSize: 16, maxWidth: 600, margin: result ? '0' : '0 auto' }}>
            Définissez votre projet étape par étape pour obtenir une analyse marketing de haute précision.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: result ? '400px 1fr' : '1fr', gap: 40, alignItems: 'start' }}>
          {!result ? (
            <div style={{
              background: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: 24,
              padding: '40px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
            }}>
              {/* Wizard Nav */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 40 }}>
                {STEPS.map((s, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: i === step ? '#1F4E79' : i < step ? '#16A34A' : '#F1F5F9',
                      color: i <= step ? 'white' : '#94A3B8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, fontWeight: 700, transition: 'all 0.3s'
                    }}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    {i < STEPS.length - 1 && <div style={{ width: 40, height: 2, background: i < step ? '#16A34A' : '#F1F5F9' }} />}
                  </div>
                ))}
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: '#1F4E79', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24, textAlign: 'center' }}>
                Étape {step + 1} : {STEPS[step].title}
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gap: 24, marginBottom: 32 }}>
                  {STEPS[step].fields.map(key => (
                    <div key={key}>
                      <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: '#1E293B', marginBottom: 8 }}>
                        {FIELD_LABELS[key].label}
                      </label>
                      <input
                        type="text"
                        value={form[key]}
                        onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                        placeholder={FIELD_LABELS[key].placeholder}
                        required
                        style={{
                          width: '100%', padding: '14px 16px',
                          background: '#F8FAFC', border: '1px solid #E2E8F0',
                          borderRadius: 12, color: '#0F172A', fontSize: 15,
                          outline: 'none', transition: 'all 0.2s',
                        }}
                        onFocus={e => { e.target.style.borderColor = '#1F4E79'; e.target.style.background = 'white' }}
                        onBlur={e => { e.target.style.borderColor = '#E2E8F0'; e.target.style.background = '#F8FAFC' }}
                      />
                    </div>
                  ))}
                </div>

                {error && <div style={{ color: '#EF4444', fontSize: 14, marginBottom: 20 }}>{error}</div>}

                <div style={{ display: 'flex', gap: 12 }}>
                  {step > 0 && (
                    <button type="button" onClick={handlePrev} style={{
                      flex: 1, padding: '14px', borderRadius: 12, border: '1px solid #E2E8F0',
                      background: 'white', color: '#475569', fontWeight: 600, cursor: 'pointer'
                    }}>
                      Précédent
                    </button>
                  )}
                  <button type="submit" disabled={loading} style={{
                    flex: 2, padding: '14px', borderRadius: 12, border: 'none',
                    background: '#1F4E79', color: 'white', fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer', fontSize: 16
                  }}>
                    {loading ? 'Analyse en cours...' : step === STEPS.length - 1 ? 'Générer l\'Analyse' : 'Suivant'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 24, padding: '32px' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1F4E79', marginBottom: 24 }}>Récapitulatif de votre projet</div>
              <div style={{ display: 'grid', gap: 16 }}>
                {Object.entries(form).map(([k, v]) => (
                  <div key={k} style={{ borderBottom: '1px solid #F1F5F9', paddingBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>{FIELD_LABELS[k].label}</div>
                    <div style={{ fontSize: 14, color: '#1E293B', fontWeight: 500 }}>{v}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => { setResult(null); setStep(0) }} style={{
                marginTop: 32, width: '100%', padding: '12px', borderRadius: 10, border: '1px solid #E2E8F0',
                background: '#F8FAFC', color: '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer'
              }}>
                Nouvelle Analyse
              </button>
            </div>
          )}

          {result && <AIResults result={result} />}
        </div>
      </div>
    </Layout>
  )
}

function AIResults({ result }) {
  return (
    <div className="fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Segments */}
      <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
        <span>Segments identifiés</span>
      </div>} color="var(--accent)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {result.segments?.map((seg, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px',
              background: 'var(--bg)',
              borderRadius: 8,
              border: '1px solid var(--border)',
            }}>
              <span style={{
                fontSize: 10, fontWeight: 800,
                background: 'var(--accent)',
                color: '#060A14',
                borderRadius: 4,
                padding: '2px 6px',
                minWidth: 22,
                textAlign: 'center',
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 14, fontWeight: 500 }}>{seg}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Personas */}
      <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
        <span>Analyses Détaillées des Personas</span>
      </div>} color="#1F4E79">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {result.personas?.map((p, i) => (
            <div key={i} style={{
              paddingBottom: 24,
              borderBottom: i === result.personas.length - 1 ? 'none' : '1px solid #F1F5F9',
            }}>
              <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(p.interest + ' person portrait professional lifestyle') || 'person'}?width=100&height=100&nologo=true&seed=${i + p.name.length}`}
                    alt={p.name}
                    style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E2E8F0', background: '#F8FAFC' }}
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}` }}
                  />
                  <div style={{ position: 'absolute', bottom: -4, right: -4, background: '#1F4E79', color: 'white', fontSize: 8, fontWeight: 900, padding: '2px 4px', borderRadius: 4, border: '1px solid white' }}>AI</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 700, color: '#1F4E79', marginBottom: 2 }}>{p.name}</h3>
                      <div style={{ fontSize: 13, color: '#64748B', fontWeight: 500 }}>
                        {p.age} ans · {p.city} · {p.interest}
                      </div>
                    </div>
                    <div style={{ 
                      background: '#F1F5F9', color: '#1F4E79', 
                      fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 4, textTransform: 'uppercase'
                    }}>
                      ID P-{i+1}
                    </div>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{p.bio}"
              </p>
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                {['Profil-type', 'Cible prioritaire', 'Marché Local'].map(tag => (
                  <span key={tag} style={{ fontSize: 11, background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '2px 8px', borderRadius: 5, color: '#64748B' }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Strategies */}
      <Card title={<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <span>Stratégies recommandées</span>
      </div>} color="var(--accent3)">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {result.strategies?.map((s, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, padding: '10px 12px',
              background: 'var(--bg)', borderRadius: 8,
              border: '1px solid var(--border)',
              fontSize: 13, lineHeight: 1.5,
            }}>
              <span style={{ color: 'var(--accent3)', fontWeight: 700, fontSize: 11, minWidth: 20, marginTop: 1 }}>
                0{i + 1}
              </span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

function Card({ title, color, children }) {
  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--border)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        fontSize: 12,
        fontWeight: 700,
        color,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}>
        {title}
      </div>
      <div style={{ padding: '14px 18px' }}>{children}</div>
    </div>
  )
}
