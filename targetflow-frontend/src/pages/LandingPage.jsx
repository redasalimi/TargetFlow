import React from 'react'
import { useNavigate } from 'react-router-dom'

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

export default function LandingPage() {
  const nav = useNavigate()
  const user = sessionStorage.getItem('tf_user')

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', overflowX: 'hidden' }}>
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .hero-gradient {
          background: radial-gradient(circle at 50% 50%, rgba(0, 229, 196, 0.15) 0%, transparent 50%);
        }
      `}</style>
      
      {/* Navigation */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '24px 48px', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, background: 'rgba(6, 10, 20, 0.8)', backdropFilter: 'blur(12px)', zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Logo />
          <div style={{ fontSize: 24, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em' }}>
            Target<span style={{ color: 'var(--accent)' }}>Flow</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          {user ? (
            <button onClick={() => nav('/app')} style={{
              background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer',
              padding: '8px 20px', fontWeight: 700, fontSize: 14, transition: 'transform 0.2s',
              boxShadow: '0 0 20px rgba(0, 229, 196, 0.3)'
            }}>
              Accéder au Dashboard →
            </button>
          ) : (
            <>
              <button onClick={() => nav('/login')} style={{
                background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer',
                padding: '8px 16px', fontWeight: 600, fontSize: 14
              }}>
                Connexion
              </button>
              <button onClick={() => nav('/register')} style={{
                background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 8, cursor: 'pointer',
                padding: '8px 20px', fontWeight: 700, fontSize: 14, transition: 'transform 0.2s',
                boxShadow: '0 0 20px rgba(0, 229, 196, 0.3)'
              }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                 onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                S'inscrire
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        padding: '120px 24px', position: 'relative'
      }}>
        <div style={{
          position: 'absolute', top: -100, left: '50%', transform: 'translateX(-50%)',
          width: 800, height: 400, background: 'var(--accent)', filter: 'blur(200px)', opacity: 0.15, zIndex: 0, borderRadius: '50%'
        }}></div>

        <div className="fade-up" style={{
          background: 'rgba(0, 229, 196, 0.1)', border: '1px solid rgba(0, 229, 196, 0.2)',
          padding: '6px 16px', borderRadius: 20, color: 'var(--accent)', fontSize: 12, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 24, position: 'relative', zIndex: 1
        }}>
          La Nouvelle Ère du Marketing Prédictif
        </div>
        
        <h1 className="fade-up-1 animate-float" style={{
          fontFamily: 'var(--font-display)', fontSize: '5rem', fontWeight: 800, lineHeight: 1.1,
          letterSpacing: '-0.04em', maxWidth: 900, marginBottom: 24, position: 'relative', zIndex: 1
        }}>
          Segmentez, Prédisez, <br />
          <span style={{
            background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
          }}>Convertissez sans effort.</span>
        </h1>
        
        <p className="fade-up-2" style={{
          fontSize: 18, color: 'var(--text-muted)', maxWidth: 600, marginBottom: 40, position: 'relative', zIndex: 1
        }}>
          De l'analyse RFM à la génération de personas par IA, TargetFlow vous donne les outils pour maximiser le ROI de vos campagnes.
        </p>
        
        <div className="fade-up-3" style={{ display: 'flex', gap: 16, position: 'relative', zIndex: 1 }}>
          <button onClick={() => nav(user ? '/app' : '/register')} style={{
            background: 'var(--accent)', color: '#000', border: 'none', borderRadius: 12, cursor: 'pointer',
            padding: '16px 32px', fontWeight: 800, fontSize: 16, transition: 'all 0.2s',
            boxShadow: '0 8px 32px rgba(0, 229, 196, 0.3)'
          }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 229, 196, 0.4)'; }}
             onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 229, 196, 0.3)'; }}>
            {user ? 'Accéder à l\'App →' : 'Commencer gratuitement →'}
          </button>
          <button onClick={() => nav(user ? '/dashboard' : '/login')} style={{
            background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: 12, cursor: 'pointer',
            padding: '16px 32px', fontWeight: 700, fontSize: 16, transition: 'all 0.2s', backdropFilter: 'blur(10px)'
          }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
             onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
            {user ? 'Voir Dashboard' : 'Voir la démo'}
          </button>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: 'var(--surface)' }}>
        <h2 style={{ textAlign: 'center', fontSize: 36, fontFamily: 'var(--font-display)', marginBottom: 64 }}>
          Pourquoi choisir TargetFlow ?
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32, maxWidth: 1200, margin: '0 auto' }}>
          {[
            { icon: '📊', title: 'Analyse RFM Puissante', desc: 'Identifiez automatiquement vos meilleurs clients et ceux à risque de churn.' },
            { icon: '🤖', title: 'Startups & IA', desc: 'Générez des personas et des stratégies marketing sur mesure via Gemini AI.' },
            { icon: '🚀', title: 'Campagnes Directes', desc: 'Exportez vos segments ou lancez des campagnes WhatsApp et Mailchimp en un clic.' }
          ].map((feat, i) => (
            <div key={i} className="fade-up" style={{
              background: 'var(--surface2)', padding: 32, borderRadius: 24, border: '1px solid var(--border)',
              transition: 'transform 0.3s', cursor: 'pointer'
            }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-8px)'}
               onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
              <div style={{ fontSize: 48, marginBottom: 24 }}>{feat.icon}</div>
              <h3 style={{ fontSize: 20, fontFamily: 'var(--font-display)', marginBottom: 12 }}>{feat.title}</h3>
              <p style={{ color: 'var(--text-muted)' }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '120px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 40, fontFamily: 'var(--font-display)', marginBottom: 16 }}>
          Des plans adaptés à votre croissance
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 64, fontSize: 18 }}>
          Commencez gratuitement, évoluez quand vous êtes prêts.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', maxWidth: 1200, margin: '0 auto' }}>
          {[
            {
              name: 'Starter', price: '0', period: '/mois',
              desc: 'Pour tester et faire ses premiers pas.',
              features: ['1 analyse CSV / mois', 'Dashboard basique', 'Jusqu\'à 500 clients', 'Mode Startup limité (3 analyses)'],
              color: 'var(--text)', bg: 'var(--surface2)', border: 'var(--border)'
            },
            {
              name: 'Expert Pro', price: '299', period: ' MAD / mois', pop: true,
              desc: 'Pour les professionnels du marketing.',
              features: ['Analyses CSV illimitées', 'Clients illimités', 'Prédiction de churn IA', 'Export PDF & Campagnes Mailchimp', 'Support prioritaire'],
              color: 'var(--accent)', bg: 'rgba(0, 229, 196, 0.05)', border: 'var(--accent)'
            },
            {
              name: 'Business', price: '499', period: ' MAD / mois',
              desc: 'La suite complète pour les agences.',
              features: ['Tout dans Expert Pro', 'Mode Startup illimité', 'Photos de Personas IA', 'Mode multi-utilisateurs', 'Dashboard Admin complet'],
              color: 'var(--accent2)', bg: 'var(--surface2)', border: 'rgba(59, 130, 246, 0.5)'
            }
          ].map((plan, i) => (
            <div key={i} className="fade-up" style={{
              flex: '1 1 300px', maxWidth: 350,
              background: plan.bg, border: `1px solid ${plan.border}`, borderRadius: 24, padding: 40,
              position: 'relative', display: 'flex', flexDirection: 'column'
            }}>
              {plan.pop && (
                <div style={{
                  position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                  background: 'var(--accent)', color: '#000', padding: '4px 12px', borderRadius: 20,
                  fontSize: 12, fontWeight: 800, textTransform: 'uppercase'
                }}>Le plus populaire</div>
              )}
              <h3 style={{ fontSize: 24, fontFamily: 'var(--font-display)', color: plan.color, marginBottom: 8 }}>{plan.name}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24, minHeight: 40 }}>{plan.desc}</p>
              
              <div style={{ marginBottom: 32 }}>
                <span style={{ fontSize: 40, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{plan.price}</span>
                <span style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
              </div>

              <div style={{ flex: 1 }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16, fontSize: 14 }}>
                    <span style={{ color: plan.color }}>✔</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => nav('/register')} style={{
                marginTop: 32, width: '100%', padding: '16px', borderRadius: 12, border: 'none',
                background: plan.pop ? 'var(--accent)' : 'var(--border)',
                color: plan.pop ? '#000' : 'var(--text)',
                fontWeight: 700, cursor: 'pointer', transition: 'filter 0.2s'
              }} onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                 onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                Choisir ce plan
              </button>
            </div>
          ))}
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ padding: '40px 24px', textAlign: 'center', borderTop: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: 14 }}>
        © 2026 TargetFlow. Propulsé par l'IA et l'Analyse RFM.
      </footer>
    </div>
  )
}
