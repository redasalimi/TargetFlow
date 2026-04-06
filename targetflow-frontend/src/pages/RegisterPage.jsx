import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setToken } from '../api/client'

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
     <div style={{ 
       fontSize: 32, 
       fontWeight: 900, 
       color: 'var(--accent)', 
       fontFamily: 'var(--font-display)',
       letterSpacing: '-0.05em',
       lineHeight: 1
     }}>T</div>
     <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', marginLeft: 1, marginTop: 14 }}></div>
  </div>
);

export default function RegisterPage({ onRegister }) {
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()

  const handle = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api.register(form.username, form.password)
      // data now contains tokens due to backend change
      if (data.access_token) {
        setToken(data.access_token)
        sessionStorage.setItem('tf_role', data.role || 'viewer')
        sessionStorage.setItem('tf_plan', data.plan || 'starter')
        onRegister(form.username, data.access_token)
        nav('/app')
      } else {
        // Fallback if token missing
        nav('/login')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: -200, left: -200,
        width: 600, height: 600,
        background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
        borderRadius: '50%',
        pointerEvents: 'none',
      }} />

      <div className="fade-up" style={{ width: '100%', maxWidth: 420, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Logo />
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12, letterSpacing: '0.05em', fontWeight: 600 }}>
            MARKETING INTELLIGENCE
          </div>
        </div>

        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '36px 32px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 22, marginBottom: 6 }}>Créer un compte</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 28 }}>Commencez votre analyse marketing</p>

          <form onSubmit={handle}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                  placeholder="votre_username"
                  required
                  style={{ width: '100%', padding: '11px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  style={{ width: '100%', padding: '11px 14px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', fontSize: 14, fontFamily: 'var(--font-body)', outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#FCA5A5', marginBottom: 20 }}>
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '13px', borderRadius: 10,
                background: loading ? 'var(--border)' : 'var(--accent2)',
                border: 'none', color: 'white',
                fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15,
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s',
              }}>
                {loading ? 'Création...' : 'Créer mon compte →'}
              </button>
            </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>
            Déjà un compte ?{' '}
            <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
