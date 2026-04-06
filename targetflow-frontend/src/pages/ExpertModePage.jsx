import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import { api } from '../api/client'

const SEGMENT_COLORS = {
  'VIP Clients':    '#00E5C4',
  'Loyal Clients':  '#3B82F6',
  'At Risk':        '#EF4444',
  'New Clients':    '#F59E0B',
}

function segColor(name) {
  return SEGMENT_COLORS[name] || '#6B7FA3'
}

export default function ExpertModePage({ user, onLogout }) {
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [nClusters, setNClusters] = useState(4)
  const [generatePersonas, setGeneratePersonas] = useState(false)
  const fileRef = useRef()
  const nav = useNavigate()

  const handleFile = (f) => {
    if (f && f.name.endsWith('.csv')) {
      setFile(f)
      setError('')
    } else {
      setError('Veuillez sélectionner un fichier .csv valide')
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    handleFile(f)
  }

  const handleSubmit = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const data = await api.uploadCSV(file, nClusters, generatePersonas)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Compute segment summary from results
  const segmentSummary = result ? (() => {
    const counts = {}
    result.segments.forEach(s => {
      const n = s.segment_name
      counts[n] = (counts[n] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({ name, count }))
  })() : []

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="fade-up">
        {/* Header */}
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16, fontWeight: 500, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            <span>Espace Expert</span> <span style={{ margin: '0 8px', color: 'var(--border)' }}>/</span> <span style={{ color: 'var(--accent)' }}>Analyse CSV</span>
          </div>
          <div style={{
            display: 'inline-block',
            background: 'rgba(0,229,196,0.08)',
            border: '1px solid rgba(0,229,196,0.2)',
            borderRadius: 20,
            padding: '4px 14px',
            fontSize: 11,
            color: 'var(--accent)',
            fontWeight: 600,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}>
            ◈ Analyse CSV
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 32, letterSpacing: '-0.03em', marginBottom: 8 }}>
            Analyse RFM & Segmentation
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
            Importez un fichier CSV avec vos données clients. Format attendu : <code style={{ color: 'var(--accent)', fontSize: 13 }}>customer_id, purchase_date, amount, city</code>
          </p>
        </div>

        {!result ? (
          <div style={{ maxWidth: 560 }}>
            {/* Drop zone */}
            <div
              onClick={() => fileRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'rgba(0,229,196,0.4)' : 'var(--border)'}`,
                borderRadius: 16,
                padding: '48px 32px',
                textAlign: 'center',
                cursor: 'pointer',
                background: dragging ? 'rgba(0,229,196,0.04)' : file ? 'rgba(0,229,196,0.03)' : 'var(--surface)',
                transition: 'all 0.2s',
                marginBottom: 20,
              }}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={e => handleFile(e.target.files[0])}
              />
              <div style={{ fontSize: 40, marginBottom: 12, color: file ? 'var(--accent)' : 'var(--text-muted)' }}>
                {file ? '✓' : '↑'}
              </div>
              {file ? (
                <>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{file.name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    {(file.size / 1024).toFixed(1)} KB · Prêt à analyser
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>
                    Glissez votre fichier CSV ici
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    ou cliquez pour sélectionner
                  </div>
                </>
              )}
            </div>
            
            {/* Cluster selection */}
            <div style={{
              background: 'var(--surface2)', borderRadius: 12, padding: '16px 20px', 
              marginBottom: 20, border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Nombre de segments (K)</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Définit la granularité de l'analyse</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input 
                  type="range" min="2" max="8" value={nClusters}
                  onChange={e => setNClusters(parseInt(e.target.value))}
                  style={{ accentColor: 'var(--accent)', cursor: 'pointer' }}
                />
                <span style={{ 
                  background: 'var(--accent)', color: '#000', 
                  borderRadius: 6, padding: '4px 10px', fontSize: 14, fontWeight: 800,
                  minWidth: 28, textAlign: 'center'
                }}>
                  {nClusters}
                </span>
              </div>
            </div>

            {/* Persona Toggle */}
            <div style={{
              background: 'var(--surface2)', borderRadius: 12, padding: '16px 20px', 
              marginBottom: 20, border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer'
            }} onClick={() => setGeneratePersonas(!generatePersonas)}>
              <div style={{ 
                width: 20, height: 20, borderRadius: 4, border: '2px solid var(--accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: generatePersonas ? 'var(--accent)' : 'transparent',
                transition: 'all 0.2s'
              }}>
                {generatePersonas && (
                  <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Générer des Personas IA (Consultant)</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>Utilise Gemini pour créer des profils détaillés par segment</div>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#FCA5A5', marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            {file && (
              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  width: '100%', padding: '12px 16px',
                  borderRadius: 10,
                  background: loading ? 'var(--border)' : 'var(--accent)',
                  border: 'none',
                  color: loading ? 'var(--text-muted)' : '#060A14',
                  fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                }}
              >
                {loading ? (
                  <>
                    <span style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid var(--text-muted)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: 10 }} />
                    Analyse en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: 20, height: 20 }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
                    Lancer l'analyse RFM
                  </>
                )}
              </button>
            )}

            {/* Info box */}
            <div style={{
              marginTop: 24,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '20px',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
                Processus d'analyse
              </div>
              {[
                { step: '01', label: 'Calcul RFM', desc: 'Récence, Fréquence, Montant par client' },
                { step: '02', label: 'Clustering K-Means', desc: 'Regroupement automatique en segments' },
                { step: '03', label: 'Labeling IA', desc: 'Attribution intelligente des étiquettes' },
                { step: '04', label: 'Sauvegarde', desc: 'Stockage des segments pour insights' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', minWidth: 24 }}>{s.step}</span>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: 13 }}>{s.label}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12, marginLeft: 8 }}>{s.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ResultsView
            result={result}
            segmentSummary={segmentSummary}
            onReset={() => { setResult(null); setFile(null) }}
            onGoInsights={() => nav('/insights')}
            onGoDashboard={() => nav('/dashboard')}
          />
        )}
      </div>
    </Layout>
  )
}

function ResultsView({ result, segmentSummary, onReset, onGoInsights, onGoDashboard }) {
  const total = result.segments.length

  return (
    <div className="fade-up">
      {/* Success banner */}
      <div style={{
        background: 'rgba(0,229,196,0.08)',
        border: '1px solid rgba(0,229,196,0.25)',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 28,
      }}>
        <span style={{ color: 'var(--accent)' }}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Analyse complétée avec succès</div>
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{total} clients analysés et segmentés</div>
        </div>
      </div>

      {/* Segment summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {segmentSummary.map(seg => (
          <div key={seg.name} style={{
            background: 'var(--surface)',
            border: `1px solid ${segColor(seg.name)}40`,
            borderRadius: 12,
            padding: '20px 16px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color: segColor(seg.name) }}>
              {seg.count}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{seg.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {Math.round((seg.count / total) * 100)}% du total
            </div>
          </div>
        ))}
      </div>

      {/* AI Personas (Detailed Written View) */}
      {result.personas && result.personas.length > 0 && (
        <div style={{
          background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16,
          padding: '24px 32px', marginBottom: 28
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1F4E79', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 24 }}>
            Analyse Détaillée des Personas IA
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            {result.personas.map((p, i) => (
              <div key={i} style={{ padding: '24px', background: '#F8FAFC', borderRadius: 16, border: '1px solid #E2E8F0', display: 'flex', gap: 20 }}>
                <div style={{ position: 'relative' }}>
                   <img 
                    src={`https://image.pollinations.ai/prompt/${encodeURIComponent(p.interest + ' professional portrait marketing persona')}?width=120&height=120&nologo=true&seed=${p.name.length + i}`}
                    alt={p.name}
                    style={{ width: 80, height: 80, borderRadius: 12, objectFit: 'cover', border: '1px solid #E2E8F0', background: 'white' }}
                    onError={(e) => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}` }}
                   />
                   <div style={{ position: 'absolute', bottom: -6, right: -6, background: 'var(--accent)', color: '#000', fontSize: 9, fontWeight: 900, padding: '2px 6px', borderRadius: 6, border: '2px solid white' }}>AI</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h4 style={{ fontWeight: 800, color: '#1F4E79', margin: 0, fontSize: 16 }}>{p.name}</h4>
                    <span style={{ fontSize: 10, background: '#1F4E79', color: 'white', padding: '2px 8px', borderRadius: 6, fontWeight: 700 }}>{p.segment}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#64748B', marginBottom: 10 }}>{p.age} ans · {p.city} · {p.interest}</div>
                  <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, fontStyle: 'italic', margin: 0 }}>"{p.bio}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14 }}>Résultats détaillés</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Affichage des 50 premiers</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--surface2)' }}>
                {['Client ID', 'Ville', 'Récence', 'Fréquence', 'Montant', 'Segment'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.segments.slice(0, 50).map((row, i) => (
                <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 16px', fontWeight: 600 }}>{row.customer_id}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{row.city || 'Maroc'}</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{Number(row.recency).toFixed(0)}j</td>
                  <td style={{ padding: '10px 16px', color: 'var(--text-muted)' }}>{Number(row.frequency).toFixed(0)}</td>
                  <td style={{ padding: '10px 16px' }}>{Number(row.monetary).toFixed(0)} MAD</td>
                  <td style={{ padding: '10px 16px' }}>
                    <span style={{
                      background: `${segColor(row.segment_name)}20`,
                      color: segColor(row.segment_name),
                      border: `1px solid ${segColor(row.segment_name)}40`,
                      borderRadius: 20,
                      padding: '2px 10px',
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {row.segment_name}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={onGoDashboard} style={{
          padding: '11px 20px', borderRadius: 8, background: 'var(--accent)', border: 'none',
          color: '#060A14', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg>
          Voir le Dashboard
        </button>
        <button onClick={onGoInsights} style={{
          padding: '11px 20px', borderRadius: 8, background: 'var(--accent2)', border: 'none',
          color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          Insights & Campagnes
        </button>
        <button onClick={onReset} style={{
          padding: '11px 20px', borderRadius: 8, background: 'transparent',
          border: '1px solid var(--border)', color: 'var(--text-muted)',
          fontSize: 14, cursor: 'pointer', fontFamily: 'var(--font-body)',
          display: 'flex', alignItems: 'center', gap: 8
        }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Nouvelle analyse
        </button>
      </div>
    </div>
  )
}
