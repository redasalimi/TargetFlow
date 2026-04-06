import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'

const MODES = [
  {
    path: '/expert',
    icon: '◈',
    title: 'Mode Expert',
    subtitle: 'Analyse RFM & Segmentation',
    description: 'Importez vos données clients CSV, lancez une analyse RFM complète avec clustering K-Means, et obtenez des insights actionnables sur vos segments.',
    features: ['Upload CSV client', 'Analyse RFM automatique', 'Clustering K-Means', 'Campagnes personnalisées'],
    color: 'var(--accent)',
    gradient: 'linear-gradient(135deg, rgba(0,229,196,0.12), rgba(0,229,196,0.03))',
    border: 'rgba(0,229,196,0.25)',
  },
  {
    path: '/startup',
    icon: '◆',
    title: 'Mode Startup',
    subtitle: 'IA Stratégique — Gemini AI',
    description: 'Sans données historiques ? Décrivez votre business et laissez l\'IA générer des segments de marché, personas clients et stratégies marketing sur mesure.',
    features: ['Zéro donnée requise', 'Segments IA générés', 'Personas détaillés', 'Stratégies marketing'],
    color: 'var(--accent2)',
    gradient: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.03))',
    border: 'rgba(59,130,246,0.25)',
  },
]

export default function HomePage({ user, onLogout }) {
  const nav = useNavigate()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!sessionStorage.getItem('tf_onboarding_done')) {
      setShowOnboarding(true)
    }
  }, [])

  const handleCloseOnboarding = () => {
    sessionStorage.setItem('tf_onboarding_done', 'true')
    setShowOnboarding(false)
  }

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="fade-up" style={{ position: 'relative' }}>
        {showOnboarding && <OnboardingModal onClose={handleCloseOnboarding} user={user} />}
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
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
            marginBottom: 16,
          }}>
            Bienvenue, {user} ✦
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: 40,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            marginBottom: 12,
          }}>
            Choisissez votre<br />
            <span style={{
              background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              mode d'analyse
            </span>
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 16, maxWidth: 500 }}>
            TargetFlow transforme vos données clients en stratégies marketing précises grâce au machine learning et à l'IA générative.
          </p>
        </div>

        {/* Mode cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, maxWidth: 900 }}>
          {MODES.map((mode, i) => (
            <div
              key={mode.path}
              className={`fade-up-${i + 1}`}
              onClick={() => nav(mode.path)}
              style={{
                background: mode.gradient,
                border: `1px solid ${mode.border}`,
                borderRadius: 20,
                padding: '36px 32px',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = `0 20px 60px ${mode.color}18`
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <div style={{
                fontSize: 32,
                color: mode.color,
                marginBottom: 16,
                display: 'block',
              }}>
                {mode.icon}
              </div>

              <div style={{
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 22,
                marginBottom: 4,
              }}>
                {mode.title}
              </div>
              <div style={{
                fontSize: 12,
                color: mode.color,
                fontWeight: 600,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                marginBottom: 16,
              }}>
                {mode.subtitle}
              </div>

              <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 24 }}>
                {mode.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {mode.features.map(f => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text)' }}>
                    <span style={{ color: mode.color, fontSize: 10 }}>◉</span>
                    {f}
                  </div>
                ))}
              </div>

              <div style={{
                position: 'absolute',
                bottom: 24,
                right: 28,
                fontSize: 22,
                color: mode.color,
                opacity: 0.4,
              }}>
                →
              </div>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="fade-up-3" style={{ display: 'flex', gap: 12, marginTop: 32 }}>
          {[
            { path: '/dashboard', label: '◇ Voir le Dashboard' },
            { path: '/insights',  label: '◉ Insights & Campagnes' },
          ].map(link => (
            <button
              key={link.path}
              onClick={() => nav(link.path)}
              style={{
                padding: '9px 18px',
                borderRadius: 8,
                background: 'transparent',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: 13,
                cursor: 'pointer',
                fontFamily: 'var(--font-body)',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.target.style.borderColor = 'var(--accent)'; e.target.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }}
            >
              {link.label}
            </button>
          ))}
        </div>
      </div>
    </Layout>
  )
}

function OnboardingModal({ onClose, user }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, animation: 'fadeIn 0.3s ease'
    }}>
      <div className="fade-up" style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 24, padding: '40px', maxWidth: 500, width: '100%',
        boxShadow: '0 24px 80px rgba(0,0,0,0.6)'
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>👋</div>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 28, marginBottom: 16 }}>
          Bienvenue sur TargetFlow, {user}!
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
          TargetFlow est votre co-pilote marketing. Pour commencer, choisissez l'espace qui correspond à vos données :
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          <div style={{ display: 'flex', gap: 16, background: 'rgba(0,229,196,0.05)', border: '1px solid rgba(0,229,196,0.2)', padding: '16px', borderRadius: 12 }}>
            <div style={{ fontSize: 24, color: 'var(--accent)' }}>◈</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent)' }}>Mode Expert</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Pour les entreprises ayant déjà des données clients (fichiers CSV). Effectuez une analyse RFM et segmentez vos clients.</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: 16, background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.2)', padding: '16px', borderRadius: 12 }}>
            <div style={{ fontSize: 24, color: 'var(--accent2)' }}>◆</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--accent2)' }}>Mode Startup / IA</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>Pour les nouveaux projets sans données. Décrivez votre idée et l'IA générera vos personas et votre stratégie.</div>
            </div>
          </div>
        </div>

        <button onClick={onClose} style={{
          width: '100%', padding: '14px', borderRadius: 12,
          background: 'var(--text)', color: 'var(--bg)',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16,
          border: 'none', cursor: 'pointer', transition: 'transform 0.1s'
        }}
        onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
        onMouseUp={e => e.target.style.transform = 'scale(1)'}>
          C'est parti !
        </button>
      </div>
    </div>
  )
}

